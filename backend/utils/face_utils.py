import time
import logging
from io import BytesIO
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
import face_recognition
from PIL import Image

from config import db
from models import User

# ───────────────────────────────────────────────
# Module-level cache + settings
# ───────────────────────────────────────────────

log = logging.getLogger(__name__)
known_faces_cache: dict[int, dict] = {}  # org_id → { timestamp, data: (encodings, names) }
CACHE_TTL = 3600  # seconds before cache expires
THREAD_POOL_SIZE = 8
THUMBNAIL_SIZE = (256, 256)
JPEG_QUALITY = 90


# ───────────────────────────────────────────────
# Internal worker for one user
# ───────────────────────────────────────────────

def _process_user_face(user_id: int, image_url: str) -> tuple[int, list]:
    """
    Download a user image, resize it, and extract face encodings.
    Returns (user_id, list_of_encodings) or (user_id, []) on error/no face.
    """
    try:
        resp = requests.get(image_url, timeout=10)
        resp.raise_for_status()

        img = Image.open(BytesIO(resp.content)).convert("RGB")
        img.thumbnail(THUMBNAIL_SIZE, Image.ANTIALIAS)

        buf = BytesIO()
        img.save(buf, format="JPEG", quality=JPEG_QUALITY)
        buf.seek(0)

        face_img = face_recognition.load_image_file(buf)
        encs = face_recognition.face_encodings(face_img)
        if not encs:
            log.warning("No face found in image for user_id=%s", user_id)
        return user_id, encs

    except requests.Timeout:
        log.error("Timeout fetching image for user_id=%s", user_id)
    except requests.HTTPError as e:
        log.error("HTTP error %s for user_id=%s", e.response.status_code, user_id)
    except requests.RequestException as e:
        log.error("Request exception for user_id=%s: %s", user_id, e)
    except Exception:
        log.exception("Unexpected error processing face for user_id=%s", user_id)

    return user_id, []


# ───────────────────────────────────────────────
# Public API
# ───────────────────────────────────────────────

def load_known_faces(organization_id: int, force_reload: bool = False) -> tuple[list, list]:
    """
    Load (and cache) all face encodings and corresponding user_ids for a given org.

    :param organization_id: PK of organization to scope users by.
    :param force_reload: bypass in-memory cache if True.
    :returns: (known_face_encodings, known_face_user_ids)
    """
    now = time.time()
    cache_entry = known_faces_cache.get(organization_id)

    # Return cached if still fresh
    if not force_reload and cache_entry and (now - cache_entry["timestamp"] < CACHE_TTL):
        return cache_entry["data"]

    # Fetch all users in org with an image
    rows = (
        db.session.query(User.id, User.image_url)
        .filter(User.organization_id == organization_id, User.image_url.isnot(None))
        .all()
    )

    encodings: list = []
    names: list[int] = []

    # Parallel download + encoding
    with ThreadPoolExecutor(max_workers=THREAD_POOL_SIZE) as exe:
        futures = {
            exe.submit(_process_user_face, uid, url): uid
            for uid, url in rows
        }
        for fut in as_completed(futures):
            uid, face_encs = fut.result()
            if face_encs:
                encodings.extend(face_encs)
                names.extend([uid] * len(face_encs))

    # Update cache
    known_faces_cache[organization_id] = {
        "timestamp": now,
        "data": (encodings, names)
    }

    log.info(
        "Loaded faces for org=%s: %d users, %d total encodings",
        organization_id, len(rows), len(encodings)
    )
    return encodings, names
