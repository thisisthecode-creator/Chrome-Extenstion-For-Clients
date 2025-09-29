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
    const skyscannerBtn = createLinkButton("Skyscanner", "skyscanner-btn", urls.skyscanner, createIcon("search"))

    // Create new flight buttons for second row
    const rovemilesBtn = createLinkButton("Rovemiles", "point-me-btn", urls.rovemiles, createIcon("plane"))
    const faresViewerBtn = createLinkButton("Seats.aero Fares", "seats-aero-btn", urls.seatsAeroFares, createIcon("tag"))
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

    // Create additional flight-specific buttons (always render; links may be disabled if params missing)
    let fareClassBtn = null
    let flightConnectionsBtn = null
    let turbliBtn = null
    let restoreUrlBtn = null

    fareClassBtn = createLinkButton("Fare Class", "fare-class-btn", urls.fareClass, createIcon("ticket"))
    flightConnectionsBtn = createLinkButton(
      "Connections",
      "flight-connections-btn",
      urls.flightconnections,
      createIcon("network")
    )
    turbliBtn = createLinkButton("Turbli", "turbli-btn", urls.turbli, createIcon("cloud-lightning"))

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
    flightRowContainer1.appendChild(pointMeBtn)
    flightRowContainer2.appendChild(rovemilesBtn)
  

    // Add new flight buttons to second row
    flightRowContainer1.appendChild(airCanadaBtn)
    flightRowContainer1.appendChild(kayakBtn)
    flightRowContainer1.appendChild(skyscannerBtn)
    flightRowContainer2.appendChild(faresViewerBtn)
    flightRowContainer2.appendChild(saSeatmapBtn)
    flightRowContainer2.appendChild(awardToolAllBtn)

    // Add additional flight-specific buttons to second row
    flightRowContainer2.appendChild(fareClassBtn)
    flightRowContainer2.appendChild(flightConnectionsBtn)
    flightRowContainer2.appendChild(turbliBtn)

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
    hotelRowContainer1.appendChild(choiceBtn)
    hotelRowContainer1.appendChild(wyndhamBtn)
    hotelRowContainer1.appendChild(hiltonBtn)
    hotelRowContainer1.appendChild(marriottBtn)
    hotelRowContainer1.appendChild(ihgBtn)
    hotelRowContainer1.appendChild(accorBtn)
    // Add hotel buttons to second row
    hotelRowContainer2.appendChild(meliaBtn)
    hotelRowContainer2.appendChild(bestWesternBtn)
    hotelRowContainer2.appendChild(radissonBtn)
    hotelRowContainer2.appendChild(ghaBtn)
    hotelRowContainer2.appendChild(biltBtn)

    // Create benefitsystems row container
    const benefitsystemsRowContainer1 = document.createElement("div")
    benefitsystemsRowContainer1.className = "custom-flight-buttons"

    // Create benefitsystems section header
    const benefitsystemsSectionHeader = document.createElement("div")
    benefitsystemsSectionHeader.className = "section-header"
    benefitsystemsSectionHeader.textContent = "Benefit Systems"

    // Create single Benefitsystems button
    const benefitsystemsAllBtn = createLinkButton(
      "Benefitsystems",
      "benefitsystems-all-btn",
      "https://tools.benefitsystems.io",
      createIcon("globe")
    )
    benefitsystemsRowContainer1.appendChild(benefitsystemsAllBtn)

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

    // Create main container for sections
    const mainContainer = document.createElement('div')
    mainContainer.className = 'custom-flight-buttons-container'
    
    // Convert existing sections to new format
    const flightSection = createSectionContainer('Flight Search')
    const hotelSection = createSectionContainer('Hotel Search')
    const benefitsystemsSection = createSectionContainer('Benefit Systems')
    
    // Move buttons to new sections
    const flightButtons = flightSectionContainer.querySelectorAll('.custom-flight-buttons > *')
    const hotelButtons = hotelSectionContainer.querySelectorAll('.custom-flight-buttons > *')
    const benefitsystemsButtons = benefitsystemsSectionContainer.querySelectorAll('.custom-flight-buttons > *')
    
    flightButtons.forEach(btn => flightSection.querySelector('.custom-flight-buttons').appendChild(btn))
    hotelButtons.forEach(btn => hotelSection.querySelector('.custom-flight-buttons').appendChild(btn))
    benefitsystemsButtons.forEach(btn => benefitsystemsSection.querySelector('.custom-flight-buttons').appendChild(btn))
    
    // Add sections to main container
    mainContainer.appendChild(flightSection)
    mainContainer.appendChild(hotelSection)
    mainContainer.appendChild(benefitsystemsSection)
    enhanceButtonsUI(mainContainer)
    
    // Add add section button
    const addSectionBtn = document.createElement('button')
    addSectionBtn.className = 'add-section-btn'
    addSectionBtn.textContent = '+ Add New Section'
    addSectionBtn.onclick = addNewSection
    mainContainer.appendChild(addSectionBtn)

    // Add container to flight element
    element.appendChild(mainContainer)
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
    const pointsYeahBtn = createLinkButton("PointsYeah", "points-yeah-btn", urls.pointsYeah, createIcon("star"))
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
    const skyscannerBtn = createLinkButton("Skyscanner", "skyscanner-btn", urls.skyscanner, createIcon("search"))

      // Create new flight buttons for second row on results page
    const rovemilesBtn = createLinkButton("Rovemiles", "point-me-btn", urls.rovemiles, createIcon("plane"))
    const faresViewerBtn = createLinkButton("Seats.aero Fares", "seats-aero-btn", urls.seatsAeroFares, createIcon("tag"))
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

      // Create additional flight-specific buttons (always render; links may be disabled if params missing)
      let fareClassBtn = null
      let flightConnectionsBtn = null
      let turbliBtn = null
      let restoreUrlBtn = null

      fareClassBtn = createLinkButton("Fare Class", "fare-class-btn", urls.fareClass, createIcon("ticket"))
      flightConnectionsBtn = createLinkButton(
        "Connections",
        "flight-connections-btn",
        urls.flightconnections,
        createIcon("network")
      )
      turbliBtn = createLinkButton("Turbli", "turbli-btn", urls.turbli, createIcon("cloud-lightning"))

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

      // Add additional flight-specific buttons to second row
      flightRowContainer2.appendChild(fareClassBtn)
      flightRowContainer2.appendChild(flightConnectionsBtn)
      flightRowContainer2.appendChild(turbliBtn)

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
    
      // Add hotel buttons to second row
      hotelRowContainer1.appendChild(ihgBtn)
      hotelRowContainer1.appendChild(accorBtn)
      hotelRowContainer2.appendChild(meliaBtn)
      hotelRowContainer2.appendChild(bestWesternBtn)
      hotelRowContainer2.appendChild(radissonBtn)
      hotelRowContainer2.appendChild(ghaBtn)
      hotelRowContainer2.appendChild(biltBtn)

      // Create benefitsystems row container
      const benefitsystemsRowContainer1 = document.createElement("div")
      benefitsystemsRowContainer1.className = "custom-flight-buttons"

      // Create benefitsystems section header
      const benefitsystemsSectionHeader = document.createElement("div")
      benefitsystemsSectionHeader.className = "section-header"
      benefitsystemsSectionHeader.textContent = "Benefit Systems"

      // Create single Benefitsystems button
      const benefitsystemsAllBtn = createLinkButton(
        "Tools",
        "benefitsystems-all-btn",
        "https://tools.benefitsystems.io",
        createIcon("globe")
      )
      benefitsystemsRowContainer1.appendChild(benefitsystemsAllBtn)

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

      // Create main container for sections
      const mainContainer = document.createElement('div')
      mainContainer.className = 'custom-flight-buttons-container'
      
      // Convert existing sections to new format
      const flightSection = createSectionContainer('Flight Search')
      const hotelSection = createSectionContainer('Hotel Search')
    const benefitsystemsSection = createSectionContainer('Benefit Systems')
      
      // Move buttons to new sections
      const flightButtons = flightSectionContainer.querySelectorAll('.custom-flight-buttons > *')
      const hotelButtons = hotelSectionContainer.querySelectorAll('.custom-flight-buttons > *')
      const benefitsystemsButtons = benefitsystemsSectionContainer.querySelectorAll('.custom-flight-buttons > *')
      
      flightButtons.forEach(btn => flightSection.querySelector('.custom-flight-buttons').appendChild(btn))
      hotelButtons.forEach(btn => hotelSection.querySelector('.custom-flight-buttons').appendChild(btn))
      benefitsystemsButtons.forEach(btn => benefitsystemsSection.querySelector('.custom-flight-buttons').appendChild(btn))
      
      // Add sections to main container
      mainContainer.appendChild(flightSection)
      mainContainer.appendChild(hotelSection)
      mainContainer.appendChild(benefitsystemsSection)
      enhanceButtonsUI(mainContainer)
      
      // Add add section button
      const addSectionBtn = document.createElement('button')
      addSectionBtn.className = 'add-section-btn'
      addSectionBtn.textContent = '+ Add New Section'
      addSectionBtn.onclick = addNewSection
      mainContainer.appendChild(addSectionBtn)
      
      // Add the fixed container to the results container
      resultsContainer.prepend(mainContainer)
      
      // Create edit mode toggle if it doesn't exist
      if (!document.querySelector('.edit-mode-toggle')) {
        createEditModeToggle()
      }
      
      // Try to load saved button order
      setTimeout(() => {
        loadButtonOrder()
      }, 100)
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
  :root {
    --card-bg: #ffffff;
    --surface: #f8fafc;
    --text: #0f172a;
    --muted: #475569;
    --border: #e2e8f0;
    --ring: #2563eb;
    --shadow: 0 6px 24px rgba(15, 23, 42, 0.08);
    --radius: 12px;
    --gap: 12px;
    --btn-h: 44px;
    --btn-font: 13.5px;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --card-bg: #0b1220;
      --surface: #111827;
      --text: #e5e7eb;
      --muted: #93a3b8;
      --border: #1f2937;
      --ring: #60a5fa;
      --shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
  }

  /* Main container card */
  .custom-flight-buttons-container {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px;
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Section wrapper */
  .section-container {
    background: transparent;
    border-radius: calc(var(--radius) - 2px);
    padding: 6px 4px 2px 4px;
    position: relative;
  }

  /* Section header – clean chip with subtle divider */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin: 2px 2px 8px 2px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border);
  }

  .section-title {
    font-weight: 700;
    font-size: 13px;
    letter-spacing: .2px;
    color: var(--muted);
    padding: 6px 10px;
    background: color-mix(in srgb, var(--surface) 88%, transparent);
    border: 1px solid var(--border);
    border-radius: 999px;
    user-select: none;
  }

  /* Responsive, auto-fit grid */
  .custom-flight-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    grid-auto-rows: var(--btn-h);
    gap: var(--gap);
    margin-top: 8px;
  }

  @media (max-width: 1040px) {
    .custom-flight-buttons { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); }
  }
  @media (max-width: 760px) {
    .custom-flight-buttons { grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); }
    :root { --btn-h: 42px; --btn-font: 13px; }
  }

  /* Modern button/link base */
  .custom-flight-buttons a,
  .custom-flight-buttons button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: var(--btn-h);
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: linear-gradient(0deg, color-mix(in srgb, var(--surface) 78%, transparent), var(--card-bg));
    color: var(--text);
    font-size: var(--btn-font);
    font-weight: 600;
    letter-spacing: .1px;
    text-decoration: none;
    cursor: pointer;
    box-shadow: 0 1px 0 rgba(0,0,0,.02);
    transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease, background 140ms ease, opacity 120ms;
    outline: none;
    position: relative;
  }

  /* Hover/active */
  .custom-flight-buttons a:hover,
  .custom-flight-buttons button:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 16px rgba(15,23,42,.06);
    border-color: color-mix(in srgb, var(--border) 60%, var(--ring));
    background: color-mix(in srgb, var(--card-bg) 86%, var(--surface));
  }

  .custom-flight-buttons a:active,
  .custom-flight-buttons button:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(15,23,42,.08) inset;
  }

  /* Focus ring (keyboard a11y) */
  .custom-flight-buttons a:focus-visible,
  .custom-flight-buttons button:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--ring) 66%, transparent);
    outline-offset: 2px;
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--ring) 22%, transparent);
  }

  /* Icon sizing */
  .button-icon {
    display: inline-flex;
    align-items: center;
    line-height: 0;
  }
  .button-icon svg {
    width: 18px; height: 18px;
    opacity: .92;
  }

  /* Subtle grouping divider between multiple button rows (if used) */
  .custom-flight-buttons + .custom-flight-buttons {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed var(--border);
  }

  /* Edit mode polish */
  .edit-mode .custom-flight-buttons a,
  .edit-mode .custom-flight-buttons button {
    cursor: move !important;
  }
  .edit-mode .custom-flight-buttons a:hover,
  .edit-mode .custom-flight-buttons button:hover {
    background: color-mix(in srgb, var(--ring) 6%, var(--card-bg));
    border-color: color-mix(in srgb, var(--ring) 30%, var(--border));
    transform: scale(1.03);
  }
  .dragging { opacity: .6; transform: rotate(.8deg); z-index: 10; }
  .drag-over { border-style: dashed; }

  /* Edit toggle */
  .edit-mode-toggle {
    position: fixed; top: 12px; right: 12px; z-index: 10000;
    background: var(--ring); color: #fff; border: 0;
    padding: 10px 12px; border-radius: 999px;
    font-size: 12px; font-weight: 700; letter-spacing: .2px;
    box-shadow: var(--shadow); cursor: pointer;
  }
  .edit-mode-toggle.edit-active { background: #22c55e; }

  /* Section controls (only in edit) */
  .section-controls { display: none; gap: 6px; }
  .edit-mode .section-controls { display: flex; }
  .section-btn {
    background: var(--surface); color: var(--muted); border: 1px solid var(--border);
    padding: 4px 8px; border-radius: 8px; font-size: 12px; cursor: pointer;
  }
  .section-btn:hover { color: var(--text); }

  /* Add section button (only in edit) */
  .add-section-btn {
    align-self: flex-start;
    background: #22c55e; color: #fff; border: 0; border-radius: 10px;
    padding: 8px 12px; font-size: 12px; font-weight: 700; display: none;
    box-shadow: 0 8px 18px rgba(34,197,94,.2);
  }
  .edit-mode .add-section-btn { display: inline-flex; }

  `

  document.head.appendChild(style)
}

function enhanceButtonsUI(root = document) {
  const items = root.querySelectorAll('.custom-flight-buttons a, .custom-flight-buttons button')
  items.forEach(el => {
    el.setAttribute('tabindex', '0')
    if (!el.getAttribute('aria-label')) {
      const label = (el.textContent || '').trim()
      if (label) el.setAttribute('aria-label', label)
    }
    el.style.whiteSpace = 'nowrap'
    el.style.textOverflow = 'ellipsis'
    el.style.overflow = 'hidden'
  })
}

// Drag and Drop functionality
let isEditMode = false
let draggedElement = null
let draggedSection = null
let sectionCounter = 0

function createEditModeToggle() {
  const toggle = document.createElement('button')
  toggle.className = 'edit-mode-toggle'
  toggle.textContent = '✏️ Edit Layout'
  toggle.onclick = toggleEditMode
  document.body.appendChild(toggle)
}

// Section Management Functions
function createSectionContainer(title, id = null) {
  const container = document.createElement('div')
  container.className = 'section-container'
  if (id) container.dataset.sectionId = id
  
  const header = document.createElement('div')
  header.className = 'section-header'
  
  const titleElement = document.createElement('div')
  titleElement.className = 'section-title'
  titleElement.textContent = title
  titleElement.contentEditable = false
  
  const controls = document.createElement('div')
  controls.className = 'section-controls'
  
  const editBtn = document.createElement('button')
  editBtn.className = 'section-btn edit'
  editBtn.textContent = '✏️'
  editBtn.title = 'Edit Section'
  editBtn.onclick = () => editSectionTitle(titleElement)
  
  const deleteBtn = document.createElement('button')
  deleteBtn.className = 'section-btn delete'
  deleteBtn.textContent = '🗑️'
  deleteBtn.title = 'Delete Section'
  deleteBtn.onclick = () => deleteSection(container)
  
  controls.appendChild(editBtn)
  controls.appendChild(deleteBtn)
  
  header.appendChild(titleElement)
  header.appendChild(controls)
  
  const buttonsContainer = document.createElement('div')
  buttonsContainer.className = 'custom-flight-buttons'
  
  container.appendChild(header)
  container.appendChild(buttonsContainer)
  
  // Add drag and drop for sections
  titleElement.draggable = true
  titleElement.addEventListener('dragstart', handleSectionDragStart)
  titleElement.addEventListener('dragend', handleSectionDragEnd)
  
  return container
}

function editSectionTitle(titleElement) {
  const currentTitle = titleElement.textContent
  const input = document.createElement('input')
  input.type = 'text'
  input.className = 'section-input'
  input.value = currentTitle
  
  input.addEventListener('blur', () => {
    if (input.value.trim()) {
      titleElement.textContent = input.value.trim()
      saveSectionLayout()
    }
    titleElement.parentNode.replaceChild(titleElement, input)
  })
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      input.blur()
    }
  })
  
  titleElement.parentNode.replaceChild(input, titleElement)
  input.focus()
  input.select()
}

function deleteSection(container) {
  if (confirm('Are you sure you want to delete this section? All buttons in this section will be moved to the first section.')) {
    const buttons = container.querySelectorAll('.custom-flight-buttons > *')
    const firstSection = document.querySelector('.section-container .custom-flight-buttons')
    
    if (firstSection) {
      buttons.forEach(button => {
        firstSection.appendChild(button)
      })
    }
    
    container.remove()
    saveSectionLayout()
  }
}

function addNewSection() {
  const title = prompt('Enter section title:', `Custom Section ${++sectionCounter}`)
  if (title && title.trim()) {
    const newSection = createSectionContainer(title.trim())
    const mainContainer = document.querySelector('.custom-flight-buttons-container')
    
    if (mainContainer) {
      mainContainer.appendChild(newSection)
      saveSectionLayout()
    }
  }
}

function handleSectionDragStart(e) {
  if (!isEditMode) return
  draggedSection = e.target.closest('.section-container')
  e.target.classList.add('section-dragging')
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/html', draggedSection.outerHTML)
}

function handleSectionDragEnd(e) {
  if (!isEditMode) return
  e.target.classList.remove('section-dragging')
  draggedSection = null
}

function handleSectionDragOver(e) {
  if (!isEditMode) return
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

function handleSectionDrop(e) {
  if (!isEditMode) return
  e.preventDefault()
  
  if (draggedSection && e.target !== draggedSection) {
    const targetSection = e.target.closest('.section-container')
    if (targetSection && targetSection !== draggedSection) {
      const mainContainer = document.querySelector('.custom-flight-buttons-container')
      if (mainContainer) {
        mainContainer.insertBefore(draggedSection, targetSection)
        saveSectionLayout()
      }
    }
  }
}

function toggleEditMode() {
  isEditMode = !isEditMode
  const toggle = document.querySelector('.edit-mode-toggle')
  
  if (isEditMode) {
    document.body.classList.add('edit-mode')
    toggle.textContent = '🔒 Lock Layout'
    toggle.classList.add('edit-active')
    enableDragAndDrop()
    enableSectionManagement()
  } else {
    document.body.classList.remove('edit-mode')
    toggle.textContent = '✏️ Edit Layout'
    toggle.classList.remove('edit-active')
    disableDragAndDrop()
    disableSectionManagement()
  }
}

function enableSectionManagement() {
  // Add section drag and drop listeners
  const sections = document.querySelectorAll('.section-container')
  sections.forEach(section => {
    section.addEventListener('dragover', handleSectionDragOver)
    section.addEventListener('drop', handleSectionDrop)
  })
  
  // Show add section button
  const addSectionBtn = document.querySelector('.add-section-btn')
  if (addSectionBtn) {
    addSectionBtn.style.display = 'block'
  }
}

function disableSectionManagement() {
  // Remove section drag and drop listeners
  const sections = document.querySelectorAll('.section-container')
  sections.forEach(section => {
    section.removeEventListener('dragover', handleSectionDragOver)
    section.removeEventListener('drop', handleSectionDrop)
  })
  
  // Hide add section button
  const addSectionBtn = document.querySelector('.add-section-btn')
  if (addSectionBtn) {
    addSectionBtn.style.display = 'none'
  }
}

function enableDragAndDrop() {
  const buttons = document.querySelectorAll('.custom-flight-buttons a, .custom-flight-buttons button')
  
  buttons.forEach(button => {
    button.draggable = true
    button.addEventListener('dragstart', handleDragStart)
    button.addEventListener('dragend', handleDragEnd)
    button.addEventListener('dragover', handleDragOver)
    button.addEventListener('drop', handleDrop)
    button.addEventListener('dragenter', handleDragEnter)
    button.addEventListener('dragleave', handleDragLeave)
  })
  
  // Add drag and drop for section titles
  const sectionTitles = document.querySelectorAll('.section-title')
  sectionTitles.forEach(title => {
    title.addEventListener('dragover', handleDragOver)
    title.addEventListener('drop', handleDrop)
    title.addEventListener('dragenter', handleDragEnter)
    title.addEventListener('dragleave', handleDragLeave)
  })
}

function disableDragAndDrop() {
  const buttons = document.querySelectorAll('.custom-flight-buttons a, .custom-flight-buttons button')
  
  buttons.forEach(button => {
    button.draggable = false
    button.removeEventListener('dragstart', handleDragStart)
    button.removeEventListener('dragend', handleDragEnd)
    button.removeEventListener('dragover', handleDragOver)
    button.removeEventListener('drop', handleDrop)
    button.removeEventListener('dragenter', handleDragEnter)
    button.removeEventListener('dragleave', handleDragLeave)
    button.classList.remove('drag-over')
  })
  
  // Remove drag and drop for section titles
  const sectionTitles = document.querySelectorAll('.section-title')
  sectionTitles.forEach(title => {
    title.removeEventListener('dragover', handleDragOver)
    title.removeEventListener('drop', handleDrop)
    title.removeEventListener('dragenter', handleDragEnter)
    title.removeEventListener('dragleave', handleDragLeave)
    title.classList.remove('drag-over')
  })
}

function handleDragStart(e) {
  if (!isEditMode) return
  draggedElement = e.target
  e.target.classList.add('dragging')
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/html', e.target.outerHTML)
}

function handleDragEnd(e) {
  if (!isEditMode) return
  e.target.classList.remove('dragging')
  draggedElement = null
}

function handleDragOver(e) {
  if (!isEditMode) return
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

function handleDragEnter(e) {
  if (!isEditMode) return
  e.preventDefault()
  e.target.classList.add('drag-over')
}

function handleDragLeave(e) {
  if (!isEditMode) return
  e.target.classList.remove('drag-over')
}

function handleDrop(e) {
  if (!isEditMode) return
  e.preventDefault()
  e.target.classList.remove('drag-over')
  
  if (draggedElement && e.target !== draggedElement) {
    // Check if we're dropping on a section title (move to that section)
    if (e.target.classList.contains('section-title')) {
      const targetSection = e.target.closest('.section-container')
      const targetContainer = targetSection.querySelector('.custom-flight-buttons')
      if (targetContainer) {
        targetContainer.appendChild(draggedElement)
        saveButtonOrder()
        return
      }
    }
    
    // Check if we're dropping on a button
    const container = e.target.closest('.custom-flight-buttons')
    if (container) {
      // Insert the dragged element before the target element
      container.insertBefore(draggedElement, e.target)
      
      // Save the new order
      saveButtonOrder()
    }
  }
}

function saveButtonOrder() {
  saveSectionLayout()
}

function saveSectionLayout() {
  const sections = document.querySelectorAll('.section-container')
  const layout = {
    sections: [],
    buttonOrder: {}
  }
  
  sections.forEach((section, sectionIndex) => {
    const title = section.querySelector('.section-title').textContent
    const container = section.querySelector('.custom-flight-buttons')
    
    const buttons = Array.from(container.children).map(button => {
      // Create a unique identifier for each button type
      let buttonId = button.textContent.trim()
      
      // Add specific identifiers for different button types
      if (button.href) {
        if (button.href.includes('google.com/travel')) buttonId = 'google-flights'
        else if (button.href.includes('pointme.com')) buttonId = 'pointme'
        else if (button.href.includes('kayak.com')) buttonId = 'kayak'
        else if (button.href.includes('skyscanner.com')) buttonId = 'skyscanner'
        else if (button.href.includes('benefitsystems.io')) buttonId = 'benefitsystems-' + button.href.split('/').pop()
        else if (button.href.includes('hyatt.com')) buttonId = 'hyatt'
        else if (button.href.includes('hilton.com')) buttonId = 'hilton'
        else if (button.href.includes('marriott.com')) buttonId = 'marriott'
        else if (button.href.includes('ihg.com')) buttonId = 'ihg'
        else if (button.href.includes('accor.com')) buttonId = 'accor'
        else if (button.href.includes('wyndhamhotels.com')) buttonId = 'wyndham'
        else if (button.href.includes('choicehotels.com')) buttonId = 'choice'
        else if (button.href.includes('melia.com')) buttonId = 'melia'
        else if (button.href.includes('bestwestern.com')) buttonId = 'bestwestern'
        else if (button.href.includes('radisson.com')) buttonId = 'radisson'
        else if (button.href.includes('ghadiscovery.com')) buttonId = 'gha'
        else if (button.href.includes('biltrewards.com')) buttonId = 'bilt'
        else if (button.href.includes('rooms.aero')) buttonId = 'rooms'
      }
      
      return {
        id: buttonId,
        text: button.textContent.trim(),
        className: button.className,
        href: button.href || '',
        isButton: button.tagName === 'BUTTON'
      }
    })
    
    layout.sections.push({
      title: title,
      id: section.dataset.sectionId || `section_${sectionIndex}`,
      buttons: buttons
    })
  })
  
  localStorage.setItem('googleFlightsExtension_layout', JSON.stringify(layout))
  console.log('Section layout saved:', layout)
}

function loadButtonOrder() {
  return loadSectionLayout()
}

function loadSectionLayout() {
  const savedLayout = localStorage.getItem('googleFlightsExtension_layout')
  if (!savedLayout) return false
  
  try {
    const layout = JSON.parse(savedLayout)
    const mainContainer = document.querySelector('.custom-flight-buttons-container')
    
    if (!mainContainer || !layout.sections) return false
    
    // Clear existing sections
    mainContainer.innerHTML = ''
    
    // Recreate sections in saved order
    layout.sections.forEach(sectionData => {
      const section = createSectionContainer(sectionData.title, sectionData.id)
      const buttonsContainer = section.querySelector('.custom-flight-buttons')
      
      // Create a map of all existing buttons by their ID
      const allButtons = new Map()
      document.querySelectorAll('.custom-flight-buttons a, .custom-flight-buttons button').forEach(button => {
        let buttonId = button.textContent.trim()
        if (button.href) {
          if (button.href.includes('google.com/travel')) buttonId = 'google-flights'
          else if (button.href.includes('pointme.com')) buttonId = 'pointme'
          else if (button.href.includes('kayak.com')) buttonId = 'kayak'
          else if (button.href.includes('skyscanner.com')) buttonId = 'skyscanner'
          else if (button.href.includes('benefitsystems.io')) buttonId = 'benefitsystems-' + button.href.split('/').pop()
          else if (button.href.includes('hyatt.com')) buttonId = 'hyatt'
          else if (button.href.includes('hilton.com')) buttonId = 'hilton'
          else if (button.href.includes('marriott.com')) buttonId = 'marriott'
          else if (button.href.includes('ihg.com')) buttonId = 'ihg'
          else if (button.href.includes('accor.com')) buttonId = 'accor'
          else if (button.href.includes('wyndhamhotels.com')) buttonId = 'wyndham'
          else if (button.href.includes('choicehotels.com')) buttonId = 'choice'
          else if (button.href.includes('melia.com')) buttonId = 'melia'
          else if (button.href.includes('bestwestern.com')) buttonId = 'bestwestern'
          else if (button.href.includes('radisson.com')) buttonId = 'radisson'
          else if (button.href.includes('ghadiscovery.com')) buttonId = 'gha'
          else if (button.href.includes('biltrewards.com')) buttonId = 'bilt'
          else if (button.href.includes('rooms.aero')) buttonId = 'rooms'
        }
        allButtons.set(buttonId, button)
      })
      
      // Add buttons to this section in saved order
      sectionData.buttons.forEach(buttonData => {
        const existingButton = allButtons.get(buttonData.id)
        if (existingButton) {
          buttonsContainer.appendChild(existingButton)
        }
      })
      
      mainContainer.appendChild(section)
    })
    
    console.log('Section layout loaded successfully')
    return true
  } catch (error) {
    console.error('Error loading section layout:', error)
    return false
  }
}

// Add these helper functions for the AwardTool All +14 button
function getCurrentDateUnix() {
  return Math.floor(new Date().getTime() / 1000)
}

function getFutureDateUnix(daysInFuture) {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + daysInFuture)
  return Math.floor(futureDate.getTime() / 1000)
}

// Helper function to create an icon
function createIcon(iconName) {
  const iconSVG = getIconSVG(iconName)
  const iconContainer = document.createElement("span")
  iconContainer.className = "button-icon"
  iconContainer.innerHTML = iconSVG
  return iconContainer
}

// Function to get SVG for different icons
function getIconSVG(iconName) {
  const icons = {
    plane:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>',
    star: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    armchair:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 6v3"></path><path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z"></path><path d="M5 18v2"></path><path d="M19 18v2"></path></svg>',
    award:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>',
    sofa: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"></path><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z"></path><path d="M4 18v2"></path><path d="M20 18v2"></path><path d="M12 4v9"></path></svg>',
    compass:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>',
    flag: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" x2="4" y1="22" y2="15"></line></svg>',
    sailboat:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 18H2a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4Z"></path><path d="M21 18c-.6-5.8-3.8-10.6-8.5-12.8C7.8 3.2 4.6 8 4 18"></path><path d="M12 2v16"></path></svg>',
    search:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line></svg>',
    "refresh-cw":
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>',
    ticket:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>',
    network:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"></circle><polyline points="9 15 9 21"></polyline><polyline points="15 15 15 21"></polyline><line x1="9" y1="18" x2="15" y2="18"></line></svg>',
    "cloud-lightning":
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"></path><path d="m13 12-3 5h4l-3 5"></path></svg>',
    hotel:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"></path><path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16"></path><path d="M8 7h.01"></path><path d="M16 7h.01"></path><path d="M12 7h.01"></path><path d="M12 11h.01"></path><path d="M16 11h.01"></path><path d="M8 11h.01"></path><path d="M10 22v-6.5m4 0V22"></path></svg>',
    building:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></svg>',
    home: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
    "check-square":
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',
    sun: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>',
    crown:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>',
    circle:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>',
    hexagon:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>',
    landmark:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="22" y2="22"></line><line x1="6" x2="6" y1="18" y2="11"></line><line x1="10" x2="10" y1="18" y2="11"></line><line x1="14" x2="14" y1="18" y2="11"></line><line x1="18" x2="18" y1="18" y2="11"></line><polygon points="12 2 20 7 4 7"></polygon></svg>',
    globe:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" x2="22" y1="12" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
    // Additional icons for Benefitsystems tools
    calculator:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"></rect><line x1="8" x2="16" y1="6" y2="6"></line><line x1="16" x2="16" y1="14" y2="18"></line><path d="m16 10 4 4-4 4"></path><path d="M8 18v-4"></path><path d="M12 18v-4"></path></svg>',
    history:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M12 7v5l4 2"></path></svg>',
    "credit-card":
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>',
    percent:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="5" y1="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>',
    calendar:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>',
    "battery-charging":
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 7h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1"></path><path d="M9.5 10.5 12 8"></path><path d="m12 8 2.5 2.5"></path><path d="M12 8v8"></path><path d="M22 12h-2.5"></path></svg>',
    luggage:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2"></path><path d="M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14"></path><path d="M10 20h4"></path><circle cx="16" cy="20" r="2"></circle><circle cx="8" cy="20" r="2"></circle></svg>',
    "file-text":
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>',
    "currency-dollar":
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
    "dollar-sign":
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
    tag: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>',
    coffee:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2"></path><path d="M14 2v2"></path><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"></path><path d="M6 2v2"></path></svg>',
    zap: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>',
    layout:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="7" x="3" y="3" rx="1"></rect><rect width="9" height="7" x="3" y="14" rx="1"></rect><rect width="5" height="7" x="16" y="14" rx="1"></rect></svg>',
    eye: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    "shopping-cart":
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>',
    "trending-up":
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>',
    clock:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    "x-circle":
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>',
  }

  return icons[iconName] || ""
}

// Helper function to create a button that links to a URL
function createLinkButton(text, className, url, icon) {
  const button = document.createElement("a")
  if (icon) {
    button.appendChild(icon)
  }
  const textSpan = document.createElement("span")
  textSpan.textContent = text
  button.appendChild(textSpan)

  button.className = className
  button.href = url
  button.target = "_blank" // Open in new tab
  button.title = text // Add title attribute for tooltip on hover
  // Let CSS control layout and sizing

  // Add event listener to prevent the current page URL from changing
  button.addEventListener("click", (e) => {
    // This ensures the current page stays on the same URL
    e.preventDefault()
    window.open(url, "_blank")
  })

  return button
}

// Helper function to create a button with a click handler
function createButton(text, className, clickHandler, icon) {
  const button = document.createElement("button")
  if (icon) {
    button.appendChild(icon)
  }
  const textSpan = document.createElement("span")
  textSpan.textContent = text
  button.appendChild(textSpan)

  button.className = className
  button.title = text // Add title attribute for tooltip on hover
  // Let CSS control layout and sizing
  button.addEventListener("click", clickHandler)
  return button
}

// Replace the promptAndOpenGoogleFlights function with this updated version that makes the departure date prompt more clear:

function promptAndOpenGoogleFlights(defaultParams) {
  // Prompt for each variable
  const departure = prompt("Enter departure airport code:", defaultParams.departure)
  if (!departure) return // User cancelled

  const arrival = prompt("Enter arrival airport code:", defaultParams.arrival)
  if (!arrival) return // User cancelled

  // Prompt for trip type
  const tripTypeOptions = ["oneway", "roundtrip"]
  const tripType = prompt("Enter trip type (oneway or roundtrip):", defaultParams.tripType || "oneway")
  if (!tripType || !tripTypeOptions.includes(tripType.toLowerCase())) return // User cancelled or invalid input

  // Format today's date as YYYY-MM-DD for default if needed
  const today = new Date().toISOString().split("T")[0]

  // Prompt for departure date with clear label
  const formattedDepartDate = prompt("Enter DEPARTURE date (YYYY-MM-DD):", defaultParams.date || today)
  if (!formattedDepartDate) return // User cancelled

  // If roundtrip, prompt for return date
  let formattedReturnDate = ""
  if (tripType.toLowerCase() === "roundtrip") {
    // Default return date is 7 days after departure
    const defaultReturnDate = new Date(formattedDepartDate)
    defaultReturnDate.setDate(defaultReturnDate.getDate() + 7)
    const defaultReturnDateStr = defaultReturnDate.toISOString().split("T")[0]

    formattedReturnDate = prompt("Enter RETURN date (YYYY-MM-DD):", defaultReturnDateStr)
    if (!formattedReturnDate) return // User cancelled
  }

  const cabin = prompt("Enter cabin class (first, business, premium_economy, economy):", defaultParams.cabin)
  if (!cabin) return // User cancelled

  // Generate and open the URL
  let url = ""
  if (tripType.toLowerCase() === "oneway") {
    url = `https://www.google.com/travel/flights/search?q=flights+from+${departure}+to+${arrival}+oneway+on+${formattedDepartDate}+in+${cabin.toLowerCase()}+class&hl=en-US&curr=USD&gl=US`
  } else {
    url = `https://www.google.com/travel/flights/search?q=flights+from+${departure}+to+${arrival}+${formattedDepartDate}+to+${formattedReturnDate}+in+${cabin.toLowerCase()}+class&hl=en-US&curr=USD&gl=US`
  }

  // Open in current tab instead of a new tab
  window.location.href = url
}

