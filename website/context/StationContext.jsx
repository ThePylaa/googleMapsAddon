"use client"

import {createContext, useContext, useState} from 'react'

const StationContext = createContext(null)

export function StationContextProvider({children}) {
  const [stationData, setStationData] = useState([])

  return (
    <StationContext.Provider value={{stationData, setStationData}}>
      {children}
    </StationContext.Provider>
  )
}

export const useStationContext = () => useContext(StationContext)