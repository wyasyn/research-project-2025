import os
import time
import logging
from io import BytesIO
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlparse

import face_recognition
from PIL import Image

from config import db
from models import User

# ─────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────

log = logging.getLogger(__name__)
known_faces_cache: dict[int, dict] = {}  # org_id → { timestamp, data: (encodings, names) }
CACHE_TTL = 3600            # seconds before cache expires
THREAD_POOL_SIZE = 8        # for parallel processing
THUMBNAIL_SIZE = (256, 256) # resize for speed
JPEG_QUALITY = 90           # buffer quality
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')  # local image storage

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ─────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────

def extract_filename_from_url(url: str) -> str:
    """
    Extracts the filename from a full upload URL.
    e.g. https://domain.com/uploads/foo.jpg → foo.jpg
    """
    parsed = urlparse(url)
    return os.path.basename(parsed.path)

# ─────────────────────────────────────────────────────────
# Internal worker
# ─────────────────────────────────────────────────────────

def _process_user_face(user_id: int, image_filename: str) -> tuple[int, list]:
    """
    Load a local image file for a user, resize, and extract face encodings.
    :returns: (user_id, list_of_encodings) or (user_id, [])
    """
    try:
        file_path = os.path.join(UPLOAD_FOLDER, image_filename)
        if not os.path.exists(file_path):
            log.error("Image file not found for user_id=%s: %s", user_id, file_path)
            return user_id, []

        img = Image.open(file_path).convert("RGB")
        img.thumbnail(THUMBNAIL_SIZE, Image.LANCZOS)

        buf = BytesIO()
        img.save(buf, format="JPEG", quality=JPEG_QUALITY)
        buf.seek(0)

        face_img = face_recognition.load_image_file(buf)
        encs = face_recognition.face_encodings(face_img)
        if not encs:
            log.warning("No face found in image for user_id=%s", user_id)
        return user_id, encs

    except Exception:
        log.exception("Unexpected error processing face for user_id=%s", user_id)
        return user_id, []

# ─────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────

def load_known_faces(organization_id: int, force_reload: bool = False) -> tuple[list, list]:
    """
    Load and cache face encodings and corresponding user IDs for an organization.

    :param organization_id: ID of the organization to scope users by.
    :param force_reload: bypass cache if True.
    :returns: (known_face_encodings, known_face_user_ids)
    """
    now = time.time()
    cache = known_faces_cache.get(organization_id)
    if not force_reload and cache and (now - cache["timestamp"] < CACHE_TTL):
        return cache["data"]

    # Query DB for users with an image URL
    rows = (
        db.session.query(User.id, User.image_url)
        .filter(User.organization_id == organization_id,
                User.image_url.isnot(None))
        .all()
    )

    encodings: list = []
    names: list[int] = []

    # Parallel processing
    with ThreadPoolExecutor(max_workers=THREAD_POOL_SIZE) as executor:
        futures = {
            executor.submit(
                _process_user_face,
                uid,
                extract_filename_from_url(url)
            ): uid
            for uid, url in rows
        }
        for fut in as_completed(futures):
            uid, face_encs = fut.result()
            if face_encs:
                encodings.extend(face_encs)
                names.extend([uid] * len(face_encs))

    # Cache results
    known_faces_cache[organization_id] = {
        "timestamp": now,
        "data": (encodings, names)
    }

    log.info(
        "Loaded faces for org=%s: %d users, %d encodings",
        organization_id, len(rows), len(encodings)
    )
    return encodings, names