// Function to prompt for airline and flight number and open PointsYeah Seatmap
function promptAndOpenPointsYeahSeatmap(defaultParams) {
  // Prompt for airline code
  const airlineCode = prompt("Enter airline code (e.g., AA, UA, DL):", defaultParams.airline || "")
  if (!airlineCode) return // User cancelled

  // Prompt for flight number
  const flightNumber = prompt("Enter flight number:", defaultParams.flightNumber || "")
  if (!flightNumber) return // User cancelled

  // Create the cabins string
  const cabinsArray = ["Economy", "Premium Economy", "Business", "First"]
  const cabinsString = encodeURIComponent(cabinsArray.join(","))

  // Format date
  const formattedDate = defaultParams.date

  // Generate and open the URL
  const url = `https://www.pointsyeah.com/seatmap/detail?airline=${airlineCode.toUpperCase()}&departure=${defaultParams.departure}&arrival=${defaultParams.arrival}&date=${formattedDate}&flightNumber=${flightNumber}&cabins=${cabinsString}`
  window.open(url, "_blank")
}

// Function to prompt for airline and flight number and open Seats.aero Seatmap
function promptAndOpenSeatsAeroSeatmap(defaultParams) {
  // Prompt for airline code
  const airlineCode = prompt("Enter airline code (e.g., AA, UA, DL):", defaultParams.airline || "")
  if (!airlineCode) return // User cancelled

  // Prompt for flight number
  const flightNumber = prompt("Enter flight number:", defaultParams.flightNumber || "")
  if (!flightNumber) return // User cancelled

  // Format date
  const formattedDate = defaultParams.date

  // Generate and open the URL
  const url = `https://seats.aero/seatmap?airline=${airlineCode.toUpperCase()}&from=${defaultParams.departure}&to=${defaultParams.arrival}&date=${formattedDate}&flight=${flightNumber}`
  window.open(url, "_blank")
}

