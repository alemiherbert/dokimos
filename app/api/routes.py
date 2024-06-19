from app import db
from app.api import api
from app.models import User
from app.api.errors import error_response
from sqlalchemy import select
from flask import jsonify, request

from email_validator import validate_email, EmailNotValidError


@api.route("/users", methods=["GET"])
def users_get():
    try:
        page = request.args.get("page", 1, type=int)
        per_page = min(request.args.get("per_page", 10, type=int), 15)
        users_query = db.session.query(User)
        users_dict = User.to_table_dict(users_query, page, per_page, "api.users_get")
        return jsonify(users_dict), 200
    except ValueError as ve:
        error_response(400, f"Bad request: {str(ve)}")


@api.route("/users/add-new", methods=["POST"])
def user_create():
    try:
        data = request.get_json()
        if not data:
            error_response(400, "Invalid JSON")

        email = data.get("email")
        firstname = data.get("firstname")
        lastname = data.get("lastname")
        if not (email and firstname and lastname):
            error_response(400, "Required parameters `email` `firstname` and `lastname` missing")

        validate_email(email)
        user = db.session.scalar(select(User).where(User.email == email))
        if user:
            error_response(409, "Resource already exists")

        new_user = User(email=email)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User created successfully"}), 201

    except EmailNotValidError as e:
        error_response(400, f"Invalid email address: {str(e)}")
    except Exception as e:
        error_response(500, "An unexpected error occurred: {}".format(str(e)))


@api.route("/users/<int:user_id>", methods=["GET"])
def user_get(user_id):
    user = db.session.scalar(select(User).where(User.id == user_id))
    if not user:
        error_response(404)
    return jsonify(user.to_dict())


@api.route("/users/<int:user_id>/", methods=["PUT"])
def user_edit(user_id):
    data = request.get_json()
    if not data:
        error_response(400, "Invalid JSON")

    email = data.get("email")
    firstname = data.get("firstname")
    lastname = data.get("lastname")
    status = data.get("status")

    if email:
        try:
            valid = validate_email(email)
            email = valid.email
        except EmailNotValidError as e:
            error_response(400, f"Invalid email address {str(e)}")

        # Check if the email already exists in another user
        existing_user = db.session.scalar(select(User).where(User.email == email, User.id != user_id))
        if existing_user:
            error_response(409, "Email already exists")

    user = db.session.scalar(select(User).where(User.id == user_id))
    if not user:
        error_response(404, "User not found")

    if email:
        user.email = email
    if firstname:
        user.firstname = firstname
    if lastname:
        user.lastname = lastname
    if status:
        user.status = status

    db.session.commit()
    return jsonify({"message": "User updated successfully"}), 200


@api.route("/users/<int:user_id>/", methods=["DELETE"])
def user_delete(user_id):
    user = db.session.scalar(select(User).where(User.id == user_id))
    if not user:
        error_response(404)

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200


@api.route("/equipment")
def equipment():
    return "Equipment management"


@api.route("/equipment/add-new")
def create_equipment():
    return "Create equipment"


@api.route("/equipment/<int:equipment_id>")
def view_equipment(equipment_id):
    return f"View equipment {equipment_id}"


@api.route("/equipment/<int:equipment_id>/edit")
def edit_equipment(equipment_id):
    return f"Edit equipment {equipment_id}"


@api.route("/equipment/<int:equipment_id>/delete")
def delete_equipment(equipment_id):
    return f"Delete equipment {equipment_id}"


@api.route("/categories")
def categories():
    return "Category management"


@api.route("/categories/add-new")
def create_category():
    return "Create category"


@api.route("/categories/<int:category_id>")
def view_category(category_id):
    return f"View category {category_id}"


@api.route("/categories/<int:category_id>/edit")
def edit_category(category_id):
    return f"Edit category {category_id}"


@api.route("/categories/<int:category_id>/delete")
def delete_category(category_id):
    return f"Delete category {category_id}"
