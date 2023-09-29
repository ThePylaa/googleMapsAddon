"use client";
import { useState, useEffect, useRef } from "react";
import HeaderNavBar from "/components/header";
import GoogleMapView from "/components/googleMap";
import RangeSelect from "/components/rangeSelect";
import { useStationContext } from "../context/StationContext";
import { useUserLocationContext } from "../context/UserLocationContext";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
  Radio,
} from "@material-tailwind/react";

const mapStyles = {
  width: "100%",
  height: "93%",
};

// This is the home page
// It renders the header and the google map
export default function Home() {
  const [gastype, setGasType] = useState("e5");
  const [sort, setSort] = useState("dist");
  const [startPoint, setStartPoint] = useState("47.75119, 11.7381");
  const [endPoint, setEndPoint] = useState("48.137154, 11.576124");
  const { stationData, setStationData } = useStationContext();
  const { userLocation, setUserLocation, userRadius, setUserRadius } =
    useUserLocationContext();
  const GoogleMapViewRef = useRef();
  let number = 1;
  let list;
  const [open, setOpen] = useState(0);

  // This function handles the opening and closing of the accordions
  const handleOpen = (value) => setOpen(open === value ? 0 : value);

  // This function gets the user location if it isn't the standard
  useEffect(() => {
    if (userLocation.lat == 50.686180 && userLocation.lng == 10.249444) {
      getUserLocation();
    }
  }, [open]);

  // This function gets the user location and puts it into the context
  const getUserLocation = async () => {
    navigator.geolocation.getCurrentPosition(function (pos) {
      setUserLocation({
        lat: parseFloat(pos.coords.latitude),
        lng: parseFloat(pos.coords.longitude),
      });
    });
  };

  // This function inserts the user location into the start point
  function insertUserStartPosition() {
    getUserLocation();
    setStartPoint(userLocation.lat + ", " + userLocation.lng);
  }

  // This function handles the showing of the speed cameras
  async function handleShowCamera() {
    GoogleMapViewRef.current.callUpdateCameras();
  }

  // This function handles the hiding of the speed cameras
  async function handleHideCamera() {
    GoogleMapViewRef.current.callHideCameras();
  }

  // This function handles the click on a station in the list
  // It automatically creates a route to the station
  async function handleClickOnStation(e) {
    let lat = await e.target.dataset.lat;
    let lng = await e.target.dataset.lng;
    let destination = { lat: parseFloat(lat), lng: parseFloat(lng) };
    GoogleMapViewRef.current.callPanToStation(destination);
  }

  // This function handles the search route
  async function handleSearchRoute() {
    GoogleMapViewRef.current.callGetRoute(await getOrigin(), await getDestination());
  }

  // This function handles the search for stations on the route
  async function handleSearchStationOnRoute(){
    GoogleMapViewRef.current.callHandleSearchStationOnRoute(await getOrigin(), await getDestination(), gastype);
  }

  // This function gets the origin out of the input box into a latlng Object
  async function getOrigin() {
    if (startPoint == "") {
      console.error("No start point found");
      return;
    }
    let originArr = await startPoint.split(", ");
    let origin = {
      lat: parseFloat(originArr[0]),
      lng: parseFloat(originArr[1]),
    };
    return origin;
  }

  // This function gets the destination out of the input box into a latlng Object
  async function getDestination() {
    if (endPoint == "") {
      console.error("No end point found");
      return;
    }
    let destinationArr = await endPoint.split(", ");
    let destination = {
      lat: parseFloat(destinationArr[0]),
      lng: parseFloat(destinationArr[1]),
    };
    return destination;
  }

  // This function handles the search for stations
  // It sends a request to the backend and gets the stations back
  // It then puts the stations into the list and the context
  async function handleFindStations() {
    await getUserLocation();
      
    if (userLocation == null) {
      console.error("No user location found");
      return;
    }
    

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_IP + "/station/listNearByStations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lat: userLocation.lat,
            lng: userLocation.lng,
            rad: userRadius,
            type: gastype,
            sort: sort,
          }),
        }
      );

      if (res.ok) {
        var data = await JSON.parse(await res.text());
        clearList();
        setStationData([]);
        let tempArray = [];
        let price;

          for (let station = 0; station < data.length; station++) {
            switch (gastype) {
                case "e10":
                  price = "E10: " + data[station].price_e10 + "€";
                  break;
                case "e5":
                  price = "E5: " + data[station].price_e5 + "€";
                  break;
                case "diesel":
                  price = "Diesel: " + data[station].price_diesel + "€";
                  break;
                default:
                  price = "E5: " +
                  data[station].price_e5 + "€" +
                  "<br/>E10: " +
                  data[station].price_e10 + "€" +
                  "<br/>Diesel: " +
                  data[station].price_diesel + "€";
                  break;
              }
              addListItem(
                data[station].name,
                data[station].street + " " + data[station].houseNumber,
                data[station].place,
                price,
                data[station].dist,
                data[station].lat,
                data[station].lng
              );
              tempArray.push({
                name: data[station].name,
                street: data[station].street + " " + data[station].houseNumber,
                place: data[station].place,
                price_e5: data[station].price_e5,
                price_e10: data[station].price_e10,
                price_diesel: data[station].price_diesel,
                dist: data[station].dist,
                lat: data[station].lat,
                lng: data[station].lng,
              });
            
          }
        await setStationData(tempArray);
        await new Promise((r) => setTimeout(r, 10));
        GoogleMapViewRef.current.callUpdateStations(gastype);
        return;
      }
    } catch (error) {
      console.error("Could not send request: " + error);
    }
  }

  // This function handles the hiding of the stations
  // It clears the list and calls the hide stations function in the google map
  async function handleHideStations() {
    await GoogleMapViewRef.current.callHideStations();
    await clearList();
  }

  function addListItem(
    stationName,
    stationStreet,
    stationCity,
    stationPrice,
    stationDistance,
    lat,
    lng
  ) {
    if (stationPrice.includes("null")) {
      return;
    }
    number++;
    list = document.getElementById("stationList");
    var newLi = document.createElement("li");
    newLi.className = "text-left m-4 text-white text-xl font-bold";
    newLi.onclick = handleClickOnStation;
    newLi.innerHTML =
      '<button class="underline text-cyan-600" data-lat="' +
      lat +
      '" data-lng="' +
      lng +
      '" >' +
      stationName +
      "</button> <p>" +
      stationPrice +
      "</p><p>Street: " +
      stationStreet +
      "</p><p>City: " +
      stationCity +
      "</p><p>Distance: " +
      stationDistance +
      "</p>";
    list.appendChild(newLi);
  }

  function clearList() {
    list = document.getElementById("stationList");
    list.innerHTML = "";
  }

  function handleSortByDisPriDiv(valid) {
    if (valid == true) {
      document.getElementById("sortByDisPriDiv").classList.remove("hidden");
    } else {
      document.getElementById("sortByDisPriDiv").classList.add("hidden");
    }
  }

  return (
    <main>
      <header>
        <HeaderNavBar originPage="home" />
      </header>
      <div className="relative h-full w-full">
        <div className="absolute top-0 left-0 w-full">
          <GoogleMapView ref={GoogleMapViewRef} />
        </div>
        <div className="m-14 absolute top-0 left-0 min-h- h-full w-1/6 z-10">
          <div className="bg-gray-800 opacity-80 rounded-xl">
            <Accordion open={open === 1}>
              <AccordionHeader
                className="ml-5 text-center text-white text-2xl font-bold hover:text-cyan-500"
                onClick={() => handleOpen(1)}
              >
                Search Route
              </AccordionHeader>
              <AccordionBody>
                <div className="container grid grid-cols-2 gap-4 items-center">
                  <div>
                    <form className="flex flex-col items-center">
                      <input
                        id="search"
                        type="text"
                        value={startPoint}
                        onChange={(v) => setStartPoint(v.target.value)}
                        placeholder="Starting Point"
                        className="bg-gray-700 rounded-full w-4/5 p-2 m-2 text-white text-center"
                      />
                      <label className="text-white text-center">to</label>
                      <input
                        id="search"
                        type="text"
                        value={endPoint}
                        onChange={(v) => setEndPoint(v.target.value)}
                        placeholder="Destination"
                        className="bg-gray-700 rounded-full w-4/5 p-2 m-2 text-white text-center"
                      />
                      <label className="text-white text-center">(You Can Only Enter Locations in lat, lng Format. Example: 47.7878669, 11.8382443)</label>
                    </form>
                  </div>
                  <div>
                    <button
                      onClick={insertUserStartPosition}
                      className="flex m-5 text-center hover:underline bg-blue-500 px-8 py-4 font-bold text-white duration-300 ease-in-out hover:bg-opacity-80 rounded-full transition hover:scale-125 delay-100 cursor-pointer"
                    >
                      Get My Location
                    </button>
                    <button
                      onClick={handleSearchRoute}
                      className="flex m-5 text-center hover:underline bg-blue-500 px-8 py-4 font-bold text-white duration-300 ease-in-out hover:bg-opacity-80 rounded-full transition hover:scale-125 delay-100 cursor-pointer"
                    >
                      Search Route
                    </button>
                  </div>
                </div>
              </AccordionBody>
            </Accordion>
            <Accordion open={open === 2}>
              <AccordionHeader
                className="ml-5 text-white text-2xl font-bold hover:text-cyan-500"
                onClick={() => handleOpen(2)}
              >
                Show Petrol Stations On Route
              </AccordionHeader>
              <AccordionBody>
                <RangeSelect
                  onRadiusChange={(radius) => {
                    setUserRadius(radius);
                  }}
                />
                <h2 className="mt-5 ml-3 font-bold">What Fuel Should Get Filtered?</h2>
                <div className="grid grid-cols-3 mt-5 place-items-center" onChange={(event) => setGasType(event.target.value)}>
                  <div><input className="w-5 h-5 cursor-pointer" type="radio" value="e10" name="gasType" onClick={(e) => handleSortByDisPriDiv(true)} />E10</div>
                  <div><input className="w-5 h-5 cursor-pointer" type="radio" value="e5" name="gasType" onClick={(e) => handleSortByDisPriDiv(true)}/>E5</div>
                  <div><input className="w-5 h-5 cursor-pointer" type="radio" value="diesel" name="gasType" onClick={(e) => handleSortByDisPriDiv(true)}/>Diesel</div>
                </div>
                <form className="flex flex-col items-center">
                      <input
                        id="search"
                        type="text"
                        value={startPoint}
                        onChange={(v) => setStartPoint(v.target.value)}
                        placeholder="Starting Point"
                        className="bg-gray-700 rounded-full w-4/5 p-2 m-2 text-white text-center"
                      />
                      <label className="text-white text-center">to</label>
                      <input
                        id="search"
                        type="text"
                        value={endPoint}
                        onChange={(v) => setEndPoint(v.target.value)}
                        placeholder="Destination"
                        className="bg-gray-700 rounded-full w-4/5 p-2 m-2 text-white text-center"
                      />
                      <label className="text-white text-center">(You Can Only Enter Locations in lat, lng Format. Example: 47.7878669, 11.8382443)</label>
                    </form>
                <button
                  onClick={handleSearchStationOnRoute}
                  className="flex m-5 text-center self-center hover:underline bg-blue-500 px-8 py-4 font-bold text-white duration-300 ease-in-out hover:bg-opacity-80 rounded-full transition hover:scale-125 delay-100 cursor-pointer"
                >
                  Search For Petrol Stations On Route
                </button>
              </AccordionBody>
            </Accordion>
            <Accordion open={open === 3}>
              <AccordionHeader
                className="ml-5 text-white text-2xl font-bold hover:text-cyan-500"
                onClick={() => handleOpen(3)}
              >
                Show Petrol Stations
                <br />
                Around My Location
              </AccordionHeader>
              <AccordionBody>
                <RangeSelect
                  onRadiusChange={(radius) => {
                    setUserRadius(radius);
                  }}
                />
                <h2 className="mt-5 ml-3 font-bold">What Fuel Should Get Filtered?</h2>
                <div className="grid grid-cols-4 mt-5 place-items-center" onChange={(event) => setGasType(event.target.value)}>
                  <div><input className="w-5 h-5 cursor-pointer" type="radio" value="e10" name="gasType" onClick={(e) => handleSortByDisPriDiv(true)} />E10</div>
                  <div><input className="w-5 h-5 cursor-pointer" type="radio" value="e5" name="gasType" onClick={(e) => handleSortByDisPriDiv(true)}/>E5</div>
                  <div><input className="w-5 h-5 cursor-pointer" type="radio" value="diesel" name="gasType" onClick={(e) => handleSortByDisPriDiv(true)}/>Diesel</div>
                  <div><input className="w-5 h-5 cursor-pointer" type="radio" value="all" name="gasType" onClick={(e) => handleSortByDisPriDiv(false)}/>All</div>
                </div>
                <div id="sortByDisPriDiv" className="hidden">
                <h2 className="mt-5 ml-3 font-bold">Sort by:</h2>
                <div className="grid grid-cols-2 mt-5 place-items-center" onChange={(event) => setSort(event.target.value)}>
                  <div><input className="w-5 h-5 cursor-pointer" type="radio" value="dist" name="sortType" />Distance</div>
                  <div><input className="w-5 h-5 cursor-pointer" type="radio" value="price" name="sortType"/>Price</div>
                </div>
                </div>
                <div className="container grid grid-cols-2 items-center">
                  <div className="container flex flex-col items-center">
                    <button
                      onClick={handleFindStations}
                      className="flex m-5 text-center hover:underline bg-blue-500 px-8 py-4 font-bold text-white duration-300 ease-in-out hover:bg-opacity-80 rounded-full transition hover:scale-125 delay-100 cursor-pointer"
                    >
                      Find Stations
                    </button>
                  </div>
                  <div className="container flex flex-col items-center">
                    <button
                      onClick={handleHideStations}
                      className="flex m-5 text-center hover:underline bg-blue-500 px-8 py-4 font-bold text-white duration-300 ease-in-out hover:bg-opacity-80 rounded-full transition hover:scale-125 delay-100 cursor-pointer"
                    >
                      Hide Stations
                    </button>
                  </div>
                </div>
                <h2 className="text-center text-white text-2xl font-bold">
                  Available Stations
                </h2>
                <div className="overflow-auto max-h-80">
                  <ul id="stationList">
                    <li className="text-left m-4 text-white text-xl font-bold">
                      Press Find Stations!
                    </li>
                  </ul>
                </div>
              </AccordionBody>
            </Accordion>
            <Accordion open={open === 4}>
              <AccordionHeader
                className="ml-5 text-center text-white text-2xl font-bold hover:text-cyan-500"
                onClick={() => handleOpen(4)}
              >
                Show Speed Cameras
              </AccordionHeader>
              <AccordionBody>
                <div className="container grid grid-cols-2 items-center">
                  <div className="container flex flex-col items-center">
                    <button
                      onClick={handleShowCamera}
                      className="flex m-5 text-center hover:underline bg-blue-500 px-8 py-4 font-bold text-white duration-300 ease-in-out hover:bg-opacity-80 rounded-full transition hover:scale-125 delay-100 cursor-pointer"
                    >
                      Show Speed Cameras
                    </button>
                  </div>
                  <div className="container flex flex-col items-center">
                    <button
                      onClick={handleHideCamera}
                      className="flex m-5 text-center hover:underline bg-blue-500 px-8 py-4 font-bold text-white duration-300 ease-in-out hover:bg-opacity-80 rounded-full transition hover:scale-125 delay-100 cursor-pointer"
                    >
                      Hide Speed Cameras
                    </button>
                  </div>
                </div>
              </AccordionBody>
            </Accordion>
          </div>
        </div>
      </div>
    </main>
  );
}
