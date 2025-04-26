from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy.orm import load_only
from models import AttendanceRecord, AttendanceSession, User
from config import db
from sqlalchemy import func, extract

user_bp = Blueprint('user', __name__)


from sqlalchemy.orm import load_only

@user_bp.route("/", methods=["GET"])
@jwt_required()
def get_users():
    current_user_id = int(get_jwt_identity())
    current_user = User.query.filter_by(id=current_user_id).first()
    
    if not current_user:
        return jsonify({"error": "User not found"}), 404
    
    role = request.args.get("role", "").strip().lower()  # Optional role filter
    
    users_query = User.query.filter(User.organization_id == current_user.organization_id)
    if role:
        users_query = users_query.filter(User.role == role)

    # Correct usage of load_only()
    users = users_query.options(load_only(User.id, User.user_id, User.name, User.email, User.image_url, User.role)).all()
    
    return jsonify({
        "users": [
            {
                "id": user.id,
                "user_id": user.user_id,
                "name": user.name,
                "email": user.email,
                "image_url": user.image_url,
                "role": user.role,
            }
            for user in users
        ],
        "organization_id": current_user.organization_id  # Include organization ID for context
    }), 200




# Get a user's attendance (filtered by organization)
@user_bp.route("/<user_id>", methods=["GET"])
@jwt_required()
def get_user_attendance(user_id):
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    user = User.query.filter_by(user_id=user_id, organization_id=current_user.organization_id).first()
    if not user:
        return jsonify({"message": "User not found or not in your organization."}), 404

    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    attendance_query = AttendanceRecord.query.join(AttendanceSession).filter(
        AttendanceRecord.user_id == user.id, AttendanceSession.organization_id == current_user.organization_id
    )
    pagination = attendance_query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "user_id": user.user_id,
        "name": user.name,
        "email": user.email,
        "attendance_count": attendance_query.count(),
        "image_url": user.image_url,
        "records": [
            {"session_id": record.session_id, "timestamp": record.timestamp}
            for record in pagination.items
        ],
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total_pages": pagination.pages,
    }), 200


# Delete user
@user_bp.route("/<id>", methods=["DELETE"])
@jwt_required()
def delete_user(id):
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    user = User.query.filter_by(id=id, organization_id=current_user.organization_id).first()
    if not user:
        return jsonify({"error": "User not found or not in your organization."}), 404

    AttendanceRecord.query.filter_by(user_id=user.id).delete()
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User and associated attendance records deleted successfully!"})


# Edit user details (Restricted by organization)
@user_bp.route("/edit/<int:id>", methods=["PUT"])
@jwt_required()
def edit_user(id):
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    user = User.query.filter_by(id=id, organization_id=current_user.organization_id).first()
    if not user:
        return jsonify({"message": "User not found or not in your organization."}), 404

    # Allow supervisors or the user themselves to edit
    if current_user.role != "supervisor" and current_user_id != user.id:
        return jsonify({"message": "Unauthorized access."}), 403

    data = request.get_json()
    user_id = data.get("user_id")
    name = data.get("name")
    email = data.get("email")
    image_url = data.get("image_url")
    
    if not any([user_id, name, email, image_url]):
        return jsonify({"message": "No updates provided."}), 400

    if name:
        user.name = name
    if email:
        user.email = email
    if user_id and current_user.role == "supervisor":
        user.user_id = user_id 
    if image_url:
        user.image_url = image_url

    try:
        db.session.commit()
        return jsonify({"message": "User details updated successfully!"}), 200
    except Exception as e:
        current_app.logger.error(f"Error updating user: {e}")
        db.session.rollback()
        return jsonify({"message": "An error occurred while updating user details."}), 500
    
# Get user's details
@user_bp.route("/details", methods=["GET"])
@jwt_required()
def get_user_details():
    current_user_id = int(get_jwt_identity())
    
    user = User.query.filter_by(id=current_user_id).first()
    
    if not user:
        return jsonify({"error": "User not found."}), 404
    
    user = {
          "user_id": user.user_id,
        "name": user.name,
        "email": user.email,
        "image_url": user.image_url,
        "role": user.role,
    }

    return jsonify({
        "user": user
    }), 200




