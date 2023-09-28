from pydantic import BaseModel
import uuid

class User(BaseModel):
    uuid: uuid.UUID
    username: str
    email: str
    forename: str
    surname: str
    admin: bool 

class createUser(BaseModel):
    email: str
    surname: str
    forename: str
    username: str
    password: str

class updateUser(BaseModel):
    email_new: str | None = None
    username: str | None = None
    forename: str | None = None
    surname: str | None = None
    password_old: str | None = None
    password_new: str | None = None

class deleteUser(BaseModel):
    info: str

class adminState(deleteUser):
    value: bool