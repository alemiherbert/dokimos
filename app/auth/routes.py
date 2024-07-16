from app.models import User
from app.auth import auth
from flask import render_template


@auth.route("/login")
def login():
    return render_template("auth/login.html")


@auth.route("/signup")
def signup():
    return render_template("auth/signup.html")