// Function to prompt for city and open Hilton hotel search
function promptAndOpenHilton(defaultParams) {
  // Prompt for city name with example
  const city = prompt("Enter city name for hotel search (e.g., Chicago):", "")
  if (!city) return // User cancelled

  // Get dates from flight parameters
  const arrivalDate = defaultParams.date || new Date().toISOString().split("T")[0]
  let departureDate = ""

  // If we have a roundtrip, use the return date as departure date
  if (defaultParams.tripType && defaultParams.tripType.toLowerCase() === "roundtrip") {
    // Try to extract return date from URL
    const urlObj = new URL(window.location.href)
    const searchParams = urlObj.searchParams
    const query = searchParams.get("q") || ""

    // Look for date range pattern in query
    const dateRangeMatch = query.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
    if (dateRangeMatch && dateRangeMatch[2]) {
      departureDate = dateRangeMatch[2]
    }
  }

  // If no departure date was found, set it to the day after arrival
  if (!departureDate) {
    const nextDay = new Date(arrivalDate)
    nextDay.setDate(nextDay.getDate() + 1)
    departureDate = nextDay.toISOString().split("T")[0]
  }

  // Generate and open the URL
  const url = `https://www.hilton.com/en/search/?query=${encodeURIComponent(city)}&arrivalDate=${arrivalDate}&departureDate=${departureDate}&flexibleDates=false&numRooms=1&numAdults=2&numChildren=0&room1ChildAges=&room1AdultAges=`
  window.open(url, "_blank")
}

