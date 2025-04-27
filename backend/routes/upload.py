import os
import uuid
from flask import Blueprint, request, jsonify
from flask import send_from_directory
from werkzeug.utils import secure_filename

upload_bp = Blueprint('upload', __name__)

# Configurations
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route("/upload", methods=["POST"])
def upload_image():
    if 'file' not in request.files:
        return jsonify({"message": "No file part in request."}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"message": "No selected file."}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"message": "Unsupported file type."}), 400

    # Create a safe unique filename
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    save_path = os.path.join(UPLOAD_FOLDER, secure_filename(filename))
    
    # Save the file
    file.save(save_path)

    # Assuming you serve uploads via `/uploads/<filename>`
    image_url = f"{request.url_root.rstrip('/')}/upload/{filename}"
    
    return jsonify({"url": image_url}), 201


@upload_bp.route('/upload/<path:filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)
