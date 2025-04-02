from flask import jsonify
from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import User

# Middleware to check if the user is an admin
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()
        user_id = int(get_jwt_identity())
        user = User.query.filter_by(id=user_id).first()
        if not user or user.role != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function

# Middleware to check if the user is a supervisor
def supervisor_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()
        user_id = int(get_jwt_identity())
        user = User.query.filter_by(id=user_id).first()
        if not user or user.role != "supervisor":
            return jsonify({"error": "Supervisor access required"}), 403
        return f(*args, **kwargs)
    return decorated_function
