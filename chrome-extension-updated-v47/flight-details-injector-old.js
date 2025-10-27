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
    console.log("Extracting flight info from element:", flightElement)
    
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

    // Try multiple selectors for airline and flight number
    const flightNumberSelectors = [
      ".Xsgmwe.sI2Nye",
      ".sI2Nye",
      "[data-testid*='flight-number']",
      ".flight-number",
      "span:contains('LO')",
      "span:contains('LH')",
      "span:contains('AA')",
      "span:contains('DL')",
      "span:contains('UA')"
    ]

    // Also look for airline codes in the text content
    const allText = flightElement.textContent
    console.log("All text content:", allText)
    
    // Look for flight numbers in data-gs attributes first
    const dataGsElements = flightElement.querySelectorAll('[data-gs]')
    for (const element of dataGsElements) {
      const dataGs = element.getAttribute('data-gs')
      console.log("Found data-gs:", dataGs)
      if (dataGs) {
        // Decode base64 and look for flight numbers
        try {
          const decoded = atob(dataGs)
          console.log("Decoded data-gs:", decoded)
          // Try multiple patterns to find flight numbers
          const patterns = [
            /(LH|LO|AA|DL|UA|BA|AF|KL|LX|OS|SK|AY|IB|VY|FR|W6|U2|EW|DE|AB|4U|X3)(\d+)/g,
            /(LH|LO|AA|DL|UA|BA|AF|KL|LX|OS|SK|AY|IB|VY|FR|W6|U2|EW|DE|AB|4U|X3)(\d+)/,
            /([A-Z]{2})(\d{3,4})/g,
            /([A-Z]{2})(\d{3,4})/
          ]
          
          for (const pattern of patterns) {
            const matches = decoded.match(pattern)
            if (matches && matches.length > 0) {
              const firstMatch = matches[0]
              const codeMatch = firstMatch.match(/([A-Z]{2})(\d+)/)
              if (codeMatch) {
                flightInfo.airlineCode = codeMatch[1]
                flightInfo.flightNumber = codeMatch[2]
                console.log("Extracted from data-gs:", flightInfo.airlineCode, flightInfo.flightNumber)
                break
              }
            }
          }
        } catch (e) {
          console.log("Could not decode data-gs:", e)
        }
      }
    }
    
    // If not found in data-gs, look for airline codes in the text content
    if (!flightInfo.airlineCode) {
      const airlineCodeMatch = allText.match(/\b(LO|LH|AA|DL|UA|BA|AF|KL|LX|OS|SK|AY|IB|VY|FR|W6|U2|EW|DE|AB|4U|X3|EW|DE|AB|4U|X3)\s*(\d+)\b/)
      if (airlineCodeMatch) {
        flightInfo.airlineCode = airlineCodeMatch[1]
        flightInfo.flightNumber = airlineCodeMatch[2]
        console.log("Extracted airline code from text:", flightInfo.airlineCode, "flight number:", flightInfo.flightNumber)
      } else {
        // Try individual selectors
        for (const selector of flightNumberSelectors) {
          const element = flightElement.querySelector(selector)
          if (element) {
            const flightCodeText = element.textContent.trim()
            console.log("Found flight code text:", flightCodeText)
            const flightCodeMatch = flightCodeText.match(/([A-Z0-9]{2})\s*(\d+)/)
            if (flightCodeMatch) {
              flightInfo.airlineCode = flightCodeMatch[1]
              flightInfo.flightNumber = flightCodeMatch[2]
              console.log("Extracted airline code:", flightInfo.airlineCode, "flight number:", flightInfo.flightNumber)
              break
            }
          }
        }
      }
    }

    // Try multiple selectors for airline name
    const airlineSelectors = [
      ".Xsgmwe:not(.sI2Nye)",
      "[data-testid*='airline']",
      ".airline-name",
      "span:not(.sI2Nye)",
      ".sSHqwe span", // New structure
      ".h1fkLb span" // New structure
    ]

    // Look for airline names in the text content
    const airlineNames = ['LOT', 'Lufthansa', 'American Airlines', 'Delta', 'United', 'British Airways', 'Air France', 'KLM', 'Swiss', 'Austrian', 'SAS', 'Finnair', 'Iberia', 'Vueling', 'Ryanair', 'Wizz Air', 'EasyJet', 'Eurowings', 'Air Berlin', 'Germanwings']
    
    for (const airlineName of airlineNames) {
      if (allText.includes(airlineName)) {
        flightInfo.airline = airlineName
        console.log("Extracted airline name from text:", flightInfo.airline)
        break
      }
    }

    // If not found in text, try selectors
    if (!flightInfo.airline) {
      for (const selector of airlineSelectors) {
        const element = flightElement.querySelector(selector)
        if (element && element.textContent.trim() && !element.textContent.match(/^\d+$/) && !element.textContent.includes('in') && !element.textContent.includes('AM') && !element.textContent.includes('PM')) {
          flightInfo.airline = element.textContent.trim()
          console.log("Extracted airline name:", flightInfo.airline)
          break
        }
      }
    }

    // Try multiple selectors for cabin class
    const cabinSelectors = [
      '.Xsgmwe[jsname="Pvlywd"]',
      '[data-testid*="cabin"]',
      '.cabin-class',
      'span:contains("Economy")',
      'span:contains("Business")',
      'span:contains("First")'
    ]

    for (const selector of cabinSelectors) {
      const element = flightElement.querySelector(selector)
      if (element) {
        flightInfo.cabin = element.textContent.trim().toLowerCase()
        console.log("Extracted cabin:", flightInfo.cabin)
        break
      }
    }

    // Try multiple selectors for aircraft type
    const aircraftSelectors = [
      '.Xsgmwe:not([jsname="Pvlywd"]):not(.sI2Nye):not(.QS0io)',
      '[data-testid*="aircraft"]',
      '.aircraft-type',
      'span:contains("Airbus")',
      'span:contains("Boeing")',
      'span:contains("Embraer")'
    ]

    // Look for aircraft in text content
    const aircraftTypes = ['Airbus A320', 'Airbus A321', 'Airbus A330', 'Airbus A350', 'Airbus A380', 'Boeing 737', 'Boeing 747', 'Boeing 757', 'Boeing 767', 'Boeing 777', 'Boeing 787', 'Embraer 170', 'Embraer 175', 'Embraer 190', 'Embraer 195', 'CRJ', 'Dash 8', 'ATR 72']
    
    for (const aircraftType of aircraftTypes) {
      if (allText.includes(aircraftType)) {
        flightInfo.aircraft = aircraftType
        console.log("Extracted aircraft from text:", flightInfo.aircraft)
        break
      }
    }

    // If not found in text, try selectors
    if (!flightInfo.aircraft) {
      for (const selector of aircraftSelectors) {
        const element = flightElement.querySelector(selector)
        if (element && element.textContent.trim() && 
            (element.textContent.includes('Airbus') || 
             element.textContent.includes('Boeing') || 
             element.textContent.includes('Embraer') ||
             element.textContent.includes('A320') ||
             element.textContent.includes('737') ||
             element.textContent.includes('A350'))) {
          flightInfo.aircraft = element.textContent.trim()
          console.log("Extracted aircraft:", flightInfo.aircraft)
          break
        }
      }
    }

    // If still no aircraft found, use a default based on airline
    if (!flightInfo.aircraft) {
      if (flightInfo.airlineCode === 'LO' || flightInfo.airlineCode === 'LH') {
        flightInfo.aircraft = 'Airbus A320' // Common for European airlines
      } else if (flightInfo.airlineCode === 'AA' || flightInfo.airlineCode === 'DL' || flightInfo.airlineCode === 'UA') {
        flightInfo.aircraft = 'Boeing 737' // Common for US airlines
      } else {
        flightInfo.aircraft = 'Aircraft' // Generic fallback
      }
      console.log("Using default aircraft:", flightInfo.aircraft)
    }

    // Look for legroom information
    const legroomSelectors = [
      ".WtSsrd",
      "[data-testid*='legroom']",
      ".legroom",
      "span:contains('legroom')",
      "span:contains('in')"
    ]

    for (const selector of legroomSelectors) {
      const element = flightElement.querySelector(selector)
      if (element && element.textContent.includes("legroom")) {
        flightInfo.legroom = element.textContent.trim()
        console.log("Extracted legroom:", flightInfo.legroom)
        break
      }
    }

    // If no explicit legroom info, try to get it from our database
    if (!flightInfo.legroom && flightInfo.aircraft && flightInfo.cabin) {
      const legroomInfo = getLegroomInfo(flightInfo.aircraft, flightInfo.airlineCode, flightInfo.cabin)
      if (legroomInfo) {
        flightInfo.legroom = legroomInfo
        console.log("Got legroom from database:", flightInfo.legroom)
      }
    }

    // Get amenities if available
    if (flightInfo.airlineCode && flightInfo.cabin) {
      flightInfo.amenities = getAmenities(flightInfo.airlineCode, flightInfo.cabin)
    }

    console.log("Final flight info:", flightInfo)
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

  // Format the legroom information with inches for conversion
  const rating = getLegroomRating(legroom)
  return `${legroom} in`
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

