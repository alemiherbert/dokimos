from os import environ, path


class BaseConfig:
    """Base configuration"""
    ITEMS_PER_TABLE = 10
    SECRET_KEY = environ.get('SECRET_KEY') or 'a really hard to guess string'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = environ.get('DATABASE_URL') or \
        'sqlite:///' + path.join(path.dirname(__file__), 'db.sqlite3')


class DevConfig(BaseConfig):
    """Development configuration"""
    DEBUG = True
    SECRET_KEY = 'development'
    SQLALCHEMY_DATABASE_URI = environ.get('DATABASE_URL') or \
        'sqlite:///' + path.join(path.dirname(__file__), 'dev.sqlite3')


class TestConfig(BaseConfig):
    """Test configuration"""
    TESTING = True
    SECRET_KEY = 'testing'
    SQLALCHEMY_DATABASE_URI = environ.get('DATABASE_URL') or \
        'sqlite:///' + path.join(path.dirname(__file__), 'test.sqlite3')


class ProductionConfig(BaseConfig):
    """Production configuration"""
    DEBUG = True
    SECRET_KEY = 'production'
    SQLALCHEMY_DATABASE_URI = environ.get('DATABASE_URL') or \
        'sqlite:///' + path.join(path.dirname(__file__), 'dev.sqlite3')


config = {
    'default': DevConfig,
    'development': DevConfig,
    'testing': TestConfig,
    'production': ProductionConfig
}
