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
  if (cm >= 86) return '#e8f5e8' // Green
  if (cm >= 81) return '#fff3cd' // Yellow
  return '#f8d7da' // Red
}

// Function to get legroom text color
function getLegroomTextColor(cm) {
  if (cm >= 86) return '#155724' // Dark green
  if (cm >= 81) return '#856404' // Dark yellow
  return '#721c24' // Dark red
}

// Function to get legroom info
function getLegroomInfo() {
  // Default legroom for different aircraft types
  const legroomData = {
    'Airbus A320': '30 in',
    'Airbus A321': '30 in',
    'Airbus A330': '31 in',
    'Airbus A350': '32 in',
    'Airbus A380': '32 in',
    'Boeing 737': '30 in',
    'Boeing 747': '31 in',
    'Boeing 757': '30 in',
    'Boeing 767': '31 in',
    'Boeing 777': '32 in',
    'Boeing 787': '32 in',
    'Embraer 170': '29 in',
    'Embraer 175': '29 in',
    'Embraer 190': '29 in',
    'Embraer 195': '29 in'
  }
  
  // Return a default legroom
  return '30 in'
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
  }

  const allText = flightElement.textContent
  console.log("All text content:", allText)
  
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
    if (allText.includes(airlineName)) {
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

  // Set legroom
  flightInfo.legroom = getLegroomInfo()

  return flightInfo
}

// Function to create flight details element
function createFlightDetailsElement(flightInfo) {
  if (!flightInfo) return null

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

  let legroomCm = 0
  if (flightInfo.legroom) {
    const match = flightInfo.legroom.match(/(\d+(?:\.\d+)?)\s*in/)
    if (match) {
      const inches = parseFloat(match[1])
      legroomCm = inchesToCm(inches)
    }
  }
  const backgroundColor = getLegroomColor(legroomCm)
  const textColor = getLegroomTextColor(legroomCm)
  detailsContainer.style.backgroundColor = backgroundColor
  detailsContainer.style.color = textColor

  // Aircraft
  if (flightInfo.aircraft) {
    const aircraftElement = document.createElement("div")
    aircraftElement.style.cssText = "display: flex; align-items: center; gap: 4px;"
    aircraftElement.innerHTML = `🛩️ ${flightInfo.aircraft}`
    detailsContainer.appendChild(aircraftElement)
  }

  // Airline and Flight Number
  if (flightInfo.airlineCode && flightInfo.flightNumber) {
    const airlineElement = document.createElement("div")
    airlineElement.style.cssText = "display: flex; align-items: center; gap: 4px;"
    airlineElement.innerHTML = `✈️ ${flightInfo.airlineCode} ${flightInfo.flightNumber}`
    detailsContainer.appendChild(airlineElement)
  }

  // Legroom
  if (flightInfo.legroom) {
    const legroomCmFormatted = formatLegroomWithCm(flightInfo.legroom)
    if (legroomCmFormatted) {
      const legroomElement = document.createElement("div")
      legroomElement.style.cssText = "display: flex; align-items: center; gap: 4px;"
      legroomElement.innerHTML = `🪑 ${legroomCmFormatted}`
      detailsContainer.appendChild(legroomElement)
    }
  }

  // Seatmap links
  if (flightInfo.airlineCode && flightInfo.flightNumber) {
    // PY Seats link
    const pySeatsElement = document.createElement("a")
    pySeatsElement.href = "#"
    pySeatsElement.textContent = "Seats 1"
    pySeatsElement.style.cssText = `
      background: #4285f4;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      text-decoration: none;
      font-size: 12px;
      margin-left: 8px;
    `
    pySeatsElement.addEventListener('click', (e) => {
      e.preventDefault()
      const fromInput = document.getElementById('bs-flight-from')
      const toInput = document.getElementById('bs-flight-to')
      const departInput = document.getElementById('bs-flight-depart')
      if (fromInput && toInput && departInput) {
        let fromCode = fromInput.value.split(' ')[0] || 'MUC'
        let toCode = toInput.value.split(' ')[0] || 'WAW'
        const pySeatsUrl = `https://www.pointsyeah.com/seatmap/detail?airline=${encodeURIComponent(flightInfo.airlineCode)}&departure=${fromCode}&arrival=${toCode}&date=${departInput.value}&flightNumber=${encodeURIComponent(flightInfo.flightNumber)}&cabins=Economy%2CPremium%20Economy%2CBusiness%2CFirst`
        window.open(pySeatsUrl, '_blank')
      }
    })
    detailsContainer.appendChild(pySeatsElement)

    // SA Seats link
    const saSeatsElement = document.createElement("a")
    saSeatsElement.href = "#"
    saSeatsElement.textContent = "Seats 2"
    saSeatsElement.style.cssText = `
      background: #34a853;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      text-decoration: none;
      font-size: 12px;
      margin-left: 4px;
    `
    saSeatsElement.addEventListener('click', (e) => {
      e.preventDefault()
      const fromInput = document.getElementById('bs-flight-from')
      const toInput = document.getElementById('bs-flight-to')
      const departInput = document.getElementById('bs-flight-depart')
      if (fromInput && toInput && departInput) {
        let fromCode = fromInput.value.split(' ')[0] || 'MUC'
        let toCode = toInput.value.split(' ')[0] || 'WAW'
        const saSeatsUrl = `https://seats.aero/seatmap?airline=${encodeURIComponent(flightInfo.airlineCode)}&from=${fromCode}&to=${toCode}&date=${departInput.value}&flight=${encodeURIComponent(flightInfo.flightNumber)}`
        window.open(saSeatsUrl, '_blank')
      }
    })
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