// Function to convert inches to centimeters
function inchesToCm(inches) {
  return Math.round(inches * 2.54)
}

// Function to format legroom with cm conversion
function formatLegroomWithCm(legroom) {
  if (!legroom) return ""
  
  // Extract the number from the legroom string (e.g., "30 in" -> 30)
  const match = legroom.match(/(\d+(?:\.\d+)?)\s*in/)
  if (match) {
    const inches = parseFloat(match[1])
    const cm = inchesToCm(inches)
    return `${cm}cm`
  }
  
  return legroom
}

// Function to get legroom color based on cm value
function getLegroomColor(cm) {
  if (cm >= 86) return "#e8f5e8" // Light green background for excellent legroom (34+ in)
  if (cm >= 81) return "#fff3cd" // Light yellow background for good legroom (32-33 in)
  if (cm >= 76) return "#f8d7da" // Light red background for average legroom (30-31 in)
  return "#f8d7da" // Light red background for below average legroom (<30 in)
}

// Function to get legroom text color
function getLegroomTextColor(cm) {
  if (cm >= 86) return "#155724" // Dark green text
  if (cm >= 81) return "#856404" // Dark yellow text
  if (cm >= 76) return "#721c24" // Dark red text
  return "#721c24" // Dark red text
}

// Function to create and inject flight details element
function createFlightDetailsElement(flightInfo) {
  if (!flightInfo) return null

  // Create container that matches Google Flights style
  const detailsContainer = document.createElement("div")
  detailsContainer.className = "injected-flight-details"
  detailsContainer.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    font-size: 14px;
    color: #5f6368;
    flex-wrap: wrap;
    border-radius: 6px;
    margin: 4px 0;
  `

  // Extract legroom cm value for color coding
  let legroomCm = 0
  if (flightInfo.legroom) {
    const match = flightInfo.legroom.match(/(\d+(?:\.\d+)?)\s*in/)
    if (match) {
      const inches = parseFloat(match[1])
      legroomCm = inchesToCm(inches)
    }
  }

  // Set background color based on legroom
  const backgroundColor = getLegroomColor(legroomCm)
  const textColor = getLegroomTextColor(legroomCm)
  detailsContainer.style.backgroundColor = backgroundColor

  // Add aircraft icon and type
  if (flightInfo.aircraft) {
    const aircraftElement = document.createElement("div")
    aircraftElement.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
    `

    const aircraftIcon = document.createElement("svg")
    aircraftIcon.setAttribute("width", "16")
    aircraftIcon.setAttribute("height", "16")
    aircraftIcon.setAttribute("viewBox", "0 0 24 24")
    aircraftIcon.setAttribute("fill", "none")
    aircraftIcon.setAttribute("stroke", "currentColor")
    aircraftIcon.setAttribute("stroke-width", "2")
    aircraftIcon.style.cssText = `
      color: #5f6368;
      flex-shrink: 0;
    `
    aircraftIcon.innerHTML = `<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>`

    const aircraftText = document.createElement("span")
    aircraftText.textContent = flightInfo.aircraft
    aircraftText.style.cssText = `
      font-weight: 600;
      color: #5f6368;
    `

    aircraftElement.appendChild(aircraftIcon)
    aircraftElement.appendChild(aircraftText)
    detailsContainer.appendChild(aircraftElement)
  }

  // Add airline icon and flight number
  if (flightInfo.airlineCode && flightInfo.flightNumber) {
    const airlineElement = document.createElement("div")
    airlineElement.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
    `

    const airlineIcon = document.createElement("svg")
    airlineIcon.setAttribute("width", "16")
    airlineIcon.setAttribute("height", "16")
    airlineIcon.setAttribute("viewBox", "0 0 24 24")
    airlineIcon.setAttribute("fill", "none")
    airlineIcon.setAttribute("stroke", "currentColor")
    airlineIcon.setAttribute("stroke-width", "2")
    airlineIcon.style.cssText = `
      color: #5f6368;
      flex-shrink: 0;
    `
    airlineIcon.innerHTML = `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>`

    const airlineText = document.createElement("span")
    airlineText.textContent = `${flightInfo.airlineCode} ${flightInfo.flightNumber}`
    airlineText.style.cssText = `
      font-weight: 600;
      color: #5f6368;
    `

    airlineElement.appendChild(airlineIcon)
    airlineElement.appendChild(airlineText)
    detailsContainer.appendChild(airlineElement)
  }

  // Add legroom icon and measurement with color coding
  if (flightInfo.legroom) {
    const legroomCm = formatLegroomWithCm(flightInfo.legroom)
    if (legroomCm) {
      const legroomElement = document.createElement("div")
      legroomElement.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        border-radius: 4px;
        background-color: rgba(255, 255, 255, 0.7);
        font-weight: 600;
      `

      const legroomIcon = document.createElement("svg")
      legroomIcon.setAttribute("width", "16")
      legroomIcon.setAttribute("height", "16")
      legroomIcon.setAttribute("viewBox", "0 0 24 24")
      legroomIcon.setAttribute("fill", "none")
      legroomIcon.setAttribute("stroke", "currentColor")
      legroomIcon.setAttribute("stroke-width", "2")
      legroomIcon.style.cssText = `
        color: ${textColor};
        flex-shrink: 0;
      `
      legroomIcon.innerHTML = `<path d="M5 15V3H3v12c0 1.1.9 2 2 2h9v-2H5zm14 3.5V11c0-1.1-.9-2-2-2h-5V3H6v9c0 1.1.9 2 2 2h8v7h6v-1l-3-1.5z"></path>`

      const legroomText = document.createElement("span")
      legroomText.textContent = legroomCm
      legroomText.style.cssText = `
        color: ${textColor};
        font-weight: 600;
      `

      legroomElement.appendChild(legroomIcon)
      legroomElement.appendChild(legroomText)
      detailsContainer.appendChild(legroomElement)
    }
  }

  // Add seatmap links if airline and flight number are available
  if (flightInfo.airlineCode && flightInfo.flightNumber) {
    // PY Seats link
    const pySeatsElement = document.createElement("a")
    pySeatsElement.href = "#"
    pySeatsElement.textContent = "Seats 1"
    pySeatsElement.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background-color: #e3f2fd;
      color: #1976d2;
      text-decoration: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid #bbdefb;
      transition: all 0.2s ease;
    `
    pySeatsElement.addEventListener('mouseenter', () => {
      pySeatsElement.style.backgroundColor = '#bbdefb'
      pySeatsElement.style.transform = 'translateY(-1px)'
    })
    pySeatsElement.addEventListener('mouseleave', () => {
      pySeatsElement.style.backgroundColor = '#e3f2fd'
      pySeatsElement.style.transform = 'translateY(0)'
    })
    pySeatsElement.addEventListener('click', (e) => {
      e.preventDefault()
      // Generate PY Seats URL using the flight info from the current flight element
      const fromInput = document.getElementById('bs-flight-from')
      const toInput = document.getElementById('bs-flight-to')
      const departInput = document.getElementById('bs-flight-depart')
      
      if (fromInput && toInput && departInput) {
        // Extract IATA codes from airport data
        let fromCode = ''
        let toCode = ''
        
        if (fromInput.dataset.airportData) {
          try {
            const airport = JSON.parse(fromInput.dataset.airportData)
            fromCode = airport.iata || fromInput.value?.trim()?.toUpperCase() || ''
          } catch (e) {
            fromCode = fromInput.value?.trim()?.toUpperCase() || ''
          }
        } else {
          fromCode = fromInput.value?.trim()?.toUpperCase() || ''
        }
        
        if (toInput.dataset.airportData) {
          try {
            const airport = JSON.parse(toInput.dataset.airportData)
            toCode = airport.iata || toInput.value?.trim()?.toUpperCase() || ''
          } catch (e) {
            toCode = toInput.value?.trim()?.toUpperCase() || ''
          }
        } else {
          toCode = toInput.value?.trim()?.toUpperCase() || ''
        }
        
        const pySeatsUrl = `https://www.pointsyeah.com/seatmap/detail?airline=${encodeURIComponent(flightInfo.airlineCode)}&departure=${fromCode}&arrival=${toCode}&date=${departInput.value}&flightNumber=${encodeURIComponent(flightInfo.flightNumber)}&cabins=Economy%2CPremium%20Economy%2CBusiness%2CFirst`
        window.open(pySeatsUrl, '_blank')
      }
    })

    // SA Seats link
    const saSeatsElement = document.createElement("a")
    saSeatsElement.href = "#"
    saSeatsElement.textContent = "Seats 2"
    saSeatsElement.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background-color: #f3e5f5;
      color: #7b1fa2;
      text-decoration: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid #ce93d8;
      transition: all 0.2s ease;
    `
    saSeatsElement.addEventListener('mouseenter', () => {
      saSeatsElement.style.backgroundColor = '#ce93d8'
      saSeatsElement.style.transform = 'translateY(-1px)'
    })
    saSeatsElement.addEventListener('mouseleave', () => {
      saSeatsElement.style.backgroundColor = '#f3e5f5'
      saSeatsElement.style.transform = 'translateY(0)'
    })
    saSeatsElement.addEventListener('click', (e) => {
      e.preventDefault()
      // Generate SA Seats URL using the flight info from the current flight element
      const fromInput = document.getElementById('bs-flight-from')
      const toInput = document.getElementById('bs-flight-to')
      const departInput = document.getElementById('bs-flight-depart')
      
      if (fromInput && toInput && departInput) {
        // Extract IATA codes from airport data
        let fromCode = ''
        let toCode = ''
        
        if (fromInput.dataset.airportData) {
          try {
            const airport = JSON.parse(fromInput.dataset.airportData)
            fromCode = airport.iata || fromInput.value?.trim()?.toUpperCase() || ''
          } catch (e) {
            fromCode = fromInput.value?.trim()?.toUpperCase() || ''
          }
        } else {
          fromCode = fromInput.value?.trim()?.toUpperCase() || ''
        }
        
        if (toInput.dataset.airportData) {
          try {
            const airport = JSON.parse(toInput.dataset.airportData)
            toCode = airport.iata || toInput.value?.trim()?.toUpperCase() || ''
          } catch (e) {
            toCode = toInput.value?.trim()?.toUpperCase() || ''
          }
        } else {
          toCode = toInput.value?.trim()?.toUpperCase() || ''
        }
        
        const saSeatsUrl = `https://seats.aero/seatmap?airline=${encodeURIComponent(flightInfo.airlineCode)}&from=${fromCode}&to=${toCode}&date=${departInput.value}&flight=${encodeURIComponent(flightInfo.flightNumber)}`
        window.open(saSeatsUrl, '_blank')
      }
    })

    detailsContainer.appendChild(pySeatsElement)
    detailsContainer.appendChild(saSeatsElement)
  }

  return detailsContainer
}

