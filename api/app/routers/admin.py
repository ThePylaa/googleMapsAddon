from fastapi import APIRouter, Depends,HTTPException, status, Security
from typing import Annotated
from utils.db.db import get_db
from utils.auth.auth import verifyUser,hashPassword
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models.users import Users
from models.stations import Stations
from models.cameras import Cameras
import uuid
from schemas.users import User, adminState, deleteUser
from schemas.station import Station
import os


router = APIRouter(tags=["admin"],prefix="/admin")

@router.get("")
def isAdmin(current_user: Annotated[User,Security(verifyUser,scopes=["admin"])]):
    return True

@router.get("/create")
async def create(db: Session = Depends(get_db)):
    if db.query(Users).filter(Users.username == os.getenv('ADMIN_USERNAME')).first():
        pass
    else:
        hashed_password = hashPassword(os.getenv('ADMIN_PASSWORD'))
        admin = Users(uuid=uuid.uuid4(),email=os.getenv('ADMIN_EMAIL'),username=os.getenv('ADMIN_USERNAME'),forename=os.getenv('ADMIN_FORENAME'),surname=os.getenv('ADMIN_SURNAME'),password_hash=hashed_password,admin=True)
        db.add(admin)
        db.commit()
        db.refresh(admin)
        return admin

@router.get("/users", response_model=list[User])
def allUsers(current_user: Annotated[User,Security(verifyUser,scopes=["admin"])],skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Users).offset(skip).limit(limit).all()

@router.post("/setAdmin", response_model=User)
def makeAdmin(current_user: Annotated[User,Security(verifyUser,scopes=["admin"])],user:adminState,db: Session = Depends(get_db)):
    try:
        uuid.UUID(user.info)
        db_user = db.query(Users).filter(Users.uuid == user.info).first()
    except:
        db_user = db.query(Users).filter(or_(Users.email == user.info, Users.username == user.info)).first()

    if db_user != None:
        db_user.admin=user.value
        db.commit()
        db.refresh(db_user)
        return db_user
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="No User Found"
    )

@router.get("/user", response_model=User)
def findUser(current_user: Annotated[User,Security(verifyUser,scopes=["admin"])],user:deleteUser,db: Session = Depends(get_db)):
    try:
        uuid.UUID(user.info)
        db_user = db.query(Users).filter(Users.uuid == user.info).first()
    except:
        db_user = db.query(Users).filter(or_(Users.email == user.info, Users.username == user.info)).first()

    if db_user != None:
        db.delete(db_user)
        db.commit()
        return db_user
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="No User Found"
    )

@router.delete("/user", response_model=User)
def deleteUser(current_user: Annotated[User,Security(verifyUser,scopes=["admin"])],user:deleteUser,db: Session = Depends(get_db)):
    try:
        uuid.UUID(user.info)
        db_user = db.query(Users).filter(Users.uuid == user.info).first()
    except:
        db_user = db.query(Users).filter(or_(Users.email == user.info, Users.username == user.info)).first()

    if db_user != None:
        db.delete(db_user)
        db.commit()
        return db_user
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="No User Found"
    )

@router.get("/stations", response_model=list[Station])
def allStations(current_user: Annotated[User,Security(verifyUser,scopes=["admin"])],skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Stations).offset(skip).limit(limit).all()

@router.delete("/station", response_model=Station)
def deleteStation(current_user: Annotated[User,Security(verifyUser,scopes=["admin"])],uuid: uuid.UUID,db: Session = Depends(get_db)):
    if uuid != None:
        db_station = db.query(Stations).filter(Stations.uuid == uuid).first()
    if db_station == None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No Station Found"
        )
    db.delete(db_station)
    db.commit()
    return db_station

@router.delete("/deleteAllCamera")
def deleteAllCamera(current_user: Annotated[User,Security(verifyUser,scopes=["admin"])],db: Session = Depends(get_db)):
    db.query(Cameras).delete()
    db.commit()