from app import db
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    firstname = Column(String(32), nullable=False)
    lastname = Column(String(32), nullable=False)
    email = Column(String(64), index=True, nullable=False)
    password_hash = Column(String(128))

    status = Column(String(32), default=True)
    date_joined = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self, include_email=False):
        data = {
            "id": self.id,
            "firstname": self.firstname,
            "lastname": self.lastname,
            "status": self.status,
            "date_joined": self.date_joined
        }
        if include_email:
            data["email"] = self.email
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
