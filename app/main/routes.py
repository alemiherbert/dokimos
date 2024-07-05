from app.main import main

from flask import request, render_template


@main.route("/")
def index():
    return render_template("main/layouts/index.html")


@main.route("/equipment")
def show_equipment():
    return render_template("main/layouts/show_equipment.html")


@main.route("/equipment/excavator-2")
def show_single_equipment():
    return render_template("main/layouts/show_single_equipment.html")


@main.route("/categories")
def show_categories():
    return render_template("main/layouts/show_categories.html")
