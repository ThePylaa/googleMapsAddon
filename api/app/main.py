from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from utils.log.logger import log
from utils.db.db import engine, SessionLocal
import os
import uvicorn

from models import users, cameras ,stations

#Import different Routers 
from routers import user, camera, station, admin, gmaps

#Load all ENV's from the .env
load_dotenv()

#Generate Table
users.Base.metadata.create_all(bind=engine)
cameras.Base.metadata.create_all(bind=engine)
stations.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GMapsAddon",
    description="Eine API zur Verwaltung von Tankstellen und Blitzern",
    summary="Created by Max Loehr, Paul Brilmayer und Stefan Moser",
    docs_url="/",
    version="v1.0.0",
)

#Add  Routes to the API
app.include_router(user.router)
app.include_router(camera.router)
app.include_router(station.router)
app.include_router(gmaps.router)
app.include_router(admin.router)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#DB Middleware
@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    response = Response("Internal server error", status_code=500)
    try:
        request.state.db = SessionLocal()
        response = await call_next(request)
    finally:
        request.state.db.close()
    return response

@app.get('/favicon.ico', include_in_schema=False)
async def favicon():
    return FileResponse('./app/assets/favicon.ico')

if __name__ == "__main__":
    log.info(f"Started on {os.getenv('API_IP')}:{os.getenv('API_PORT')} with Mode {os.getenv('DEBUG')}")
    uvicorn.run("main:app", host=os.getenv('API_IP'), port=int(os.getenv('API_PORT')), reload=os.getenv('DEBUG'),log_level="info")