// Update the promptAndOpenHyatt function
function promptAndOpenHyatt(defaultParams) {
  // Prompt for city name with example
  const city = prompt("Enter city name for hotel search (e.g., San Francisco):", "")
  if (!city) return // User cancelled

  // Get dates from flight parameters
  const arrivalDate = defaultParams.date || new Date().toISOString().split("T")[0]
  let departureDate = ""

  // If we have a roundtrip, use the return date as departure date
  if (defaultParams.tripType && defaultParams.tripType.toLowerCase() === "roundtrip") {
    // Try to extract return date from URL
    const urlObj = new URL(window.location.href)
    const searchParams = urlObj.searchParams
    const query = searchParams.get("q") || ""

    // Look for date range pattern in query
    const dateRangeMatch = query.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
    if (dateRangeMatch && dateRangeMatch[2]) {
      departureDate = dateRangeMatch[2]
    }
  }

  // If no departure date was found, set it to the day after arrival
  if (!departureDate) {
    const nextDay = new Date(arrivalDate)
    nextDay.setDate(nextDay.getDate() + 1)
    departureDate = nextDay.toISOString().split("T")[0]
  }

  // Generate and open the URL
  const url = `https://www.hyatt.com/search/hotels/en-US/${encodeURIComponent(city)}?checkinDate=${arrivalDate}&checkoutDate=${departureDate}&rooms=1&adults=2&kids=0&rate=Standard`
  window.open(url, "_blank")
}