# get all users logs in an organization
@user_bp.route("/logs", methods=["GET"])
@jwt_required()
def get_logs():
    current_user_id = int(get_jwt_identity())
    current_user = User.query.filter_by(id=current_user_id).first()
    
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    logs_query = AttendanceRecord.query.join(AttendanceSession).filter(
        AttendanceSession.organization_id == current_user.organization_id
    )
    pagination = logs_query.paginate(page=page, per_page=per_page, error_out=False)

    logs_list = [
        {
            "user_id": log.user_id,
            "session_id": log.session_id,
            "timestamp": log.timestamp,
        }
        for log in pagination.items
    ]
    
    return jsonify({
        "logs": logs_list,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total_pages": pagination.pages,
    }), 200




@user_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_organization_stats():
    current_user_id = int(get_jwt_identity())
    current_user = User.query.filter_by(id=current_user_id).first()
    
    if not current_user:
        return jsonify({"error": "User not found"}), 404
    
    organization_id = current_user.organization_id
    
    num_supervisors = User.query.filter_by(organization_id=organization_id, role="supervisor").count()
    num_staff = User.query.filter_by(organization_id=organization_id, role="user").count()
    num_logs = AttendanceRecord.query.join(AttendanceSession).filter(AttendanceSession.organization_id == organization_id).count()
    
    return jsonify({
        "num_supervisors": num_supervisors,
        "num_staff": num_staff,
        "num_logs": num_logs
    }), 200
    
    
@user_bp.route("/search", methods=["GET"])
@jwt_required()
def search_user():
    current_user_id = int(get_jwt_identity())
    current_user = User.query.filter_by(id=current_user_id).first()
    
    if not current_user:
        return jsonify({"error": "User not found"}), 404
    query = request.args.get("query", "").strip()
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400
    
    users = User.query.filter((User.organization_id == current_user.organization_id) & ((User.name.ilike(f"%{query}%")) | (User.email.ilike(f"%{query}%")) | (User.user_id.ilike(f"%{query}%")))).all()

    
    users_list = [
        {
            "id": user.id,
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "image_url": user.image_url,
            "role": user.role,
        }
        for user in users
    ]
    
    return jsonify({"users": users_list}), 200




@user_bp.route("/summary", methods=["GET"])
@jwt_required()
def get_user_attendance_summary():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    # 1. Total sessions in user's organization
    total_sessions = AttendanceSession.query.filter_by(
        organization_id=user.organization_id
    ).count()

    # 2. Sessions the user has attended
    sessions_attended = AttendanceRecord.query.filter_by(
        user_id=user.id
    ).count()

    # 3. Attendance rate
    attendance_rate = (
        (sessions_attended / total_sessions) * 100
        if total_sessions > 0 else 0
    )

    # 4. Recent attendance (latest 10 records)
    recent_records = (
        db.session.query(AttendanceRecord, AttendanceSession)
        .join(AttendanceSession, AttendanceRecord.session_id == AttendanceSession.id)
        .filter(AttendanceRecord.user_id == user.id)
        .order_by(AttendanceRecord.timestamp.desc())
        .limit(10)
        .all()
    )

    recent_attendance = [
        {
            "session_name": session.title,
            "date": record.timestamp.date().isoformat(),
            "status": "Present"  # always present because record exists
        }
        for record, session in recent_records
    ]

    # 5. Monthly progress (how much user attended vs how many sessions were held)
    monthly_sessions = db.session.query(
        extract('year', AttendanceSession.date).label('year'),
        extract('month', AttendanceSession.date).label('month'),
        func.count(AttendanceSession.id).label('total_sessions')
    ).filter(
        AttendanceSession.organization_id == user.organization_id
    ).group_by('year', 'month').order_by('year', 'month').all()

    monthly_attended = db.session.query(
        extract('year', AttendanceRecord.timestamp).label('year'),
        extract('month', AttendanceRecord.timestamp).label('month'),
        func.count(AttendanceRecord.id).label('attended_sessions')
    ).filter(
        AttendanceRecord.user_id == user.id
    ).group_by('year', 'month').order_by('year', 'month').all()

    attended_lookup = {(row.year, row.month): row.attended_sessions for row in monthly_attended}

    monthly_progress = []
    for month in monthly_sessions:
        attended = attended_lookup.get((month.year, month.month), 0)
        rate = (attended / month.total_sessions) * 100 if month.total_sessions > 0 else 0
        monthly_progress.append({
            "month": f"{int(month.year)}-{int(month.month):02d}",
            "attendance_rate": round(rate, 2)
        })

    return jsonify({
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "image": user.image_url
        },
        "organization_name": user.organization.name,
        "total_sessions": total_sessions,
        "sessions_attended": sessions_attended,
        "attendance_rate": round(attendance_rate, 2),
        "recent_attendance": recent_attendance,
        "monthly_progress": monthly_progress
    })
