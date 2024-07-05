from flask import Blueprint

dash = Blueprint(
    "dash", __name__,
    static_folder="static",
    template_folder="templates",
    url_prefix="/dashboard")

from app.dashboard import routes
