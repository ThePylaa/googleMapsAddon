from typing import Annotated
from pydantic import ValidationError
from datetime import datetime, timedelta
from fastapi import HTTPException,status,Security, Depends
from fastapi.security import OAuth2PasswordBearer,SecurityScopes
from models.users import Users
from schemas.token import Token
from sqlalchemy import *
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
from utils.db.db import get_db
from utils.db.redis import rs
# This is the auth utils. It is used to verify the user and to create a new access token.

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/user/signIn",
    scopes={"user":"","camera":"","station":"","admin":""}
)
pwd_context = CryptContext(schemes=["bcrypt"])
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# This function is used to verify the password.
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# This function is used to hash the password.
def hashPassword(plain_password):
    return pwd_context.hash(plain_password)

# This function is used to create a new access token and safe it to redis.
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    rs.setex(name=data.get("userUuid"),time=1800,value=encoded_jwt)
    return encoded_jwt

# This function is used to verify the user.
# It checks if the user exists in the postqres database and if the token is still valid in the redis database.
# It also checks if the user has the required scopes.
def verifyUser(security_scopes: SecurityScopes,token: Annotated[str,Depends(oauth2_scheme)],db: Session= Depends(get_db)):
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        userUuid: str = payload.get("userUuid")
        username: str = payload.get("username")
        email: str = payload.get("email")
        if userUuid is None:
            raise credentials_exception
        token_scopes = payload.get("scopes", [])
        token_data = Token(scopes=token_scopes, username=username, email=email,userUuid=userUuid)
    except (JWTError,ValidationError):
        raise credentials_exception
    db_user = db.query(Users).filter(Users.username == token_data.username,Users.email == token_data.email, Users.uuid == token_data.userUuid).first()
    if db_user is None:
        raise credentials_exception
    for scope in security_scopes.scopes:
        if scope not in token_data.scopes:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not enough permissions",
                headers={"WWW-Authenticate": authenticate_value},
            )
    rs_token = rs.get(name=str(token_data.userUuid))
    if rs_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token Expired",
        )
    return db_user