// Update the promptAndOpenGHA function
function promptAndOpenGHA(defaultParams) {
  // Prompt for city name with example
  const city = prompt("Enter city name for hotel search (e.g., London):", "")
  if (!city) return // User cancelled

  // Generate and open the URL
  const url = `https://de.ghadiscovery.com/search/hotels?keyword=${encodeURIComponent(city)}&clearBookingParams=1&clearHotelSearchParams=1`
  window.open(url, "_blank")
}

// Update the promptAndOpenAccor function
function promptAndOpenAccor(defaultParams) {
  // Prompt for city name with example
  const city = prompt("Enter city name for hotel search (e.g., Paris):", "")
  if (!city) return // User cancelled

  // Get dates from flight parameters
  const arrivalDate = defaultParams.date || new Date().toISOString().split("T")[0]
  let departureDate = ""

  // If we have a roundtrip, use the return date as departure date
  if (defaultParams.tripType && defaultParams.tripType.toLowerCase() === "roundtrip") {
    // Try to extract return date from URL
    const urlObj = new URL(window.location.href)
    const searchParams = urlObj.searchParams
    const query = searchParams.get("q") || ""

    // Look for date range pattern in query
    const dateRangeMatch = query.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
    if (dateRangeMatch && dateRangeMatch[2]) {
      departureDate = dateRangeMatch[2]
    }
  }

  // If no departure date was found, set it to the day after arrival
  if (!departureDate) {
    const nextDay = new Date(arrivalDate)
    nextDay.setDate(nextDay.getDate() + 1)
    departureDate = nextDay.toISOString().split("T")[0]
  }

  // Generate and open the URL
  const url = `https://all.accor.com/booking/en/accor/hotels/${encodeURIComponent(city)}?compositions=2&stayplus=true&snu=false&hideWDR=false&productCode=null&accessibleRooms=false&hideHotelDetails=true&sortBy=PRICE_LOW_TO_HIGH&filters=eyJhdmFpbGFiaWxpdHkiOlsiQVZBSUxBQkxFIl0sImxveWFsdHkiOlsiTUVNQkVSX1JBVEUiLCJQQVJUSUNJUEFUSU5HX0hPVEVMIl19`
  window.open(url, "_blank")
}

