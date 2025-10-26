// Flight Details Injector - Simplified Version
// This script replaces CO2 emissions with flight details

console.log("Flight Details Injector loaded")

// Function to convert inches to centimeters
function inchesToCm(inches) {
  return Math.round(inches * 2.54)
}

// Function to format legroom with cm
function formatLegroomWithCm(legroom) {
  const match = legroom.match(/(\d+(?:\.\d+)?)\s*in/)
  if (match) {
    const inches = parseFloat(match[1])
    const cm = inchesToCm(inches)
    return `${cm}cm`
  }
  return legroom
}

// Function to get legroom color
function getLegroomColor(cm) {
  if (cm > 76) return '#e8f5e8' // Green for > 76cm (30 in)
  if (cm === 76) return '#fff3cd' // Yellow for exactly 76cm (30 in)
  return '#f8d7da' // Red for < 76cm (< 30 in)
}

// Function to get legroom text color
function getLegroomTextColor(cm) {
  if (cm > 76) return '#155724' // Dark green
  if (cm === 76) return '#856404' // Dark yellow
  return '#721c24' // Dark red
}

// Function to get legroom info based on aircraft type
function getLegroomInfo(aircraftType, airlineCode) {
  // Legroom database in inches
  const legroomData = {
    'Airbus A320': 30,
    'Airbus A321': 30,
    'Airbus A330': 31,
    'Airbus A350': 32,
    'Airbus A380': 32,
    'Boeing 737': 30,
    'Boeing 747': 31,
    'Boeing 757': 30,
    'Boeing 767': 31,
    'Boeing 777': 32,
    'Boeing 787': 32,
    'Embraer 170': 29,
    'Embraer 175': 29,
    'Embraer 190': 29,
    'Embraer 195': 29,
    'CRJ 700': 29,
    'CRJ 900': 29,
    'Dash 8': 30,
    'ATR 72': 29
  }
  
  // Airline-specific overrides
  const airlineOverrides = {
    'LH': { 'Airbus A320': 31, 'Airbus A350': 31 },
    'BA': { 'Airbus A320': 29, 'Boeing 777': 31 },
    'AA': { 'Boeing 737': 30 },
    'DL': { 'Airbus A320': 31, 'Boeing 737': 31 },
    'UA': { 'Boeing 737': 30 },
    'OS': { 'Embraer 195': 29 }
  }
  
  // Get legroom for specific aircraft and airline
  let legroomInches = 30 // Default fallback
  
  if (aircraftType) {
    // Check airline-specific override first
    if (airlineCode && airlineOverrides[airlineCode] && airlineOverrides[airlineCode][aircraftType]) {
      legroomInches = airlineOverrides[airlineCode][aircraftType]
    } else if (legroomData[aircraftType]) {
      legroomInches = legroomData[aircraftType]
    }
  }
  
  return `${legroomInches} in`
}

  // Function to extract flight information
