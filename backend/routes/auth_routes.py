from datetime import timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from models import User, Organization
from config import SECRET_KEY, db

from utils.auth_utils import generate_jwt_tokens

auth_bp = Blueprint('auth', __name__)


# Registration Route
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        required_fields = ["user_id", "name", "email", "password", "organization_id"]
        if not all(data.get(field) for field in required_fields):
            return jsonify({"message": "All required fields must be provided."}), 400

        user_id, name, email, password, organization_id = (
            data["user_id"], data["name"], data["email"], data["password"], data["organization_id"]
        )
        image_url = data.get("image_url")
        role = data.get("role", "user")

        if User.query.filter_by(user_id=user_id).first():
            return jsonify({"message": "User ID already exists."}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({"message": "Email already exists."}), 400
        if not Organization.query.get(organization_id):
            return jsonify({"message": "Invalid organization ID."}), 404

        new_user = User(
            user_id=user_id,
            name=name,
            email=email,
            image_url=image_url,
            organization_id=organization_id,
            role=role
        )
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        # Generate Access and Refresh Tokens
        access_token, refresh_token = generate_jwt_tokens(new_user)

        return jsonify({
            "message": "User registered successfully!",
            "access_token": access_token,
            "refresh_token": refresh_token
        }), 201

    except Exception as e:
        current_app.logger.error(f"Registration error: {e}")
        return jsonify({"message": "An error occurred during registration."}), 500


# Login Route
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email, password = data.get("email"), data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required."}), 400

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({"error": "Invalid credentials."}), 401

        # Generate Access and Refresh Tokens
        access_token, refresh_token = generate_jwt_tokens(user)

        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token
        }), 200

    except Exception as e:
        current_app.logger.error(f"Login error: {e}")
        return jsonify({"error": "An error occurred during login."}), 500





@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True) 
def refresh():
    """
    Generates a new access token using a valid refresh token.
    """
    user_id = get_jwt_identity()  # Get the user_id from the refresh token

    new_access_token = create_access_token(
        identity=user_id,
        expires_delta=timedelta(days=7)  # New 7-day token
    )

    return jsonify({"access_token": new_access_token}), 200