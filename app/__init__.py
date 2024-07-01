from flask import Flask
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy

from config import config


db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()


def create_app(config=config['default']):
    app = Flask(__name__)
    app.config.from_object(config)
    app.url_map.strict_slashes = False

    login_manager.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)

    with app.app_context():
        from app.api import api
        from app.auth import auth
        from app.main import main
        from app.dashboard import dash
        app.register_blueprint(api)
        app.register_blueprint(auth)
        app.register_blueprint(main)
        app.register_blueprint(dash)

    return app
