from app import db
from app.api import api
from app.models import User
from app.api.errors import error_response
from flask import jsonify, request
from flask_httpauth import HTTPBasicAuth, HTTPTokenAuth
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


@api.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()

    if user is None or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = user.get_token()
    db.session.commit()
    return jsonify({'token': token, 'role': user.role})


@api.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    names = data.get("name").split(" ")
    firstname, lastname = names[0], names[1]
    email = data.get("email")
    password = data.get("password")

    if not firstname or not lastname or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 400

    new_user = User(firstname=firstname, lastname=lastname, email=email)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    token = new_user.get_token()

    return jsonify({"message": "User created successfully", "token": token}), 201


@api.route("/logout", methods=["POST"])
@token_auth.login_required
def logout():
    token_auth.current_user.revoke_token()
    db.session.commit()
    return jsonify({"message": "Logged out successfully"}), 200
