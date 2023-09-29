from sqlalchemy import Column, String, Uuid, Boolean

from utils.db.db import Base

# Database model for users
class Users(Base):
    __tablename__ = "users"

    uuid = Column(Uuid, primary_key=True, index=True, nullable=False)
    email = Column(String, unique=True,index=True,nullable=False)
    username = Column(String, unique=True,index=True,nullable=False)
    forename = Column(String,index=True,nullable=False)
    surname = Column(String,index=True,nullable=False)
    password_hash = Column(String,nullable=False)
    admin = Column(Boolean,default=False)
