from app import db
from app.api import api
from app.api.auth import token_auth
from app.api.errors import error_response
from app.api.utils import add_to_cart, remove_from_cart, view_cart, book_equipment, cancel_booking
from app.models import User, Equipment, Category, CartItem, Booking
from email_validator import validate_email, EmailNotValidError
from flask import jsonify, request, send_from_directory
from sqlalchemy import select


@api.route("/users", methods=["GET"])
# @token_auth.login_required
def get_users():
    try:
        page = request.args.get("page", 1, type=int)
        per_page = min(request.args.get("per_page", 10, type=int), 15)
        users_query = db.session.query(User)
        users_dict = User.to_table_dict(users_query, page, per_page, "api.get_users")
        return jsonify(users_dict), 200
    except ValueError as ve:
        return error_response(400, f"Bad request: {str(ve)}")


@api.route("/users/add-new", methods=["POST"])
def create_user():
    data = request.get_json()
    if not data:
        return error_response(400, "Invalid JSON")
    email = data.get("email")
    firstname = data.get("firstname")
    lastname = data.get("lastname")
    if email and firstname and lastname:
        try:
            validate_email(email)
        except EmailNotValidError as e:
            return error_response(400, f"Invalid email address: {str(e)}")

        user = db.session.scalar(select(User).where(User.email == email))
        if user:
            return error_response(409, "User already exists")

        new_user = User(firstname=firstname, lastname=lastname, email=email)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User added successfully"}), 201
    return error_response(400, "Required parameters `email`, `firstname` or `lastname` missing")


@api.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = db.session.scalar(select(User).where(User.id == user_id))
    return jsonify(user.to_dict()) if user else error_response(404)


@api.route("/users/<int:user_id>/", methods=["PUT"])
def edit_user(user_id):
    data = request.get_json()
    if not data:
        return error_response(400, "Invalid JSON")

    email = data.get("email")
    firstname = data.get("firstname")
    lastname = data.get("lastname")
    status = data.get("status")

    if email:
        try:
            valid = validate_email(email)
            email = valid.email
        except EmailNotValidError as e:
            return error_response(400, f"Invalid email address {str(e)}")

        # Check if the email already exists in another user
        existing_user = db.session.scalar(select(User).where(User.email == email, User.id != user_id))
        if existing_user:
            return error_response(409, "Email already exists")

    user = db.session.scalar(select(User).where(User.id == user_id))
    if not user:
        return error_response(404, "User not found")

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
def delete_user(user_id):
    user = db.session.scalar(select(User).where(User.id == user_id))
    if not user:
        return error_response(404, "User not found")

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200


@api.route("/equipments", methods=["GET"])
@api.route("/equipments/<category>", methods=["GET"])
def get_equipments(category=None):
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        location = request.args.get("location", "all")

        equipment_query = db.session.query(Equipment)

        if category:
            if category in [cat.slug for cat in Category.query.all()]:
                equipment_query = equipment_query.filter(Equipment.category.has(Category.slug == category))
            elif category == "all":
                pass
            else:
                return error_response(404, "Category not found")

        if location and location != 'all':
            equipment_query = equipment_query.filter(Equipment.location == location.capitalize())

        equipment_dict = Equipment.to_table_dict(equipment_query, page, per_page, "api.get_equipments")
        return jsonify(equipment_dict), 200

    except ValueError as ve:
        return error_response(400, f"Bad request: {str(ve)}")
    except Exception as e:
        return error_response(500, f"An error occurred: {str(e)}")


@api.route("/equipment/add-new", methods=["POST"])
def create_equipment():
    data = request.get_json()
    if not data:
        return error_response(400, "Invalid JSON")
    name = data.get("name")
    description = data.get("description")
    category = data.get("category")
    if name and description and category:
        new_equipment = Equipment(name=name, description=description, category=category)
        new_equipment.generate_slug()
        db.session.add(new_equipment)
        db.session.commit()
        return jsonify({"message": "Equipment added successfully"}), 201
    return error_response(400, "Required parameters `name`, `description` or `category` missing")


@api.route("/equipment/<slug>")
def get_equipment(slug):
    try:
        equipment = db.session.scalar(select(Equipment).where(Equipment.id == int(slug)))
    except ValueError:
        equipment = db.session.scalar(select(Equipment).where(Equipment.slug == slug))
    finally:
        return jsonify(equipment.to_dict()) if equipment else error_response(404)


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


@api.route("/cart/add/<int:equipment_id>", methods=["POST"])
# @token_auth.login_required
def add_to_cart_endpoint(equipment_id):
    user = token_auth.current_user()
    equipment = db.session.scalar(select(Equipment).where(Equipment.id == equipment_id))
    result = add_to_cart(user, equipment)
    return jsonify(result)


@api.route("/cart/remove/<int:equipment_id>", methods=["POST"])
# @token_auth.login_required
def remove_from_cart_endpoint(equipment_id):
    user = token_auth.current_user()
    equipment = db.session.scalar(select(Equipment).where(Equipment.id == equipment_id))
    result = remove_from_cart(user, equipment)
    return jsonify(result)


@api.route("/cart/view", methods=["GET"])
# @token_auth.login_required
def view_cart_endpoint():
    user = token_auth.current_user()
    result = view_cart(user)
    return jsonify(result)


@api.route("/book", methods=["POST"])
# @token_auth.login_required
def book_equipment_endpoint():
    user = token_auth.current_user()
    result = book_equipment(user)
    return jsonify(result)


@api.route("/booking/cancel/<int:booking_id>", methods=["POST"])
# @token_auth.login_required
def cancel_booking_endpoint(booking_id):
    user = token_auth.current_user()
    result = cancel_booking(user, booking_id)
    return jsonify(result)


@api.route("/images/<path:filename>")
def serve_file(filename):
    send_from_directory("static/dist/img/equipment", filename)
