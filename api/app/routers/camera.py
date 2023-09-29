from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session
from models.cameras import Cameras
from schemas.camera import createCamera,Camera, currentPos, renewCamera
from uuid import uuid4, UUID
from utils.db.db import get_db
from utils.gmaps.googleapi import getAddress

# This is the camera router. It is used to manage the speed cameras.
router = APIRouter(tags=["camera"],prefix="/camera")

# This endpoint is used to get the information of a specific camera.
@router.get("/")
def info(uuid:UUID,db: Session = Depends(get_db)):
    dbCamera = db.query(Cameras).filter(Cameras.uuid==uuid).first()
    return dbCamera

# This endpoint is used to get all cameras.
@router.get("/cameras", response_model=list[Camera])
def allCameras(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Cameras).offset(skip).limit(limit).all()

# This endpoint is used to add a new camera.
@router.post("/addCamera", response_model=Camera)
def addCamera(camera:createCamera, db: Session = Depends(get_db)):
    dbCamera = Cameras(uuid=uuid4(), lat=camera.lat, lng=camera.lng, speed=camera.speed)
    # Try to get the address of the camera via Google Maps API
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

# This endpoint is used to update the position of a camera.
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

# This endpoint is used to delete a camera.
@router.delete("/deleteCamera")
def deleteCamera(uuid:UUID,db: Session = Depends(get_db)):
    db.query(Cameras).filter(Cameras.uuid==uuid).delete()
    db.commit()