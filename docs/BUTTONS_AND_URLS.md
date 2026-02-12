# Flight and Hotel Search Buttons with Dynamic URLs

This document contains all button definitions and their corresponding URL generation code.

## Flight Search Buttons

### Button HTML Definitions (lines 189-243 in content.js)

```html
<div class="bs-buttons-grid" id="bs-external-links" style="display:none;">
  <button class="bs-btn bs-btn-google-flights" data-service="google-flights">
    Google Flights
  </button>
  <button class="bs-btn bs-btn-points-yeah" data-service="points-yeah">
    PointsYeah
  </button>
  <button class="bs-btn bs-btn-award-tool" data-service="award-tool">
    AwardTool
  </button>
  <button class="bs-btn bs-btn-seats-aero" data-service="seats-aero">
    Seats.aero
  </button>
  <button class="bs-btn bs-btn-point-me" data-service="point-me">
    Point.me
  </button>
  <button class="bs-btn bs-btn-kayak" data-service="kayak">
    Kayak
  </button>
  <button class="bs-btn bs-btn-skyscanner" data-service="skyscanner">
    Skyscanner
  </button>
  <button class="bs-btn bs-btn-air-canada" data-service="air-canada">
    Air Canada
  </button>
  <button class="bs-btn bs-btn-united" data-service="united">
    United
  </button>
  <button class="bs-btn bs-btn-rovemiles" data-service="rovemiles">
    Rovemiles
  </button>
  <button class="bs-btn bs-btn-fare-class" data-service="fare-class">
    Fare Class
  </button>
  <button class="bs-btn bs-btn-flight-connections" data-service="flight-connections">
    Connections
  </button>
  <button class="bs-btn bs-btn-turbli" data-service="turbli">
    Turbli
  </button>
  <button class="bs-btn bs-btn-roame" data-service="roame">
    Roame
  </button>
  <button class="bs-btn bs-btn-awardlogic" data-service="awardlogic">
    AwardLogic
  </button>
  <button class="bs-btn bs-btn-pointhound" data-service="pointhound">
    Pointhound
  </button>
  <button class="bs-btn bs-btn-pointsyeah-seatmap" data-service="pointsyeah-seatmap" style="display: none;">
    PY Seats
  </button>
  <button class="bs-btn bs-btn-seats-aero-seatmap" data-service="seats-aero-seatmap" style="display: none;">
    SA Seats
  </button>
</div>
```

### Flight Button Click Handler (lines 1477-1502 in content.js)

```javascript
// Handle flight button clicks
function handleFlightButtonClick(e) {
  e.preventDefault();
  
  const service = e.currentTarget.dataset.service;
  const flightData = getFlightInputData();
  
  if (!validateFlightData(flightData)) {
    showNotification('Bitte alle Pflichtfelder ausfüllen (From, To, Depart)', 'error');
    return;
  }
  
  const url = generateFlightUrl(service, flightData);
  
  if (url) {
    // Save flight data to localStorage before navigation
    saveFlightDataToStorage(flightData);
    
    // Google Flights loads in current tab, all others in new tab
    if (service === 'google-flights') {
      window.location.href = url;
    } else {
      window.open(url, '_blank');
    }
  }
}
```

### Flight URL Generation Function (lines 3330-3522 in content.js)

