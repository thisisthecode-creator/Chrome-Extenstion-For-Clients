// Google Flight Extension V2 - Enhanced with drag and drop functionality
console.log('Google Flight Extension V2 script loaded')

// Function to inject buttons into flight elements
function injectButtons() {
  // Cache management for login data
const CACHE_KEY = 'benefitsystems_login_cache'
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Cache management functions
function getCachedLoginData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    
    const data = JSON.parse(cached)
    if (Date.now() - data.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    
    return data.data
  } catch (error) {
    console.error('Error reading cached login data:', error)
    return null
  }
}

function setCachedLoginData(loginData) {
  try {
    const cacheData = {
      data: loginData,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error caching login data:', error)
  }
}

function clearCachedLoginData() {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch (error) {
    console.error('Error clearing cached login data:', error)
  }
}

// Function to handle AmexTransfer button click with caching
function handleAmexTransferClick() {
  const cachedData = getCachedLoginData()
  
  if (cachedData) {
    // Use cached data to pre-fill forms or auto-login
    console.log('Using cached login data for AmexTransfer')
    // You can implement auto-fill logic here based on the cached data
  }
  
  // Open the AmexTransfer tool
  window.open('https://tools.benefitsystems.io/amextransfer', '_blank')
}

// Add Benefitsystems button styles
addBenefitsystemsButtonStyles()

  // Find all elements with role="jhRv2c"
  const flightElements = document.querySelectorAll("div.jhRv2c")

  // Parse flight information from URL
  const urlParams = parseFlightInfoFromUrl(window.location.href)

  // Store the original Google Flights URL
  if (!window.originalGoogleFlightsUrl) {
    window.originalGoogleFlightsUrl = window.location.href
  }

  // Check if we have the necessary parameters to show the second row of buttons
  const hasRequiredParams = urlParams.departure && urlParams.arrival && urlParams.date

  // Loop through each flight element
  flightElements.forEach((element, index) => {
    // Check if buttons are already injected
    if (element.querySelector(".custom-flight-buttons")) {
      return
    }

    // Create button container
    const buttonContainer = document.createElement("div")
    buttonContainer.className = "custom-flight-buttons-container"

    // Create flight row containers
    const flightRowContainer1 = document.createElement("div")
    flightRowContainer1.className = "custom-flight-buttons"

    const flightRowContainer2 = document.createElement("div")
    flightRowContainer2.className = "custom-flight-buttons second-row"

    // Create hotel row containers
    const hotelRowContainer1 = document.createElement("div")
    hotelRowContainer1.className = "custom-flight-buttons"

    const hotelRowContainer2 = document.createElement("div")
    hotelRowContainer2.className = "custom-flight-buttons second-row"

    // Generate all URLs
    const urls = generateAllUrls(urlParams)

    // Create flight buttons - first row
    const googleFlightsBtn = createButton(
      "Flights",
      "google-flights-btn",
      () => {
        promptAndOpenGoogleFlights(urlParams)
      },
      createIcon("plane"),
    )
    const pointsYeahBtn = createLinkButton("PointsYeah", "points-yeah-btn", urls.pointsYeah, createIcon("star"))
    const pointsYeahSeatmapBtn = createButton(
      "Seatmap",
      "points-yeah-seatmap-btn",
      () => {
        promptAndOpenPointsYeahSeatmap(urlParams)
      },
      createIcon("armchair"),
    )
    const awardToolBtn = createLinkButton("AwardTool", "award-tool-btn", urls.awardtool, createIcon("award"))
    const seatsAeroBtn = createLinkButton("SeatsAero", "seats-aero-btn", urls.seatsaero, createIcon("sofa"))
    const airCanadaBtn = createLinkButton("AirCanada", "air-canada-btn", urls.airCanada, createIcon("flag"))
    const pointMeBtn = createLinkButton("PointMe", "point-me-btn", urls.pointme, createIcon("compass"))
    const kayakBtn = createLinkButton("Kayak", "kayak-btn", urls.kayak, createIcon("sailboat"))
    const skyscannerBtn = createLinkButton("Skys", "skyscanner-btn", urls.skyscanner, createIcon("search"))

    // Create new flight buttons for second row
    const rovemilesBtn = createLinkButton("Rovemiles", "point-me-btn", urls.rovemiles, createIcon("plane"))
    const faresViewerBtn = createLinkButton("Fares", "seats-aero-btn", urls.seatsAeroFares, createIcon("tag"))
    const saSeatmapBtn = createButton(
      "Seatmap",
      "seats-aero-seatmap-btn",
      () => {
        promptAndOpenSeatsAeroSeatmap(urlParams)
      },
      createIcon("layout"),
    )
    const awardToolAllBtn = createLinkButton(
      "All+14",
      "award-tool-btn",
      urls.awardtoolAllPlus14,
      createIcon("calendar"),
    )

    // Add additional flight-specific buttons if we have the required parameters
    let fareClassBtn = null
    let flightConnectionsBtn = null
    let turbliBtn = null
    let restoreUrlBtn = null

    if (hasRequiredParams) {
      fareClassBtn = createLinkButton("FareClass", "fare-class-btn", urls.fareClass, createIcon("ticket"))
      flightConnectionsBtn = createLinkButton(
        "Connections",
        "flight-connections-btn",
        urls.flightconnections,
        createIcon("network")
      )
      turbliBtn = createLinkButton("Turbli", "turbli-btn", urls.turbli, createIcon("cloud-lightning"))
    }

    // Add restore button if URL has changed
    if (window.location.href !== window.originalGoogleFlightsUrl) {
      restoreUrlBtn = createButton(
        "RestoreURL",
        "restore-url-btn",
        () => {
          window.location.href = window.originalGoogleFlightsUrl
        },
        createIcon("refresh-cw"),
      )
    }

    // Add flight buttons to first row
    flightRowContainer1.appendChild(googleFlightsBtn)
    flightRowContainer1.appendChild(pointsYeahBtn)
    flightRowContainer1.appendChild(pointsYeahSeatmapBtn)
    flightRowContainer1.appendChild(awardToolBtn)
    flightRowContainer1.appendChild(seatsAeroBtn)
    flightRowContainer1.appendChild(airCanadaBtn)
    flightRowContainer1.appendChild(pointMeBtn)
    flightRowContainer1.appendChild(kayakBtn)
    flightRowContainer1.appendChild(skyscannerBtn)

    // Add new flight buttons to second row
    flightRowContainer2.appendChild(rovemilesBtn)
    flightRowContainer2.appendChild(faresViewerBtn)
    flightRowContainer2.appendChild(saSeatmapBtn)
    flightRowContainer2.appendChild(awardToolAllBtn)

    // Add additional flight-specific buttons to second row if we have the required parameters
    if (hasRequiredParams) {
      flightRowContainer2.appendChild(fareClassBtn)
      flightRowContainer2.appendChild(flightConnectionsBtn)
      flightRowContainer2.appendChild(turbliBtn)
    }

    if (restoreUrlBtn) {
      flightRowContainer2.appendChild(restoreUrlBtn)
    }

    // Create hotel buttons - first row
    const googleHotelsBtn = createButton(
      "Hotels",
      "google-hotels-btn",
      () => {
        promptAndOpenGoogleHotels()
      },
      createIcon("search"),
    )
    const hiltonBtn = createButton(
      "Hilton",
      "hilton-btn",
      () => {
        promptAndOpenHilton(urlParams)
      },
      createIcon("hotel"),
    )
    const hyattBtn = createButton(
      "Hyatt",
      "hyatt-btn",
      () => {
        promptAndOpenHyatt(urlParams)
      },
      createIcon("building"),
    )
    const marriottBtn = createButton(
      "Marriott",
      "marriott-btn",
      () => {
        promptAndOpenMarriott(urlParams)
      },
      createIcon("landmark"),
    )
    const ihgBtn = createButton(
      "IHG",
      "ihg-btn",
      () => {
        promptAndOpenIHG(urlParams)
      },
      createIcon("hexagon"),
    )
    const accorBtn = createButton(
      "Accor",
      "accor-btn",
      () => {
        promptAndOpenAccor(urlParams)
      },
      createIcon("star"),
    )

    const wyndhamBtn = createButton(
      "Wyndham",
      "wyndham-btn",
      () => {
        promptAndOpenWyndham(urlParams)
      },
      createIcon("home"),
    )
    const choiceBtn = createButton(
      "Choice",
      "choice-btn",
      () => {
        promptAndOpenChoice(urlParams)
      },
      createIcon("check-square"),
    )
    const meliaBtn = createButton(
      "Melia",
      "melia-btn",
      () => {
        promptAndOpenMelia(urlParams)
      },
      createIcon("sun"),

      // Create hotel buttons - second row
    )
    const bestWesternBtn = createButton(
      "BestWest",
      "best-western-btn",
      () => {
        promptAndOpenBestWestern(urlParams)
      },
      createIcon("crown"),
    )
    const radissonBtn = createButton(
      "Radisson",
      "radisson-btn",
      () => {
        promptAndOpenRadisson(urlParams)
      },
      createIcon("circle"),
    )
    const ghaBtn = createButton(
      "GHA",
      "gha-btn",
      () => {
        promptAndOpenGHA(urlParams)
      },
      createIcon("globe"),
    )

    const biltBtn = createButton(
      "Bilt",
      "bilt-btn",
      () => {
        promptAndOpenBilt(urlParams)
      },
      createIcon("credit-card"),
    )

    const roomsBtn = createButton(
      "Rooms",
      "rooms-btn",
      () => {
        promptAndOpenRooms(urlParams)
      },
      createIcon("search"),
    )

    // Add hotel buttons to first row
    hotelRowContainer1.appendChild(googleHotelsBtn)
    hotelRowContainer1.appendChild(roomsBtn)
    hotelRowContainer1.appendChild(hyattBtn)
    hotelRowContainer1.appendChild(hiltonBtn)
    hotelRowContainer1.appendChild(choiceBtn)
    hotelRowContainer1.appendChild(wyndhamBtn)
    hotelRowContainer1.appendChild(marriottBtn)
    hotelRowContainer1.appendChild(ihgBtn)
    hotelRowContainer1.appendChild(accorBtn)
    // Add hotel buttons to second row
    hotelRowContainer2.appendChild(meliaBtn)
    hotelRowContainer2.appendChild(bestWesternBtn)
    hotelRowContainer2.appendChild(radissonBtn)
    hotelRowContainer2.appendChild(ghaBtn)
    hotelRowContainer2.appendChild(biltBtn)

    // Create benefitsystems row containers
    const benefitsystemsRowContainer1 = document.createElement("div")
    benefitsystemsRowContainer1.className = "custom-flight-buttons"

    const benefitsystemsRowContainer2 = document.createElement("div")
    benefitsystemsRowContainer2.className = "custom-flight-buttons second-row"

    const benefitsystemsRowContainer3 = document.createElement("div")
    benefitsystemsRowContainer3.className = "custom-flight-buttons second-row"

    const benefitsystemsRowContainer4 = document.createElement("div")
    benefitsystemsRowContainer4.className = "custom-flight-buttons second-row"

    // Create benefitsystems section header
    const benefitsystemsSectionHeader = document.createElement("div")
    benefitsystemsSectionHeader.className = "section-header"
    benefitsystemsSectionHeader.textContent = "Benefitsystems Tools"

    // Create Benefitsystems buttons
    const benefitsystemsTools = {
      "/calculator": { name: "Calc", icon: "calculator", className: "benefitsystems-calculator-btn" },
      "/flights": { name: "Flights", icon: "plane", className: "benefitsystems-flight-btn" },
      "/hotels": { name: "Hotels", icon: "hotel", className: "benefitsystems-hotel-btn" },
      "/purchase": { name: "History", icon: "history", className: "benefitsystems-history-btn" },
      "/cards": { name: "Cards", icon: "credit-card", className: "benefitsystems-cards-btn" },
      "/transfers": { name: "Transfer", icon: "refresh-cw", className: "benefitsystems-transfers-btn" },
      "/transfersbonus": { name: "Bonus", icon: "percent", className: "benefitsystems-bonus-btn" },
      "/awarddates": { name: "Awards", icon: "calendar", className: "benefitsystems-award-btn" },
      "/charge": { name: "Charge", icon: "battery-charging", className: "benefitsystems-charge-btn" },
      "/cardtravel": { name: "Portal", icon: "luggage", className: "benefitsystems-cardtravel-btn" },
      "/cardrules": { name: "Rules", icon: "file-text", className: "benefitsystems-cardrules-btn" },
      "/currency": { name: "Exchange", icon: "currency-dollar", className: "benefitsystems-currency-btn" },
      "/casm": { name: "CASM", icon: "calculator", className: "benefitsystems-casm-btn" },
      "/rovemile": { name: "Rovemile", icon: "dollar-sign", className: "benefitsystems-rovemile-btn" },
      "/hyatt": { name: "Hyatt", icon: "building", className: "benefitsystems-hyatt-btn" },
      "/hilton": { name: "Hilton", icon: "hotel", className: "benefitsystems-hilton-btn" },
      "/hotelprice": { name: "Price", icon: "tag", className: "benefitsystems-hotelprice-btn" },
      "/hotelrewards": { name: "Rewards", icon: "award", className: "benefitsystems-rewards-btn" },
      "/lounges": { name: "Lounges", icon: "coffee", className: "benefitsystems-lounges-btn" },
      "/fasttrack": { name: "FastTrack", icon: "zap", className: "benefitsystems-fasttrack-btn" },
      "/premium": { name: "Premium", icon: "armchair", className: "benefitsystems-premium-btn" },
      "/seatmaps": { name: "Seats", icon: "layout", className: "benefitsystems-seatmaps-btn" },
      "/pnr": { name: "PNR", icon: "eye", className: "benefitsystems-pnr-btn" },
      "/buypoints": { name: "Buy", icon: "shopping-cart", className: "benefitsystems-buypoints-btn" },
      "/pointvalue": { name: "AwardValue", icon: "trending-up", className: "benefitsystems-pointvalue-btn" },
      "/transfertimes": { name: "Times", icon: "clock", className: "benefitsystems-transfertimes-btn" },
      "/purchasetimes": { name: "BuyTimes", icon: "clock", className: "benefitsystems-purchasetimes-btn" },
      "/valuecalc": { name: "Calc", icon: "calculator", className: "benefitsystems-valuecalc-btn" },
      "/statuscards": { name: "Status", icon: "award", className: "benefitsystems-statuscards-btn" },
      "/merchant": { name: "Merchant", icon: "search", className: "benefitsystems-merchant-btn" },
      "/search": { name: "Search", icon: "search", className: "benefitsystems-search-btn" },
      "/amextransfer": { name: "Amex", icon: "refresh-cw", className: "benefitsystems-amextransfer-btn" },
      "/awardcancellation": { name: "Cancel", icon: "x-circle", className: "benefitsystems-awardcancellation-btn" },
      "/hotelstatus": { name: "Benefits", icon: "award", className: "benefitsystems-hotelstatus-btn" },
      "/rss": { name: "RSS News", icon: "rss", className: "benefitsystems-rss-btn" },
      "/myflights": { name: "My Flights", icon: "plane", className: "benefitsystems-myflights-btn" },
      "/myhotels": { name: "My Hotels", icon: "hotel", className: "benefitsystems-myhotels-btn" },
      "/benefits": { name: "Benefits", icon: "gift", className: "benefitsystems-benefits-btn" },
    }

    // Create and add buttons to row containers
    let buttonCount = 0
    const maxButtonsPerRow = 9

    for (const [path, details] of Object.entries(benefitsystemsTools)) {
      const url = `https://tools.benefitsystems.io${path}`
      const button = createLinkButton(details.name, details.className, url, createIcon(details.icon))

      if (buttonCount < maxButtonsPerRow) {
        benefitsystemsRowContainer1.appendChild(button)
      } else if (buttonCount < maxButtonsPerRow * 2) {
        benefitsystemsRowContainer2.appendChild(button)
      } else if (buttonCount < maxButtonsPerRow * 3) {
        benefitsystemsRowContainer3.appendChild(button)
      } else if (buttonCount < maxButtonsPerRow * 4) {
        benefitsystemsRowContainer4.appendChild(button)
      }
      buttonCount++
    }

    // Add section headers
    const flightSectionHeader = document.createElement("div")
    flightSectionHeader.className = "section-header"
    flightSectionHeader.textContent = "Flight Search"

    const hotelSectionHeader = document.createElement("div")
    hotelSectionHeader.className = "section-header"
    hotelSectionHeader.textContent = "Hotel Search"

    // Create section containers
    const flightSectionContainer = document.createElement("div")
    flightSectionContainer.className = "flight-section-container"
    flightSectionContainer.appendChild(flightSectionHeader)
    flightSectionContainer.appendChild(flightRowContainer1)
    flightSectionContainer.appendChild(flightRowContainer2)

    const hotelSectionContainer = document.createElement("div")
    hotelSectionContainer.className = "hotel-section-container"
    hotelSectionContainer.appendChild(hotelSectionHeader)
    hotelSectionContainer.appendChild(hotelRowContainer1)
    hotelSectionContainer.appendChild(hotelRowContainer2)

    const benefitsystemsSectionContainer = document.createElement("div")
    benefitsystemsSectionContainer.className = "benefitsystems-section-container"
    benefitsystemsSectionContainer.appendChild(benefitsystemsSectionHeader)
    benefitsystemsSectionContainer.appendChild(benefitsystemsRowContainer1)
    benefitsystemsSectionContainer.appendChild(benefitsystemsRowContainer2)
    benefitsystemsSectionContainer.appendChild(benefitsystemsRowContainer3)
    benefitsystemsSectionContainer.appendChild(benefitsystemsRowContainer4)

    // Add all containers to the button container
    buttonContainer.appendChild(flightSectionContainer)
    buttonContainer.appendChild(hotelSectionContainer)
    buttonContainer.appendChild(benefitsystemsSectionContainer)

    // Add container to flight element
    element.appendChild(buttonContainer)
  })

  // If no flight elements were found or buttons weren't injected, check if we're on a search results page
  if (
    (flightElements.length === 0 || !document.querySelector(".custom-flight-buttons")) &&
    !(window.location.href.includes("tcfs") && !window.location.href.includes("search")) && // Only skip on the main flights homepage, not search results
    document.querySelector(".gws-flights-results__results-container")
  ) {
    // Only add if we're on a results page

    const resultsContainer = document.querySelector(".gws-flights-results__results-container")
    if (resultsContainer && !resultsContainer.querySelector(".custom-flight-buttons-container")) {
      // Create a container at the top of the results, but not fixed position
      const buttonsContainer = document.createElement("div")
      buttonsContainer.className = "custom-flight-buttons-container"
      buttonsContainer.style.margin = "10px 0"
      buttonsContainer.style.backgroundColor = "rgba(255, 255, 255, 0.95)"
      buttonsContainer.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)"
      buttonsContainer.style.borderRadius = "8px"

      // Create flight row containers
      const flightRowContainer1 = document.createElement("div")
      flightRowContainer1.className = "custom-flight-buttons"

      const flightRowContainer2 = document.createElement("div")
      flightRowContainer2.className = "custom-flight-buttons second-row"

      // Create hotel row containers
      const hotelRowContainer1 = document.createElement("div")
      hotelRowContainer1.className = "custom-flight-buttons"

      const hotelRowContainer2 = document.createElement("div")
      hotelRowContainer2.className = "custom-flight-buttons second-row"

      // Generate URLs and create buttons
      const urlParams = parseFlightInfoFromUrl(window.location.href)
      const urls = generateAllUrls(urlParams)

      // Create flight buttons - first row
      const googleFlightsBtn = createButton(
        "Flights",
        "google-flights-btn",
        () => {
          promptAndOpenGoogleFlights(urlParams)
        },
        createIcon("plane"),
      )
      const pointsYeahBtn = createLinkButton("PY", "points-yeah-btn", urls.pointsYeah, createIcon("star"))
      const pointsYeahSeatmapBtn = createButton(
        "PY Seatmap",
        "points-yeah-seatmap-btn",
        () => {
          promptAndOpenPointsYeahSeatmap(urlParams)
        },
        createIcon("armchair"),
      )
      const awardToolBtn = createLinkButton("AwardTool", "award-tool-btn", urls.awardtool, createIcon("award"))
      const seatsAeroBtn = createLinkButton("SeatsAero", "seats-aero-btn", urls.seatsaero, createIcon("sofa"))
      const airCanadaBtn = createLinkButton("AirCanada", "air-canada-btn", urls.airCanada, createIcon("flag"))
      const pointMeBtn = createLinkButton("PointMe", "point-me-btn", urls.pointme, createIcon("compass"))
      const kayakBtn = createLinkButton("Kayak", "kayak-btn", urls.kayak, createIcon("sailboat"))
      const skyscannerBtn = createLinkButton("Skys", "skyscanner-btn", urls.skyscanner, createIcon("search"))

      // Create new flight buttons for second row on results page
      const rovemilesBtn = createLinkButton("Rovemiles", "point-me-btn", urls.rovemiles, createIcon("plane"))
      const faresViewerBtn = createLinkButton("Fares", "seats-aero-btn", urls.seatsAeroFares, createIcon("tag"))
      const saSeatmapBtn = createButton(
        "Seatmap",
        "seats-aero-seatmap-btn",
        () => {
          promptAndOpenSeatsAeroSeatmap(urlParams)
        },
        createIcon("layout"),
      )
      const awardToolAllBtn = createLinkButton(
        "AwardTool All",
        "award-tool-btn",
        urls.awardtoolAllPlus14,
        createIcon("calendar"),
      )

      // Add additional flight-specific buttons if we have the required parameters
      let fareClassBtn = null
      let flightConnectionsBtn = null
      let turbliBtn = null
      let restoreUrlBtn = null

      if (hasRequiredParams) {
        fareClassBtn = createLinkButton("FareClass", "fare-class-btn", urls.fareClass, createIcon("ticket"))
        flightConnectionsBtn = createLinkButton(
          "Connections",
          "flight-connections-btn",
          urls.flightconnections,
          createIcon("network")
        )
        turbliBtn = createLinkButton("Turbli", "turbli-btn", urls.turbli, createIcon("cloud-lightning"))
      }

      // Add restore button if URL has changed
      if (window.location.href !== window.originalGoogleFlightsUrl) {
        restoreUrlBtn = createButton(
          "Restore URL",
          "restore-url-btn",
          () => {
            window.location.href = window.originalGoogleFlightsUrl
          },
          createIcon("refresh-cw"),
        )
      }

      // Add flight buttons to first row
      flightRowContainer1.appendChild(googleFlightsBtn)
      flightRowContainer1.appendChild(pointsYeahBtn)
      flightRowContainer1.appendChild(pointsYeahSeatmapBtn)
      flightRowContainer1.appendChild(awardToolBtn)
      flightRowContainer1.appendChild(seatsAeroBtn)
      flightRowContainer1.appendChild(airCanadaBtn)
      flightRowContainer1.appendChild(pointMeBtn)
      flightRowContainer1.appendChild(kayakBtn)
      flightRowContainer1.appendChild(skyscannerBtn)

      // Add new flight buttons to second row
      flightRowContainer2.appendChild(rovemilesBtn)
      flightRowContainer2.appendChild(faresViewerBtn)
      flightRowContainer2.appendChild(saSeatmapBtn)
      flightRowContainer2.appendChild(awardToolAllBtn)

      // Add additional flight-specific buttons to second row if we have the required parameters
      if (hasRequiredParams) {
        flightRowContainer2.appendChild(fareClassBtn)
        flightRowContainer2.appendChild(flightConnectionsBtn)
        flightRowContainer2.appendChild(turbliBtn)
      }

      if (restoreUrlBtn) {
        flightRowContainer2.appendChild(restoreUrlBtn)
      }

      // Create hotel buttons - first row
      const googleHotelsBtn = createButton(
        "Hotels",
        "google-hotels-btn",
        () => {
          promptAndOpenGoogleHotels()
        },
        createIcon("search"),
      )
      const hiltonBtn = createButton(
        "Hilton",
        "hilton-btn",
        () => {
          promptAndOpenHilton(urlParams)
        },
        createIcon("hotel"),
      )
      const hyattBtn = createButton(
        "Hyatt",
        "hyatt-btn",
        () => {
          promptAndOpenHyatt(urlParams)
        },
        createIcon("building"),
      )
      const marriottBtn = createButton(
        "Marriott",
        "marriott-btn",
        () => {
          promptAndOpenMarriott(urlParams)
        },
        createIcon("landmark"),
      )
      const ihgBtn = createButton(
        "IHG",
        "ihg-btn",
        () => {
          promptAndOpenIHG(urlParams)
        },
        createIcon("hexagon"),
      )
      const accorBtn = createButton(
        "Accor",
        "accor-btn",
        () => {
          promptAndOpenAccor(urlParams)
        },
        createIcon("star"),
      )

      // Create hotel buttons - second row
      const wyndhamBtn = createButton(
        "Wyndham",
        "wyndham-btn",
        () => {
          promptAndOpenWyndham(urlParams)
        },
        createIcon("home"),
      )
      const choiceBtn = createButton(
        "Choice",
        "choice-btn",
        () => {
          promptAndOpenChoice(urlParams)
        },
        createIcon("check-square"),
      )
      const meliaBtn = createButton(
        "Melia",
        "melia-btn",
        () => {
          promptAndOpenMelia(urlParams)
        },
        createIcon("sun"),
      )
      const bestWesternBtn = createButton(
        "BestWest",
        "best-western-btn",
        () => {
          promptAndOpenBestWestern(urlParams)
        },
        createIcon("crown"),
      )
      const radissonBtn = createButton(
        "Radisson",
        "radisson-btn",
        () => {
          promptAndOpenRadisson(urlParams)
        },
        createIcon("circle"),
      )
      const ghaBtn = createButton(
        "GHA",
        "gha-btn",
        () => {
          promptAndOpenGHA(urlParams)
        },
        createIcon("globe"),
      )

      const biltBtn = createButton(
        "Bilt",
        "bilt-btn",
        () => {
          promptAndOpenBilt(urlParams)
        },
        createIcon("credit-card"),
      )

      const roomsBtn = createButton(
        "Rooms",
        "rooms-btn",
        () => {
          promptAndOpenRooms(urlParams)
        },
        createIcon("search"),
      )

      // Add hotel buttons to first row
      hotelRowContainer1.appendChild(googleHotelsBtn)
      hotelRowContainer1.appendChild(roomsBtn)
      hotelRowContainer1.appendChild(hyattBtn)
      hotelRowContainer1.appendChild(hiltonBtn)
      hotelRowContainer1.appendChild(choiceBtn)
      hotelRowContainer1.appendChild(wyndhamBtn)
      hotelRowContainer1.appendChild(marriottBtn)
      hotelRowContainer1.appendChild(ihgBtn)
      hotelRowContainer1.appendChild(accorBtn)
      // Add hotel buttons to second row
      hotelRowContainer2.appendChild(meliaBtn)
      hotelRowContainer2.appendChild(bestWesternBtn)
      hotelRowContainer2.appendChild(radissonBtn)
      hotelRowContainer2.appendChild(ghaBtn)
      hotelRowContainer2.appendChild(biltBtn)

      // Create benefitsystems row containers
      const benefitsystemsRowContainer1 = document.createElement("div")
      benefitsystemsRowContainer1.className = "custom-flight-buttons"

      const benefitsystemsRowContainer2 = document.createElement("div")
      benefitsystemsRowContainer2.className = "custom-flight-buttons second-row"

      const benefitsystemsRowContainer3 = document.createElement("div")
      benefitsystemsRowContainer3.className = "custom-flight-buttons second-row"

      const benefitsystemsRowContainer4 = document.createElement("div")
      benefitsystemsRowContainer4.className = "custom-flight-buttons second-row"

      // Create benefitsystems section header
      const benefitsystemsSectionHeader = document.createElement("div")
      benefitsystemsSectionHeader.className = "section-header"
      benefitsystemsSectionHeader.textContent = "Benefitsystems Tools"

      // Create Benefitsystems buttons
      const benefitsystemsTools = {
        "/calculator": { name: "Calc", icon: "calculator", className: "benefitsystems-calculator-btn" },
        "/flights": { name: "Flights", icon: "plane", className: "benefitsystems-flight-btn" },
        "/hotels": { name: "Hotels", icon: "hotel", className: "benefitsystems-hotel-btn" },
        "/purchase": { name: "History", icon: "history", className: "benefitsystems-history-btn" },
        "/cards": { name: "Cards", icon: "credit-card", className: "benefitsystems-cards-btn" },
        "/transfers": { name: "TransferPartner", icon: "refresh-cw", className: "benefitsystems-transfers-btn" },
        "/transfersbonus": { name: "Bonus", icon: "percent", className: "benefitsystems-bonus-btn" },
        "/awarddates": { name: "Awards", icon: "calendar", className: "benefitsystems-award-btn" },
        "/charge": { name: "Charge", icon: "battery-charging", className: "benefitsystems-charge-btn" },
        "/cardtravel": { name: "Portal", icon: "luggage", className: "benefitsystems-cardtravel-btn" },
        "/cardrules": { name: "Rules", icon: "file-text", className: "benefitsystems-cardrules-btn" },
        "/currency": { name: "Exchange", icon: "currency-dollar", className: "benefitsystems-currency-btn" },
        "/casm": { name: "CASM", icon: "calculator", className: "benefitsystems-casm-btn" },
        "/rovemile": { name: "Rovemile", icon: "dollar-sign", className: "benefitsystems-rovemile-btn" },
        "/hyatt": { name: "Hyatt", icon: "building", className: "benefitsystems-hyatt-btn" },
        "/hilton": { name: "Hilton", icon: "hotel", className: "benefitsystems-hotel-btn" },
        "/hotelprice": { name: "Price", icon: "tag", className: "benefitsystems-hotelprice-btn" },
        "/hotelrewards": { name: "Rewards", icon: "award", className: "benefitsystems-rewards-btn" },
        "/lounges": { name: "Lounges", icon: "coffee", className: "benefitsystems-lounges-btn" },
        "/fasttrack": { name: "FastTrack", icon: "zap", className: "benefitsystems-fasttrack-btn" },
        "/premium": { name: "Premium", icon: "armchair", className: "benefitsystems-premium-btn" },
        "/seatmaps": { name: "Seats", icon: "layout", className: "benefitsystems-seatmaps-btn" },
        "/pnr": { name: "PNR", icon: "eye", className: "benefitsystems-pnr-btn" },
        "/buypoints": { name: "Buy", icon: "shopping-cart", className: "benefitsystems-buypoints-btn" },
        "/pointvalue": { name: "Value", icon: "trending-up", className: "benefitsystems-pointvalue-btn" },
        "/transfertimes": { name: "Times", icon: "clock", className: "benefitsystems-transfertimes-btn" },
        "/purchasetimes": { name: "BuyTimes", icon: "clock", className: "benefitsystems-purchasetimes-btn" },
        "/valuecalc": { name: "Calc", icon: "calculator", className: "benefitsystems-valuecalc-btn" },
        "/statuscards": { name: "Status", icon: "award", className: "benefitsystems-statuscards-btn" },
        "/merchant": { name: "Merchant", icon: "search", className: "benefitsystems-merchant-btn" },
        "/search": { name: "Search", icon: "search", className: "benefitsystems-search-btn" },
        "/amextransfer": { name: "Amex", icon: "refresh-cw", className: "benefitsystems-amextransfer-btn" },
        "/awardcancellation": { name: "Cancel", icon: "x-circle", className: "benefitsystems-awardcancellation-btn" },
        "/hotelstatus": { name: "Benefits", icon: "award", className: "benefitsystems-hotelstatus-btn" },
        "/rss": { name: "RSS News", icon: "rss", className: "benefitsystems-rss-btn" },
        "/myflights": { name: "My Flights", icon: "plane", className: "benefitsystems-myflights-btn" },
        "/myhotels": { name: "My Hotels", icon: "hotel", className: "benefitsystems-myhotels-btn" },
        "/benefits": { name: "Benefits", icon: "gift", className: "benefitsystems-benefits-btn" },
      }

      // Create and add buttons to row containers
      let buttonCount = 0
      const maxButtonsPerRow = 9

      for (const [path, details] of Object.entries(benefitsystemsTools)) {
        const url = `https://tools.benefitsystems.io${path}`
        const button = createLinkButton(details.name, details.className, url, createIcon(details.icon))

        if (buttonCount < maxButtonsPerRow) {
          benefitsystemsRowContainer1.appendChild(button)
        } else if (buttonCount < maxButtonsPerRow * 2) {
          benefitsystemsRowContainer2.appendChild(button)
        } else if (buttonCount < maxButtonsPerRow * 3) {
          benefitsystemsRowContainer3.appendChild(button)
        } else if (buttonCount < maxButtonsPerRow * 4) {
          benefitsystemsRowContainer4.appendChild(button)
        }
        buttonCount++
      }

      // Add section headers
      const flightSectionHeader = document.createElement("div")
      flightSectionHeader.className = "section-header"
      flightSectionHeader.textContent = "Flight Search"

      const hotelSectionHeader = document.createElement("div")
      hotelSectionHeader.className = "section-header"
      hotelSectionHeader.textContent = "Hotel Search"

      // Create section containers
      const flightSectionContainer = document.createElement("div")
      flightSectionContainer.className = "flight-section-container"
      flightSectionContainer.appendChild(flightSectionHeader)
      flightSectionContainer.appendChild(flightRowContainer1)
      flightSectionContainer.appendChild(flightRowContainer2)

      const hotelSectionContainer = document.createElement("div")
      hotelSectionContainer.className = "hotel-section-container"
      hotelSectionContainer.appendChild(hotelSectionHeader)
      hotelSectionContainer.appendChild(hotelRowContainer1)
      hotelSectionContainer.appendChild(hotelRowContainer2)

      const benefitsystemsSectionContainer = document.createElement("div")
      benefitsystemsSectionContainer.className = "benefitsystems-section-container"
      benefitsystemsSectionContainer.appendChild(benefitsystemsSectionHeader)
      benefitsystemsSectionContainer.appendChild(benefitsystemsRowContainer1)
      benefitsystemsSectionContainer.appendChild(benefitsystemsRowContainer2)
      benefitsystemsSectionContainer.appendChild(benefitsystemsRowContainer3)
      benefitsystemsSectionContainer.appendChild(benefitsystemsRowContainer4)

      // Add all containers to the button container
      buttonsContainer.appendChild(flightSectionContainer)
      buttonsContainer.appendChild(hotelSectionContainer)
      buttonsContainer.appendChild(benefitsystemsSectionContainer)
      
      // Add the fixed container to the results container
      resultsContainer.prepend(buttonsContainer)
    }
  }
}

