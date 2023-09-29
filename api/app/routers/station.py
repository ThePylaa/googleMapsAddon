from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
import requests
import os
import uuid
from schemas.station import searchStation, foundStation, Station

# This is the station router. It is used to get the information of a specific petrol station and to get a list of petrol stations.
router = APIRouter(tags=["station"],prefix="/station")

# This endpoint is used to get the information of a specific petrol station.
@router.get("/",response_model=Station)
def info(uuid: uuid.UUID):

    URL = "https://creativecommons.tankerkoenig.de/json/detail.php"
    PARAMS = {}
    PARAMS["id"] = str(uuid)
    PARAMS["apikey"]=os.getenv("TANKERKONIG_API_KEY")

    response = requests.get(url=URL,params=PARAMS)

    response_json_data = response.json()

    stations_data = response_json_data["station"]

    return JSONResponse(stations_data)

# This endpoint is used to get a list of petrol stations around the requestet coordinates with specific radius.
@router.post("/listNearByStations",response_model=list[foundStation])
async def searchStations(search: searchStation):
    
    # Check if the requested fueltype is all and if so, check if the sort is price and if so, raise an error
    # You can not sort by price when every fueltype is selected -> what should you sort by?
    if search.type == "all":
        if search.sort == "price":
            raise HTTPException(
                status_code=status.HTTP_406_NOT_ACCEPTABLE,
                detail="Can not be sorted by Price when every Fueltype is selected",
                )

    URL = "https://creativecommons.tankerkoenig.de/json/list.php"
    PARAMS = {}

    for key, value in search.dict().items():
        PARAMS[key] = value


    PARAMS["apikey"]=os.getenv("TANKERKONIG_API_KEY")

    response = requests.get(url=URL,params=PARAMS)

    response_json_data = response.json()
    
    try:
        stations_json_list = response_json_data["stations"]
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lat or/and Lng out of bounds"
        )
    stations=[]

    # Check if the response contains any valid stations
    for station_data in stations_json_list:
        # Check if the requested fueltype is all and if so, add every station and every price to the list
        if search.type == "all":
            station = foundStation(
                uuid=uuid.UUID(station_data["id"]),
                name=station_data["name"],
                brand=station_data["brand"],
                lat=station_data["lat"],
                lng=station_data["lng"],
                is_open=station_data["isOpen"],
                dist=station_data["dist"],
                price_e5=station_data["e5"],
                price_e10=station_data["e10"],
                price_diesel=station_data["diesel"],
                street=station_data["street"],
                place=station_data["place"],
                houseNumber=station_data["houseNumber"],
                postCode=station_data["postCode"]
            )
            stations.append(station)
            continue
        match search.type:
            # Check if the requested fueltype is e5 and if so, add every station and the price of e5 to the list
                case "e5":
                    station = foundStation(
                        uuid=uuid.UUID(station_data["id"]),
                        name=station_data["name"],
                        brand=station_data["brand"],
                        lat=station_data["lat"],
                        lng=station_data["lng"],
                        is_open=station_data["isOpen"],
                        dist=station_data["dist"],
                        price_e5=station_data["price"],
                        street=station_data["street"],
                        place=station_data["place"],
                        houseNumber=station_data["houseNumber"],
                        postCode=station_data["postCode"]
                    )
                # Check if the requested fueltype is e10 and if so, add every station and the price of e10 to the list
                case "e10":
                    station = foundStation(
                        uuid=uuid.UUID(station_data["id"]),
                        name=station_data["name"],
                        brand=station_data["brand"],
                        lat=station_data["lat"],
                        lng=station_data["lng"],
                        is_open=station_data["isOpen"],
                        dist=station_data["dist"],
                        price_e10=station_data["price"],
                        street=station_data["street"],
                        place=station_data["place"],
                        houseNumber=station_data["houseNumber"],
                        postCode=station_data["postCode"]
                    )
                # Check if the requested fueltype is diesel and if so, add every station and the price of diesel to the list
                case "diesel":
                    station = foundStation(
                        uuid=uuid.UUID(station_data["id"]),
                        name=station_data["name"],
                        brand=station_data["brand"],
                        lat=station_data["lat"],
                        lng=station_data["lng"],
                        is_open=station_data["isOpen"],
                        dist=station_data["dist"],
                        price_diesel=station_data["price"],
                        street=station_data["street"],
                        place=station_data["place"],
                        houseNumber=station_data["houseNumber"],
                        postCode=station_data["postCode"]
                    )
        stations.append(station)
    return stations