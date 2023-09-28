from pydantic import BaseModel, Field
from typing import Literal, Optional

class getAddressSchema(BaseModel):
    lat: float
    lng: float
    language: str = 'en'

class getCoordinatesSchema(BaseModel):
    address: str
    language: str = 'en'

class routeInformation(BaseModel):
    routePolyline: str
    rad: Optional[int] = Field(5,ge=5,le=25)
    type: Literal['e5','e10','diesel'] | None = 'e5'