```javascript
// Generate flight URLs
function generateFlightUrl(service, data) {
  const { from, to, depart, return: ret, cabin, adults, language, currency, location } = data;
  
  // Format dates for different services
  const skyscannerDate = depart.replace(/-/g, '');
  const retDate = ret ? ret.replace(/-/g, '') : '';
  const skyscannerCabin = cabin.replace(/_/g, '');
  
  // Convert cabin to PointsYeah format (capitalize first letter)
  const pointsYeahCabin = cabin.charAt(0).toUpperCase() + cabin.slice(1).replace(/_/g, ' ');
  
  // Convert date to Unix timestamp in seconds (not milliseconds)
  const departTimestamp = Math.floor(new Date(depart).getTime() / 1000);
  const returnTimestamp = ret ? Math.floor(new Date(ret).getTime() / 1000) : departTimestamp;
  
  // Build Google Flights URL
  const googleFlightsUrl = `https://www.google.com/travel/flights/search?q=flights+from+${from}+to+${to}+${ret ? depart+'+to+'+ret : 'oneway+on+'+depart}+${cabin}+class&hl=${language}&curr=${currency}&gl=${location}&tfu=EgYIABAAGAA`;
  
  const urls = {
    'google-flights': googleFlightsUrl,
    
    'points-yeah': `https://www.pointsyeah.com/search?cabins=${pointsYeahCabin}&cabin=${pointsYeahCabin}&banks=Amex%2CCapital+One%2CChase&airlineProgram=AM%2CAC%2CKL%2CAS%2CAV%2CDL%2CEK%2CEY%2CAY%2CB6%2CQF%2CSQ%2CTK%2CUA%2CVS%2CVA&tripType=${ret ? '2' : '1'}&adults=${adults}&children=0&departure=${from}&arrival=${to}&departDate=${depart}&departDateSec=${depart}&returnDate=${ret || depart}&returnDateSec=${ret || depart}&multiday=false&stops=0`,
    
    'award-tool': ret 
      ? `https://www.awardtool.com/flight?flightWay=roundtrip&pax=${adults}&children=0&cabins=${cabin}&range=false&rangeV2=false&from=${from}&to=${to}&programs=&targetId=&roundTripDepartureDate=${departTimestamp}&roundTripReturnDate=${returnTimestamp}`
      : `https://www.awardtool.com/flight?flightWay=oneway&pax=${adults}&children=0&cabins=${cabin}&range=true&rangeV2=false&from=${from}&to=${to}&programs=&targetId=&oneWayRangeStartDate=${departTimestamp}&oneWayRangeEndDate=${departTimestamp}`,
    
    'seats-aero': `https://seats.aero/search?min_seats=${adults}&applicable_cabin=${cabin}&additional_days_num=7&max_fees=40000&date=${depart}&origins=${from}&destinations=${to}&stops=0`,
    
    'point-me': `https://point.me/results?departureCity=${from}&departureIata=${from}&arrivalCity=${to}&arrivalIata=${to}&legType=${ret ? 'roundtrip' : 'oneway'}&classOfService=${cabin}&passengers=${adults}&departureDate=${depart}&arrivalDate=${ret || ''}`,
    
    'kayak': `https://www.kayak.com/flights/${from}-${to}/${depart}${ret ? '/' + ret : ''}/${adults}adults?sort=bestflight_a`,
    
    'skyscanner': `https://www.skyscanner.com/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${skyscannerDate}/${ret ? retDate : ''}?adults=${adults}&cabinclass=${skyscannerCabin}&currency=USD&locale=en-US&market=US`,
    
    'air-canada': ret
      ? `https://www.aircanada.com/aeroplan/redeem/availability/outbound?org0=${from}&dest0=${to}&org1=${to}&dest1=${from}&departureDate0=${depart}&departureDate1=${ret}&ADT=${adults}&YTH=0&CHD=0&INF=0&INS=0&lang=en-CA&tripType=R&marketCode=INT`
      : `https://www.aircanada.com/aeroplan/redeem/availability/outbound?org0=${from}&dest0=${to}&departureDate0=${depart}&ADT=${adults}&YTH=0&CHD=0&INF=0&INS=0&lang=en-CA&tripType=O&marketCode=INT`,
    
    'united': (() => {
      // United FSR: one-way (tqp=A, tt=1, rm=1, act=0) vs round-trip (tqp=R, r=, sc=7,7, ct=0)
      const cabinMap = { 'economy': '7', 'business': '2', 'first': '1' };
      const scCode = cabinMap[cabin] || '7';
      const px = `${adults},0,0,0,0,0,0,0`;
      const editId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().toUpperCase()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => ((c === 'x' ? Math.random() * 16 : (Math.random() * 4 + 8)) | 0).toString(16).toUpperCase());
      if (ret) {
        const sc = `${scCode},${scCode}`;
        return `https://www.united.com/en/us/fsr/choose-flights?f=${from}&t=${to}&d=${depart}&r=${ret}&sc=${encodeURIComponent(sc)}&st=bestmatches&cbm=-1&cbm2=-1&ft=0&cp=0&ct=0&px=${encodeURIComponent(px)}&taxng=1&clm=7&EditSearchCartId=${editId}&tqp=R`;
      }
      return `https://www.united.com/en/us/fsr/choose-flights?f=${from}&t=${to}&d=${depart}&sc=${scCode}&st=bestmatches&cbm=-1&cbm2=-1&ft=0&cp=0&tt=1&at=${adults}&rm=1&act=0&px=${encodeURIComponent(px)}&taxng=1&clm=7&EditSearchCartId=${editId}&tqp=A`;
    })(),
    
    'rovemiles': `https://www.rovemiles.com/search/flights?origin=${from}&destination=${to}&cabin=${cabin}&adults=${adults}&children=0&infants=0&payment=miles&start_date=${depart}`,
    
    'fare-class': `https://seats.aero/fareclass?from=${from}&to=${to}&date=${depart}&carriers=&connections=false&stops=0`,
    
    'flight-connections': `https://www.flightconnections.com/de/fl%C3%BCge-von-${from.toLowerCase()}-nach-${to.toLowerCase()}`,
    
    'turbli': `https://turbli.com/${from}/${to}/${depart}/`,
    
    'roame': (() => {
      // Map cabin to Roame searchClass format
      const cabinMap = {
        'economy': 'ECON',
        'business': 'BUS',
        'first': 'FIRST'
      };
      const searchClass = cabinMap[cabin] || 'ECON';
      
      // Map cabin to fareClasses
      const fareClassMap = {
        'economy': 'ECON',
        'business': 'BUS',
        'first': 'FIRST'
      };
      const fareClass = fareClassMap[cabin] || 'ECON';
      
      // For endDepartureDate, use return date if available, otherwise use same as departure
      const endDepartureDate = ret || depart;
      
      // Build base URL with required parameters
      let url = `https://roame.travel/search?origin=${from}&originType=airport&destination=${to}&destinationType=airport&departureDate=${depart}&endDepartureDate=${endDepartureDate}&pax=${adults}&searchClass=${searchClass}&fareClasses=${fareClass}&fareClasses=PREMECON&isSkyview=false&flexibleDates=0&selectedCards=accor&selectedCards=amex&selectedCards=bilt&selectedCards=bofa&selectedCards=brex&selectedCards=capital_one&selectedCards=chase&selectedCards=citi&selectedCards=hawaiian&selectedCards=marriott&selectedCards=ramp&selectedCards=wells_fargo&selectedPrograms=ALL&selectedAirlines=&unselectedAirlines=&selectedAirports=&unselectedAirports=&selectedAircrafts=&unselectedAircrafts=&maxStops=3&minPremiumPercent=0&maxPoints=300000&maxSurcharge=800`;
      
      // Add cachebust parameter (timestamp)
      const cachebust = Date.now();
      url += `&cachebust=${cachebust}`;
      
      return url;
    })(),
    
    'awardlogic': (() => {
      // Map cabin to AwardLogic format (E=Economy, B=Business, F=First)
      const cabinMap = {
        'economy': 'E',
        'business': 'B',
        'first': 'F'
      };
      const cabinCode = cabinMap[cabin] || 'E';
      
      // Determine trip type
      const tripType = ret ? 'round-trip' : 'one-way';
      
      // Format passengers: adults:children:infants:seniors:youth:students
      // Default to adults only: 1:0:0:0:0:0
      const passengers = `${adults}:0:0:0:0:0`;
      
      // Use path-based format without search parameter (search ID is generated server-side)
      if (tripType === 'round-trip') {
        // Round-trip format: /round-trip/ORIGIN-DEST/OUTBOUND_DATE/RETURN_DATE/CABIN/PASSENGERS
        return `https://awardlogic.com/award/results/round-trip/${from}-${to}/${depart}/${ret}/${cabinCode}/${passengers}`;
      } else {
        // One-way format: /one-way/ORIGIN-DEST/DATE/CABIN/PASSENGERS
        return `https://awardlogic.com/award/results/one-way/${from}-${to}/${depart}/${cabinCode}/${passengers}`;
      }
    })(),
    
    'pointhound': (() => {
      // Map cabin to Pointhound format (Economy, Business, First)
      const cabinMap = {
        'economy': 'Economy',
        'business': 'Business',
        'first': 'First'
      };
      const flightClass = cabinMap[cabin] || 'Economy';
      
      // Get airport names from input fields
      const fromInput = document.getElementById('bs-flight-from');
      const toInput = document.getElementById('bs-flight-to');
      
      let originName = '';
      let destinationName = '';
      
      // Try to get airport name from airport data
      if (fromInput?.dataset?.airportData) {
        try {
          const airport = JSON.parse(fromInput.dataset.airportData);
          // Use full airport name if available, otherwise construct from city
          if (airport.name) {
            originName = airport.name;
          } else if (airport.city) {
            originName = `${airport.city} Airport`;
          } else {
            originName = from;
          }
        } catch (e) {
          originName = from;
        }
      } else {
        // Fallback: try to get from input value if it contains airport name
        const inputValue = fromInput?.value?.trim() || '';
        originName = inputValue.length > 3 ? inputValue : from;
      }
      
      if (toInput?.dataset?.airportData) {
        try {
          const airport = JSON.parse(toInput.dataset.airportData);
          // Use full airport name if available, otherwise construct from city
          if (airport.name) {
            destinationName = airport.name;
          } else if (airport.city) {
            destinationName = `${airport.city} Airport`;
          } else {
            destinationName = to;
          }
        } catch (e) {
          destinationName = to;
        }
      } else {
        // Fallback: try to get from input value if it contains airport name
        const inputValue = toInput?.value?.trim() || '';
        destinationName = inputValue.length > 3 ? inputValue : to;
      }
      
      // URL encode airport names properly (Pointhound expects + for spaces in query params)
      const encodedOriginName = originName.split(' ').map(part => encodeURIComponent(part)).join('+');
      const encodedDestinationName = destinationName.split(' ').map(part => encodeURIComponent(part)).join('+');
      
      return `https://www.pointhound.com/flights?dateBuffer=false&flightClass=${encodeURIComponent(flightClass)}&originCode=${from}&originName=${encodedOriginName}&destinationCode=${to}&destinationName=${encodedDestinationName}&passengerCount=${adults}&departureDate=${depart}`;
    })(),
    
    'pointsyeah-seatmap': data.airline && data.flightNumber ? `https://www.pointsyeah.com/seatmap/detail?airline=${encodeURIComponent(data.airline)}&departure=${from}&arrival=${to}&date=${depart}&flightNumber=${encodeURIComponent(data.flightNumber)}&cabins=Economy%2CPremium%20Economy%2CBusiness%2CFirst` : '#',
    
    'seats-aero-seatmap': data.airline && data.flightNumber ? `https://seats.aero/seatmap?airline=${encodeURIComponent(data.airline)}&from=${from}&to=${to}&date=${depart}&flight=${encodeURIComponent(data.flightNumber)}&stops=0` : '#'
  };
  
  return urls[service] || '#';
}
```

---

## Hotel Search Buttons

### Button HTML Definitions (lines 400-442 in content.js)

```html
<div class="bs-buttons-grid" id="bs-hotel-external-links" style="display:none;">
  <button class="bs-btn bs-btn-google-hotels" data-service="google-hotels">
    Google Hotels
  </button>
  <button class="bs-btn bs-btn-rooms-aero" data-service="rooms-aero">
    Rooms.aero
  </button>
  <button class="bs-btn bs-btn-points-yeah" data-service="pointsyeah-hotels">
    PointsYeah
  </button>
  <button class="bs-btn bs-btn-rovemiles" data-service="rovemiles-hotels">
    RoveMiles
  </button>
  <button class="bs-btn bs-btn-rovemiles" data-service="rovemiles-hotels-loyal">
    RoveMiles Loyalty
  </button>
  <button class="bs-btn bs-btn-maxmypoint" data-service="maxmypoint">
    MaxMyPoint
  </button>
  <button class="bs-btn bs-btn-hyatt" data-service="hyatt">
    Hyatt
  </button>
  <button class="bs-btn bs-btn-hilton" data-service="hilton">
    Hilton
  </button>
  <button class="bs-btn bs-btn-marriott" data-service="marriott">
    Marriott
  </button>
  <button class="bs-btn bs-btn-ihg" data-service="ihg">
    IHG
  </button>
  <button class="bs-btn bs-btn-accor" data-service="accor">
    Accor
  </button>
  <button class="bs-btn bs-btn-wyndham" data-service="wyndham">
    Wyndham
  </button>
  <button class="bs-btn bs-btn-choice" data-service="choice">
    Choice
  </button>
  <button class="bs-btn bs-btn-gha" data-service="gha">
    GHA
  </button>
