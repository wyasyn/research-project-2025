import cv2
import threading
import queue
from flask import Blueprint, Response, jsonify, request
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

    camera_index = int(request.args.get("camera", 0))
    # Open webcam
    video_capture = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)
    if not video_capture.isOpened():
        return jsonify({"message": f"Failed to access the webcam at index {camera_index}."}), 500

    # Define colors
    GREEN = (39, 123, 62)
    RED = (89, 14, 195)
    new_attendance_records = []

    # Queue for processed frames
    frame_queue = queue.Queue()

    # Function to process face recognition in a separate thread
    def process_frame(frame):
        nonlocal new_attendance_records

        # Resize frame to a smaller resolution for faster processing
        frame = cv2.resize(frame, (640, 480))

        # Convert frame to RGB (OpenCV loads images in BGR)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Detect faces (HOG model for faster processing)
        face_locations = face_recognition.face_locations(rgb_frame, model='hog')
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
                    existing_attendance.add(user.id)
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

        # Encode frame as JPEG for streaming (with reduced quality)
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 50]  # Set JPEG quality to 50 (0-100)
        ret, jpeg = cv2.imencode('.jpg', frame, encode_param)
        if not ret:
            return None
        return jpeg.tobytes()

    def generate_video_stream():
        frame_count = 0
        try:
            while True:
                ret, frame = video_capture.read()
                if not ret:
                    break

                frame_count += 1
                if frame_count % 5 != 0:  # Skip more frames for performance
                    continue

                # Process the frame in a separate thread
                thread = threading.Thread(target=lambda: frame_queue.put(process_frame(frame)))
                thread.start()

                # Get the result from the queue
                result = frame_queue.get()
                if result is None:
                    continue  # If the frame wasn't processed successfully, skip

                # Yield the processed frame for streaming
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + result + b'\r\n\r\n')

                # Commit attendance records if we have 10 or more
                if len(new_attendance_records) >= 10:
                    db.session.bulk_save_objects(new_attendance_records)
                    db.session.commit()
                    new_attendance_records.clear()

        except Exception as e:
            print(f"Error during face recognition: {e}")
            return jsonify({"message": "Error during face recognition."}), 500

        finally:
            video_capture.release()

    return Response(generate_video_stream(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')
