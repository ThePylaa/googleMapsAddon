"use client"

import {createContext, useContext, useState} from 'react'

const DirectionsRendererContext = createContext(null)

export function DirectionsRendererContextProvider({children}) {
  const [directionsRendererArray, setDirectionsRendererArray] = useState([])

  return (
    <DirectionsRendererContext.Provider value={{directionsRendererArray, setDirectionsRendererArray}}>
      {children}
    </DirectionsRendererContext.Provider>
  )
}

export const useDirectionsRendererContext = () => useContext(DirectionsRendererContext)