</div>
```

### Hotel Button Click Handler (lines 1869-1928 in content.js)

```javascript
// Handle hotel button clicks
async function handleHotelButtonClick(e) {
  e.preventDefault();
  e.stopPropagation(); // Prevent event bubbling that might trigger auto-reload
  e.stopImmediatePropagation(); // Prevent other listeners on the same element
  
  // Set flag to prevent auto-reload from firing
  hotelButtonClicked = true;
  
  // Clear any pending auto-reload timeouts to prevent Google Hotels from opening
  const hotelInputs = [
    document.getElementById('bs-hotel-city'),
    document.getElementById('bs-hotel-checkin'),
    document.getElementById('bs-hotel-checkout'),
    document.getElementById('bs-hotel-adults'),
    document.getElementById('bs-hotel-rooms')
  ];
  hotelInputs.forEach(input => {
    if (input && input.autoReloadTimeout) {
      clearTimeout(input.autoReloadTimeout);
      input.autoReloadTimeout = null;
    }
  });
  
  const service = e.currentTarget.dataset.service;
  const hotelData = getHotelInputData();
  
  if (!validateHotelData(hotelData)) {
    hotelButtonClicked = false; // Reset flag if validation fails
    showNotification('Bitte alle Pflichtfelder ausfüllen (City, Check-In, Check-Out)', 'error');
    return;
  }
  
  // For PointsYeah and RoveMiles, get geocoding data using the city from hotel input field
  let geocodeData = null;
  if (service === 'pointsyeah-hotels' || service === 'rovemiles-hotels' || service === 'rovemiles-hotels-loyal') {
    // Get city name directly from the hotel city input field
    const cityInput = document.getElementById('bs-hotel-city');
    const cityName = cityInput?.value?.trim() || hotelData.city;
    
    if (cityName) {
      showNotification('Geocoding location...', 'info');
      geocodeData = await geocodeCity(cityName);
      if (!geocodeData) {
        showNotification('Could not geocode city. Using city name only.', 'warning');
      }
    }
  }
  
  const url = await generateHotelUrl(service, hotelData, geocodeData);
  
  if (url) {
    window.open(url, '_blank');
  }
  
  // Reset flag after a delay to allow auto-reload to work again for future input changes
  setTimeout(() => {
    hotelButtonClicked = false;
  }, 2000);
}
```

### Hotel URL Generation Function (lines 3524-3838 in content.js)

```javascript
// Generate hotel URLs
async function generateHotelUrl(service, data, geocodeData = null) {
  const { city, checkin, checkout, adults, rooms } = data;

  // Calculate nights
  const nights = Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)));
  
  // Format dates for different services
  const toDotted = (iso) => {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  };
  
  const toIHG = (iso) => {
    const d = new Date(iso);
    return {
      day: String(d.getDate()).padStart(2, '0'),
      monthYear: `${String(d.getMonth() + 1).padStart(2, '0')}${d.getFullYear()}`
    };
  };
  
  const fromDateDotted = toDotted(checkin);
  const toDateDotted = toDotted(checkout);
  const checkInIHG = toIHG(checkin);
  const checkOutIHG = toIHG(checkout);
  
  // Format dates for Google Hotels (YYYY-MM-DD)
  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);

  // Format dates for Marriott (MM/DD/YYYY)
  const toMarriottFormat = (iso) => {
    const d = new Date(iso);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };
  
  const fromDateMarriott = toMarriottFormat(checkin);
  const toDateMarriott = toMarriottFormat(checkout);
  
  const urls = {
    'google-hotels': (() => {
      // Google Hotels URL with proper date formatting
      // Ensure dates are in YYYY-MM-DD format
      let checkinFormatted = checkin;
      let checkoutFormatted = checkout;
      
      // If dates are not in correct format, convert them
      if (checkinFormatted && !checkinFormatted.match(/^\d{4}-\d{2}-\d{2}$/)) {
        try {
          const d = new Date(checkinFormatted);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          checkinFormatted = `${year}-${month}-${day}`;
        } catch (e) {
          // Keep original if conversion fails
        }
      }
      
      if (checkoutFormatted && !checkoutFormatted.match(/^\d{4}-\d{2}-\d{2}$/)) {
        try {
          const d = new Date(checkoutFormatted);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          checkoutFormatted = `${year}-${month}-${day}`;
        } catch (e) {
          // Keep original if conversion fails
        }
      }
      
      return `https://www.google.com/travel/search?q=${encodeURIComponent(city)}&checkin=${checkinFormatted}&checkout=${checkoutFormatted}&adults=${adults}&rooms=${rooms}`;
    })(),
    
    'hilton': `https://www.hilton.com/en/search/?query=${encodeURIComponent(city)}&arrivalDate=${checkin}&departureDate=${checkout}&flexibleDates=false&numRooms=${rooms}&numAdults=${adults}&numChildren=0`,
    
    'hyatt': `https://www.hyatt.com/search/hotels/de-DE/${encodeURIComponent(city)}?checkinDate=${checkin}&checkoutDate=${checkout}&rooms=${rooms}&adults=${adults}&kids=0&rate=Standard&rateFilter=woh`,
    
    'marriott': `https://www.marriott.com/de/search/findHotels.mi?fromToDate_submit=${toDateMarriott}&fromDate=${fromDateDotted}&toDate=${toDateDotted}&toDateDefaultFormat=${toDateMarriott}&fromDateDefaultFormat=${fromDateMarriott}&lengthOfStay=${nights}&childrenCount=0&roomCount=${rooms}&numAdultsPerRoom=${adults}&destinationAddress.destination=${encodeURIComponent(city)}&useRewardsPoints=true&deviceType=desktop-web&view=list&isInternalSearch=true&vsInitialRequest=false&searchType=InCity&singleSearch=true&flexibleDateSearchRateDisplay=false&isSearch=true&isRateCalendar=true&t-start=${checkin}&t-end=${checkout}&flexibleDateSearch=false&isTransient=true&initialRequest=true&fromToDate=${fromDateMarriott}&numberOfRooms=${rooms}`,
    
    'ihg': `https://www.ihg.com/hotels/us/en/find-hotels/hotel-search?qDest=${encodeURIComponent(city)}&qPt=POINTS&qCiD=${checkInIHG.day}&qCoD=${checkOutIHG.day}&qCiMy=${checkInIHG.monthYear}&qCoMy=${checkOutIHG.monthYear}&qAdlt=${adults}&qChld=0&qRms=${rooms}&qRtP=IVANI&qAkamaiCC=PL&srb_u=1&qExpndSrch=false&qSrt=sRT&qBrs=6c.hi.ex.sb.ul.ic.cp.cw.in.vn.cv.rs.ki.kd.ma.sp.va.sp.re.vx.nd.sx.we.lx.rn.sn.sn.sn.sn.sn.nu.ge&qWch=0&qSmP=0&qRad=30&qRdU=mi&setPMCookies=false&qLoSe=false`,
    
    'accor': `https://all.accor.com/booking/en/accor/hotels/${encodeURIComponent(city.toLowerCase())}?compositions=${adults}${rooms > 1 ? ',' + rooms : ''}&stayplus=true&sortBy=PRICE_LOW_TO_HIGH&dateIn=${checkin}&dateOut=${checkout}`,
    
    'wyndham': `https://www.wyndhamhotels.com/de-de/hotels/${encodeURIComponent(city.toLowerCase())}?brand_id=ALL&checkInDate=${checkin}&checkOutDate=${checkout}&useWRPoints=true&children=0&adults=${adults}&rooms=${rooms}`,
    
    'choice': `https://www.choicehotels.com/de-de/${encodeURIComponent(city.toLowerCase())}/hotels?adults=${adults}&checkInDate=${checkin}&checkOutDate=${checkout}&ratePlanCode=SRD&sort=price`,
    
    'melia': (() => {
      // Melia format: /de/ locale with search parameter
      // Structure matches: destination with city, country, type, name
      const checkInTimestamp = new Date(checkin).getTime();
      const checkoutTimestamp = new Date(checkout).getTime();
      
      // Use geocoded city name if available, otherwise use input city
      const cityName = geocodeData?.city || city;
      const countryName = geocodeData?.country || null;
      
      // Build destination object matching the required format
      const destination = {
        city: cityName,
        type: "DESTINATION",
        name: cityName.toLowerCase()
      };
      
      // Country is required for proper search
      if (countryName) {
        destination.country = countryName;
      }
      
      const searchData = {
        destination: destination,
        occupation: Array(rooms).fill(null).map(() => ({ adults: adults })),
        calendar: {
          dates: [checkInTimestamp, checkoutTimestamp],
          locale: "de"
        },
        dynamicServicesFilters: []
      };
      
      const searchJson = JSON.stringify(searchData);
      return `https://www.melia.com/de/booking?search=${encodeURIComponent(searchJson)}`;
    })(),
    
    'maxmypoint': `https://maxmypoint.com/?search=${encodeURIComponent(city)}`,
    
    'radisson': null, // Will be handled separately below due to async requirements
    
    'gha': `https://de.ghadiscovery.com/search/hotels?keyword=${encodeURIComponent(city)}&clearBookingParams=1&types=all&sortBy=price&sortDirection=asc`,
    
    'rooms-aero': `https://rooms.aero/search?city=${encodeURIComponent(city)}&start=${checkin}&end=${checkout}&nights=${nights}`,
    
    'pointsyeah-hotels': (() => {
      // Format dates for PointsYeah (YYYY-MM-DD)
      const fromDate = checkin;
      const toDate = checkout;
      
      // Default hotel programs (can be customized)
      const hotelPrograms = 'wyndhamhotels%2Cchoicehotels%2Chyatt%2Cihg%2Chilton%2Cmarriott%2Camextravel%2Cvirtuoso%2Caadvantagehotels%2Cunitedhotel';
      
      // Default bank programs
      const bankPrograms = 'Amex%2CCapital%20One%2CChase';
      
      // Build base URL
      let baseUrl = `https://www.pointsyeah.com/hotelsearch?adult=${adults}&bankPrograms=${bankPrograms}&bankpromotion=false&certificates=&children=0&dest_type=city&distance=30000&fromDate=${fromDate}&hotelPrograms=${hotelPrograms}&pointpromotion=false&room=${rooms}&toDate=${toDate}`;
      
      // Add geocoding data if available
      if (geocodeData) {
        baseUrl += `&city=${encodeURIComponent(geocodeData.city)}`;
        baseUrl += `&country_code=${geocodeData.countryCode}`;
        baseUrl += `&latitude=${geocodeData.latitude}`;
        baseUrl += `&longitude=${geocodeData.longitude}`;
        baseUrl += `&label=${encodeURIComponent(geocodeData.city)}`;
        baseUrl += `&location=${encodeURIComponent(geocodeData.fullLocation)}`;
      } else {
        // Fallback to city name only
        baseUrl += `&city=${encodeURIComponent(city)}`;
        baseUrl += `&label=${encodeURIComponent(city)}`;
        baseUrl += `&location=${encodeURIComponent(city)}`;
      }
      
      return baseUrl;
    })(),
    
    'rovemiles-hotels': (() => {
      // Format rooms as JSON array (URL encoded)
      const roomsData = Array(rooms).fill(null).map(() => ({
        adults: adults,
        children: 0,
        childrenAges: []
      }));
      const roomsJson = JSON.stringify(roomsData);
      const roomsEncoded = encodeURIComponent(encodeURIComponent(roomsJson)); // Double encode as shown in example
      
      // Default filters JSON
      const filters = {
        hotelName: "",
        cancellation: "all",
        guestRating: 0,
        loyaltyEligible: false, // Regular RoveMiles shows all hotels
        loyaltyPrograms: [],
        types: [],
        propertyRating: [],
        facilities: [],
        priceRange: {
          start: 0,
          end: 2000,
          currency: "cash"
        },
        sorting: "1"
      };
      const filtersEncoded = encodeURIComponent(JSON.stringify(filters));
      
      // Build base URL
      let baseUrl = `https://www.rovemiles.com/search/hotels?checkin=${checkin}&checkout=${checkout}&rooms=${roomsEncoded}&nationality=US&currency=USD&is_hotel=false&filters=${filtersEncoded}`;
      
      // Add geocoding data if available
      if (geocodeData) {
        baseUrl += `&search_name=${encodeURIComponent(geocodeData.city)}`;
        baseUrl += `&country_code=${geocodeData.countryCode}`;
        // Coordinates need to be double URL encoded for RoveMiles
        const coordinates = `${geocodeData.latitude},${geocodeData.longitude}`;
        baseUrl += `&coordinates=${encodeURIComponent(encodeURIComponent(coordinates))}`;
      } else {
        // Fallback to city name only
        baseUrl += `&search_name=${encodeURIComponent(city)}`;
      }
      
      return baseUrl;
    })(),
    
    'rovemiles-hotels-loyal': (() => {
      // Same as rovemiles-hotels but with loyaltyEligible: true explicitly
      // Format rooms as JSON array (URL encoded)
      const roomsData = Array(rooms).fill(null).map(() => ({
        adults: adults,
        children: 0,
        childrenAges: []
      }));
      const roomsJson = JSON.stringify(roomsData);
      const roomsEncoded = encodeURIComponent(encodeURIComponent(roomsJson)); // Double encode as shown in example
      
      // Filters JSON with loyaltyEligible: true for Loyal button
      const filters = {
        hotelName: "",
        cancellation: "all",
        guestRating: 0,
        loyaltyEligible: true, // Show hotels with loyalty benefits
        loyaltyPrograms: [],
        types: [],
        propertyRating: [],
        facilities: [],
        priceRange: {
          start: 0,
          end: 2000,
          currency: "cash"
        },
        sorting: "1"
      };
      const filtersEncoded = encodeURIComponent(JSON.stringify(filters));
      
      // Build base URL
      let baseUrl = `https://www.rovemiles.com/search/hotels?checkin=${checkin}&checkout=${checkout}&rooms=${roomsEncoded}&nationality=US&currency=USD&is_hotel=false&filters=${filtersEncoded}`;
      
      // Add geocoding data if available
      if (geocodeData) {
        baseUrl += `&search_name=${encodeURIComponent(geocodeData.city)}`;
        baseUrl += `&country_code=${geocodeData.countryCode}`;
        // Coordinates need to be double URL encoded for RoveMiles
        const coordinates = `${geocodeData.latitude},${geocodeData.longitude}`;
        baseUrl += `&coordinates=${encodeURIComponent(encodeURIComponent(coordinates))}`;
      } else {
        // Fallback to city name only
        baseUrl += `&search_name=${encodeURIComponent(city)}`;
      }
      
      return baseUrl;
    })()
  };
  
  // Handle Radisson separately since it requires async placeId lookup
  if (service === 'radisson') {
    // Radisson format: use placeId (Google Place ID) instead of destination
    // Format: placeId=...&checkInDate=...&checkOutDate=...&adults[]=...&children[]=0&aoc[]=&searchType=lowest&promotionCode=&voucher=&brands=&brandFirst=
    let baseUrl = `https://www.radissonhotels.com/en-us/booking/search-results?checkInDate=${checkin}&checkOutDate=${checkout}&adults%5B%5D=${adults}&children%5B%5D=0&aoc%5B%5D=&searchType=lowest&promotionCode=&voucher=&brands=&brandFirst=`;
    
    // Try to get placeId from geocoding data
    if (geocodeData && geocodeData.latitude && geocodeData.longitude) {
      const placeId = await getPlaceIdFromCoordinates(geocodeData.latitude, geocodeData.longitude);
      if (placeId) {
        return baseUrl + `&placeId=${placeId}`;
      }
    }
    
    // If no placeId available, return URL without it (may not work correctly)
    // Note: Radisson requires placeId for proper search
    return baseUrl;
  }
  
  return urls[service] || '#';
}
```

---

## Summary

### Flight Search Services (17 buttons)
1. **Google Flights** - Opens in current tab
2. **PointsYeah** - Award flight search
3. **AwardTool** - Award flight search tool
4. **Seats.aero** - Award seat availability
5. **Point.me** - Award flight search
6. **Kayak** - Flight search engine
7. **Skyscanner** - Flight search engine
8. **Air Canada** - Aeroplan award search
9. **United** - United award search
10. **Rovemiles** - Award flight search
11. **Fare Class** - Fare class search
12. **Flight Connections** - Route connections
13. **Turbli** - Turbulence forecast
14. **Roame** - Award search tool
15. **AwardLogic** - Award search tool
16. **Pointhound** - Award flight search
17. **PointsYeah Seatmap** (hidden) - Seat map view
18. **Seats.aero Seatmap** (hidden) - Seat map view

### Hotel Search Services (14 buttons)
1. **Google Hotels** - Hotel search
2. **Rooms.aero** - Award hotel search
3. **PointsYeah** - Award hotel search
4. **RoveMiles** - Award hotel search
5. **RoveMiles Loyalty** - Award hotel search (loyalty filter)
6. **MaxMyPoint** - Hotel points search
7. **Hyatt** - Hyatt hotel search
8. **Hilton** - Hilton hotel search
9. **Marriott** - Marriott hotel search
10. **IHG** - IHG hotel search
11. **Accor** - Accor hotel search
12. **Wyndham** - Wyndham hotel search
13. **Choice** - Choice Hotels search
14. **GHA** - GHA Discovery search

All buttons use the `data-service` attribute to identify which service they represent, and the click handlers call the respective URL generation functions with the form data to create dynamic URLs.
