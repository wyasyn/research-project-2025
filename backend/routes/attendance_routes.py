from flask import Blueprint, request, jsonify, current_app
import pandas as pd
from config import db
from models import AttendanceRecord, AttendanceSession, User
from datetime import datetime, timezone
from flask_jwt_extended import jwt_required, get_jwt_identity

from middleware import supervisor_required
from utils.pagination_utils import paginate_query

from dateutil import parser  # pip install python-dateutil

attendance_bp = Blueprint('attendance', __name__)


@attendance_bp.route("/sessions", methods=["POST"])
@jwt_required()
def create_session():
    data = request.get_json()
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role not in ['admin', 'supervisor']:
        return {"message": "Unauthorized"}, 403

    session = AttendanceSession(
        title=data.get("title"),
        description=data.get("description"),
        location=data.get("location"),
        start_time=datetime.fromisoformat(data.get("start_time")),
        duration_minutes=data.get("duration_minutes"),
        date=parser.parse(data.get("date")).date() if data.get("date") else datetime.now(timezone.utc).date(),
        organization_id=user.organization_id,
        creator_id=user.id
    )

    db.session.add(session)
    db.session.commit()

    return jsonify({"message": "Session created", "session_id": session.id}), 201



@attendance_bp.route("/sessions", methods=["GET"])
@jwt_required()
def get_all_sessions():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    # Base query
    query = AttendanceSession.query.filter_by(organization_id=user.organization_id).order_by(AttendanceSession.start_time.desc())

    # Pagination parameters
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    # Paginate
    paginated, metadata = paginate_query(query, page, per_page)

    results = [{
        "id": s.id,
        "title": s.title,
        "date": s.date.isoformat(),
        "start_time": s.start_time.isoformat(),
        "duration_minutes": s.duration_minutes,
        "status": s.computed_status,
        "location": s.location
    } for s in paginated]

    return jsonify({
        "sessions": results,
        "pagination": metadata
    })


@attendance_bp.route("/sessions/<int:session_id>", methods=["GET"])
@jwt_required()
def get_session_details(session_id):
    session = AttendanceSession.query.get_or_404(session_id)
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.organization_id != session.organization_id:
        return {"message": "Unauthorized"}, 403

    session.update_status()
    db.session.commit()

    return jsonify({
        "id": session.id,
        "title": session.title,
        "description": session.description,
        "start_time": session.start_time.isoformat(),
        "duration_minutes": session.duration_minutes,
        "status": session.status,
        "location": session.location,
        "records": [{
            "user_id": r.user_id,
            "name": r.user.name,
            "timestamp": r.timestamp.isoformat()
        } for r in session.records]
    })


@attendance_bp.route("/sessions/<int:session_id>/status", methods=["PATCH"])
@jwt_required()
def update_session_status(session_id):
    session = AttendanceSession.query.get_or_404(session_id)
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role not in ["admin", "supervisor"] or user.organization_id != session.organization_id:
        return {"message": "Unauthorized"}, 403

    session.update_status()
    db.session.commit()

    return jsonify({"message": "Status updated", "status": session.status})



@attendance_bp.route("/sessions/<int:session_id>", methods=["DELETE"])
@jwt_required()
def delete_session(session_id):
    session = AttendanceSession.query.get_or_404(session_id)
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role not in ["admin", "supervisor"] or user.organization_id != session.organization_id:
        return {"message": "Unauthorized"}, 403

    db.session.delete(session)
    db.session.commit()

    return jsonify({"message": "Session deleted successfully."})


@attendance_bp.route("/my-records", methods=["GET"])
@jwt_required()
def get_my_attendance_records():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    records = AttendanceRecord.query.filter_by(user_id=user.id).join(AttendanceSession).order_by(AttendanceSession.start_time.desc()).all()

    result = [{
        "session_id": r.session_id,
        "title": r.session.title,
        "date": r.session.date.isoformat(),
        "timestamp": r.timestamp.isoformat(),
        "status": r.session.computed_status
    } for r in records]

    return jsonify(result)


@attendance_bp.route("/user-records/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user_attendance_records(user_id):
    registerer_id = int(get_jwt_identity())
    requester = User.query.get(registerer_id)
    target_user = User.query.get_or_404(user_id)

    if requester.role not in ["admin", "supervisor"] or requester.organization_id != target_user.organization_id:
        return {"message": "Unauthorized"}, 403

    records = AttendanceRecord.query.filter_by(user_id=user_id).join(AttendanceSession).order_by(AttendanceSession.start_time.desc()).all()

    result = [{
        "session_id": r.session_id,
        "title": r.session.title,
        "date": r.session.date.isoformat(),
        "timestamp": r.timestamp.isoformat(),
        "status": r.session.computed_status
    } for r in records]

    return jsonify(result)


@attendance_bp.route("/my-attendance/percentage", methods=["GET"])
@jwt_required()
def get_my_attendance_percentage():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    start_date = request.args.get("start")
    end_date = request.args.get("end")

    session_query = AttendanceSession.query.filter_by(
        organization_id=user.organization_id
    ).filter(AttendanceSession.status != "scheduled")

    if start_date:
        session_query = session_query.filter(AttendanceSession.date >= parser.parse(start_date).date())
    if end_date:
        session_query = session_query.filter(AttendanceSession.date <= parser.parse(end_date).date())

    total_sessions = session_query.count()

    # Only fetch attendance records for filtered sessions
    session_ids = [s.id for s in session_query.all()]
    attended_sessions = AttendanceRecord.query.filter(
        AttendanceRecord.user_id == user.id,
        AttendanceRecord.session_id.in_(session_ids)
    ).count()

    percentage = round((attended_sessions / total_sessions) * 100, 2) if total_sessions else 0.0

    return jsonify({
        "user_id": user.id,
        "name": user.name,
        "total_sessions": total_sessions,
        "attended_sessions": attended_sessions,
        "attendance_percentage": percentage
    })



@attendance_bp.route('/mark', methods=["POST"])
@jwt_required()
@supervisor_required 
def mark_attendance():
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        session_id = data.get("session_id")

        if not user_id or not session_id:
            return jsonify({"message": "User ID and session ID are required."}), 400

        # Check if attendance already exists
        if db.session.query(AttendanceRecord.id).filter_by(user_id=user_id, session_id=session_id).first():
            return jsonify({"message": "User has already been marked present."}), 409

        new_record = AttendanceRecord(user_id=user_id, session_id=session_id)
        db.session.add(new_record)
        db.session.commit()

        return jsonify({"message": "Attendance recorded successfully!"}), 201
    except Exception as e:
        current_app.logger.error(f"Error marking attendance: {e}")
        return jsonify({"message": "An error occurred while marking attendance."}), 500
