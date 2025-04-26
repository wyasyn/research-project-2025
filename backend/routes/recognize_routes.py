import logging
import platform
import os
import time

import cv2
import numpy as np
import face_recognition
from flask import Blueprint, Response, jsonify, request

from config import db
from models import AttendanceSession, AttendanceRecord, User
from utils.face_utils import load_known_faces

log = logging.getLogger(__name__)
recognize_bp = Blueprint('recognize', __name__)

@recognize_bp.route("/<int:session_id>", methods=["GET"])
def recognize(session_id):
    # ─── 1. Load session ──────────────────────────────
    session = AttendanceSession.query.get(session_id)
    if not session:
        return jsonify({"message": "Attendance session not found."}), 404

    org_id = session.organization_id

    # ─── 2. Load known faces (cached, parallel) ──────
    known_encs, known_user_ids = load_known_faces(org_id)

    # ─── 3. Pre-load users & existing attendance ──────
    users = {
        u.id: u for u in User.query
                                .filter_by(organization_id=org_id)
                                .all()
    }
    existing = {
        r.user_id for r in AttendanceRecord.query
                                           .filter_by(session_id=session.id)
                                           .all()
    }

    # ─── 4. Open camera ───────────────────────────────
    cam_idx = int(request.args.get("camera", 0))
    cap = cv2.VideoCapture(cam_idx, cv2.CAP_DSHOW)
    if not cap.isOpened():
        log.error("Webcam index %d not accessible", cam_idx)
        return jsonify({"message": f"Failed to access webcam {cam_idx}"}), 500

    # ─── 5. Constants & state ─────────────────────────
    GREEN = (0, 255, 0)
    RED   = (0,   0, 255)
    WHITE = (255,255,255)

    prev_time = time.time()
    no_face_since = prev_time
    TIMEOUT = 30  # seconds to auto-stop

    def _play_alert():
        """Beep on timeout."""
        if platform.system() == "Windows":
            import winsound
            winsound.Beep(1000, 500)
        else:
            if platform.system() == "Darwin":
                os.system('say "No face detected"')
            else:
                os.system('echo -e "\a"')

    # ─── 6. Video stream generator ────────────────────
    def generate():
        nonlocal prev_time, no_face_since

        try:
            while True:
                ok, frame = cap.read()
                if not ok:
                    log.warning("Frame read failed, stopping")
                    break

                # Resize + convert
                small = cv2.resize(frame, (800, 600))
                rgb   = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)

                # Detect & encode
                locs = face_recognition.face_locations(rgb, model='hog')
                encs = face_recognition.face_encodings(rgb, locs)

                # Timeout logic
                now = time.time()
                if locs:
                    no_face_since = now
                elif now - no_face_since > TIMEOUT:
                    log.info("No face for %ds → timeout, stopping", TIMEOUT)
                    _play_alert()
                    break

                # Draw boxes & mark attendance immediately per detection
                for fe, loc in zip(encs, locs):
                    name, color = "Unknown", RED
                    if known_encs:
                        dists = face_recognition.face_distance(known_encs, fe)
                        idx   = np.argmin(dists)
                        if dists[idx] < 0.5:
                            uid = known_user_ids[idx]
                            user = users.get(uid)
                            if user and uid not in existing:
                                rec = AttendanceRecord(session_id=session.id, user_id=uid)
                                try:
                                    db.session.add(rec)
                                    db.session.commit()
                                    existing.add(uid)
                                    log.info("Marked attendance for user %s", uid)
                                except Exception as e:
                                    log.exception("Failed to mark attendance for user %s: %s", uid, e)
                            name, color = user.name, GREEN

                    top, right, bottom, left = loc
                    cv2.rectangle(small, (left, top), (right, bottom), color, 2)
                    cv2.rectangle(
                        small,
                        (left, top - 20),
                        (right, top),
                        color,
                        cv2.FILLED
                    )
                    cv2.putText(
                        small,
                        name,
                        (left + 6, top - 6),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        WHITE,
                        1
                    )

                # FPS counter
                curr = time.time()
                fps  = 1.0 / (curr - prev_time)
                prev_time = curr
                cv2.putText(
                    small,
                    f"FPS: {fps:.1f}",
                    (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    WHITE,
                    2
                )

                # Encode & yield
                ret, jpg = cv2.imencode('.jpg', small, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
                if not ret:
                    continue

                yield (
                    b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' +
                    jpg.tobytes() +
                    b'\r\n'
                )
        finally:
            cap.release()
            log.info("Camera released, stream ending")

    return Response(generate(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')
