// Flight Details Injector
// This script injects additional flight information directly into Google Flights search results

// Database of aircraft seat information for reference
const aircraftSeatDatabase = {
  // Airbus
  A319: { legroom: { economy: 30, premium: 34, business: 38 }, width: { economy: 18, premium: 18.5, business: 21 } },
  A320: { legroom: { economy: 30, premium: 34, business: 38 }, width: { economy: 18, premium: 18.5, business: 21 } },
  A321: { legroom: { economy: 31, premium: 35, business: 38 }, width: { economy: 18, premium: 18.5, business: 21 } },
  A330: {
    legroom: { economy: 31, premium: 35, business: 60, first: 82 },
    width: { economy: 18, premium: 19, business: 21, first: 24 },
  },
  A350: {
    legroom: { economy: 32, premium: 38, business: 60, first: 82 },
    width: { economy: 18, premium: 19, business: 22, first: 26 },
  },
  A380: {
    legroom: { economy: 32, premium: 38, business: 60, first: 82 },
    width: { economy: 18.5, premium: 19.5, business: 22, first: 26 },
  },

  // Boeing
  737: { legroom: { economy: 30, premium: 34, business: 38 }, width: { economy: 17, premium: 17.5, business: 20 } },
  747: {
    legroom: { economy: 31, premium: 38, business: 60, first: 80 },
    width: { economy: 17.5, premium: 18.5, business: 20, first: 22 },
  },
  757: { legroom: { economy: 31, premium: 35, business: 45 }, width: { economy: 17.5, premium: 18.5, business: 21 } },
  767: {
    legroom: { economy: 31, premium: 35, business: 60, first: 80 },
    width: { economy: 17.5, premium: 18.5, business: 20, first: 22 },
  },
  777: {
    legroom: { economy: 31, premium: 38, business: 60, first: 80 },
    width: { economy: 17.5, premium: 18.5, business: 22, first: 24 },
  },
  787: {
    legroom: { economy: 32, premium: 38, business: 60, first: 80 },
    width: { economy: 17.5, premium: 18.5, business: 22, first: 24 },
  },

  // Embraer
  "Embraer 170": { legroom: { economy: 31, business: 36 }, width: { economy: 18, business: 20 } },
  "Embraer 175": { legroom: { economy: 31, business: 36 }, width: { economy: 18, business: 20 } },
  "Embraer 190": { legroom: { economy: 31, business: 36 }, width: { economy: 18, business: 20 } },
  "Embraer 195": { legroom: { economy: 29, business: 36 }, width: { economy: 18, business: 20 } },

  // Bombardier/CRJ
  CRJ: { legroom: { economy: 29, business: 34 }, width: { economy: 17, business: 19 } },
  "CRJ 700": { legroom: { economy: 29, business: 34 }, width: { economy: 17, business: 19 } },
  "CRJ 900": { legroom: { economy: 29, business: 34 }, width: { economy: 17, business: 19 } },

  // Other common aircraft
  "Dash 8": { legroom: { economy: 30, business: 34 }, width: { economy: 17, business: 19 } },
  "ATR 72": { legroom: { economy: 29, business: 34 }, width: { economy: 17, business: 19 } },
}

// Airline-specific overrides for certain aircraft
const airlineAircraftOverrides = {
  LH: {
    // Lufthansa
    A320: { legroom: { economy: 31, premium: 35, business: 40 } },
    A350: { legroom: { economy: 31, premium: 38, business: 64 } },
  },
  BA: {
    // British Airways
    A320: { legroom: { economy: 29, premium: 34, business: 38 } },
    777: { legroom: { economy: 31, premium: 38, business: 72, first: 78 } },
  },
  AA: {
    // American Airlines
    737: { legroom: { economy: 30, premium: 34, business: 37 } },
  },
  DL: {
    // Delta
    A320: { legroom: { economy: 31, premium: 34, business: 37 } },
    737: { legroom: { economy: 31, premium: 34, business: 37 } },
  },
  UA: {
    // United
    737: { legroom: { economy: 30, premium: 34, business: 38 } },
  },
  OS: {
    // Austrian
    "Embraer 195": { legroom: { economy: 29, business: 36 } },
  },
}

