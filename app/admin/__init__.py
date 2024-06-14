from flask import Blueprint

admin = Blueprint(
    'admin', __name__,
    static_folder='static',
    template_folder='template',
    url_prefix='/admin')

from app.admin import routes