// Function to replace CO2 emissions display with flight details
function replaceEmissionsWithFlightDetails() {
  try {
    console.log("=== REPLACING EMISSIONS WITH FLIGHT DETAILS ===")
    
    // Find all flight elements first
    const flightElements = document.querySelectorAll('li.pIav2d, .yR1fYc, .mxvQLc')
    console.log(`Found ${flightElements.length} flight elements to process`)
    
    flightElements.forEach((flightElement, index) => {
      console.log(`Processing flight element ${index + 1}`)
      
      // Find emissions container in this flight
      const emissionsContainer = flightElement.querySelector('.y0NSEe.V1iAHe.tPgKwe.ogfYpf, .y0NSEe.axwZ3c.y52p7d.ogfYpf')
      
      if (emissionsContainer) {
        console.log(`Found emissions container in flight ${index + 1}`)
        
        // Extract flight info from this flight element
        const flightInfo = extractFlightInfo(flightElement)
        console.log(`Flight ${index + 1} info:`, flightInfo)
        
        if (flightInfo && (flightInfo.aircraft || flightInfo.airlineCode)) {
          // Create flight details element
          const detailsElement = createFlightDetailsElement(flightInfo)
          if (detailsElement) {
            console.log(`Replacing emissions with flight details for flight ${index + 1}`)
            // Replace the emissions container with our flight details
            emissionsContainer.parentNode.replaceChild(detailsElement, emissionsContainer)
            console.log(`Successfully replaced emissions for flight ${index + 1}`)
          } else {
            console.log(`Failed to create details element for flight ${index + 1}`)
            // Just hide the emissions if we can't create details
            emissionsContainer.style.display = 'none'
          }
        } else {
          console.log(`Insufficient flight info for flight ${index + 1}, just hiding emissions`)
          // Just hide the emissions if we don't have enough info
          emissionsContainer.style.display = 'none'
        }
      } else {
        console.log(`No emissions container found in flight ${index + 1}`)
      }
    })
    
    // Also hide any remaining emissions elements
    const emissionsSelectors = [
      '[data-co2currentflight]',
      '[data-relativeemissions]',
      '.AdWm1c.lc3qH.ogfYpf.PtgtFe',
      '.N6PNV.Dd7uHc.ogfYpf.juCwOd.BYjnCf',
      '.N6PNV.URDlle.ogfYpf.juCwOd.BYjnCf',
      '[aria-label*="Carbon emissions"]',
      '[jsname="Prr8lb"]'
    ];

    emissionsSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element.textContent.includes('CO2') || 
            element.textContent.includes('emissions') ||
            element.getAttribute('data-co2currentflight') ||
            element.getAttribute('data-relativeemissions') ||
            element.getAttribute('aria-label')?.includes('Carbon emissions')) {
          element.style.display = 'none';
        }
      });
    });
    
  } catch (error) {
    console.error("Error replacing emissions display:", error);
  }
}

