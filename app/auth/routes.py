from app import login_manager
from app.models import User
from app.auth import auth

from flask import render_template


@auth.route("/login")
def login():
    return render_template("dashboard.html")


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)
