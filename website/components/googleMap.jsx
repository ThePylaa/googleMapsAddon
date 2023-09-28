"use client";
import { GoogleMap, LoadScript, MarkerClusterer } from "@react-google-maps/api";
import React, {
  forwardRef,
  useState,
  useImperativeHandle,
  useEffect,
} from "react";
import { useStationContext } from "../context/StationContext";
import { useUserLocationContext } from "../context/UserLocationContext";
import { useDirectionsRendererContext } from "../context/DirectionsRendererContext";

// This is the Google Map View
// It renders the Google Map
// It also provides the functions for the Google Map
// It also provides the context for the Google Map
const GoogleMapView = forwardRef((props, ref) => {
  const containerStyle = {
    width: "100%",
    height: "94vh",
  };
  const [map, setMap] = useState();
  const { userLocation, setUserLocation, userRadius, setUserRadius } =
    useUserLocationContext();
  const { stationData, setStationData } = useStationContext();
  const [stationMarker, setStationMarker] = useState([]);
  const [cameraMarker, setCameraMarker] = useState([]);
  const [cheapGasMarker, setCheapGasMarker] = useState([]);
  const [userMarker, setUserMarker] = useState();
  const [userCircle, setUserCircle] = useState();
  const [routeCircles, setRouteCircles] = useState([]);
  const [routeLink, setRouteLink] = useState("");
  let directionsService;
  let directionsRenderer;
  const { directionsRendererArray, setDirectionsRendererArray } =
    useDirectionsRendererContext();

  // This gets all funciton calls from the main page
  useImperativeHandle(ref, () => ({
    callUpdateStations(gasType) {
      showStations(gasType);
    },
    callUpdateCameras() {
      showCameras();
    },
    callShowRoute(lat, lng) {
      showRoute(
        { origin: userLocation },
        { destination: { lat: lat, lng: lng } }
      );
    },
    callHideCameras() {
      deleteMarkers("camera");
    },
    callHideStations() {
      deleteMarkers("gas");
      if (userCircle != null) {
        userCircle.setMap(null);
      }
    },
    callPanToStation(destination) {
      map.panTo(destination);
      map.setZoom(16);
      showRoute({ origin: userLocation }, { destination: destination });
    },
    callGetRoute(origin, destination) {
      showRoute({ origin: origin }, { destination: destination });
    },
    async callHandleSearchStationOnRoute(origin, destination, gasType) {
      showRoute({ origin: origin }, { destination: destination });
      await new Promise((r) => setTimeout(r, 200));
      let polyRoute = await directionsRendererArray[directionsRendererArray.length-1].directions.routes[0]["overview_polyline"];
      getStationsOnRoute(polyRoute, gasType)
    }
  }));

  // This is the function gets all stations on a specific route
  // It also sets the circles around the origin points
  async function getStationsOnRoute(polyRoute, gasType) {
    if (routeCircles.length > 0) {
      routeCircles.forEach((circle) => {
        circle.setMap(null);
      });
    }
    if (cheapGasMarker.length > 0) {
      deleteMarkers("cheapGas");
    }


    let res = await fetch(
      process.env.NEXT_PUBLIC_API_IP + "/gMaps/getRouteInformation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          routePolyline: polyRoute,
          rad: userRadius,
          type: gasType
        }),
      })
    
    let data = await res.json();

    //Set cricles arounf origin Points
    data.origin_list.forEach(element => {
      routeCircles.push(new google.maps.Circle({
        center: { lat: element[0], lng: element[1] },
        radius: userRadius * 1000,
        fillColor: "#F89880",
        fillOpacity: 0.3,
        map: map,
        strokeColor: "#FFFFFF",
        strokeOpacity: 0.1,
        strokeWeight: 2,
      }))
    });

    let tempArray = [];
    let price;

    //Set Markers for cheap gas stations
    data.stations_list.forEach(element => {
      switch (gasType) {
        case "e5": 
          price = "<div class='text-black'>E5: " + element.e5 + " €</div>";
          break;
        case "e10":
          price = "<div class='text-black'>E10: " + element.e10 + " €</div>";
          break;
        case "diesel":
          price = "<div class='text-black'>Diesel: " + element.diesel + " €</div>";
          break;
        default:
          console.error("Wrong type for adding Markers");
          break;
      }
      tempArray.push(addMarker(element.lat, element.lng, "cheapGas", 0, price))
    })
    setCheapGasMarker(tempArray);

  }

  // This function gets the user location and sets it
  async function panToUserLocation() {
    if (map && userLocation) {
      if (userRadius <= 5) {
        map.setZoom(13);
      } else if (userRadius >= 5 && userRadius <= 15) {
        map.setZoom(11);
      } else if (userRadius >= 15 && userRadius <= 25) {
        map.setZoom(10);
      }

      if (userMarker != null) {
        await deleteMarkers("user");
      }
      await map.panTo(userLocation);
    }
  }

  // This function sets the user location marker
  async function setUserMarkerFunction() {
    if (userMarker != null) {
      await deleteMarkers("user");
    }
    setUserMarker(
      new google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: map,
      })
    );
    setUserCircle(
      new google.maps.Circle({
        center: { lat: userLocation.lat, lng: userLocation.lng },
        radius: userRadius * 1000,
        fillColor: "#0000FF",
        fillOpacity: 0.1,
        map: map,
        strokeColor: "#FFFFFF",
        strokeOpacity: 0.1,
        strokeWeight: 2,
      })
    );
  }

  // This function adds a marker to the map
  // It also adds a info window to the marker
  // When the marker is clicked, the info window opens and a route to this marker is shown
  function addMarker(lat, lng, type, speed, price) {
    let markerPicture;
    let content;
    if (type == "camera") {
      markerPicture = "/speed_camera.png";
      content =
        "<div class='text-black'>Speedlimit: " + speed + " km/h" + "</div>";
    } else if (type == "gas") {
      markerPicture = "/gas_station.png";
      if(price.includes("null")){
        return new google.maps.Marker({
          position: { lat: lat, lng: lng },
          map: null,
          icon: {
            url: markerPicture,
            scaledSize: {
              width: 50,
              height: 50,
            },
          },
        });
      }
      content = price
    } else if (type == "cheapGas") {
      markerPicture = "/gas_station_green.png";
      if(price.includes("null")){
        return new google.maps.Marker({
          position: { lat: lat, lng: lng },
          map: null,
          icon: {
            url: markerPicture,
            scaledSize: {
              width: 50,
              height: 50,
            },
          },
        });
      }
      content = price
    } else {
      console.error("Wrong type for adding Markers");
      return;
    }
    const marker = new google.maps.Marker({
      position: { lat: lat, lng: lng },
      map: map,
      icon: {
        url: markerPicture,
        scaledSize: {
          width: 50,
          height: 50,
        },
      },
    });

    let infoWindow = new google.maps.InfoWindow({
      content: "",
      disableAutoPan: true,
    });

    marker.addListener("click", () => {
      infoWindow.setContent(content);
      infoWindow.open(map, marker);
      showRoute(
        { origin: userLocation },
        { destination: { lat: lat, lng: lng } }
      );
    });

    return marker;
  }

  // This function deletes all markers of a specific type
  function deleteMarkers(markerType) {
    if (markerType == "gas" && stationMarker.length > 0) {
      stationMarker.forEach((marker) => {
        marker.setMap(null);
      });
    } else if (markerType == "camera" && cameraMarker.length > 0) {
      cameraMarker.forEach((marker) => {
        marker.setMap(null);
      });
    } else if (markerType == "user" && userMarker != null) {
      userMarker.setMap(null);
      userCircle.setMap(null);
    } else if (markerType == "cheapGas" && cheapGasMarker.length > 0) {
      cheapGasMarker.forEach((marker) => {
        marker.setMap(null);
      });
    } else {
      console.error("Wrong type for deleting Markers or no Marker existing");
    }
  }

  // This function shows the gas stations on the map
  async function showStations(gasType) {
    await deleteMarkers("gas");
    await deleteMarkers("user");
    await new Promise((r) => setTimeout(r, 1000));
    let tempArray = [];
    let price;

    for (let station = 0; station < stationData.length; station++) {

      switch (gasType) {
        case "e5": 
          price = "<div class='text-black'>E5: " + stationData[station].price_e5 + " €</div>";
          break;
        case "e10":
          price = "<div class='text-black'>E10: " + stationData[station].price_e10 + " €</div>";
          break;
        case "diesel":
          price = "<div class='text-black'>Diesel: " + stationData[station].price_diesel + " €</div>";
          break;
        default:
          if(stationData[station].price_e5 == null){
            price = "<div class='text-black'>E5: No Data Provided<br/>E10: " + stationData[station].price_e10 + " €<br/>Diesel: " + stationData[station].price_diesel + "€</div>";
            break;
          }else if(stationData[station].price_e10 == null){
            price = "<div class='text-black'>E5: " + stationData[station].price_e5 + " €<br/>E10: No Data Provided<br/>Diesel: " + stationData[station].price_diesel + "€</div>";
            break;
          }else if(stationData[station].price_diesel == null){
            price = "<div class='text-black'>E5: " + stationData[station].price_e5 + " €<br/>E10: " + stationData[station].price_e10 + " €<br/>Diesel: No Data Provided</div>";
            break;
          }else{
            price = "<div class='text-black'>E5: " + stationData[station].price_e5 + " €<br/>E10: " + stationData[station].price_e10 + " €<br/>Diesel: " + stationData[station].price_diesel + "€</div>";
            break;
          }
      }

      tempArray.push(
        addMarker(
          stationData[station].lat,
          stationData[station].lng,
          "gas",
          0,
          price
        )
      );
    }
    setStationMarker(tempArray);
    await setUserMarkerFunction();
    await panToUserLocation();
  }

  // This function shows the speed cameras on the map
  async function showCameras() {
    await deleteMarkers("user");
    await deleteMarkers("camera");
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_IP + "/camera/cameras?skip=0&limit=2000",
        {
          method: "GET",
        }
      );
      let data = await JSON.parse(await res.text());

      let tempArray = [];
      for (let camera = 0; camera < data.length; camera++) {
        tempArray.push(
          addMarker(
            data[camera].lat,
            data[camera].lng,
            "camera",
            data[camera].speed
          )
        );
      }
      await setCameraMarker(tempArray);
      await panToUserLocation();
    } catch (error) {
      console.error("Could not send request: " + error);
    }
  }

  // This function deletes all shown routes
  async function deleteRoutes() {
    if (directionsRendererArray.length > 0) {
      directionsRendererArray.forEach((directionsRenderer) => {
        directionsRenderer.setMap(null);
      });
    }
  }

  // This function generates a route link to google maps
  async function generateRouteLink({ origin }, { destination }) {
    setRouteLink(
      "https://www.google.com/maps/dir/?api=1&origin=" +
        origin.lat +
        "," +
        origin.lng +
        "&destination=" +
        destination.lat +
        "," +
        destination.lng +
        "&travelmode=driving"
    );
    document.getElementById("toMapsDiv").classList.remove("hidden");
  }

  // This function shows a route on the map
  function showRoute({ origin }, { destination }) {
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: false,
    });
    deleteRoutes();
    directionsRenderer.setMap(map);

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
          directionsRendererArray.push(directionsRenderer);
          generateRouteLink({ origin }, { destination });
          return 
        } else {
          console.error(`error fetching directions ${result}`);
          return 
        }
      }
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-0 left-0 w-full">
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          mapIds={["54377c3a04726634"]}
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={{ lat: userLocation.lat, lng: userLocation.lng }}
            options={{
              mapId: "54377c3a04726634",
              streetViewControl: false,
              fullscreenControl: false,
              mapTypeControl: false,
            }}
            zoom={6}
            onLoad={(map) => setMap(map)}
          ></GoogleMap>
        </LoadScript>
        <div
          id="toMapsDiv"
          className="m-14 absolute top-0 right-0 min-h- h-full w-1/6 z-10 hidden"
        >
          <div className="bg-gray-800 opacity-80 rounded-xl">
            <h2
              className="text-center text-white text-2xl font-bold m-5"
            >
              Open Current Route in Google Maps
            </h2>
            <div className="container flex justify-center">
              <a href={routeLink} target="_blank">
                <button className="flex m-5 text-center hover:underline bg-blue-500 px-8 py-4 font-bold text-white duration-300 ease-in-out hover:bg-opacity-80 rounded-full transition hover:scale-125 delay-100 cursor-pointer">
                  Go To Maps
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
GoogleMapView.displayName = "GoogleMapView";
export default GoogleMapView;
