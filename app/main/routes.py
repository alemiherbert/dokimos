from app.main import main

from flask import request, render_template


@main.route("/")
def index():
    """tabs = {
        "overview": "dashboard/overview.html",
        "users": "dashboard/users.html",
        "inventory": "dashboard/inventory.html",
        "rentals": "dashboard/rentals.html",
        "invoices": "dashboard/invoices.html",
        "maintenance": "dashboard/maintenance.html",
        "reports": "dashboard/reports.html"
    }
    tab = request.args.get("tab")
    active_tab = tab if tab in tabs else "overview"
    return render_template(tabs[active_tab], active_tab=active_tab, tabs_list=tabs.keys())"""
    return {}
