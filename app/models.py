from app import db
from flask import url_for
from secrets import token_hex
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import relationship
from sqlalchemy import select, Column, Integer, String, DateTime, ForeignKey
from werkzeug.security import generate_password_hash, check_password_hash


class PaginatedAPIMixin:
    @staticmethod
    def to_table_dict(query, page, per_page, endpoint, **kwargs):
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        data = {
            "items": [item.to_dict() for item in pagination.items],
            "_meta": {
                "page": page,
                "per_page": per_page,
                "total_pages": pagination.pages,
                "total_items": pagination.total
            },
            "_links": {
                "self": url_for(endpoint, page=page, per_page=per_page, **kwargs),
                "next": url_for(endpoint, page=page + 1, per_page=per_page, **kwargs) if pagination.has_next else None,
                "prev": url_for(endpoint, page=page - 1, per_page=per_page, **kwargs) if pagination.has_prev else None
            }
        }
        return data


class User(PaginatedAPIMixin, db.Model):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    firstname = Column(String(32), nullable=False)
    lastname = Column(String(32), nullable=False)
    email = Column(String(64), index=True, nullable=False)
    status = Column(String(32), default="active")
    date_joined = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    password_hash = Column(String(128))
    token = Column(String(32), index=True, unique=True)
    token_expiration = Column(DateTime)

    def to_dict(self, include_email=False):
        data = {
            "id": self.id,
            "firstname": self.firstname,
            "lastname": self.lastname,
            "email": self.email,
            "status": self.status,
            "date_joined": self.date_joined
        }
        return data

    def from_dict(self, data, new_user=False):
        for field in ["firstname", "lastname", "email"]:
            if field in data:
                setattr(self, field, data[field])

        if new_user and "password" in data:
            self.set_password(data["password"])

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_token(self, expires_in=3600):
        now = datetime.now(timezone.utc)
        if self.token and self.token_expiration:
            if self.token_expiration.replace(tzinfo=timezone.utc) > now + timedelta(seconds=60):
                return self.token
        self.token = token_hex(16)
        self.token_expiration = now + timedelta(seconds=expires_in)
        db.session.add(self)
        return self.token

    def revoke_token(self):
        self.token_expiration = datetime.now(timezone.utc) - timedelta(seconds=1)

    @staticmethod
    def check_token(token):
        user = db.session.scalar(select(User).where(User.token == token))
        if user is None or user.token_expiration.replace(
                tzinfo=timezone.utc) < datetime.now(timezone.utc):
            return None
        return user

    def __repr__(self):
        return f"<User {self.email}>"


class Equipment(PaginatedAPIMixin, db.Model):
    __tablename__ = "equipment"
    id = Column(Integer, primary_key=True)
    name = Column(String(32), nullable=False)
    location = Column(String(32), nullable=False)
    slug = Column(String(64), index=True)
    description = Column(String(192), nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id'))
    image_url = Column(String(256), nullable=True)

    def to_dict(self):
        data = {
            "category": {
                "name": self.category.name,
                "description": self.category.description,
                "slug": self.category.slug,
            },
            "description": self.description,
            "id": self.id,
            "location": self.location,
            "name": self.name,
            "slug": self.slug,
            "image_url": self.image_url,
        }
        return data

    def generate_slug(self):
        self.slug = self.name.replace(' ', '-').lower()

    def __repr__(self):
        return f"<Equipment {self.name}>"


class Category(PaginatedAPIMixin, db.Model):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True)
    name = Column(String(32), nullable=False)
    slug = Column(String(64), index=True)
    description = Column(String(192), nullable=False)
    equipment = relationship('Equipment', backref='category', lazy='dynamic')

    def generate_slug(self):
        self.slug = self.name.replace(' ', '-').lower()
