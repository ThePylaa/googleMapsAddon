import googlemaps
import os
import polyline
from typing import Literal
from math import sin, cos, sqrt, atan2, radians

# Google Maps API

gmaps = googlemaps.Client(key=os.getenv('GOOGLE_API_KEY'))

# This function is used to get the address from a given coordinate.
# It returns a dictionary with the address information.
def getAddress(lat:float,lng:float,language:str):
    geocode_result = gmaps.reverse_geocode(latlng=(lat,lng),language=language)

    streetNumber = geocode_result[0]["address_components"][0]["short_name"]
    street = geocode_result[0]["address_components"][1]["short_name"]
    city= geocode_result[0]["address_components"][2]["short_name"]
    state= geocode_result[0]["address_components"][5]["long_name"]
    country= geocode_result[0]["address_components"][6]["short_name"]
    postalCode= geocode_result[0]["address_components"][7]["short_name"]

    address = {
        "country":country,
        "state":state,
        "postalCode":postalCode,
        "city":city,
        "street":street,
        "streetNumber":streetNumber       
    }
    
    return address

# This function is used to get the coordinates from a given address.
# It returns a dictionary with the coordinates information.
def getCoordinates(address:str,language:str):
    geocode_result = gmaps.geocode(address=address,language=language)

    lat = geocode_result[0]["geometry"]["location"]["lat"]
    lng = geocode_result[0]["geometry"]["location"]["lng"]

    coordinates = {
        "lat":lat,
        "lng":lng
    }
    
    return coordinates

# This function is used to get the polyline from a given origin and destination address.
# It returns a string with the polyline.
def getPolylineStr(originAddress:str,destinationAddress:str,mode:Literal["driving","walking","transit","bicycling"] = "driving",language:str = "en",alternatives:bool = False):
    route = gmaps.directions(origin=originAddress,destination=destinationAddress,mode=mode,alternatives=alternatives,language=language)[0]
    polyline_str = route["overview_polyline"]["points"]
    return polyline_str

# This function is used to get the distance between two coordinates.
# It returns the distance in kilometers.
def getDistance(coord1:tuple,coord2:tuple):
    lat1 = radians(coord1[0])
    lng1 = radians(coord1[1])
    lat2 = radians(coord2[0])
    lng2 = radians(coord2[1])
    R = 6373.0

    dlat = lat1-lat2
    dlng = lng1-lng2

    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlng / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    distanceKM = R * c

    return distanceKM