// Database of airline amenities
const airlineAmenities = {
  LH: {
    // Lufthansa
    economy: ["Power outlets", "Wi-Fi (fee)", "Personal entertainment"],
    premium: ["Power outlets", "Wi-Fi (fee)", "Personal entertainment", "Enhanced meals"],
    business: ["Lie-flat seats", "Power outlets", "Wi-Fi", "Personal entertainment", "Premium meals"],
  },
  BA: {
    // British Airways
    economy: ["Wi-Fi (fee)", "Personal entertainment"],
    premium: ["Power outlets", "Wi-Fi (fee)", "Personal entertainment", "Enhanced meals"],
    business: ["Lie-flat seats", "Power outlets", "Wi-Fi", "Personal entertainment", "Premium meals"],
  },
  AA: {
    // American Airlines
    economy: ["Power outlets", "Wi-Fi (fee)", "Personal entertainment"],
    premium: ["Power outlets", "Wi-Fi (fee)", "Personal entertainment", "Enhanced meals"],
    business: ["Lie-flat seats", "Power outlets", "Wi-Fi", "Personal entertainment", "Premium meals"],
  },
  DL: {
    // Delta
    economy: ["Power outlets", "Wi-Fi (fee)", "Personal entertainment"],
    premium: ["Power outlets", "Wi-Fi (fee)", "Personal entertainment", "Enhanced meals"],
    business: ["Lie-flat seats", "Power outlets", "Wi-Fi", "Personal entertainment", "Premium meals"],
  },
  UA: {
    // United
    economy: ["Power outlets", "Wi-Fi (fee)", "Personal entertainment"],
    premium: ["Power outlets", "Wi-Fi (fee)", "Personal entertainment", "Enhanced meals"],
    business: ["Lie-flat seats", "Power outlets", "Wi-Fi", "Personal entertainment", "Premium meals"],
  },
  OS: {
    // Austrian
    economy: ["Wi-Fi (fee)"],
    business: ["Recliner seats", "Power outlets", "Wi-Fi", "Premium meals"],
  },
}

// Function to extract flight information from flight element
function extractFlightInfo(flightElement) {
  try {
    // Initialize flight info object
    const flightInfo = {
      airline: "",
      airlineCode: "",
      flightNumber: "",
      aircraft: "",
      legroom: "",
      cabin: "",
      amenities: [],
    }

    // Extract airline and flight number
    const flightNumberElement = flightElement.querySelector(".Xsgmwe.sI2Nye")
    if (flightNumberElement) {
      const flightCodeText = flightNumberElement.textContent.trim()
      const flightCodeMatch = flightCodeText.match(/([A-Z0-9]{2})\s*(\d+)/)
      if (flightCodeMatch) {
        flightInfo.airlineCode = flightCodeMatch[1]
        flightInfo.flightNumber = flightCodeMatch[2]
      }
    }

    // Extract airline name
    const airlineNameElement = flightElement.querySelector(".Xsgmwe:not(.sI2Nye)")
    if (airlineNameElement) {
      flightInfo.airline = airlineNameElement.textContent.trim()
    }

    // Extract cabin class
    const cabinClassElement = flightElement.querySelector('.Xsgmwe[jsname="Pvlywd"]')
    if (cabinClassElement) {
      flightInfo.cabin = cabinClassElement.textContent.trim().toLowerCase()
    }

    // Extract aircraft type
    const aircraftTypeElement = flightElement.querySelector('.Xsgmwe:not([jsname="Pvlywd"]):not(.sI2Nye):not(.QS0io)')
    if (aircraftTypeElement) {
      flightInfo.aircraft = aircraftTypeElement.textContent.trim()
    }

    // Look for legroom information in the flight details
    const flightDetailsContainer = flightElement.closest(".sSHqwe, .L5Okte")
    if (flightDetailsContainer) {
      const legroomElement = flightDetailsContainer.querySelector(".WtSsrd")
      if (legroomElement && legroomElement.textContent.includes("legroom")) {
        flightInfo.legroom = legroomElement.textContent.trim()
      } else {
        // If no explicit legroom info, try to get it from our database
        if (flightInfo.aircraft && flightInfo.cabin) {
          const legroomInfo = getLegroomInfo(flightInfo.aircraft, flightInfo.airlineCode, flightInfo.cabin)
          if (legroomInfo) {
            flightInfo.legroom = legroomInfo
          }
        }
      }
    }

    // Get amenities if available
    if (flightInfo.airlineCode && flightInfo.cabin) {
      flightInfo.amenities = getAmenities(flightInfo.airlineCode, flightInfo.cabin)
    }

    return flightInfo
  } catch (error) {
    console.error("Error extracting flight info:", error)
    return null
  }
}

