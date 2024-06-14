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

    login_manager.init_app(app)
    migrate.init_app(app, db)

    with app.app_context():
        from app.admin import admin
        app.register_blueprint(admin)

    return app
