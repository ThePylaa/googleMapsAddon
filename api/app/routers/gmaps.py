from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from schemas.gmaps import getAddressSchema,getCoordinatesSchema,routeInformation
from utils.gmaps.googleapi import getAddress,getCoordinates, getDistance,getPolylineStr
import polyline
import requests
import os

# This is the gMaps router. It is used to get the address and coordinates of a location and to get the polyline of a route.
router = APIRouter(tags=["gMaps"],prefix="/gMaps")

# This endpoint is used to get the address of a location by lat lng.
@router.post("/getAddress")
def returnAddress(coordinates:getAddressSchema):
    address = getAddress(lat=coordinates.lat,lng=coordinates.lng,language=coordinates.language)

    return address

#  This endpoint is used to get the coordinates of a location by address.
@router.post("/getCoordinates")
def returnCoordinates(address:getCoordinatesSchema):
    coordinates = getCoordinates(address=address.address,language=address.language)
    
    return coordinates

# This endpoint is used to get the polyline of a route.
@router.post("/getPolyline")
def returnPolyline(origin:str, destination:str):
    polyline = getPolylineStr(originAddress=origin,destinationAddress=destination,mode="driving",language="en",alternatives=False)
    return polyline

# This endpoint is used to get the stations along a route.
@router.post("/getRouteInformation")
async def getRouteInformation(routeInformation:routeInformation):

    URL = "https://creativecommons.tankerkoenig.de/json/list.php"
    PARAMS = {}
    PARAMS["type"] = "all"
    PARAMS["sort"] =  "dist"
    PARAMS["rad"] = routeInformation.rad
    PARAMS["apikey"]=os.getenv("TANKERKONIG_API_KEY")

    stations_list = []
    origin_list=[]	#for debug pruposes

    routeCoordinates = polyline.decode(routeInformation.routePolyline)

    origin = routeCoordinates[0]

    #Iterate through every coordinate in the route and get the stations
    for coordinate in routeCoordinates:
        #Get the stations for the first initial coordinate
        if origin == coordinate:
            PARAMS["lat"] = origin[0]
            PARAMS["lng"] = origin[1]
            response = requests.get(url=URL,params=PARAMS)

            if response.status_code == 503:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Tankerkönig API is not available at the moment"
                )
            
            response_json_data = response.json()

            # Check if the response contains any valid stations
            try:
                stations_json_list = response_json_data["stations"]
                for station_data in stations_json_list:
                    stations_list.append(station_data)
                origin_list.append(origin)
            except:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Lat or/and Lng out of bounds"
                )
            
        #Check if every coordinate is at least routeInformation.rad km's away from the last coordinate
        if getDistance(origin,coordinate) > routeInformation.rad:
            origin = coordinate
            PARAMS["lat"] = origin[0]
            PARAMS["lng"] = origin[1]

            response = requests.get(url=URL,params=PARAMS)

            if response.status_code == 503:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Tankerkönig API is not available at the moment"
                )
            
            response_json_data = response.json()
    
            try:
                stations_json_list = response_json_data["stations"]
                for station_data in stations_json_list:
                    stations_list.append(station_data)
                origin_list.append(origin)
            except:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Lat or/and Lng out of bounds"
                )
        else:
            continue

    #Remove all stations that don't have the requested fuel type        
    for station in stations_list:
        if station[routeInformation.type] is None:
            stations_list.remove(station)

    # Sort the stations by price the requested fuel type
    stations_list.sort(key=lambda x: x[routeInformation.type])

    stations_list = stations_list[:6]

    responseJson = {"stations_list":stations_list,"origin_list":origin_list}

    return JSONResponse(content=responseJson)