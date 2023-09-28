"use client"

import {createContext, useContext, useState} from 'react'

const UserLocationContext = createContext(null)

export function UserLocationContextProvider({children}) {
  const [userLocation, setUserLocation] = useState({lat: 50.686180, lng: 10.249444})
  const [userRadius, setUserRadius] = useState(10)

  return (
    <UserLocationContext.Provider value={{userLocation, setUserLocation, userRadius, setUserRadius}}>
      {children}
    </UserLocationContext.Provider>
  )
}

export const useUserLocationContext = () => useContext(UserLocationContext)