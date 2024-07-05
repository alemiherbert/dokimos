from app.dashboard import dash

from flask import request, render_template


@dash.route("/")
def dashboard():
    tabs = {
        "overview": {
            "name": "Overview",
            "templatefile": "dashboard/layouts/overview.html",
            "icon": "monitor"
        },
        "users": {
            "name": "Users",
            "templatefile": "dashboard/layouts/users.html",
            "icon": "users"
        },
        "inventory": {
            "name": "Inventory",
            "templatefile": "dashboard/layouts/inventory.html",
            "icon": "box"
        },
        "rentals": {
            "name": "Rentals",
            "templatefile": "dashboard/layouts/rentals.html",
            "icon": "truck"
        },
        "invoices": {
            "name": "Invoices",
            "templatefile": "dashboard/layouts/invoices.html",
            "icon": "file-text"
        },
        "maintenance": {
            "name": "Maintenance",
            "templatefile": "dashboard/layouts/maintenance.html",
            "icon": "tool"
        },
        "reports": {
            "name": "Reports",
            "templatefile": "dashboard/layouts/reports.html",
            "icon": "bar-chart-2"
        }
    }
    tab = request.args.get("tab")
    active_tab = tab if tab in tabs else "overview"
    return render_template(tabs[active_tab]["templatefile"], active_tab=active_tab, tabs=tabs)