function extractFlightInfo(flightElement) {
  const flightInfo = {
    airline: "",
    airlineCode: "",
    flightNumber: "",
    aircraft: "",
    legroom: "",
    cabin: "",
    amenities: [],
    stops: "",
    stopsInfo: "",
    travelTime: ""
  }

  const allText = flightElement.textContent
  console.log("All text content:", allText)
  
  // Clean up "Operated by" text from the content
  const cleanedText = allText.replace(/Operated by\s+/gi, '')
  console.log("Cleaned text content:", cleanedText)
  
  // Look for flight numbers in data-gs attributes first
  const dataGsElements = flightElement.querySelectorAll('[data-gs]')
  for (const element of dataGsElements) {
    const dataGs = element.getAttribute('data-gs')
    console.log("Found data-gs:", dataGs)
    if (dataGs) {
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
  
  // Look for airline names in text content
  const airlineNames = ['LOT', 'Lufthansa', 'American Airlines', 'Delta', 'United', 'British Airways', 'Air France', 'KLM', 'Swiss', 'Austrian', 'SAS', 'Finnair', 'Iberia', 'Vueling', 'Ryanair', 'Wizz Air', 'EasyJet', 'Eurowings', 'Air Berlin', 'Germanwings']
  
  for (const airlineName of airlineNames) {
    if (cleanedText.includes(airlineName)) {
      flightInfo.airline = airlineName
      console.log("Extracted airline name from text:", flightInfo.airline)
      break
    }
  }

  // Set default aircraft based on airline
  if (!flightInfo.aircraft) {
    if (flightInfo.airlineCode === 'LO' || flightInfo.airlineCode === 'LH') {
      flightInfo.aircraft = 'Airbus A320'
    } else if (flightInfo.airlineCode === 'AA' || flightInfo.airlineCode === 'DL' || flightInfo.airlineCode === 'UA') {
      flightInfo.aircraft = 'Boeing 737'
    } else {
      flightInfo.aircraft = 'Aircraft'
    }
    console.log("Using default aircraft:", flightInfo.aircraft)
  }

  // Look for stops information
  const stopsPatterns = [
    /(Nonstop|Direct)/i,
    /(\d+)\s*stop/i,
    /(\d+)\s*stops/i
  ]
  
  for (const pattern of stopsPatterns) {
    const match = cleanedText.match(pattern)
    if (match) {
      if (match[1].toLowerCase().includes('nonstop') || match[1].toLowerCase().includes('direct')) {
        flightInfo.stops = "Nonstop"
        flightInfo.stopsInfo = "Direct flight"
  } else {
        const stopCount = parseInt(match[1])
        flightInfo.stops = `${stopCount} stop${stopCount > 1 ? 's' : ''}`
        flightInfo.stopsInfo = `${stopCount} stop${stopCount > 1 ? 's' : ''}`
      }
      break
    }
  }
  
  // Extract travel time directly from the page
  const timeElement = flightElement.querySelector('.gvkrdb.AdWm1c.tPgKwe.ogfYpf[aria-label*="Total duration"]')
  if (timeElement) {
    flightInfo.travelTime = timeElement.textContent.trim()
    console.log("Extracted travel time:", flightInfo.travelTime)
  } else {
    // Fallback: look for time patterns in the text
    const timeMatch = cleanedText.match(/(\d+\s*(?:hr|hour|h)\s*\d+\s*(?:min|minutes|m)|(\d+\s*(?:hr|hour|h))|(\d+\s*(?:min|minutes|m)))/i)
    if (timeMatch) {
      flightInfo.travelTime = timeMatch[0].trim()
      console.log("Extracted travel time from text:", flightInfo.travelTime)
    }
  }

  // Set legroom based on aircraft and airline
  flightInfo.legroom = getLegroomInfo(flightInfo.aircraft, flightInfo.airlineCode)

  return flightInfo
}

// Function to create flight details element
function createFlightDetailsElement(flightInfo) {
  if (!flightInfo) return null

  const detailsContainer = document.createElement("div")
  detailsContainer.className = "injected-flight-details"

  // Calculate legroom for color coding
  let legroomCm = 0
  if (flightInfo.legroom) {
    const match = flightInfo.legroom.match(/(\d+(?:\.\d+)?)\s*in/)
    if (match) {
      const inches = parseFloat(match[1])
      legroomCm = inchesToCm(inches)
    }
  }
  
  detailsContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 2px 4px;
    font-size: 12px;
    font-weight: 500;
    color: rgb(0, 0, 0);
    background: rgb(255, 255, 255);
    border-radius: 0px;
    margin: -13px 1px 0px -120px;
    border: 1px solid rgb(255, 255, 255);
    box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 0px;
    max-width: 50%;
    position: relative;
    z-index: 100;
    min-height: 32px;
    align-self: flex-start;
    text-align: left;
  `

  // Create first row for flight details
  const flightDetailsRow = document.createElement("div")
  flightDetailsRow.style.cssText = `
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    white-space: nowrap;
  `

  // Aircraft info
  if (flightInfo.aircraft) {
    const aircraftElement = document.createElement("span")
    aircraftElement.style.cssText = `
      display: flex;
      align-items: center;
      gap: 2px;
      font-weight: 500;
      color: #666666;
      font-size: 11px;
      padding: 1px 3px;
      background: #f5f5f5;
      border-radius: 3px;
      border: 1px solid #e0e0e0;
    `
    aircraftElement.innerHTML = `✈️ ${flightInfo.aircraft}`
    flightDetailsRow.appendChild(aircraftElement)
  }

  // Airline and Flight Number
  if (flightInfo.airlineCode && flightInfo.flightNumber) {
    const airlineElement = document.createElement("span")
    airlineElement.style.cssText = `
      display: flex;
      align-items: center;
      gap: 2px;
      font-weight: 500;
      color: #666666;
      font-size: 11px;
      padding: 1px 3px;
      background: #f5f5f5;
      border-radius: 3px;
      border: 1px solid #e0e0e0;
    `
    airlineElement.innerHTML = `🏢 ${flightInfo.airlineCode} ${flightInfo.flightNumber}`
    flightDetailsRow.appendChild(airlineElement)
  }

  // Travel Time
  if (flightInfo.travelTime) {
    const timeElement = document.createElement("span")
    timeElement.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-weight: 500;
      color: #666666;
      font-size: 11px;
      padding: 1px 3px;
      background: #f5f5f5;
      border-radius: 3px;
      border: 1px solid #e0e0e0;
    `
    timeElement.innerHTML = `⏱️ ${flightInfo.travelTime}`
    flightDetailsRow.appendChild(timeElement)
  }

  // Legroom with proper color coding
  if (flightInfo.legroom) {
    const legroomCmFormatted = formatLegroomWithCm(flightInfo.legroom)
    if (legroomCmFormatted) {
      const legroomElement = document.createElement("span")
      const backgroundColor = getLegroomColor(legroomCm)
      const textColor = getLegroomTextColor(legroomCm)
      
      legroomElement.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 2px 6px;
        background: ${backgroundColor};
        border-radius: 4px;
        font-weight: 600;
        color: ${textColor};
        font-size: 11px;
        white-space: nowrap;
        border: 1px solid ${textColor}20;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        transition: all 0.2s ease;
      `
      legroomElement.innerHTML = `🪑 ${legroomCmFormatted}`
      flightDetailsRow.appendChild(legroomElement)
    }
  }

  // Add stops and travel time information
  if (flightInfo.stops) {
    const stopsElement = document.createElement("span")
    const isNonstop = flightInfo.stops === 'Nonstop'
    stopsElement.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 2px 6px;
      background: ${isNonstop ? 'linear-gradient(135deg, #d5f4e6 0%, #c8e6c9 100%)' : 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)'};
      border-radius: 4px;
      font-weight: 600;
      color: ${isNonstop ? '#2d5a27' : '#8b6914'};
      font-size: 11px;
      white-space: nowrap;
      border: 1px solid ${isNonstop ? '#4caf50' : '#ffc107'}40;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
    `
    stopsElement.innerHTML = `✈️ ${flightInfo.stops}`
    flightDetailsRow.appendChild(stopsElement)
  }

  // Add the flight details row to the container
  detailsContainer.appendChild(flightDetailsRow)

  // Add links in a second row
  if (flightInfo.airlineCode && flightInfo.flightNumber) {
    const linksRow = document.createElement("div")
    linksRow.style.cssText = `
      display: flex;
      gap: 8px;
      align-items: center;
      margin-top: 4px;
    `
    
    // Create individual link buttons
    const links = [
      { text: "PY Seats", website: "pointsyeah.com", action: () => {
        const fromInput = document.getElementById('bs-flight-from')
        const toInput = document.getElementById('bs-flight-to')
        const departInput = document.getElementById('bs-flight-depart')
        if (fromInput && toInput && departInput) {
          let fromCode = fromInput.value.split(' ')[0] || 'MUC'
          let toCode = toInput.value.split(' ')[0] || 'WAW'
          const pySeatsUrl = `https://www.pointsyeah.com/seatmap/detail?airline=${encodeURIComponent(flightInfo.airlineCode)}&departure=${fromCode}&arrival=${toCode}&date=${departInput.value}&flightNumber=${encodeURIComponent(flightInfo.flightNumber)}&cabins=Economy%2CPremium%20Economy%2CBusiness%2CFirst`
          window.open(pySeatsUrl, '_blank')
        }
      }},
      { text: "SA Seats", website: "seats.aero", action: () => {
        const fromInput = document.getElementById('bs-flight-from')
        const toInput = document.getElementById('bs-flight-to')
        const departInput = document.getElementById('bs-flight-depart')
        if (fromInput && toInput && departInput) {
          let fromCode = fromInput.value.split(' ')[0] || 'MUC'
          let toCode = toInput.value.split(' ')[0] || 'WAW'
          const saSeatsUrl = `https://seats.aero/seatmap?airline=${encodeURIComponent(flightInfo.airlineCode)}&from=${fromCode}&to=${toCode}&date=${departInput.value}&flight=${encodeURIComponent(flightInfo.flightNumber)}`
          window.open(saSeatsUrl, '_blank')
        }
      }},
      { text: "FareClass", website: "seats.aero", action: () => {
        const fromInput = document.getElementById('bs-flight-from')
        const toInput = document.getElementById('bs-flight-to')
        const departInput = document.getElementById('bs-flight-depart')
        
        if (fromInput && toInput && departInput) {
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

          const fareClassUrl = `https://seats.aero/fareclass?from=${fromCode}&to=${toCode}&date=${departInput.value}&connections=true&codeshares=true`
          window.open(fareClassUrl, '_blank')
        }
      }},
      { text: "FareViewer", website: "seats.aero", action: () => {
        const fromInput = document.getElementById('bs-flight-from')
        const toInput = document.getElementById('bs-flight-to')
        const departInput = document.getElementById('bs-flight-depart')
        
        if (fromInput && toInput && departInput) {
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

          const fareViewerUrl = `https://seats.aero/fares?from=${fromCode}&to=${toCode}&date=${departInput.value}&carriers=${flightInfo.airlineCode}&currency=USD`
          window.open(fareViewerUrl, '_blank')
        }
      }}
    ]
    
    // Create individual link buttons
    links.forEach(link => {
      const linkButton = document.createElement("button")
      linkButton.textContent = link.text
      linkButton.style.cssText = `
        background: transparent;
        color: #1a73e8;
        padding: 1px 3px;
        border-radius: 3px;
        border: none;
        font-size: 10px;
        font-weight: 500;
        text-decoration: underline;
        letter-spacing: 0.3px;
        transition: all 0.2s ease;
        white-space: nowrap;
        cursor: pointer;
      `
      
      linkButton.addEventListener('click', (e) => {
        e.stopPropagation()
        link.action()
      })
      
      linkButton.addEventListener('mouseenter', () => {
        linkButton.style.color = '#1557b0'
        linkButton.style.textDecoration = 'none'
      })
      
      linkButton.addEventListener('mouseleave', () => {
        linkButton.style.color = '#1a73e8'
        linkButton.style.textDecoration = 'underline'
      })
      
      linksRow.appendChild(linkButton)
    })
    
    detailsContainer.appendChild(linksRow)
  }

  return detailsContainer
}

// Function to remove unwanted span elements
function removeUnwantedSpans() {
  // Remove "Operated by" spans and their content
  let operatedByCount = 0
  const allSpans = document.querySelectorAll('span')
  allSpans.forEach(span => {
    if (span.textContent && span.textContent.includes('Operated by')) {
      // Find the parent element that contains the entire "Operated by" text
      let parent = span.parentElement
      while (parent && parent.textContent && parent.textContent.includes('Operated by')) {
        // Check if this parent contains only "Operated by" and airline name
        const text = parent.textContent.trim()
        if (text.startsWith('Operated by') || text.includes('Operated by')) {
          parent.remove()
          operatedByCount++
          break
        }
        parent = parent.parentElement
      }
    }
  })
  
  console.log(`Removed ${operatedByCount} "Operated by" spans`)
}


// Function to replace CO2 emissions display with flight details
function replaceEmissionsWithFlightDetails() {
  try {
    console.log("=== REPLACING EMISSIONS WITH FLIGHT DETAILS ===")
    
    // Remove unwanted spans first
    removeUnwantedSpans()
    
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

// Function to inject flight details
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

    console.log("=== FLIGHT DETAILS INJECTION COMPLETE ===")
  } catch (error) {
    console.error("Error injecting flight details:", error)
  }
}

// Function to ensure visibility
function ensureVisibility() {
  // Remove unwanted spans first
  removeUnwantedSpans()
  
  
  // This runs periodically to make sure our injected content stays visible
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

// Start the injection
injectFlightDetails()

// Start the visibility checker
setTimeout(ensureVisibility, 2000)

// Also run when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectFlightDetails)
} else {
  injectFlightDetails()
}

// Run when new content is added to the page
const observer = new MutationObserver((mutations) => {
  let shouldRun = false
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // Check if any of the added nodes contain flight elements
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.querySelector && (
            node.querySelector('li.pIav2d') ||
            node.querySelector('.yR1fYc') ||
            node.querySelector('.mxvQLc') ||
            node.classList.contains('pIav2d') ||
            node.classList.contains('yR1fYc') ||
            node.classList.contains('mxvQLc')
          )) {
            shouldRun = true
          }
        }
      })
    }
  })
  
  if (shouldRun) {
    console.log("New flight content detected, running injection")
    setTimeout(injectFlightDetails, 500)
  }
})

observer.observe(document.body, {
  childList: true,
  subtree: true
})
