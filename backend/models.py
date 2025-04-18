from datetime import datetime, timedelta, timezone
from enum import Enum
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.sql import func
from config import db

# ───────────────────────────────────────────────
# ENUMS
# ───────────────────────────────────────────────

class AttendanceStatusEnum(str, Enum):
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    COMPLETED = "completed"


# ───────────────────────────────────────────────
# ORGANIZATION MODEL
# ───────────────────────────────────────────────

class Organization(db.Model):
    __tablename__ = 'organization'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)

    users = db.relationship('User', backref='organization', lazy=True, cascade="all, delete-orphan")
    sessions = db.relationship('AttendanceSession', backref='organization', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Organization {self.name}>"


# ───────────────────────────────────────────────
# USER MODEL
# ───────────────────────────────────────────────

class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.String(255), nullable=True)

    role = db.Column(db.Enum('admin', 'supervisor', 'user', name='user_roles'), nullable=False, default='user')
    organization_id = db.Column(db.Integer, db.ForeignKey('organization.id'), nullable=False)

    attendance_sessions = db.relationship('AttendanceSession', backref='creator', lazy=True)
    records = db.relationship('AttendanceRecord', backref='user', lazy=True)

    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def is_admin(self):
        return self.role == 'admin'

    def is_supervisor(self):
        return self.role == 'supervisor'

    def __repr__(self):
        return f"<User {self.email} - {self.role}>"


# ───────────────────────────────────────────────
# ATTENDANCE SESSION MODEL
# ───────────────────────────────────────────────

class AttendanceSession(db.Model):
    __tablename__ = 'attendance_session'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(255), nullable=True)

    date = db.Column(db.Date, default=lambda: datetime.now(timezone.utc).date())
    start_time = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    duration_minutes = db.Column(db.Integer, nullable=False, default=60)

    status = db.Column(
        db.Enum(AttendanceStatusEnum),
        default=AttendanceStatusEnum.SCHEDULED,
        nullable=False
    )

    organization_id = db.Column(db.Integer, db.ForeignKey('organization.id'), nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    records = db.relationship('AttendanceRecord', backref='session', lazy=True, cascade="all, delete-orphan")

    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    def end_time(self):
        return self.start_time + timedelta(minutes=self.duration_minutes)

    def update_status(self):
        now = datetime.now(timezone.utc)
        if now < self.start_time:
            self.status = AttendanceStatusEnum.SCHEDULED
        elif self.start_time <= now < self.end_time():
            self.status = AttendanceStatusEnum.ACTIVE
        else:
            self.status = AttendanceStatusEnum.COMPLETED

    @property
    def computed_status(self):
        now = datetime.now(timezone.utc)
        if now < self.start_time:
            return AttendanceStatusEnum.SCHEDULED
        elif self.start_time <= now < self.end_time():
            return AttendanceStatusEnum.ACTIVE
        else:
            return AttendanceStatusEnum.COMPLETED

    @classmethod
    def bulk_update_statuses(cls):
        sessions = cls.query.all()
        for session in sessions:
            session.update_status()
        db.session.commit()

    def __repr__(self):
        return f"<Session {self.title} [{self.status}]>"


# ───────────────────────────────────────────────
# ATTENDANCE RECORD MODEL
# ───────────────────────────────────────────────

class AttendanceRecord(db.Model):
    __tablename__ = 'attendance_record'

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('attendance_session.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.UniqueConstraint('session_id', 'user_id', name='unique_attendance_record'),
    )

    def __repr__(self):
        return f"<Record User {self.user_id} Session {self.session_id}>"
