// Function to inject buttons into flight elements
function injectButtons() {
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
    flightRowContainer2.className = "custom-flight-buttons"

    // Create hotel row containers
    const hotelRowContainer1 = document.createElement("div")
    hotelRowContainer1.className = "custom-flight-buttons second-row"

    const hotelRowContainer2 = document.createElement("div")
    hotelRowContainer2.className = "custom-flight-buttons"

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
    const seatsAeroBtn = createLinkButton("Seats.aero", "seats-aero-btn", urls.seatsaero, createIcon("sofa"))
    const airCanadaBtn = createLinkButton("Air Canada", "air-canada-btn", urls.airCanada, createIcon("flag"))

    // Create flight buttons - second row
    const pointMeBtn = createLinkButton("Point.me", "point-me-btn", urls.pointme, createIcon("compass"))
    const kayakBtn = createLinkButton("Kayak", "kayak-btn", urls.kayak, createIcon("sailboat"))
    const skyscannerBtn = createLinkButton("Skyscanner", "skyscanner-btn", urls.skyscanner, createIcon("search"))

    // Add restore button if URL has changed
    let restoreUrlBtn = null
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

    // Add additional flight-specific buttons if we have the required parameters
    let fareClassBtn = null
    let flightConnectionsBtn = null
    let turbliBtn = null

    if (hasRequiredParams) {
      fareClassBtn = createLinkButton("FareClass", "fare-class-btn", urls.fareClass, createIcon("ticket"))
      flightConnectionsBtn = createLinkButton(
        "Connections",
        "flight-connections-btn",
        urls.flightconnections,
        createIcon("network"),
      )
      turbliBtn = createLinkButton("Turbli", "turbli-btn", urls.turbli, createIcon("cloud-lightning"))
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

    if (restoreUrlBtn) {
      flightRowContainer1.appendChild(restoreUrlBtn)
    }

    if (hasRequiredParams) {
      flightRowContainer1.appendChild(fareClassBtn)
      flightRowContainer1.appendChild(flightConnectionsBtn)
      flightRowContainer1.appendChild(turbliBtn)
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
      "BestWestern",
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

    // Add hotel buttons to first row
    hotelRowContainer1.appendChild(googleHotelsBtn)
    hotelRowContainer1.appendChild(hiltonBtn)
    hotelRowContainer1.appendChild(hyattBtn)
    hotelRowContainer1.appendChild(marriottBtn)
    hotelRowContainer1.appendChild(ihgBtn)
    hotelRowContainer1.appendChild(accorBtn)

    // Add hotel buttons to second row
    hotelRowContainer1.appendChild(wyndhamBtn)
    hotelRowContainer1.appendChild(choiceBtn)
    hotelRowContainer1.appendChild(meliaBtn)
    hotelRowContainer1.appendChild(bestWesternBtn)
    hotelRowContainer1.appendChild(radissonBtn)
    hotelRowContainer1.appendChild(ghaBtn)

    // Add section headers
    const flightSectionHeader = document.createElement("div")
    flightSectionHeader.className = "section-header"
    flightSectionHeader.textContent = "Flight Search"

    const hotelSectionHeader = document.createElement("div")
    hotelSectionHeader.className = "section-header"
    hotelSectionHeader.textContent = "Hotel Search"

    // Add rows to container
    buttonContainer.appendChild(flightSectionHeader)
    buttonContainer.appendChild(flightRowContainer1)
    buttonContainer.appendChild(flightRowContainer2)
    buttonContainer.appendChild(hotelSectionHeader)
    buttonContainer.appendChild(hotelRowContainer1)
    buttonContainer.appendChild(hotelRowContainer2)

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
      flightRowContainer2.className = "custom-flight-buttons"

      // Create hotel row containers
      const hotelRowContainer1 = document.createElement("div")
      hotelRowContainer1.className = "custom-flight-buttons second-row"

      const hotelRowContainer2 = document.createElement("div")
      hotelRowContainer2.className = "custom-flight-buttons"

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
        "Seatmap",
        "points-yeah-seatmap-btn",
        () => {
          promptAndOpenPointsYeahSeatmap(urlParams)
        },
        createIcon("armchair"),
      )
      const awardToolBtn = createLinkButton("AwardTool", "award-tool-btn", urls.awardtool, createIcon("award"))
      const seatsAeroBtn = createLinkButton("Seats.aero", "seats-aero-btn", urls.seatsaero, createIcon("sofa"))
      const airCanadaBtn = createLinkButton("Air Canada", "air-canada-btn", urls.airCanada, createIcon("flag"))

      // Create flight buttons - second row
      const pointMeBtn = createLinkButton("Point.me", "point-me-btn", urls.pointme, createIcon("compass"))
      const kayakBtn = createLinkButton("Kayak", "kayak-btn", urls.kayak, createIcon("sailboat"))
      const skyscannerBtn = createLinkButton("Skyscanner", "skyscanner-btn", urls.skyscanner, createIcon("search"))

      // Add restore button if URL has changed
      let restoreUrlBtn = null
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

      // Add additional flight-specific buttons if we have the required parameters
      let fareClassBtn = null
      let flightConnectionsBtn = null
      let turbliBtn = null

      if (hasRequiredParams) {
        fareClassBtn = createLinkButton("FareClass", "fare-class-btn", urls.fareClass, createIcon("ticket"))
        flightConnectionsBtn = createLinkButton(
          "Connections",
          "flight-connections-btn",
          urls.flightconnections,
          createIcon("network"),
        )
        turbliBtn = createLinkButton("Turbli", "turbli-btn", urls.turbli, createIcon("cloud-lightning"))
      }

      // Add flight buttons to first row
      flightRowContainer1.appendChild(googleFlightsBtn)
      flightRowContainer1.appendChild(pointsYeahBtn)
      flightRowContainer1.appendChild(pointsYeahSeatmapBtn)
      flightRowContainer1.appendChild(awardToolBtn)
      flightRowContainer1.appendChild(seatsAeroBtn)
      flightRowContainer1.appendChild(airCanadaBtn)

      // Add flight buttons to second row
      flightRowContainer1.appendChild(pointMeBtn)
      flightRowContainer1.appendChild(kayakBtn)
      flightRowContainer1.appendChild(skyscannerBtn)

      if (restoreUrlBtn) {
        flightRowContainer1.appendChild(restoreUrlBtn)
      }

      if (hasRequiredParams) {
        flightRowContainer1.appendChild(fareClassBtn)
        flightRowContainer1.appendChild(flightConnectionsBtn)
        flightRowContainer1.appendChild(turbliBtn)
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
        "BestWestern",
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

      // Add hotel buttons to first row
      hotelRowContainer1.appendChild(googleHotelsBtn)
      hotelRowContainer1.appendChild(hiltonBtn)
      hotelRowContainer1.appendChild(hyattBtn)
      hotelRowContainer1.appendChild(marriottBtn)
      hotelRowContainer1.appendChild(ihgBtn)
      hotelRowContainer1.appendChild(accorBtn)

      // Add hotel buttons to second row
      hotelRowContainer1.appendChild(wyndhamBtn)
      hotelRowContainer1.appendChild(choiceBtn)
      hotelRowContainer1.appendChild(meliaBtn)
      hotelRowContainer1.appendChild(bestWesternBtn)
      hotelRowContainer1.appendChild(radissonBtn)
      hotelRowContainer1.appendChild(ghaBtn)

      // Add section headers
      const flightSectionHeader = document.createElement("div")
      flightSectionHeader.className = "section-header"
      flightSectionHeader.textContent = "Flight Search"

      const hotelSectionHeader = document.createElement("div")
      hotelSectionHeader.className = "section-header"
      hotelSectionHeader.textContent = "Hotel Search"

      // Add rows to container
      buttonsContainer.appendChild(flightSectionHeader)
      buttonsContainer.appendChild(flightRowContainer1)
      buttonsContainer.appendChild(flightRowContainer2)
      buttonsContainer.appendChild(hotelSectionHeader)
      buttonsContainer.appendChild(hotelRowContainer1)
      buttonsContainer.appendChild(hotelRowContainer2)

      // Add the fixed container to the results container
      resultsContainer.prepend(buttonsContainer)
    }
  }
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
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>',
    network:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"></circle><polyline points="9 15 9 21"></polyline><polyline points="15 15 15 21"></polyline><line x1="9" y1="18" x2="15" y2="18"></line></svg>',
    "cloud-lightning":
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"></path><path d="m13 12-3 5h4l-3 5"></path></svg>',
    hotel:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"></path><path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16"></path><path d="M8 7h.01"></path><path d="M16 7h.01"></path><path d="M12 7h.01"></path><path d="M12 11h.01"></path><path d="M16 11h.01"></path><path d="M8 11h.01"></path><path d="M10 22v-6.5m4 0V22"></path></svg>',
    building:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>',
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
  button.style.display = "inline-flex"
  button.style.textDecoration = "none"
  button.style.textAlign = "center"
  button.title = text // Add title attribute for tooltip on hover
  button.style.width = "90px" // Ensure consistent width
  button.style.height = "32px" // Ensure consistent height
  button.style.boxSizing = "border-box" // Include padding in width/height calculation

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
  button.style.width = "90px" // Ensure consistent width
  button.style.height = "32px" // Ensure consistent height
  button.style.boxSizing = "border-box" // Include padding in width/height calculation
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
  const url = `https://all.accor.com/booking/en/accor/hotels/${encodeURIComponent(city)}-${encodeURIComponent(city)}?compositions=2&stayplus=false&snu=false&hideWDR=false&productCode=null&accessibleRooms=false&hideHotelDetails=false&dateIn=${arrivalDate}&dateOut=${departureDate}`
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
  const url = `https://www.wyndhamhotels.com/en-us/hotels/search-results?brand_id=&checkInDate=${formattedArrivalDate}&checkOutDate=${formattedDepartureDate}&city=${encodeURIComponent(city)}&country=&radius=25&adults=2&children=0&rooms=1`
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
  const url = `https://www.choicehotels.com/en-us/search-results?city=${encodeURIComponent(city)}&checkInDate=${formattedArrivalDate}&checkOutDate=${formattedDepartureDate}&adults=2&children=0&rooms=1`
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

  // Generate and open the URL
  const url = `https://www.ihg.com/hotels/us/en/find-hotels/hotel/list?qDest=${encodeURIComponent(city)}&qCiD=${arrivalDate.split("-")[2]}&qCiMy=${arrivalDate.split("-")[1]}${arrivalDate.split("-")[0]}&qCoD=${departureDate.split("-")[2]}&qCoMy=${departureDate.split("-")[1]}${departureDate.split("-")[0]}&qAdlt=2&qChld=0&qRms=1`
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

  // Format dates for Marriott (MM/DD/YYYY)
  const formatDateForMarriott = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  }

  const formattedArrivalDate = formatDateForMarriott(arrivalDate)
  const formattedDepartureDate = formatDateForMarriott(departureDate)

  // Generate and open the URL
  const url = `https://www.marriott.com/search/default.mi?destination=${encodeURIComponent(city)}&checkin=${formattedArrivalDate}&checkout=${formattedDepartureDate}&rooms=1&adults=2&children=0`
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

  return {
    pointsYeah: pointsYeahUrl,

    pointsYeahSeatmap:
      params.airline && params.flightNumber
        ? `https://www.pointsyeah.com/seatmap/detail?airline=${airlineCode}&departure=${params.departure}&arrival=${params.arrival}&date=${formattedDate}&flightNumber=${params.flightNumber}&cabins=${cabinsString}`
        : "#",

    awardtool: `https://www.awardtool.com/flight?flightWay=${params.tripType.toLowerCase()}&pax=${params.adults}&children=${params.children || 0}&cabins=${params.cabin}&range=true&rangeV2=false&from=${params.departure}&to=${params.arrival}&programs=&targetId=&oneWayRangeStartDate=${timestamp}&oneWayRangeEndDate=${timestamp}`,

    seatsaero: `https://seats.aero/search?min_seats=${params.adults}&applicable_cabin=${seatsAeroCabin}&additional_days=true&additional_days_num=7&max_fees=40000&date=${formattedDate}&origins=${params.departure}&destinations=${params.arrival}`,

    pointme: `https://amex.point.me/results?departureCity=${params.departure}&departureIata=${params.departure}&arrivalCity=${params.arrival}&arrivalIata=${params.arrival}&legType=${params.tripType.toLowerCase()}&classOfService=${params.cabin.toLowerCase()}&passengers=${params.adults}&pid=&departureDate=${formattedDate}&arrivalDate=${params.tripType.toLowerCase() === "roundtrip" ? formattedReturnDate : ""}&mode=&searchInit=${searchTimestamp}&fsrRequestId=${Math.floor(Math.random() * 100000000)}&searchKey=${crypto.randomUUID()}&userSearchRequestId=${crypto.randomUUID()}&directionality=outbound`,

    airCanada: `https://www.aircanada.com/aeroplan/redeem/availability/outbound?org0=${params.departure}&dest0=${params.arrival}&departureDate0=${formattedDate}&ADT=${params.adults}&YTH=0&CHD=0&INF=0&INS=0&lang=en-CA&tripType=${params.tripType.toLowerCase() === "roundtrip" ? "R" : "O"}&marketCode=INT`,

    kayak: `https://www.kayak.com/flights/${params.departure}-${params.arrival}/${formattedDate}${params.tripType.toLowerCase() === "roundtrip" ? "/" + formattedReturnDate : ""}/${params.adults}adults?sort=bestflight_a`,

    // URLs for second row buttons
    fareClass: `https://seats.aero/fareclass?from=${params.departure}&to=${params.arrival}&date=${formattedDate}&carriers=&connections=false`,

    flightconnections: `https://www.flightconnections.com/flights-from-${params.departure.toLowerCase()}-to-${params.arrival.toLowerCase()}`,

    turbli: `https://turbli.com/${params.departure}/${params.arrival}/${formattedDate}/`,

    skyscanner: `https://www.skyscanner.com/transport/flights/${params.departure.toLowerCase()}/${params.arrival.toLowerCase()}/${skyscannerDate}/${params.tripType.toLowerCase() === "roundtrip" ? formattedReturnDate.replace(/-/g, "") : ""}?adults=${params.adults}&cabinclass=${skyscannerCabin}&currency=USD&locale=en-US&market=US&preferdirects=false&previousCultureSource=GEO_LOCATION&redirectedFrom=www.skyscanner.com&rtn=${params.tripType.toLowerCase() === "roundtrip" ? "1" : "0"}`,
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