// Update the promptAndOpenWyndham function to not prompt for city
function promptAndOpenWyndham(defaultParams) {
  // Use a default city
  const city = "New York"

  // Get dates from flight parameters
  const arrivalDate = defaultParams.date || new Date().toISOString().split("T")[0]
  let departureDate = ""

  // If we have a roundtrip, use the return date as departure date
  if (defaultParams.tripType && defaultParams.tripType.toLowerCase() === "roundtrip") {
    // Try to extract return date from URL
    const urlObj = new URL(window.location.href)
    const searchParams = urlObj.searchParams
    const query = searchParams.get("q") || ""

    // Look for date range pattern in query
    const dateRangeMatch = query.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
    if (dateRangeMatch && dateRangeMatch[2]) {
      departureDate = dateRangeMatch[2]
    }
  }

  // If no departure date was found, set it to the day after arrival
  if (!departureDate) {
    const nextDay = new Date(arrivalDate)
    nextDay.setDate(nextDay.getDate() + 1)
    departureDate = nextDay.toISOString().split("T")[0]
  }

  // Format dates for Wyndham (MM/DD/YYYY)
  const formatDateForWyndham = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  }

  const formattedArrivalDate = formatDateForWyndham(arrivalDate)
  const formattedDepartureDate = formatDateForWyndham(departureDate)

  // Generate and open the URL
  const url = `https://www.wyndhamhotels.com/de-de/hotels/${encodeURIComponent(city)}?brand_id=ALL&checkInDate=${arrivalDate}&checkOutDate=${departureDate}&useWRPoints=true&children=0&adults=2&rooms=1`
  window.open(url, "_blank")
}

// Update the promptAndOpenChoice function to not prompt for city
function promptAndOpenChoice(defaultParams) {
  // Use a default city
  const city = "New York"

  // Get dates from flight parameters
  const arrivalDate = defaultParams.date || new Date().toISOString().split("T")[0]
  let departureDate = ""

  // If we have a roundtrip, use the return date as departure date
  if (defaultParams.tripType && defaultParams.tripType.toLowerCase() === "roundtrip") {
    // Try to extract return date from URL
    const urlObj = new URL(window.location.href)
    const searchParams = urlObj.searchParams
    const query = searchParams.get("q") || ""

    // Look for date range pattern in query
    const dateRangeMatch = query.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
    if (dateRangeMatch && dateRangeMatch[2]) {
      departureDate = dateRangeMatch[2]
    }
  }

  // If no departure date was found, set it to the day after arrival
  if (!departureDate) {
    const nextDay = new Date(arrivalDate)
    nextDay.setDate(nextDay.getDate() + 1)
    departureDate = nextDay.toISOString().split("T")[0]
  }

  // Format dates for Choice Hotels (MM/DD/YYYY)
  const formatDateForChoice = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  }

  const formattedArrivalDate = formatDateForChoice(arrivalDate)
  const formattedDepartureDate = formatDateForChoice(departureDate)

  // Generate and open the URL
  const url = `https://www.choicehotels.com/de-de/${encodeURIComponent(city)}/hotels?checkInDate=${arrivalDate}&checkOutDate=${departureDate}`
  window.open(url, "_blank")
}

// Update the promptAndOpenMelia function to not prompt for city
function promptAndOpenMelia(defaultParams) {
  // Use a default city
  const city = "Madrid"

  // Get dates from flight parameters
  const arrivalDate = defaultParams.date || new Date().toISOString().split("T")[0]
  let departureDate = ""

  // If we have a roundtrip, use the return date as departure date
  if (defaultParams.tripType && defaultParams.tripType.toLowerCase() === "roundtrip") {
    // Try to extract return date from URL
    const urlObj = new URL(window.location.href)
    const searchParams = urlObj.searchParams
    const query = searchParams.get("q") || ""

    // Look for date range pattern in query
    const dateRangeMatch = query.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
    if (dateRangeMatch && dateRangeMatch[2]) {
      departureDate = dateRangeMatch[2]
    }
  }

  // If no departure date was found, set it to the day after arrival
  if (!departureDate) {
    const nextDay = new Date(arrivalDate)
    nextDay.setDate(nextDay.getDate() + 1)
    departureDate = nextDay.toISOString().split("T")[0]
  }

  // Generate and open the URL
  const url = `https://www.melia.com/en/hotels/search/${encodeURIComponent(city)}?checkIn=${arrivalDate}&checkOut=${departureDate}&adults=2&children=0&rooms=1`
  window.open(url, "_blank")
}

// Update the promptAndOpenBestWestern function to not prompt for city
function promptAndOpenBestWestern(defaultParams) {
  // Use a default city
  const city = "Phoenix"

  // Get dates from flight parameters
  const arrivalDate = defaultParams.date || new Date().toISOString().split("T")[0]
  let departureDate = ""

  // If we have a roundtrip, use the return date as departure date
  if (defaultParams.tripType && defaultParams.tripType.toLowerCase() === "roundtrip") {
    // Try to extract return date from URL
    const urlObj = new URL(window.location.href)
    const searchParams = urlObj.searchParams
    const query = searchParams.get("q") || ""

    // Look for date range pattern in query
    const dateRangeMatch = query.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
    if (dateRangeMatch && dateRangeMatch[2]) {
      departureDate = dateRangeMatch[2]
    }
  }

  // If no departure date was found, set it to the day after arrival
  if (!departureDate) {
    const nextDay = new Date(arrivalDate)
    nextDay.setDate(nextDay.getDate() + 1)
    departureDate = nextDay.toISOString().split("T")[0]
  }

  // Format dates for BestWestern (MM/DD/YYYY)
  const formatDateForBW = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  }

  const formattedArrivalDate = formatDateForBW(arrivalDate)
  const formattedDepartureDate = formatDateForBW(departureDate)

  // Generate and open the URL
  const url = `https://www.bestwestern.com/en_US/book/hotel-search.html?searchTerm=${encodeURIComponent(city)}&arrivalDate=${formattedArrivalDate}&departureDate=${formattedDepartureDate}&numAdults=2&numChildren=0&numRooms=1`
  window.open(url, "_blank")
}

// Update the promptAndOpenRadisson function to not prompt for city
function promptAndOpenRadisson(defaultParams) {
  // Use a default city
  const city = "Brussels"

  // Get dates from flight parameters
  const arrivalDate = defaultParams.date || new Date().toISOString().split("T")[0]
  let departureDate = ""

  // If we have a roundtrip, use the return date as departure date
  if (defaultParams.tripType && defaultParams.tripType.toLowerCase() === "roundtrip") {
    // Try to extract return date from URL
    const urlObj = new URL(window.location.href)
    const searchParams = urlObj.searchParams
    const query = searchParams.get("q") || ""

    // Look for date range pattern in query
    const dateRangeMatch = query.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
    if (dateRangeMatch && dateRangeMatch[2]) {
      departureDate = dateRangeMatch[2]
    }
  }

  // If no departure date was found, set it to the day after arrival
  if (!departureDate) {
    const nextDay = new Date(arrivalDate)
    nextDay.setDate(nextDay.getDate() + 1)
    departureDate = nextDay.toISOString().split("T")[0]
  }

  // Generate and open the URL
  const url = `https://www.radissonhotels.com/en-us/search/${encodeURIComponent(city)}?checkInDate=${arrivalDate}&checkOutDate=${departureDate}&adults=2&children=0&searchType=city`
  window.open(url, "_blank")
}

// Update the promptAndOpenIHG function to not prompt for city
function promptAndOpenIHG(defaultParams) {
  // Use a default city
  const city = "Atlanta"

  // Get dates from flight parameters
  const arrivalDate = defaultParams.date || new Date().toISOString().split("T")[0]
  let departureDate = ""

  // If we have a roundtrip, use the return date as departure date
  if (defaultParams.tripType && defaultParams.tripType.toLowerCase() === "roundtrip") {
    // Try to extract return date from URL
    const urlObj = new URL(window.location.href)
    const searchParams = urlObj.searchParams
    const query = searchParams.get("q") || ""

    // Look for date range pattern in query
    const dateRangeMatch = query.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
    if (dateRangeMatch && dateRangeMatch[2]) {
      departureDate = dateRangeMatch[2]
    }
  }

  // If no departure date was found, set it to the day after arrival
  if (!departureDate) {
    const nextDay = new Date(arrivalDate)
    nextDay.setDate(nextDay.getDate() + 1)
    departureDate = nextDay.toISOString().split("T")[0]
  }

  // Format dates for IHG (custom format)
  const checkInDay = arrivalDate.split("-")[2]
  const checkOutDay = departureDate.split("-")[2]
  const checkInMonthYear = arrivalDate.split("-")[1] + arrivalDate.split("-")[0]
  const checkOutMonthYear = departureDate.split("-")[1] + departureDate.split("-")[0]

  // Generate and open the URL
  const url = `https://www.ihg.com/hotels/us/en/find-hotels/hotel-search?qDest=${encodeURIComponent(city)}&qPt=POINTS&qCiD=${checkInDay}&qCoD=${checkOutDay}&qCiMy=${checkInMonthYear}&qCoMy=${checkOutMonthYear}&qAdlt=2&qChld=0&qRms=1&qRtP=IVANI&qAkamaiCC=PL&srb_u=1&qExpndSrch=false&qSrt=sRT&qBrs=6c.hi.ex.sb.ul.ic.cp.cw.in.vn.cv.rs.ki.kd.ma.sp.va.sp.re.vx.nd.sx.we.lx.rn.sn.sn.sn.sn.sn.nu.ge&qWch=0&qSmP=0&qRad=30&qRdU=mi&setPMCookies=true&qpMbw=0&qErm=false&qpMn=1&qLoSe=false`
  window.open(url, "_blank")
}

