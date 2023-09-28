import React, { useState } from "react";
import { useUserLocationContext } from "../context/UserLocationContext";

// This component is the range select for the user to select the radius in which petrol stations should be found
function RangeSelect({ onRadiusChange }) {
  const {userRadius, setUserRadius } = useUserLocationContext();

  return (
    <div className="mt-5 px-2">
      <h2 className="font-bold ">In Which Radius Should Petrol Stations Be Found?</h2>
      <input
        type="range"
        className="w-full h-2 bg-gray-200
        rounded-lg appearance-none
        cursor-pointer "
        min="5"
        max="25"
        step="1"
        onChange={(e) => {
          setUserRadius(e.target.value);
          onRadiusChange(e.target.value);
        }}
        defaultValue={userRadius}
      />
      <label
        className="
        text-[15px]"
      >
        {userRadius} Kilometer
      </label>
    </div>
  );
}

export default RangeSelect;
