import cv2
from flask import Blueprint, Response, jsonify
import face_recognition
import numpy as np

from models import AttendanceRecord, AttendanceSession, User
from utils.face_utils import load_known_faces
from config import db

recognize_bp = Blueprint('recognize', __name__)

@recognize_bp.route("/<int:session_id>", methods=["GET"]) 
def recognize(session_id):
    session = AttendanceSession.query.get(session_id)
    if not session:
        return jsonify({"message": "Attendance session not found."}), 404

    # Load known faces ONLY for users in this organization
    known_face_encodings, known_face_names = load_known_faces(session.organization_id)

    # Load users and attendance records once to prevent multiple queries
    users = {user.id: user for user in User.query.filter_by(organization_id=session.organization_id).all()}
    existing_attendance = {record.user_id for record in AttendanceRecord.query.filter_by(session_id=session.id).all()}

    # Open webcam
    video_capture = cv2.VideoCapture(0, cv2.CAP_DSHOW)  # CAP_DSHOW speeds up camera on Windows
    if not video_capture.isOpened():
        return jsonify({"message": "Failed to access the webcam."}), 500

    # Define colors
    GREEN = (39, 123, 62)
    RED = (89, 14, 195)
    new_attendance_records = []
    
    def generate_video_stream():
        frame_count = 0
        try:
            while True:
                ret, frame = video_capture.read()
                if not ret:
                    break

                frame_count += 1
                if frame_count % 3 != 0:  # Only process every 3rd frame to optimize performance
                    continue

                # Convert frame to RGB (OpenCV loads images in BGR)
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

                # Detect faces
                face_locations = face_recognition.face_locations(rgb_frame)
                face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

                for face_encoding, location in zip(face_encodings, face_locations):
                    # Compute distances between detected face and known faces
                    if known_face_encodings:
                        face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                        best_match_index = np.argmin(face_distances) if len(face_distances) > 0 else None
                    else:
                        best_match_index = None

                    name = "Unknown"
                    color = RED

                    if best_match_index is not None and face_distances[best_match_index] < 0.4:
                        user_id = known_face_names[best_match_index]
                        user = users.get(user_id)

                        if user and user.id not in existing_attendance:
                            # Store attendance in memory instead of writing to DB immediately
                            new_attendance_records.append(
                                AttendanceRecord(session_id=session.id, user_id=user.id)
                            )
                            existing_attendance.add(user.id)  # Mark as recorded
                            name = user.name
                            color = GREEN

                    # Draw bounding box and label
                    top, right, bottom, left = location
                    cv2.rectangle(frame, (left, top), (right, bottom), color, 2)

                    # Draw name label
                    label_position = max(top - 10, 0)
                    cv2.rectangle(frame, (left, label_position - 20), (right, label_position), color, cv2.FILLED)
                    font = cv2.FONT_HERSHEY_SIMPLEX
                    cv2.putText(frame, name, (left + 6, label_position - 5), font, 0.5, (255, 255, 255), 1)

                # Encode frame as JPEG for streaming
                ret, jpeg = cv2.imencode('.jpg', frame)
                if not ret:
                    break

                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n\r\n')

        except Exception as e:
            print(f"Error during face recognition: {e}")
            return jsonify({"message": "Error during face recognition."}), 500

        finally:
            video_capture.release()

            # Bulk insert new attendance records to reduce DB operations
            if new_attendance_records:
                db.session.bulk_save_objects(new_attendance_records)
                db.session.commit()

    return Response(generate_video_stream(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')
