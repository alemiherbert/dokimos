from app.main import main
from app.models import Equipment
from flask import request, render_template, url_for


@main.route("/")
def index():
    return render_template("main/layouts/index.html")


@main.route("/equipment")
def show_equipment():
    locations = list({eq.location for eq in Equipment.query.all()})
    unique_categories = {}
    for eq in Equipment.query.all():
        cat = {"name": eq.category.name, "slug": eq.category.slug}
        if eq.category.slug not in unique_categories:
            unique_categories[eq.category.slug] = cat
    categories = list(unique_categories.values())

    return render_template(
        "main/layouts/show_equipment.html",
        data={
            "locations": locations,
            "categories": categories,
        })


@main.route("/equipment/<slug>")
def show_single_equipment(slug):
    return render_template("main/layouts/show_single_equipment.html")


@main.route("/categories")
def show_categories():
    return render_template("main/layouts/show_categories.html")
