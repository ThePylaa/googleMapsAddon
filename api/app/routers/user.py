from fastapi import APIRouter, Security, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from schemas.users import *
from models.users import Users
from uuid import uuid4
from utils.db.db import get_db
from utils.auth.auth import create_access_token,verify_password, oauth2_scheme, verifyUser
from sqlalchemy.orm import Session
from sqlalchemy import or_
from utils.auth.auth import hashPassword
from utils.db.redis import rs

router = APIRouter(tags=["user"],prefix="/user")

@router.get("/me",response_model=User)
def info(db_user: Annotated[User,Security(verifyUser,scopes=['user'])]):
    return db_user

@router.put("/update")
def updateInfo(user_update: updateUser,db_user: Annotated[User,Security(verifyUser,scopes=["user"])],db: Session = Depends(get_db)):
    if db_user:
        for key, value in user_update.dict().items():
            if value is not None:
                if key == "password_old":
                    if not verify_password(value,db_user.password_hash):
                        raise HTTPException(
                            status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Incorrect Password",
                        )
                    pass
                if key == "password_new":
                    key = "password_hash"
                    value = hashPassword(value)
                if key == "username":
                    existing_username = db.query(Users).filter(Users.username == value).first()
                    if existing_username:
                        raise HTTPException(status_code=400, detail="Username is already in use")
                if key == "email_new":
                    key = "email"
                    existing_email = db.query(Users).filter(Users.email == value).first()
                    if existing_email:
                        raise HTTPException(status_code=400, detail="Email is already in use")
                setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/register")
def register(user: createUser, db: Session = Depends(get_db)):

    existing_email = db.query(Users).filter(Users.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email is already in use")
    
    existing_username = db.query(Users).filter(Users.username == user.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username is already in use")

    uuid = uuid4()
    hashedPassword = hashPassword(user.password)
    dbUser = Users(uuid=uuid,email=user.email,username=user.username,forename=user.forename,surname=user.surname,password_hash=hashedPassword)
    db.add(dbUser)
    db.commit()
    db.refresh(dbUser)
    return dbUser

@router.post("/signIn")
def signIn(form_data: OAuth2PasswordRequestForm = Depends(),db: Session = Depends(get_db)):
    """Function to get a standard oauth2 token"""
    username = form_data.username
    password = form_data.password

    db_user = db.query(Users).filter(or_(Users.username == username,Users.email == username)).first()
    if db_user:
        if verify_password(password,db_user.password_hash):
            for i in form_data.scopes:
                if i == "admin":
                    if db_user.admin != True:
                        raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="You ar not an Admin!",
                        headers={"WWW-Authenticate": "Bearer"},
                        )
                    form_data.scopes= ['admin','user']
            token_data = {
                "userUuid":str(db_user.uuid),
                "username": db_user.username,
                "email": db_user.email,
                "scopes": form_data.scopes
            }
            token = create_access_token(token_data)
            content = {"access_token": token, "token_type": "bearer"}
            response = JSONResponse(content=content)
            response.set_cookie(key="access_token", value=token)
            return response 
        else:
            raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect Password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect Username",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/signOut")
def signOut(db_user: Annotated[User,Security(verifyUser,scopes=["user"])]):
    rs.delete(str(db_user.uuid))
    return status.HTTP_200_OK

@router.delete("/me")
def delete_me(db_user: Annotated[User,Security(verifyUser,scopes=["user"])],db: Session = Depends(get_db)):
    db.delete(db_user)
    db.commit()
    return status.HTTP_200_OK