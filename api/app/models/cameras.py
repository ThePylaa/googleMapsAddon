from sqlalchemy import Column, Integer, String, Float,Uuid

from utils.db.db import Base

# Database model for cameras
class Cameras(Base):
    __tablename__ = "cameras"

    uuid = Column(Uuid, primary_key=True, index=True,unique=True)
    lat = Column(Float,index=True, nullable=False)
    lng = Column(Float,index=True, nullable=False)
    speed = Column(Integer,nullable=True)
    country = Column(String,nullable=True)
    postal_code=Column(Integer,nullable=True)
    city= Column(String,nullable=True)
    street=Column(String,nullable=True)
    street_number=Column(String,nullable=True)
