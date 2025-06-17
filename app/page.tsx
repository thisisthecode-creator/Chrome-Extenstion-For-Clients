"use client"

import { useEffect } from "react"

export default function SyntheticV0PageForDeployment() {
  useEffect(() => {
    // Import the flight-details-injector script dynamically
    const importScript = async () => {
      try {
        await import("../flight-details-injector.js")
        console.log("Flight details injector script loaded")
      } catch (error) {
        console.error("Error loading flight details injector:", error)
      }
    }

    importScript()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Google Flight Extension</h1>
      <p className="mb-4">This extension adds custom buttons and flight details to Google Flights search results.</p>
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          To use this extension, please install it in your browser and visit Google Flights.
        </p>
      </div>
    </div>
  )
}