// Update the promptAndOpenMarriott function to not prompt for city
function promptAndOpenMarriott(defaultParams) {
  // Use a default city
  const city = "Miami"

  // Get dates from flight parameters
  const arrivalDate = defaultParams.date || new Date().toISOString().split("T")[0]
  let departureDate = ""

  // If we have a roundtrip, use the return date as departure date
  if (defaultParams.tripType && defaultParams.tripType.toLowerCase() === "roundtrip") {
    // Try to extract return date from URL
    const urlObj = new URL(window.location.href)
    const searchParams = urlObj.searchParams
    const query = searchParams.get("q") || ""

    // Look for date range pattern in query
    const dateRangeMatch = query.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
    if (dateRangeMatch && dateRangeMatch[2]) {
      departureDate = dateRangeMatch[2]
    }
  }

  // If no departure date was found, set it to the day after arrival
  if (!departureDate) {
    const nextDay = new Date(arrivalDate)
    nextDay.setDate(nextDay.getDate() + 1)
    departureDate = nextDay.toISOString().split("T")[0]
  }

  // Calculate nights
  const arrivalDateObj = new Date(arrivalDate)
  const departureDateObj = new Date(departureDate)
  const calculatedNights = Math.ceil((departureDateObj - arrivalDateObj) / (1000 * 60 * 60 * 24))

  // Format dates for Marriott (MM/DD/YYYY)
  const formatDateForMarriott = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  }

  const checkInFormatted = formatDateForMarriott(arrivalDate)
  const checkOutFormatted = formatDateForMarriott(departureDate)

  // Generate and open the URL
  const url = `https://www.marriott.com/de/search/findHotels.mi?fromToDate_submit=${departureDate}&fromDate=${checkInFormatted}&toDate=${checkOutFormatted}&toDateDefaultFormat=${departureDate}&fromDateDefaultFormat=${arrivalDate}&flexibleDateSearch=false&t-start=${arrivalDate}&t-end=${departureDate}&lengthOfStay=${calculatedNights}&childrenCountBox=0+Children+Per+Room&childrenCount=0&clusterCode=none&isAdvanceSearch=true&recordsPerPage=100&isInternalSearch=true&vsInitialRequest=false&searchType=InCity&singleSearchAutoSuggest=Unmatched&collapseAccordian=is-true&singleSearch=true&isTransient=true&initialRequest=true&flexibleDateSearchRateDisplay=true&isSearch=true&isRateCalendar=true&destinationAddress.destination=${encodeURIComponent(city)}&isHideFlexibleDateCalendar=true&roomCountBox=1+Room&roomCount=1&guestCountBox=2+Adult+Per+Room&numAdultsPerRoom=2&deviceType=desktop-web&view=list&fromToDate=${checkInFormatted}&isFlexibleDatesOptionSelected=false&numberOfRooms=1&useRewardsPoints=true`
  window.open(url, "_blank")
}

// Update the promptAndOpenGoogleHotels function
function promptAndOpenGoogleHotels() {
  // Prompt for city name with example
  const city = prompt("Enter city name for hotel search (e.g., New York):", "")
  if (!city) return // User cancelled

  // Generate and open the URL
  const url = `https://www.google.com/travel/search?q=${encodeURIComponent(city)}`
  window.open(url, "_blank")
}

// New promptAndOpenBilt function for Bilt Rewards hotel search
function promptAndOpenBilt(defaultParams) {
  // Prompt for city name with example
  const city = prompt("Enter city name for hotel search (e.g., New York):", "")
  if (!city) return // User cancelled

  // Get dates from flight parameters
  const arrivalDate = defaultParams.date || new Date().toISOString().split("T")[0]
  let departureDate = ""

  // If we have a roundtrip, use the return date as departure date
  if (defaultParams.tripType && defaultParams.tripType.toLowerCase() === "roundtrip") {
    // Try to extract return date from URL
    const urlObj = new URL(window.location.href)
    const searchParams = urlObj.searchParams
    const query = searchParams.get("q") || ""

    // Look for date range pattern in query
    const dateRangeMatch = query.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
    if (dateRangeMatch && dateRangeMatch[2]) {
      departureDate = dateRangeMatch[2]
    }
  }

  // If no departure date was found, set it to the day after arrival
  if (!departureDate) {
    const nextDay = new Date(arrivalDate)
    nextDay.setDate(nextDay.getDate() + 1)
    departureDate = nextDay.toISOString().split("T")[0]
  }

  // Generate and open the URL
  const url = `https://www.biltrewards.com/rewards/travel/hotel-search?checkInDate=${arrivalDate}&checkOutDate=${departureDate}&numGuestAdults=2&childrenAges=&numRooms=1`
  window.open(url, "_blank")
}

// New promptAndOpenRooms function for Rooms.aero hotel search
function promptAndOpenRooms(defaultParams) {
  // Prompt for city name with example
  const city = prompt("Enter city name for hotel search (e.g., New York):", "")
  if (!city) return // User cancelled

  // Get dates from flight parameters
  const arrivalDate = defaultParams.date || new Date().toISOString().split("T")[0]
  let departureDate = ""

  // If we have a roundtrip, use the return date as departure date
  if (defaultParams.tripType && defaultParams.tripType.toLowerCase() === "roundtrip") {
    // Try to extract return date from URL
    const urlObj = new URL(window.location.href)
    const searchParams = urlObj.searchParams
    const query = searchParams.get("q") || ""

    // Look for date range pattern in query
    const dateRangeMatch = query.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
    if (dateRangeMatch && dateRangeMatch[2]) {
      departureDate = dateRangeMatch[2]
    }
  }

  // If no departure date was found, set it to the day after arrival
  if (!departureDate) {
    const nextDay = new Date(arrivalDate)
    nextDay.setDate(nextDay.getDate() + 1)
    departureDate = nextDay.toISOString().split("T")[0]
  }

  // Calculate nights
  const arrivalDateObj = new Date(arrivalDate)
  const departureDateObj = new Date(departureDate)
  const calculatedNights = Math.ceil((departureDateObj - arrivalDateObj) / (1000 * 60 * 60 * 24))

  // Generate and open the URL
  const url = `https://rooms.aero/search?city=${encodeURIComponent(city)}&start=${arrivalDate}&end=${departureDate}&nights=${calculatedNights}`
  window.open(url, "_blank")
}

// Function to parse flight information from Google Flights URL
function parseFlightInfoFromUrl(url) {
  const urlObj = new URL(url)
  const searchParams = urlObj.searchParams
  const query = searchParams.get("q") || ""

  // Default values
  const result = {
    departure: "",
    arrival: "",
    date: "",
    cabin: "Economy",
    adults: 1,
    children: 0,
    tripType: "oneway",
    airline: "",
    flightNumber: "",
  }

  // Extract information from query
  if (query) {
    // Extract airports
    const fromMatch = query.match(/flights\s+from\s+([A-Z]{3})\s+to\s+([A-Z]{3})/)
    if (fromMatch) {
      result.departure = fromMatch[1]
      result.arrival = fromMatch[2]
    }

    // Extract date
    const dateMatch = query.match(/on\s+(\d{4}-\d{2}-\d{2})/)
    if (dateMatch) {
      result.date = dateMatch[1]
    }

    // Extract cabin class
    if (query.includes("in first class")) {
      result.cabin = "First"
    } else if (query.includes("in business class")) {
      result.cabin = "Business"
    } else if (query.includes("in premium economy")) {
      result.cabin = "Premium Economy"
    } else if (query.includes("in economy class")) {
      result.cabin = "Economy"
    }

    // Extract trip type
    if (query.includes("oneway")) {
      result.tripType = "oneway"
    } else if (query.includes("roundtrip")) {
      result.tripType = "roundtrip"
    }

    // Try to extract number of adults
    const adultsMatch = query.match(/(\d+)\s+adults?/)
    if (adultsMatch) {
      result.adults = Number.parseInt(adultsMatch[1], 10)
    }

    // Try to extract number of children
    const childrenMatch = query.match(/(\d+)\s+children?/)
    if (childrenMatch) {
      result.children = Number.parseInt(childrenMatch[1], 10)
    }
  }

  return result
}

