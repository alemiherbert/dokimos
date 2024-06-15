from app import db
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime


class User(db.Model):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    firstname = Column(String(32), nullable=False)
    lastname = Column(String(32), nullable=False)
    email = Column(String(64), index=True, nullable=False)
    password_hash = Column(String(128))

    status = Column(String(32), default=True)
    date_joined = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'firstname': self.firstname,
            'lastname': self.lastname,
            'email': self.email,
            'status': self.status,
            'date_joined': self.date_joined
        }

    def __repr__(self):
        return f"<User {self.email}>"
