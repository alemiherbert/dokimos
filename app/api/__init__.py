from flask import Blueprint

api = Blueprint(
    'api', __name__,
    static_folder='static',
    template_folder='templates',
    url_prefix='/api')

from app.api import routes, errors
