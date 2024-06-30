from app import db
from app.api import api
from app.models import User
from flask_httpauth import HTTPBasicAuth, HTTPTokenAuth

from app.api.errors import error_response
from sqlalchemy import select

basic_auth = HTTPBasicAuth()
token_auth = HTTPTokenAuth()


@basic_auth.verify_password
def verify_password(email, password):
    user = db.session.scalar(select(User).where(User.email == email))
    if user and user.check_password(password):
        return user


@basic_auth.error_handler
def basic_auth_error(status):
    return error_response(status)


@token_auth.verify_token
def verify_token(token):
    return User.check_token(token) if token else None


@token_auth.error_handler
def token_auth_error(status):
    return error_response(status)


@api.route("/tokens", methods=["POST"])
@basic_auth.login_required
def get_token():
    token = basic_auth.current_user().get_token()
    db.session.commit()
    return {"token": token}


@api.route("/tokens", methods=["DELETE"])
@token_auth.login_required
def revoke_token():
    token_auth.current_user().revoke_token()
    db.session.commit()
    return "", 204
