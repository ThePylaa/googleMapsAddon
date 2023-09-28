"use client"
import './globals.css'
import { Inter } from 'next/font/google'
import { StationContextProvider } from '../context/StationContext.jsx'
import { UserLocationContextProvider } from '../context/UserLocationContext.jsx'
import { DirectionsRendererContextProvider } from '../context/DirectionsRendererContext.jsx'

const inter = Inter({ subsets: ['latin'] })

 const metadata = {
  title: 'gMapsAddon',
  description: 'gMapsAddon',
}

// This is the layout for the whole website
// It renders the children
// It also provides the context for the whole website
export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={inter.className}>
        <UserLocationContextProvider>
          <StationContextProvider>
            <DirectionsRendererContextProvider>
              {children}
            </DirectionsRendererContextProvider>
          </StationContextProvider>
        </UserLocationContextProvider>
      </body>
    </html>
  )
}
