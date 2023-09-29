from pydantic import BaseModel,Field
import uuid
from typing import Literal, Optional

class searchStation(BaseModel):
    lat: float
    lng: float
    rad: Optional[int] = Field(5,ge=1,le=25)
    type: Literal['e5','e10','diesel','all'] | None = 'all'
    sort: Literal['price', 'dist'] | None = 'dist'

class foundStation(BaseModel):
    uuid: uuid.UUID
    name: str
    brand: str
    lat: float
    lng: float
    is_open:bool
    dist: float
    price_e5: float | None = None
    price_e10: float | None = None
    price_diesel: float | None = None
    street:str
    place:str
    houseNumber:str
    postCode:int

class createStation(BaseModel):
    lat: float
    lng: float

class Station(BaseModel):
    uuid: uuid.UUID
    name: str
    brand: str
    lat: float
    lng: float
    is_open:bool
    dist: float
    price_e5: float | None = None
    price_e10: float | None = None
    price_diesel: float | None = None
    street:str
    place:str
    houseNumber:str
    postCode:int
    openingTimes: list