// Function to inject flight details into flight elements
function injectFlightDetails() {
  try {
    console.log("=== INJECTING FLIGHT DETAILS ===")
    
    // Skip injection on the main flights homepage, but not on search results
    if (
      window.location.href.includes("tcfs") &&
      !window.location.href.includes("search") &&
      !document.querySelector(".MX5RWe.sSHqwe.y52p7d, .L5Okte.y52p7d")
    ) {
      console.log("Skipping injection on homepage")
      return
    }

    // Replace CO2 emissions with flight details
    replaceEmissionsWithFlightDetails();

    // Find all flight elements with multiple selectors
    const flightSelectors = [
      "li.pIav2d", // New ul/li structure
      ".yR1fYc", // Main flight container
      ".mxvQLc", // Flight content container
      ".MX5RWe.sSHqwe.y52p7d", 
      ".L5Okte.y52p7d",
      "[data-testid*='flight']",
      ".gws-flights-results__result-list > div",
      ".sSHqwe",
      ".L5Okte",
      ".BroJf.y52p7d" // Flight selection container
    ]
    
    let flightElements = []
    flightSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(el => {
        if (!flightElements.includes(el)) {
          flightElements.push(el)
        }
      })
    })

    console.log(`Found ${flightElements.length} flight elements`)
    
    // Test injection - add a simple test element to see if injection works at all
    if (flightElements.length > 0) {
      const testElement = document.createElement('div')
      testElement.style.cssText = 'background: red; color: white; padding: 10px; margin: 5px; border: 2px solid blue;'
      testElement.textContent = 'TEST INJECTION - Extension is working!'
      flightElements[0].appendChild(testElement)
      console.log('Added test element to first flight')
    }

    flightElements.forEach((flightElement, index) => {
      console.log(`Processing flight element ${index + 1}`)
      
      // Check if details are already injected
      if (flightElement.querySelector(".injected-flight-details")) {
        console.log(`Flight ${index + 1} already has details, skipping`)
        return
      }

      // Extract flight info
      const flightInfo = extractFlightInfo(flightElement)
      console.log(`Flight ${index + 1} info:`, flightInfo)
      
      if (!flightInfo || (!flightInfo.aircraft && !flightInfo.airlineCode)) {
        console.log(`Flight ${index + 1} has insufficient info, skipping`)
        return
      }

      // Create details element
      const detailsElement = createFlightDetailsElement(flightInfo)
      if (!detailsElement) {
        console.log(`Failed to create details element for flight ${index + 1}`)
        return
      }

      console.log(`Created details element for flight ${index + 1}`)

      // Simple injection - just append to the flight element
      console.log(`Appending details to flight element ${index + 1}`)
      console.log(`Flight element classes:`, flightElement.className)
      console.log(`Flight element tag:`, flightElement.tagName)
      
      // Make sure the element is visible
      detailsElement.style.display = 'block'
      detailsElement.style.visibility = 'visible'
      detailsElement.style.opacity = '1'
      
      // Append to the flight element
      flightElement.appendChild(detailsElement)
      
      console.log(`Successfully injected details for flight ${index + 1}`)
      console.log(`Details element:`, detailsElement)

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
    
    console.log("=== FLIGHT DETAILS INJECTION COMPLETE ===")
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
    element.style.display = "flex"

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

  // Also replace any emissions that might have been re-added
  replaceEmissionsWithFlightDetails()

  // Schedule the next check
  setTimeout(ensureVisibility, 2000)
}

// Start the visibility checker
setTimeout(ensureVisibility, 2000)
