from flask import Blueprint, request, jsonify, current_app

from config import db
from models import AttendanceRecord, AttendanceSession, User
from datetime import datetime, timezone, timedelta, date
import calendar  # for monthrange
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
        "location": s.location,
        "attendees": len(s.records)
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


@attendance_bp.route("/latest-records", methods=["GET"])
@jwt_required()
def get_latest_attendance_records():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    # Only records from the same organization
    subquery = (
        db.session.query(
            AttendanceRecord.session_id,
            db.func.max(AttendanceRecord.timestamp).label("max_timestamp")
        )
        .join(AttendanceSession)
        .filter(AttendanceSession.organization_id == user.organization_id)
        .group_by(AttendanceRecord.session_id)
        .subquery()
    )

    latest_records = (
        db.session.query(AttendanceRecord)
        .join(AttendanceSession, AttendanceRecord.session_id == AttendanceSession.id)
        .join(User, AttendanceRecord.user_id == User.id)
        .join(subquery, db.and_(
            AttendanceRecord.session_id == subquery.c.session_id,
            AttendanceRecord.timestamp == subquery.c.max_timestamp
        ))
        .order_by(AttendanceRecord.timestamp.desc())
        .limit(10)
        .all()
    )

    result = [{
        "user_id": r.user.id,
        "name": r.user.name,
        "email": r.user.email,
        "image_url": r.user.image_url,
        "session_title": r.session.title,
        "timestamp": r.timestamp.isoformat(),
        "status": r.session.computed_status
    } for r in latest_records]

    return jsonify(result)


@attendance_bp.route("/total-sessions", methods=["GET"])
@jwt_required()
def get_total_sessions():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    total_sessions = (
        AttendanceSession.query
        .filter_by(organization_id=user.organization_id)
        .count()
    )

    return jsonify({"total_sessions": total_sessions})


@attendance_bp.route("/weekly", methods=["GET"])
@jwt_required()
def get_weekly_attendance():
    # parse month param as "YYYY-MM", default to current month
    month_str = request.args.get("month")
    if month_str:
        try:
            year, month = map(int, month_str.split("-", 1))
        except ValueError:
            return jsonify({"message": "month must be in YYYY-MM format"}), 400
    else:
        now = datetime.now(timezone.utc).date()
        year, month = now.year, now.month

    # compute first/last day of month
    first_day = date(year, month, 1)
    last_day   = date(year, month, calendar.monthrange(year, month)[1])

    # find the Monday of the week containing the 1st
    start_monday = first_day - timedelta(days=first_day.weekday())

    # build week ranges
    weeks = []
    cur_start = start_monday
    while cur_start <= last_day:
        cur_end = cur_start + timedelta(days=6)
        # cap to month bounds
        week_start = max(cur_start, first_day)
        week_end   = min(cur_end,   last_day)
        weeks.append((week_start, week_end))
        cur_start = cur_end + timedelta(days=1)

    # get current user & their org
    user = User.query.get_or_404(int(get_jwt_identity()))

    results = []
    for start, end in weeks:
        count = (
            db.session.query(AttendanceRecord)
            .join(AttendanceSession, AttendanceRecord.session_id == AttendanceSession.id)
            .filter(AttendanceSession.organization_id == user.organization_id)
            .filter(AttendanceRecord.timestamp >= datetime.combine(start, datetime.min.time(), tzinfo=timezone.utc))
            .filter(AttendanceRecord.timestamp <  datetime.combine(end + timedelta(days=1), datetime.min.time(), tzinfo=timezone.utc))
            .count()
        )
        results.append({
            "week_start": start.isoformat(),
            "week_end":   end.isoformat(),
            "attendee_count": count
        })

    return jsonify({
        "month": f"{year:04d}-{month:02d}",
        "weeks": results
    })
    
    

@attendance_bp.route("/users/attendance-summary", methods=["GET"])
@jwt_required()
def users_attendance_summary():
    """Returns all users in the org with their attendance stats."""
    requester = User.query.get_or_404(int(get_jwt_identity()))
    if requester.role not in ("admin", "supervisor"):
        return jsonify({"message": "Unauthorized"}), 403

    # all non‐scheduled sessions in this org
    sessions = AttendanceSession.query \
        .filter_by(organization_id=requester.organization_id) \
        .filter(AttendanceSession.status != "scheduled") \
        .all()
    session_ids = [s.id for s in sessions]
    total_sessions = len(sessions)

    users = User.query.filter_by(organization_id=requester.organization_id).all()
    result = []
    for u in users:
        attended = db.session.query(AttendanceRecord) \
            .filter(AttendanceRecord.user_id == u.id) \
            .filter(AttendanceRecord.session_id.in_(session_ids)) \
            .count()
        pct = round((attended / total_sessions) * 100, 2) if total_sessions else 0.0

        result.append({
            "user_id": u.id,
            "name": u.name,
            "email": u.email,
            "image_url": u.image_url,
            "total_sessions": total_sessions,
            "attended_sessions": attended,
            "attendance_percentage": pct
        })

    return jsonify(result), 200


@attendance_bp.route("/sessions/summary", methods=["GET"])
@jwt_required()
def sessions_attendance_summary():
    """Returns all sessions in the org with their attendance stats."""
    requester = User.query.get_or_404(int(get_jwt_identity()))
    if requester.role not in ("admin", "supervisor"):
        return jsonify({"message": "Unauthorized"}), 403

    # all sessions in this org
    sessions = AttendanceSession.query \
        .filter_by(organization_id=requester.organization_id) \
        .order_by(AttendanceSession.start_time.desc()) \
        .all()

    # total users (you can filter by role='user' if you only want end‐users)
    total_users = User.query.filter_by(organization_id=requester.organization_id).count()

    result = []
    for s in sessions:
        count = len(s.records)
        pct = round((count / total_users) * 100, 2) if total_users else 0.0

        result.append({
            "session_id": s.id,
            "title": s.title,
            "date": s.date.isoformat(),
            "start_time": s.start_time.isoformat(),
            "duration_minutes": s.duration_minutes,
            "location": s.location,
            "status": s.computed_status,
            "total_users": total_users,
            "attended_sessions": count,
            "attendance_percentage": pct
        })

    return jsonify(result), 200
