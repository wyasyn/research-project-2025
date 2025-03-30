from flask_jwt_extended import create_access_token, create_refresh_token
from datetime import timedelta

def generate_jwt_tokens(user):
    """
    Generates an access and refresh token for a user.
    - Access token: Valid for 7 days.
    - Refresh token: Valid for 30 days.
    """
    additional_claims = {
        "role": user.role,
        "organization_id": user.organization_id  
    }

    access_token = create_access_token(
        identity=user.user_id,  
        additional_claims=additional_claims,
        expires_delta=timedelta(days=7)  # 7-day access token
    )

    refresh_token = create_refresh_token(
        identity=user.user_id,
        expires_delta=timedelta(days=30)  # 30-day refresh token
    )

    return access_token, refresh_token