// Update the addBenefitsystemsButtonStyles function to add a separator line between rows

function addBenefitsystemsButtonStyles() {
  if (document.getElementById("custom-button-styles")) {
    return // Styles already added
  }

  const style = document.createElement("style")
  style.id = "custom-button-styles"
  style.textContent = `
    /* Clean, minimal button styling */
    .custom-flight-buttons a, .custom-flight-buttons button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 16px;
      margin: 4px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: #ffffff;
      color: #111827;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .custom-flight-buttons a:hover, .custom-flight-buttons button:hover {
      background: #f9fafb;
      border-color: #d1d5db;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .custom-flight-buttons a:active, .custom-flight-buttons button:active {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .button-icon {
      margin-right: 8px;
      display: flex;
      align-items: center;
      opacity: 0.7;
    }
    
    /* Clean section header styling */
    .section-header {
      font-weight: 600;
      padding: 12px 16px;
      margin: 20px 0 12px 0;
      border-radius: 8px;
      background: #ffffff;
      color: #111827;
      border: 1px solid #e5e7eb;
      font-size: 14px;
      letter-spacing: 0.025em;
      text-transform: uppercase;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    /* Clean container styling */
    .custom-flight-buttons-container {
      background: #ffffff;
      border-radius: 12px;
      padding: 24px;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }
    
    /* Clean button row styling */
    .custom-flight-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .custom-flight-buttons:last-child {
      margin-bottom: 0;
    }
    
    /* Clean row separator styling */
    .custom-flight-buttons.second-row {
      border-top: 1px solid #e5e7eb;
      padding-top: 16px;
      margin-top: 16px;
    }
  `
  document.head.appendChild(style)
}

// Initialize the extension
console.log('Google Flight Extension V2 script loaded')

// Wait for the page to load
document.addEventListener("DOMContentLoaded", function () {
  console.log('Google Flight Extension V2 loaded - DOMContentLoaded event fired')
  // Check if we're on a Google Flights page
  if (window.location.href.includes("google.com/travel/flights")) {
    console.log('On Google Flights page, will inject buttons in 2 seconds')
    // Wait a bit for the page to fully load
    setTimeout(injectButtons, 2000)
  } else {
    console.log('Not on Google Flights page, current URL:', window.location.href)
  }
})

// Also try to inject buttons immediately if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectButtons)
} else {
  injectButtons()
}

// Set up a mutation observer to watch for dynamic content changes
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      injectButtons()
    }
  }
})

// Start observing the document body for changes
observer.observe(document.body, {
  childList: true,
  subtree: true,
})
