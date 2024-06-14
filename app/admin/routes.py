from app.admin import admin


@admin.route("/login")
def login():
    return 'Admin signin'


@admin.route("/")
def dashboard():
    return 'Admin dashboard'


@admin.route("/users")
def users():
    return 'User management'


@admin.route("/users/add-new")
def create_user():
    return 'Create user'


@admin.route("/users/<int:user_id>")
def view_user(user_id):
    return f'View user {user_id}'


@admin.route("/users/<int:user_id>/edit")
def edit_user(user_id):
    return f'Edit user {user_id}'


@admin.route("/users/<int:user_id>/delete")
def delete_user(user_id):
    return f'Delete user {user_id}'


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
