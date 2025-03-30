import requests
import face_recognition
from io import BytesIO
from PIL import Image
from models import User
from config import db

# Dictionary cache to store known faces per organization
known_faces_cache = {}

def load_known_faces(organization_id, force_reload=False):
    """Load known face encodings for a given organization."""
    global known_faces_cache

    # Return cached data if available and not forcing reload
    if not force_reload and organization_id in known_faces_cache:
        return known_faces_cache[organization_id]

    known_face_encodings, known_face_names = [], []

    # Fetch users with images from the specific organization
    users = db.session.query(User.user_id, User.image_url).filter(
        User.image_url.isnot(None),
        User.organization_id == organization_id
    ).all()

    for user_id, image_url in users:
        try:
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()  # Ensure the request was successful

            # Open image and validate format
            try:
                image = Image.open(BytesIO(response.content))
                image = image.convert("RGB")  # Ensure image is in RGB format
            except OSError:
                print(f"[Warning] Skipping {user_id}: Unidentified image format.")
                continue

            # Convert image to bytes buffer
            buffer = BytesIO()
            image.save(buffer, format="JPEG")
            buffer.seek(0)

            # Process image for face recognition
            face_image = face_recognition.load_image_file(buffer)
            face_encodings = face_recognition.face_encodings(face_image)

            if face_encodings:
                known_face_encodings.extend(face_encodings)
                known_face_names.extend([user_id] * len(face_encodings))  # Map all detected faces to the user
            else:
                print(f"[Warning] No face detected for {user_id}")

        except requests.Timeout:
            print(f"[Error] Timeout: Skipping {user_id} due to slow response.")
        except requests.HTTPError as http_err:
            print(f"[Error] HTTP Error {http_err.response.status_code} for {user_id}")
        except requests.RequestException as req_err:
            print(f"[Error] Skipping {user_id}: Image request failed ({req_err})")
        except Exception as e:
            print(f"[Error] Unexpected issue processing {user_id}: {e}")

    # Cache the results per organization
    known_faces_cache[organization_id] = (known_face_encodings, known_face_names)
    return known_faces_cache[organization_id]
