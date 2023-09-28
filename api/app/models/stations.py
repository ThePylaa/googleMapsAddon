from sqlalchemy import Column, String, Uuid,Float,Integer

from utils.db.db import Base

class Stations(Base):
    __tablename__ = "stations"

    uuid = Column(Uuid, primary_key=True, index=True, nullable=False)
    name = Column(String, unique=True,index=True,nullable=False)
    brand = Column(String,index=True,nullable=False)
    lat = Column(Float,index=True,nullable=False)
    lng = Column(Float,index=True,nullable=False)
    postal_code=Column(Integer,nullable=True)
    city= Column(String,nullable=True)
    street=Column(String,nullable=True)
    street_number=Column(String,nullable=True)