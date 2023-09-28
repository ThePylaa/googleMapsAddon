from pydantic import BaseModel
import uuid

class createCamera(BaseModel):
    lat: float
    lng: float
    speed: int

class renewCamera(BaseModel):
    uuid: uuid.UUID
    lat: float | None = None
    lng: float | None = None
    speed: int | None = None
    country: str  | None = None
    postal_code: int  | None = None
    city: str  | None = None
    street: str  | None = None
    street_number: str  | None = None

class currentPos(BaseModel):
    lat: float
    lng: float
    radius: int | None = 10000

class Camera(BaseModel):
    uuid: uuid.UUID
    lat: float
    lng: float
    speed: int
    country: str  | None = None
    postal_code: int  | None = None
    city: str  | None = None
    street: str  | None = None
    street_number: str  | None = None