// Add these helper functions for the AwardTool All +14 button
// Function to generate all URLs
function generateAllUrls(params) {
  // If we don't have the required parameters, return empty URLs for the second row
  if (!params.departure || !params.arrival || !params.date) {
    return {
      pointsYeah: "#",
      pointsYeahSeatmap: "#",
      awardtool: "#",
      seatsaero: "#",
      pointme: "#",
      airCanada: "#",
      kayak: "#",
      flightconnections: "#",
      skyscanner: "#",
      fareClass: "#",
      turbli: "#",
    }
  }

  // Format date for Flight Connections (YYYY-MM-DD)
  const formattedDate = params.date
  const timestamp = Math.floor(new Date(params.date).getTime() / 1000)

  // Format cabin class for Skyscanner
  const skyscannerCabin = params.cabin.toLowerCase().replace(/\s+/g, "")

  // Format cabin for PointsYeah
  const pointsYeahCabin =
    params.cabin === "Economy"
      ? "Economy"
      : params.cabin === "Premium Economy"
        ? "Premium Economy"
        : params.cabin === "Business"
          ? "Business"
          : "First"

  // Format cabin for seats.aero
  const seatsAeroCabin =
    params.cabin === "Economy"
      ? "economy"
      : params.cabin === "Premium Economy"
        ? "premium"
        : params.cabin === "Business"
          ? "business"
          : "first"

  // Create the cabins string for PointsYeah
  const cabinsArray = ["Economy", "Premium Economy", "Business", "First"]
  const cabinsString = encodeURIComponent(cabinsArray.join(","))

  // Format date for Skyscanner (YYYYMMDD)
  const skyscannerDate = formattedDate.replace(/-/g, "")

  // Ensure airline code is uppercase
  const airlineCode = params.airline ? params.airline.toUpperCase() : ""

  // Generate timestamp for Point.me
  const searchTimestamp = Date.now()

  // Calculate a default return date (7 days after departure) for roundtrip searches
  const returnDate = new Date(formattedDate)
  returnDate.setDate(returnDate.getDate() + 7)
  const formattedReturnDate = returnDate.toISOString().split("T")[0]

  // Generate PointsYeah URL based on trip type
  let pointsYeahUrl = ""
  if (params.tripType.toLowerCase() === "roundtrip") {
    // For roundtrip, use tripType=2 and include return date parameters
    pointsYeahUrl = `https://www.pointsyeah.com/search?cabins=${pointsYeahCabin}&tripType=2&adults=${params.adults}&children=${params.children || 0}&departure=${params.departure}&arrival=${params.arrival}&departDate=${formattedDate}&departDateSec=${formattedDate}&returnDate=${formattedReturnDate}&returnDateSec=${formattedReturnDate}&multiday=false&bankpromotion=false&pointpromotion=false`
  } else {
    // For one-way, use tripType=1
    pointsYeahUrl = `https://www.pointsyeah.com/search?cabins=${pointsYeahCabin}&tripType=1&adults=${params.adults}&children=${params.children || 0}&departure=${params.departure}&arrival=${params.arrival}&departDate=${formattedDate}&departDateSec=${formattedDate}&multiday=false&bankpromotion=false&pointpromotion=false`
  }

  // Format cabin for Rovemiles
  const rovemilesCabin =
    params.cabin === "Economy"
      ? "economy"
      : params.cabin === "Premium Economy"
        ? "premium_economy"
        : params.cabin === "Business"
          ? "business"
          : "first"

  // Format cabin for seats.aero fares
  const seatsAeroFaresCabin =
    params.cabin === "Economy"
      ? "economy"
      : params.cabin === "Premium Economy"
        ? "premium"
        : params.cabin === "Business"
          ? "business"
          : "first"

  return {
    pointsYeah: pointsYeahUrl,

    pointsYeahSeatmap:
      params.airline && params.flightNumber
        ? `https://www.pointsyeah.com/seatmap/detail?airline=${airlineCode}&departure=${params.departure}&arrival=${params.arrival}&date=${formattedDate}&flightNumber=${params.flightNumber}&cabins=${cabinsString}`
        : "#",

    awardtool: `https://www.awardtool.com/flight?flightWay=${params.tripType.toLowerCase()}&pax=${params.adults}&children=${params.children || 0}&cabins=${params.cabin}&range=true&rangeV2=false&from=${params.departure}&to=${params.arrival}&programs=&targetId=&oneWayRangeStartDate=${timestamp}&oneWayRangeEndDate=${timestamp}`,

    seatsaero: `https://seats.aero/search?min_seats=${params.adults}&applicable_cabin=${seatsAeroCabin}&additional_days=true&additional_days_num=7&max_fees=40000&date=${formattedDate}&origins=${params.departure}&destinations=${params.arrival}`,

    pointme: `https://point.me/results?departureCity=${params.departure}&departureIata=${params.departure}&arrivalCity=${params.arrival}&arrivalIata=${params.arrival}&legType=${params.tripType.toLowerCase()}&classOfService=${params.cabin.toLowerCase()}&passengers=${params.adults}&pid=&departureDate=${formattedDate}&arrivalDate=${params.tripType.toLowerCase() === "roundtrip" ? formattedReturnDate : ""}&mode=&searchInit=${searchTimestamp}&fsrRequestId=${Math.floor(Math.random() * 100000000)}&searchKey=${crypto.randomUUID()}&userSearchRequestId=${crypto.randomUUID()}&directionality=outbound`,

    airCanada: `https://www.aircanada.com/aeroplan/redeem/availability/outbound?org0=${params.departure}&dest0=${params.arrival}&departureDate0=${formattedDate}&ADT=${params.adults}&YTH=0&CHD=0&INF=0&INS=0&lang=en-CA&tripType=${params.tripType.toLowerCase() === "roundtrip" ? "R" : "O"}&marketCode=INT`,

    kayak: `https://www.kayak.com/flights/${params.departure}-${params.arrival}/${formattedDate}${params.tripType.toLowerCase() === "roundtrip" ? "/" + formattedReturnDate : ""}/${params.adults}adults?sort=bestflight_a`,

    // URLs for second row buttons
    fareClass: `https://seats.aero/fareclass?from=${params.departure}&to=${params.arrival}&date=${formattedDate}&carriers=&connections=false`,

    flightconnections: `https://www.flightconnections.com/flights-from-${params.departure.toLowerCase()}-to-${params.arrival.toLowerCase()}`,

    turbli: `https://turbli.com/${params.departure}/${params.arrival}/${formattedDate}/`,

    skyscanner: `https://www.skyscanner.com/transport/flights/${params.departure.toLowerCase()}/${params.arrival.toLowerCase()}/${skyscannerDate}/${params.tripType.toLowerCase() === "roundtrip" ? formattedReturnDate.replace(/-/g, "") : ""}?adults=${params.adults}&cabinclass=${skyscannerCabin}&currency=USD&locale=en-US&market=US&preferdirects=false&previousCultureSource=GEO_LOCATION&redirectedFrom=www.skyscanner.com&rtn=${params.tripType.toLowerCase() === "roundtrip" ? "1" : "0"}`,

    rovemiles: `https://www.rovemiles.com/search/flights?origin=${params.departure}&destination=${params.arrival}&cabin=${rovemilesCabin}&adults=${params.adults}&children=${params.children || 0}&infants=0&payment=miles&start_date=${formattedDate}`,

    seatsAeroFares: `https://seats.aero/fares?from=${params.departure}&to=${params.arrival}&date=${formattedDate}&carriers=${airlineCode || ""}&currency=USD&cabin=${seatsAeroFaresCabin}`,

    seatsAeroSeatmap:
      params.airline && params.flightNumber
        ? `https://seats.aero/seatmap?airline=${airlineCode}&from=${params.departure}&to=${params.arrival}&date=${formattedDate}&flight=${params.flightNumber}`
        : "#",

    awardtoolAllPlus14: `https://www.awardtool.com/deals/flight?from=ANW_1&to=ANW_1&startDate=${getCurrentDateUnix()}&endDate=${getFutureDateUnix(14)}`,
  }
}

// Intercept navigation events to prevent URL changes
function setupNavigationInterception() {
  // Store the original URL when the extension first loads
  window.originalGoogleFlightsUrl = window.location.href

  // Listen for history changes
  let lastUrl = window.location.href
  new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href
      // Re-inject buttons when URL changes
      injectButtons()
    }
  }).observe(document, { subtree: true, childList: true })
}

// Run the initial setup
setupNavigationInterception()

// Run the injection function initially
injectButtons()

// Set up a mutation observer to handle dynamically loaded content
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
