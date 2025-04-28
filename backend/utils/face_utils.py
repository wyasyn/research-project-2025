import os
import time
import logging
from urllib.parse import urlparse
from concurrent.futures import ProcessPoolExecutor

import cv2
import face_recognition
from config import db
from models import User

log = logging.getLogger(__name__)

# Cache: org_id -> { timestamp, data: (encodings, ids) }
known_faces_cache: dict[int, dict] = {}
CACHE_TTL = 24 * 3600  # 24h
MAX_WORKERS = os.cpu_count() or 4
THUMBNAIL_SIZE = (128, 128)

# Helpers

def _extract_filename(url: str) -> str:
    return os.path.basename(urlparse(url).path)


def _process_user_face(args):
    """Loads image via cv2, resizes, and encodes face."""
    user_id, image_fname = args
    file_path = os.path.join('uploads', image_fname)
    if not os.path.isfile(file_path):
        return user_id, []

    img = cv2.imread(file_path)
    if img is None:
        return user_id, []
    # downsample
    small = cv2.resize(img, THUMBNAIL_SIZE)
    rgb = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
    encs = face_recognition.face_encodings(rgb)
    return user_id, encs


def load_known_faces(organization_id: int, force_reload: bool = False):
    """
    Returns (encodings, ids) for an org, using ProcessPool and cv2 for speed.
    """
    now = time.time()
    cache = known_faces_cache.get(organization_id)
    # If cache valid and not forcing, return immediately
    if cache and not force_reload and now - cache['timestamp'] < CACHE_TTL:
        return cache['data']

    # Query only id and url
    rows = db.session.query(User.id, User.image_url) \
        .filter_by(organization_id=organization_id) \
        .filter(User.image_url.isnot(None)).all()

    tasks = []
    for uid, url in rows:
        fname = _extract_filename(url)
        tasks.append((uid, fname))

    encs, ids = [], []
    with ProcessPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = pool.map(_process_user_face, tasks)
        for uid, face_list in futures:
            for e in face_list:
                encs.append(e)
                ids.append(uid)

    # Cache and return
    known_faces_cache[organization_id] = {'timestamp': now, 'data': (encs, ids)}
    log.info("Loaded %d face encodings for org %s", len(encs), organization_id)
    return encs, ids
