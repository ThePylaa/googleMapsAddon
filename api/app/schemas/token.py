from pydantic import BaseModel
import uuid

class Token(BaseModel):
    userUuid: uuid.UUID
    username: str
    email: str
    scopes: list[str]=[]