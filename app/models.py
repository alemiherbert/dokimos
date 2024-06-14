from app import db
from sqlalchemy import Column, Integer, String, Boolean


class User(db.Model):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    firstname = Column(String(32), nullable=False)
    lastname = Column(String(32), nullable=False)
    email = Column(String(64), index=True, nullable=False)
    password_hash = Column(String(128))

    is_active = Column(Boolean)