// Function to get legroom information from our database
function getLegroomInfo(aircraftType, airlineCode, cabinClass) {
  // Try to match the aircraft type to our database
  let aircraftKey = null

  // Check for exact match
  if (aircraftSeatDatabase[aircraftType]) {
    aircraftKey = aircraftType
  } else {
    // Check for partial match
    for (const key in aircraftSeatDatabase) {
      if (aircraftType.includes(key)) {
        aircraftKey = key
        break
      }
    }
  }

  if (!aircraftKey) return null

  // Check if there's an airline-specific override
  let legroom = null
  if (airlineCode && airlineAircraftOverrides[airlineCode] && airlineAircraftOverrides[airlineCode][aircraftKey]) {
    const airlineOverride = airlineAircraftOverrides[airlineCode][aircraftKey]
    if (airlineOverride.legroom && airlineOverride.legroom[cabinClass]) {
      legroom = airlineOverride.legroom[cabinClass]
    }
  }

  // If no airline override, use the base aircraft info
  if (!legroom && aircraftSeatDatabase[aircraftKey].legroom && aircraftSeatDatabase[aircraftKey].legroom[cabinClass]) {
    legroom = aircraftSeatDatabase[aircraftKey].legroom[cabinClass]
  }

  if (!legroom) return null

  // Format the legroom information
  const rating = getLegroomRating(legroom)
  return `${rating} legroom (${legroom} in)`
}

// Function to get amenities for an airline and cabin class
function getAmenities(airlineCode, cabinClass) {
  if (!airlineCode || !cabinClass) return []

  if (airlineAmenities[airlineCode] && airlineAmenities[airlineCode][cabinClass]) {
    return airlineAmenities[airlineCode][cabinClass]
  }

  // Default amenities if airline not found
  const defaultAmenities = {
    economy: ["Personal entertainment"],
    premium: ["Power outlets", "Personal entertainment"],
    business: ["Power outlets", "Wi-Fi", "Personal entertainment"],
    first: ["Power outlets", "Wi-Fi", "Personal entertainment", "Premium service"],
  }

  return defaultAmenities[cabinClass] || []
}

// Function to rate legroom
function getLegroomRating(legroom) {
  if (!legroom) return "Unknown"

  if (legroom < 30) return "Below average"
  if (legroom < 32) return "Average"
  if (legroom < 34) return "Above average"
  if (legroom < 38) return "Good"
  if (legroom < 60) return "Excellent"
  return "Exceptional"
}

