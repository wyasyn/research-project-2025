import logging
import platform
import os
import time

import cv2
import numpy as np
import face_recognition
from flask import Blueprint, jsonify, request, Response

from config import db
from models import AttendanceSession, AttendanceRecord, User
from utils.face_utils import load_known_faces

log = logging.getLogger(__name__)
recognize_bp = Blueprint('recognize', __name__)


def _draw_labels(frame: np.ndarray, locs: list, names: list[str]) -> np.ndarray:
    """
    Draw bounding boxes and names on the frame at its native resolution.
    """
    for (top, right, bottom, left), name in zip(locs, names):
        color = (39, 123, 62) if name != "Unknown" else (89, 14, 195)
        cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
        cv2.rectangle(frame, (left, top - 20), (right, top), color, cv2.FILLED)
        cv2.putText(
            frame,
            name,
            (left + 6, top - 6),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (255, 255, 255),
            1
        )
    return frame


def _play_alert():
    """Beep on no-face timeout."""
    if platform.system() == "Windows":
        import winsound; winsound.Beep(1000, 500)
    elif platform.system() == "Darwin":
        os.system('say "No face detected"')
    else:
        os.system('echo -e "\a"')


@recognize_bp.route("/window/<int:session_id>", methods=["GET"])
def recognize(session_id):
    """
    Real-time face recognition via OpenCV window for an attendance session.
    Press 'q' to end, or auto-stop after `timeout` seconds of no detection.
    Query params:
      camera: camera index (default 0)
      timeout: seconds to auto-stop on no face (default 30)
    """
    session = AttendanceSession.query.get(session_id)
    if not session:
        return jsonify({"message": "Attendance session not found."}), 404

    known_encs, known_ids = load_known_faces(session.organization_id)
    users = {u.id: u for u in User.query.filter_by(organization_id=session.organization_id)}
    existing = {r.user_id for r in AttendanceRecord.query.filter_by(session_id=session.id)}

    cam_idx = int(request.args.get('camera', 0))
    timeout_s = int(request.args.get('timeout', 30))
    cap = cv2.VideoCapture(cam_idx, cv2.CAP_DSHOW)
    if not cap.isOpened():
        log.error("Cannot open camera %s", cam_idx)
        return jsonify({"message": "Failed to access camera."}), 500

    last_detect = time.time()

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                log.warning("Failed to grab frame for session %s", session_id)
                break

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            locs = face_recognition.face_locations(rgb)
            encs = face_recognition.face_encodings(rgb, locs)

            if locs:
                last_detect = time.time()
            elif time.time() - last_detect > timeout_s:
                _play_alert()
                break

            names = []
            for fe in encs:
                name = "Unknown"
                if known_encs:
                    dists = face_recognition.face_distance(known_encs, fe)
                    idx = np.argmin(dists)
                    if dists[idx] < 0.5:
                        uid = known_ids[idx]
                        user = users.get(uid)
                        if user:
                            if uid not in existing:
                                try:
                                    rec = AttendanceRecord(session_id=session.id, user_id=uid)
                                    db.session.add(rec)
                                    db.session.commit()
                                    existing.add(uid)
                                    log.info("Recorded %s in session %s", uid, session_id)
                                except Exception:
                                    log.exception("Error recording attendance")
                            name = user.name
                names.append(name)

            annotated = _draw_labels(frame.copy(), locs, names)
            cv2.imshow(f"Session {session.id}", annotated)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()
        log.info("Session %s recognition ended", session_id)

    return jsonify({"message": "Recognition ended."})


@recognize_bp.route("/<int:session_id>", methods=["GET"])
def stream(session_id):
    """
    MJPEG browser stream: detects at lower res, then draws labels on full-resolution frame.
    Query params:
      camera (int): camera index (default 0)
      skip (int): detect every nth frame (default 3)
      quality (int): JPEG quality 0-100 (default 50)
    """
    session = AttendanceSession.query.get(session_id)
    if not session:
        return jsonify({"message": "Session not found."}), 404

    known_encs, known_ids = load_known_faces(session.organization_id)
    users = {u.id: u for u in User.query.filter_by(organization_id=session.organization_id)}
    existing = {r.user_id for r in AttendanceRecord.query.filter_by(session_id=session.id)}

    cam_idx = int(request.args.get('camera', 0))
    skip = int(request.args.get('skip', 3))
    quality = int(request.args.get('quality', 50))

    cap = cv2.VideoCapture(cam_idx, cv2.CAP_DSHOW)
    if not cap.isOpened():
        return jsonify({"message": "Cannot open camera."}), 500

    def generate():
        frame_count = 0
        last_locs, last_names = [], []
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame_count += 1

            # Prepare small frame for detection
            small = cv2.resize(frame, (320, 240))
            rgb_small = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)

            # Detection & record every skip frames
            if frame_count % skip == 0:
                locs = face_recognition.face_locations(rgb_small)
                encs = face_recognition.face_encodings(rgb_small, locs)
                names = []
                for fe in encs:
                    name = "Unknown"
                    if known_encs:
                        dists = face_recognition.face_distance(known_encs, fe)
                        idx = np.argmin(dists)
                        if dists[idx] < 0.5:
                            uid = known_ids[idx]
                            user = users.get(uid)
                            if user and uid not in existing:
                                try:
                                    rec = AttendanceRecord(session_id=session.id, user_id=uid)
                                    db.session.add(rec)
                                    db.session.commit()
                                    existing.add(uid)
                                except Exception:
                                    pass
                            name = user.name if user else "Unknown"
                    names.append(name)
                last_locs, last_names = locs, names

            # Scale locations to full frame
            h_ratio = frame.shape[0] / 240
            w_ratio = frame.shape[1] / 320
            scaled_locs = [(
                int(top * h_ratio),
                int(right * w_ratio),
                int(bottom * h_ratio),
                int(left * w_ratio)
            ) for (top, right, bottom, left) in last_locs]

            # Draw on full-resolution frame
            annotated_full = _draw_labels(frame.copy(), scaled_locs, last_names)

            ret2, jpg = cv2.imencode('.jpg', annotated_full, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
            if not ret2:
                continue
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + jpg.tobytes() + b'\r\n')
        cap.release()

    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')
