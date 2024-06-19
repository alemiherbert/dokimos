from app import db
from flask import url_for
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
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
    password_hash = Column(String(128))

    status = Column(String(32), default="active")
    date_joined = Column(DateTime, default=lambda: datetime.now(timezone.utc))

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

    def __repr__(self):
        return f"<User {self.email}>"
