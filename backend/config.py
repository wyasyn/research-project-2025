import os
from pathlib import Path
from datetime import timedelta

from dotenv import load_dotenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# 1) Load .env from project root
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


# 2) Define upload folder as an absolute path
UPLOAD_FOLDER = BASE_DIR / "uploads"
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

# 3) Extensions (uninitialized)
db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()

class Config:
    # Flask core
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB uploads

    # SQLAlchemy
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Uploads
    UPLOAD_FOLDER = str(UPLOAD_FOLDER)
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(weeks=1)

    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")


def create_app():
    app = Flask(__name__, instance_relative_config=False)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": app.config["CORS_ORIGINS"]}})

    # Register blueprints (all routes)
    from routes.user_routes import user_bp
    from routes.auth_routes import auth_bp
    from routes.recognize_routes import recognize_bp
    from routes.attendance_routes import attendance_bp
    from routes.stats_routes import stats_bp
    from routes.organization_routes import organization_bp
    from routes.upload import upload_bp

    app.register_blueprint(user_bp, url_prefix='/users')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(recognize_bp, url_prefix='/recognize')
    app.register_blueprint(attendance_bp, url_prefix='/attendance')
    app.register_blueprint(stats_bp, url_prefix='/stats')
    app.register_blueprint(organization_bp, url_prefix='/organizations')
    app.register_blueprint(upload_bp, url_prefix='/upload')

    return app