// Function to create and inject flight details element
function createFlightDetailsElement(flightInfo) {
  if (!flightInfo) return null

  // Create container for flight details
  const detailsContainer = document.createElement("div")
  detailsContainer.className = "injected-flight-details"

  // Add a subtle separator
  const separator = document.createElement("div")
  separator.className = "flight-details-separator"
  detailsContainer.appendChild(separator)

  // Create flight info section
  const flightInfoSection = document.createElement("div")
  flightInfoSection.className = "flight-info-section"

  // Add aircraft type
  if (flightInfo.aircraft) {
    const aircraftElement = document.createElement("div")
    aircraftElement.className = "aircraft-info"

    const aircraftIcon = document.createElement("span")
    aircraftIcon.className = "info-icon aircraft-icon"
    aircraftIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>`

    const aircraftText = document.createElement("span")
    aircraftText.className = "info-text"
    aircraftText.textContent = flightInfo.aircraft

    aircraftElement.appendChild(aircraftIcon)
    aircraftElement.appendChild(aircraftText)
    flightInfoSection.appendChild(aircraftElement)
  }

  // Add legroom information
  if (flightInfo.legroom) {
    const legroomElement = document.createElement("div")
    legroomElement.className = "legroom-info"

    const legroomIcon = document.createElement("span")
    legroomIcon.className = "info-icon legroom-icon"
    legroomIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 11.84l-.09.16-.41.71-3.25 5.62 1.85 2.8-.5.87-5.2-3 2.89-5H9c-1.1 0-2-.9-2-2V3h6v6h5.77c1.47 0 2.4 1.53 1.8 2.83l.03.01zM13 15H6V3H4v12c0 1.1.9 2 2 2h7v-2z"></path></svg>`

    const legroomText = document.createElement("span")
    legroomText.className = "info-text"
    legroomText.textContent = flightInfo.legroom

    // Add color coding based on legroom rating
    if (flightInfo.legroom.includes("Below average")) {
      legroomText.classList.add("below-average")
    } else if (flightInfo.legroom.includes("Average")) {
      legroomText.classList.add("average")
    } else if (
      flightInfo.legroom.includes("Above average") ||
      flightInfo.legroom.includes("Good") ||
      flightInfo.legroom.includes("Excellent") ||
      flightInfo.legroom.includes("Exceptional")
    ) {
      legroomText.classList.add("above-average")
    }

    legroomElement.appendChild(legroomIcon)
    legroomElement.appendChild(legroomText)
    flightInfoSection.appendChild(legroomElement)
  }

  // Add amenities if available
  if (flightInfo.amenities && flightInfo.amenities.length > 0) {
    const amenitiesElement = document.createElement("div")
    amenitiesElement.className = "amenities-info"

    const amenitiesIcon = document.createElement("span")
    amenitiesIcon.className = "info-icon amenities-icon"
    amenitiesIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`

    const amenitiesText = document.createElement("span")
    amenitiesText.className = "info-text"
    amenitiesText.textContent = flightInfo.amenities.join(", ")

    amenitiesElement.appendChild(amenitiesIcon)
    amenitiesElement.appendChild(amenitiesText)
    flightInfoSection.appendChild(amenitiesElement)
  }

  // Add all sections to the container
  detailsContainer.appendChild(flightInfoSection)

  return detailsContainer
}

// Function to inject flight details into flight elements
function injectFlightDetails() {
  try {
    // Skip injection on the main flights homepage, but not on search results
    if (
      window.location.href.includes("tcfs") &&
      !window.location.href.includes("search") &&
      !document.querySelector(".MX5RWe.sSHqwe.y52p7d, .L5Okte.y52p7d")
    ) {
      return
    }

    // Find all flight elements
    const flightElements = document.querySelectorAll(".MX5RWe.sSHqwe.y52p7d, .L5Okte.y52p7d")

    flightElements.forEach((flightElement) => {
      // Check if details are already injected
      if (flightElement.querySelector(".injected-flight-details")) {
        return
      }

      // Extract flight info
      const flightInfo = extractFlightInfo(flightElement)
      if (!flightInfo) return

      // Create details element
      const detailsElement = createFlightDetailsElement(flightInfo)
      if (!detailsElement) return

      // Always append to the end of the flight element to ensure consistent placement
      // This ensures the details are always at the bottom of the listing
      flightElement.appendChild(detailsElement)

      // Make sure the flight element can accommodate the added content
      flightElement.style.position = "relative"
      flightElement.style.overflow = "visible"

      // Ensure the parent containers don't clip our content
      let parent = flightElement.parentElement
      while (parent && parent !== document.body) {
        const style = window.getComputedStyle(parent)
        if (style.overflow === "hidden" || style.overflowY === "hidden") {
          parent.style.overflow = "visible"
          parent.style.overflowY = "visible"
        }
        parent = parent.parentElement
      }
    })
  } catch (error) {
    console.error("Error injecting flight details:", error)
  }
}

// Set up observer to watch for DOM changes
function setupFlightDetailsObserver() {
  // Skip injection on the main flights homepage, but not on search results
  if (
    window.location.href.includes("tcfs") &&
    !window.location.href.includes("search") &&
    !document.querySelector(".MX5RWe.sSHqwe.y52p7d, .L5Okte.y52p7d")
  ) {
    console.log("Skipping flight details injection on Google Flights homepage")
    return
  }

  // Create a mutation observer to watch for changes to the DOM
  const observer = new MutationObserver((mutations) => {
    let shouldInject = false

    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        shouldInject = true
        break
      }
    }

    if (shouldInject) {
      // Use setTimeout to allow the DOM to settle
      setTimeout(injectFlightDetails, 500)
    }
  })

  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // Also inject flight details immediately
  setTimeout(injectFlightDetails, 500)
}

// Function to ensure injected content remains visible
function ensureVisibility() {
  // This runs periodically to make sure our injected content stays visible
  // even if Google's JavaScript modifies the DOM
  const injectedElements = document.querySelectorAll(".injected-flight-details")

  injectedElements.forEach((element) => {
    // Make sure the element is visible
    element.style.display = "block"

    // Make sure parent containers don't hide our content
    let parent = element.parentElement
    while (parent && parent !== document.body) {
      const style = window.getComputedStyle(parent)
      if (style.overflow === "hidden" || style.overflowY === "hidden") {
        parent.style.overflow = "visible"
        parent.style.overflowY = "visible"
      }
      parent = parent.parentElement
    }
  })

  // Schedule the next check
  setTimeout(ensureVisibility, 2000)
}

// Start the visibility checker
setTimeout(ensureVisibility, 2000)
