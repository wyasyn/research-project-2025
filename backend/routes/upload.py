import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from werkzeug.utils import secure_filename

upload_bp = Blueprint('upload', __name__)

def allowed_file(filename: str) -> bool:
    allowed_exts = current_app.config['ALLOWED_EXTENSIONS']
    return (
        '.' in filename and 
        filename.rsplit('.', 1)[1].lower() in allowed_exts
    )

@upload_bp.route("/", methods=["POST"])
def upload_image():
    if 'file' not in request.files:
        return jsonify({"message": "No file part in request."}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file."}), 400

    if not allowed_file(file.filename):
        return jsonify({"message": "Unsupported file type."}), 400

    # pull the absolute folder from config
    upload_folder = current_app.config['UPLOAD_FOLDER']

    # create a unique, safe filename
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    save_path = os.path.join(upload_folder, secure_filename(filename))

    # save it
    file.save(save_path)

    # build the public URL
    image_url = f"{request.url_root.rstrip('/')}/upload/{filename}"
    return jsonify({"url": image_url}), 201

@upload_bp.route('/<path:filename>')
def uploaded_file(filename):
    upload_folder = current_app.config['UPLOAD_FOLDER']
    return send_from_directory(upload_folder, filename)
