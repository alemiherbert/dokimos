from app import db
from app.admin import admin
from app.models import User

from sqlalchemy import select
from flask import jsonify, abort, render_template, request
from email_validator import validate_email, EmailNotValidError


@admin.route("/login")
def login():
    return 'Admin signin'


@admin.route("/")
def dashboard():
    return render_template('admin/dashboard.html')


@admin.route("/users", methods=['GET'])
def users_all():
    try:
        users = db.session.scalars(select(User)).all()
        users_data = [{'id': user.id,
                       'email': user.email,
                       'firstname': user.firstname,
                       'lastname': user.lastname,
                       'status': user.status,
                       'date_joined': user.date_joined
                       } for user in users]
        return jsonify(users_data), 200
    except Exception as e:
        abort(500, f'An unexpected error occurred: {str(e)}')


@admin.route("/users/add-new", methods=['POST'])
def user_create():
    try:
        json_data = request.get_json()
        if not json_data:
            abort(400, 'Invalid JSON')

        email = json_data.get('email')
        firstname = json_data.get('firstname')
        lastname = json_data.get('lastname')
        if not (email and firstname and lastname):
            abort(400, 'Email, firstname, and lastname are required')

        validate_email(email)
        user = db.session.scalar(select(User).where(User.email == email))
        if user:
            abort(400, 'User already exists')

        new_user = User(email=email)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({'message': 'User created successfully'}), 201

    except EmailNotValidError:
        abort(400, 'Invalid email address')
    except Exception as e:
        abort(500, 'An unexpected error occurred: {}'.format(str(e)))


@admin.route("/users/<int:user_id>", methods=['GET'])
def user(user_id):
    user = db.session.scalar(select(User).where(User.id == user_id))
    if not user:
        abort(404, 'User not found')
    return jsonify(user.to_dict())


@admin.route("/users/<int:user_id>/", methods=['PUT'])
def user_edit(user_id):
    json_data = request.get_json()
    if not json_data:
        abort(400, 'Invalid JSON')

    email = json_data.get('email')
    firstname = json_data.get('firstname')
    lastname = json_data.get('lastname')

    if email:
        try:
            validate_email(email)
        except EmailNotValidError:
            abort(400, 'Invalid email address')

        # Check if the email already exists in another user
        existing_user = db.session.scalar(select(User).where(User.email == email, User.id != user_id))
        if existing_user:
            abort(400, 'Email already exists')

    user = db.session.scalar(select(User).where(User.id == user_id))
    if not user:
        abort(404, 'User not found')

    if email:
        user.email = email
    if firstname:
        user.firstname = firstname
    if lastname:
        user.lastname = lastname

    db.session.commit()
    return jsonify({'message': 'User updated successfully'}), 200


@admin.route("/users/<int:user_id>/", methods=['DELETE'])
def user_delete(user_id):
    user = db.session.scalar(select(User).where(User.id == user_id))
    if not user:
        abort(404, 'User not found')

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'}), 200


@admin.route("/equipment")
def equipment():
    return 'Equipment management'


@admin.route("/equipment/add-new")
def create_equipment():
    return 'Create equipment'


@admin.route("/equipment/<int:equipment_id>")
def view_equipment(equipment_id):
    return f'View equipment {equipment_id}'


@admin.route("/equipment/<int:equipment_id>/edit")
def edit_equipment(equipment_id):
    return f'Edit equipment {equipment_id}'


@admin.route("/equipment/<int:equipment_id>/delete")
def delete_equipment(equipment_id):
    return f'Delete equipment {equipment_id}'


@admin.route("/categories")
def categories():
    return 'Category management'


@admin.route("/categories/add-new")
def create_category():
    return 'Create category'


@admin.route("/categories/<int:category_id>")
def view_category(category_id):
    return f'View category {category_id}'


@admin.route("/categories/<int:category_id>/edit")
def edit_category(category_id):
    return f'Edit category {category_id}'


@admin.route("/categories/<int:category_id>/delete")
def delete_category(category_id):
    return f'Delete category {category_id}'
