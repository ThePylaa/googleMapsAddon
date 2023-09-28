from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session
from models.cameras import Cameras
from schemas.camera import createCamera,Camera, currentPos, renewCamera
from uuid import uuid4, UUID
from utils.db.db import get_db
from utils.gmaps.googleapi import getAddress

router = APIRouter(tags=["camera"],prefix="/camera")

@router.get("/")
def info(uuid:UUID,db: Session = Depends(get_db)):
    dbCamera = db.query(Cameras).filter(Cameras.uuid==uuid).first()
    return dbCamera

@router.get("/cameras", response_model=list[Camera])
def allCameras(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Cameras).offset(skip).limit(limit).all()

@router.get("/currentPosCameras", response_model=list[Camera])
def currentPosCameras(currentPos: currentPos, db: Session = Depends(get_db)):
    return True

@router.post("/addCamera", response_model=Camera)
def addCamera(camera:createCamera, db: Session = Depends(get_db)):
    dbCamera = Cameras(uuid=uuid4(), lat=camera.lat, lng=camera.lng, speed=camera.speed)
    try:
        address = getAddress(lat=camera.lat,lng=camera.lng)
        dbCamera.country = address.get("country")
        dbCamera.city =  address.get("city")
        dbCamera.postal_code = address.get("postalCode")
        dbCamera.street = address.get("street")
        dbCamera.street_number = address.get("streetNumber")
    except:
        pass
    db.add(dbCamera)
    db.commit()
    db.refresh(dbCamera)
    return dbCamera

@router.put("/updateCamera",response_model=Camera)
def updateCamera(camera: renewCamera,db: Session = Depends(get_db)):
    dbCamera = db.query(Cameras).filter(Cameras.uuid==camera.uuid).first()

    if dbCamera:
        for key, value in camera.dict().items():
            if value is not None:
                setattr(dbCamera, key, value)
    
    db.commit()
    db.refresh(dbCamera)
    return dbCamera

@router.delete("/deleteCamera")
def deleteCamera(uuid:UUID,db: Session = Depends(get_db)):
    db.query(Cameras).filter(Cameras.uuid==uuid).delete()
    db.commit()