// ==============================
// Google Flights Extension - Clean Version
// ==============================

// Main injection function
function injectExtensionPanel() {
  // Check if panel already exists
  if (document.querySelector('.bs-extension-panel')) {
    return;
  }

  // Try multiple possible container locations
  const selectors = [
    '.cOFTkc',                    // Main flights page
    '.gws-flights-results__result-list',
    'main',                        // Main content area
    '[role="main"]',              // Main landmark
    'body > c-wiz',               // Common Google structure
    'body'                        // Fallback
  ];
  
  let targetContainer = null;
  for (const selector of selectors) {
    targetContainer = document.querySelector(selector);
    if (targetContainer) {
      break;
    }
  }
  
  if (!targetContainer) {
    console.log('BS Extension: No container found, trying again...');
    return;
  }

  // Create main panel
  const panel = document.createElement('div');
  panel.className = 'bs-extension-panel';
  
  // Create panel HTML structure
  panel.innerHTML = `
    <!-- Benefit Systems Logo with Section Toggles -->
    <div class="bs-logo-container" id="bs-logo-container">
      <div class="bs-logo-header">
        <a href="https://tools.benefitsystems.io" target="_blank" class="bs-logo-link">
          <img src="https://saegzrncsjcsvgcjkniv.supabase.co/storage/v1/object/sign/Logo/BenefitSystems.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83ZWM2ZTk3Zi03YjQ2LTQ0ODMtODNjMS00ZDQwODU5N2MyOTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMb2dvL0JlbmVmaXRTeXN0ZW1zLnBuZyIsImlhdCI6MTc1OTc5MDg1MSwiZXhwIjoxNzY4NDMwODUxfQ.wRo7pPjUbmM-Rzo0fXGUChNcgwpM_aTnMjlz4IB5RHk" alt="Benefit Systems" class="bs-logo" />
        </a>
        <div class="bs-section-toggles">
          <div class="bs-toggle-item">
            <label class="bs-toggle-label" for="bs-flight-toggle">Flight Search</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-flight-toggle" checked>
              <span class="bs-toggle-slider"></span>
            </label>
          </div>
          <div class="bs-toggle-item">
            <label class="bs-toggle-label" for="bs-hotel-toggle">Hotel Search</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-hotel-toggle">
              <span class="bs-toggle-slider"></span>
            </label>
          </div>
          <div class="bs-toggle-item">
            <label class="bs-toggle-label" for="bs-search-toggle">Search</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-search-toggle">
              <span class="bs-toggle-slider"></span>
            </label>
          </div>
          <div class="bs-toggle-item">
            <label class="bs-toggle-label" for="bs-information-toggle">Information</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-information-toggle">
              <span class="bs-toggle-slider"></span>
            </label>
          </div>
          <div class="bs-toggle-item">
            <label class="bs-toggle-label" for="bs-settings-toggle">Settings</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-settings-toggle">
              <span class="bs-toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bs-content" id="bs-collapsible-content">
    <!-- Flight Search Section -->
    <div class="bs-section" id="bs-flight-section">
      <div class="bs-section-header">
        <svg class="bs-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
        </svg>
        <span>Flight Search</span>
        <div class="bs-header-actions">
          <button class="bs-action-btn bs-action-save" id="bs-save-flight" title="Save flight data">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
          <button class="bs-action-btn bs-action-reset" id="bs-reset-flight" title="Reset flight data">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="bs-inputs-grid">
        <div class="bs-input-group">
          <label>From</label>
          <input type="text" id="bs-flight-from" placeholder="JFK or New York" autocomplete="off" />
        </div>
        <div class="bs-switch-container">
          <button type="button" class="bs-switch-btn" id="bs-flight-switch" title="Switch From/To">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 16V4M7 4L3 8M7 4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
            </svg>
          </button>
        </div>
        <div class="bs-input-group">
          <label>To</label>
          <input type="text" id="bs-flight-to" placeholder="LAX or Los Angeles" autocomplete="off" />
        </div>
        <div class="bs-input-group">
          <label>Depart</label>
          <input type="date" id="bs-flight-depart" />
        </div>
        <div class="bs-input-group">
          <label>Return</label>
          <input type="date" id="bs-flight-return" />
        </div>
        <div class="bs-input-group">
          <label>Cabin</label>
          <select id="bs-flight-cabin">
          <option value="economy">Economy</option>
          <option value="premium_economy">PremEco</option>
          <option value="business">Business</option>
          <option value="first">First</option>
        </select>
      </div>
        <div class="bs-input-group">
          <label>Adults</label>
          <select id="bs-flight-adults">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
          </select>
        </div>
        <div class="bs-input-group">
          <label>Airline</label>
          <input type="text" id="bs-flight-airline" placeholder="W6" maxlength="2" />
        </div>
        <div class="bs-input-group">
          <label>Flight Nr</label>
          <input type="text" id="bs-flight-number" placeholder="1444" />
        </div>
      </div>
      
      <div class="bs-buttons-grid">
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
        <button class="bs-btn bs-btn-pointsyeah-seatmap" data-service="pointsyeah-seatmap" style="display: none;">
          PY Seats
        </button>
        <button class="bs-btn bs-btn-seats-aero-seatmap" data-service="seats-aero-seatmap" style="display: none;">
          SA Seats
        </button>
      </div>
    </div>

    <!-- Hotel Search Section -->
    <div class="bs-section" id="bs-hotel-section" style="display: none;">
      <div class="bs-section-header">
        <svg class="bs-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6h14"/><path d="M4 14h16v7H4z"/>
        </svg>
        <span>Hotel Search</span>
        <div class="bs-header-actions">
          <button class="bs-action-btn bs-action-save" id="bs-save-hotel" title="Save hotel data">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
          <button class="bs-action-btn bs-action-reset" id="bs-reset-hotel" title="Reset hotel data">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="bs-inputs-grid">
        <div class="bs-input-group">
          <label>City</label>
          <input type="text" id="bs-hotel-city" placeholder="New York" />
        </div>
        <div class="bs-input-group">
          <label>Check-In</label>
          <input type="date" id="bs-hotel-checkin" />
        </div>
        <div class="bs-input-group">
          <label>Check-Out</label>
          <input type="date" id="bs-hotel-checkout" />
        </div>
        <div class="bs-input-group">
          <label>Adults</label>
          <input type="number" id="bs-hotel-adults" min="1" value="2" />
        </div>
        <div class="bs-input-group">
          <label>Rooms</label>
          <input type="number" id="bs-hotel-rooms" min="1" value="1" />
        </div>
      </div>
      
      <div class="bs-buttons-grid">
        <button class="bs-btn bs-btn-rooms-aero" data-service="rooms-aero">
          Rooms.aero
        </button>
        <button class="bs-btn bs-btn-hilton" data-service="hilton">
          Hilton
        </button>
        <button class="bs-btn bs-btn-hyatt" data-service="hyatt">
          Hyatt
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
        <button class="bs-btn bs-btn-melia" data-service="melia">
          Melia
        </button>
        <button class="bs-btn bs-btn-gha" data-service="gha">
          GHA
        </button>
        <button class="bs-btn bs-btn-google-hotels" data-service="google-hotels">
          Google Hotels
        </button>
        <button class="bs-btn bs-btn-best-western" data-service="best-western">
          BestWest
        </button>
        <button class="bs-btn bs-btn-radisson" data-service="radisson">
          Radisson
        </button>
      </div>
    </div>

    <!-- Search Section -->
    <div class="bs-section" id="bs-search-section" style="display: none;">
      <div class="bs-section-header">
        <svg class="bs-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <span>Search</span>
      </div>
      
      <div class="bs-search-container">
        <label for="bs-search-term">Search Term</label>
        <input type="text" id="bs-search-term" placeholder="e.g., Hyatt, Amex Green..." />
      </div>
      
      <div class="bs-buttons-grid">
        <button class="bs-btn bs-btn-travel-news" data-service="travel-news">
          Travel News
        </button>
        <button class="bs-btn bs-btn-hotel-points" data-service="hotel-points">
          Hotel Points
        </button>
        <button class="bs-btn bs-btn-airline-miles" data-service="airline-miles">
          Airline Miles
        </button>
        <button class="bs-btn bs-btn-credit-cards" data-service="credit-cards">
          Credit Cards
        </button>
        <button class="bs-btn bs-btn-search-engine" data-service="search-engine">
          Search Engine
        </button>
      </div>
    </div>

    <!-- Information Section -->
    <div class="bs-section" id="bs-information-section" style="display: none;">
        <div class="bs-section-header">
          <svg class="bs-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
          <span>Information</span>
          <div class="bs-header-actions">
            <button class="bs-action-btn bs-action-save" id="bs-save-information" title="Save information data">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
            <button class="bs-action-btn bs-action-reset" id="bs-reset-information" title="Reset information data">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
    
          
          <!-- Card Selection Panel -->
          <div class="card-selection-panel">
            <div class="bs-section-header">
              <h4>My Credit Cards <span class="card-count" id="total-cards-count">(Loading...)</span></h4>
            </div>
            <div class="bs-section-content">
              <div class="card-selection-controls">
                <input type="text" id="card-search-input" placeholder="Search cards..." class="card-search-input">
              </div>
              <div class="card-selection-grid" id="card-selection-grid">
                <!-- Cards will be loaded here -->
              </div>
            </div>
          </div>

          <!-- Selected Cards Comparison -->
          <div class="selected-cards-comparison" id="selected-cards-comparison">
            <div class="selected-cards-grid" id="selected-cards-grid">
              <!-- Selected cards comparison table will be displayed here -->
            </div>
          </div>

          <!-- Results Display -->
          <div class="results-display" id="results-display">

              <!-- Available Transfer Partners -->
              <div class="available-transfer-partners" id="available-transfer-partners">
                <div class="partners-header">
                  <h4>Available Transfer Partners (<span id="partners-count">0</span>)</h4>
                  <div class="partners-search-controls">
                    <input type="text" id="partners-search-input" placeholder="Search transfer partners..." class="partners-search-input">
                    <select id="partners-type-filter" class="partners-type-filter">
                      <option value="">All Types</option>
                      <option value="Airline">Airlines</option>
                      <option value="Hotel">Hotels</option>
                    </select>
                    <select id="partners-alliance-filter" class="partners-alliance-filter">
                      <option value="">All Alliances</option>
                      <option value="Star Alliance">Star Alliance</option>
                      <option value="SkyTeam">SkyTeam</option>
                      <option value="Oneworld">Oneworld</option>
                      <option value="None">No Alliance</option>
                    </select>
                  </div>
                </div>
              <div class="partners-content" id="partners-content">
                <!-- Filtered transfer partners will be displayed here -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    </div>
    
    <!-- Settings Section -->
    <div class="bs-section" id="bs-settings-section" style="display: none;">
      <div class="bs-section-header">
        <svg class="bs-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
        </svg>
        <span>Settings</span>
      </div>
      
      <div class="bs-settings-content">
        <div class="bs-settings-compact">
        <div class="bs-settings-item">
          <label>Language</label>
          <select id="bs-flight-language">
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
            <option value="it">Italiano</option>
            <option value="pl">Polski</option>
        </select>
        </div>
        <div class="bs-settings-item">
          <label>Currency</label>
          <select id="bs-flight-currency">
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CHF">CHF</option>
            <option value="PLN">PLN</option>
          </select>
        </div>
        <div class="bs-settings-item">
          <label>Location</label>
          <select id="bs-flight-location">
            <option value="US">United States</option>
            <option value="DE">Germany</option>
            <option value="GB">United Kingdom</option>
            <option value="FR">France</option>
            <option value="AT">Austria</option>
            <option value="CH">Switzerland</option>
            <option value="PL">Poland</option>
          </select>
        </div>
        <div class="bs-settings-item bs-settings-link">
          <a href="https://www.benefitsystems.io/" target="_blank" class="bs-link">Benefit Systems</a>
        </div>
        </div>
      </div>
    </div>
  `;
  
  // Insert panel at the top
  targetContainer.insertBefore(panel, targetContainer.firstChild);
  
  // Initialize event listeners
  initializeEventListeners();
  
  // Initialize collapse/expand functionality
  initializeCollapsible();
  
  // Load and apply saved toggle states
  const toggleStates = loadToggleStates();
  applyToggleStates(toggleStates);
  
  // Restore saved flight data after a short delay to ensure inputs are ready
  setTimeout(() => {
    restoreFlightData();
    restoreHotelData();
    // Initialize airport autocomplete after inputs are ready
    initializeAirportAutocomplete();
    // Initialize transfer partners tooltip
    initializeTransferPartnersTooltip();
    // Initialize Information section content
    initializeInformationContent();
    // Initialize credit card multipliers
    initializeCreditCardMultipliers();
  }, 100);
}

// Save toggle states to localStorage
function saveToggleStates() {
  const flightToggle = document.getElementById('bs-flight-toggle');
  const hotelToggle = document.getElementById('bs-hotel-toggle');
  const searchToggle = document.getElementById('bs-search-toggle');
  const informationToggle = document.getElementById('bs-information-toggle');
  const settingsToggle = document.getElementById('bs-settings-toggle');
  
  const toggleStates = {
    flight: flightToggle ? flightToggle.checked : false,
    hotel: hotelToggle ? hotelToggle.checked : false,
    search: searchToggle ? searchToggle.checked : false,
    information: informationToggle ? informationToggle.checked : false,
    settings: settingsToggle ? settingsToggle.checked : false
  };
  
  localStorage.setItem('bs-toggle-states', JSON.stringify(toggleStates));
}

// Load toggle states from localStorage
function loadToggleStates() {
  const savedStates = localStorage.getItem('bs-toggle-states');
  if (savedStates) {
    try {
      const toggleStates = JSON.parse(savedStates);
      return toggleStates;
    } catch (e) {
      console.log('BS Extension: Error parsing saved toggle states');
    }
  }
  
  // Default states if no saved data
  return {
    flight: true,  // Flight Search ON by default
    hotel: false,  // Hotel Search OFF by default
    search: false,  // Search OFF by default
    information: false,  // Information OFF by default
    settings: false // Settings OFF by default
  };
}

// Apply toggle states to UI
function applyToggleStates(toggleStates) {
  const flightToggle = document.getElementById('bs-flight-toggle');
  const hotelToggle = document.getElementById('bs-hotel-toggle');
  const searchToggle = document.getElementById('bs-search-toggle');
  const informationToggle = document.getElementById('bs-information-toggle');
  const settingsToggle = document.getElementById('bs-settings-toggle');
  const flightSection = document.getElementById('bs-flight-section');
  const hotelSection = document.getElementById('bs-hotel-section');
  const searchSection = document.getElementById('bs-search-section');
  const informationSection = document.getElementById('bs-information-section');
  const settingsSection = document.getElementById('bs-settings-section');
  
  // Apply flight toggle state
  if (flightToggle && flightSection) {
    flightToggle.checked = toggleStates.flight;
    flightSection.style.display = toggleStates.flight ? 'block' : 'none';
  }
  
  // Apply hotel toggle state
  if (hotelToggle && hotelSection) {
    hotelToggle.checked = toggleStates.hotel;
    hotelSection.style.display = toggleStates.hotel ? 'block' : 'none';
  }
  
  // Apply search toggle state
  if (searchToggle && searchSection) {
    searchToggle.checked = toggleStates.search;
    searchSection.style.display = toggleStates.search ? 'block' : 'none';
  }
  
  // Apply information toggle state
  if (informationToggle && informationSection) {
    informationToggle.checked = toggleStates.information;
    informationSection.style.display = toggleStates.information ? 'block' : 'none';
  }
  
  // Apply settings toggle state
  if (settingsToggle && settingsSection) {
    settingsToggle.checked = toggleStates.settings;
    settingsSection.style.display = toggleStates.settings ? 'block' : 'none';
  }
}

// Initialize all event listeners
function initializeEventListeners() {
  console.log('=== INITIALIZING EVENT LISTENERS ===');
  
  // Flight buttons
  const flightButtons = document.querySelectorAll('.bs-section:nth-child(1) .bs-btn');
  flightButtons.forEach(btn => {
    btn.addEventListener('click', handleFlightButtonClick);
  });
  
  // Hotel buttons
  const hotelButtons = document.querySelectorAll('.bs-section:nth-child(2) .bs-btn');
  hotelButtons.forEach(btn => {
    btn.addEventListener('click', handleHotelButtonClick);
  });
  
  // Search buttons
  const searchButtons = document.querySelectorAll('#bs-search-section .bs-btn');
  searchButtons.forEach(btn => {
    btn.addEventListener('click', handleSearchButtonClick);
  });
  
  // Section toggle functionality
  const flightToggle = document.getElementById('bs-flight-toggle');
  const hotelToggle = document.getElementById('bs-hotel-toggle');
  const searchToggle = document.getElementById('bs-search-toggle');
  const informationToggle = document.getElementById('bs-information-toggle');
  const settingsToggle = document.getElementById('bs-settings-toggle');
  const flightSection = document.getElementById('bs-flight-section');
  const hotelSection = document.getElementById('bs-hotel-section');
  const searchSection = document.getElementById('bs-search-section');
  const informationSection = document.getElementById('bs-information-section');
  const settingsSection = document.getElementById('bs-settings-section');
  
  console.log('Toggle elements found:', {
    flightToggle: !!flightToggle,
    hotelToggle: !!hotelToggle,
    searchToggle: !!searchToggle,
    informationToggle: !!informationToggle,
    settingsToggle: !!settingsToggle
  });
  
  console.log('Section elements found:', {
    flightSection: !!flightSection,
    hotelSection: !!hotelSection,
    searchSection: !!searchSection,
    informationSection: !!informationSection,
    settingsSection: !!settingsSection
  });
  
  if (flightToggle && flightSection) {
    flightToggle.addEventListener('change', () => {
      if (flightToggle.checked) {
        flightSection.style.display = 'block';
      } else {
        flightSection.style.display = 'none';
      }
      saveToggleStates();
    });
  }
  
  if (hotelToggle && hotelSection) {
    hotelToggle.addEventListener('change', () => {
      if (hotelToggle.checked) {
        hotelSection.style.display = 'block';
      } else {
        hotelSection.style.display = 'none';
      }
      saveToggleStates();
    });
  }
  
  if (searchToggle && searchSection) {
    searchToggle.addEventListener('change', () => {
      if (searchToggle.checked) {
        searchSection.style.display = 'block';
      } else {
        searchSection.style.display = 'none';
      }
      saveToggleStates();
    });
  }
  
  if (informationToggle && informationSection) {
    console.log('Setting up Information toggle event listener...');
    informationToggle.addEventListener('change', () => {
      console.log('Information toggle changed:', informationToggle.checked);
      if (informationToggle.checked) {
        informationSection.style.display = 'block';
        console.log('Information section shown');
      } else {
        informationSection.style.display = 'none';
        console.log('Information section hidden');
      }
      saveToggleStates();
    });
    
    // Also add click handler as backup
    informationToggle.addEventListener('click', () => {
      console.log('Information toggle clicked');
      setTimeout(() => {
        if (informationToggle.checked) {
          informationSection.style.display = 'block';
          console.log('Information section shown via click');
        } else {
          informationSection.style.display = 'none';
          console.log('Information section hidden via click');
        }
      }, 10);
    });
  } else {
    console.log('Information toggle or section not found:', { informationToggle, informationSection });
  }

      // Information data management buttons
      const informationSaveBtn = document.getElementById('bs-save-information');
      const informationResetBtn = document.getElementById('bs-reset-information');
      
      if (informationSaveBtn) {
        informationSaveBtn.addEventListener('click', function() {
          console.log('Information save button clicked');
          // Save current information data
          saveInformationData();
        });
      }
      
      if (informationResetBtn) {
        informationResetBtn.addEventListener('click', function() {
          console.log('Information reset button clicked');
          // Clear information data
          clearInformationData();
        });
      }
  
  if (settingsToggle && settingsSection) {
    console.log('Setting up Settings toggle event listener...');
    settingsToggle.addEventListener('change', () => {
      console.log('Settings toggle changed:', settingsToggle.checked);
      if (settingsToggle.checked) {
        settingsSection.style.display = 'block';
        console.log('Settings section shown');
      } else {
        settingsSection.style.display = 'none';
        console.log('Settings section hidden');
      }
      saveToggleStates();
    });
    
    // Also add click handler as backup
    settingsToggle.addEventListener('click', () => {
      console.log('Settings toggle clicked');
      setTimeout(() => {
        if (settingsToggle.checked) {
          settingsSection.style.display = 'block';
          console.log('Settings section shown via click');
        } else {
          settingsSection.style.display = 'none';
          console.log('Settings section hidden via click');
        }
      }, 10);
    });
  } else {
    console.log('Settings toggle or section not found:', { settingsToggle, settingsSection });
  }
  
  console.log('=== EVENT LISTENERS INITIALIZATION COMPLETE ===');
  
  // Handle airport input changes (autocomplete will handle the logic)
  const fromInput = document.getElementById('bs-flight-from');
  const toInput = document.getElementById('bs-flight-to');
  const airlineInput = document.getElementById('bs-flight-airline');
  const flightNumberInput = document.getElementById('bs-flight-number');
  
  // Auto-uppercase airline codes
  if (airlineInput) {
    airlineInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
      toggleSeatmapButtons();
    });
  }
  
  if (flightNumberInput) {
    flightNumberInput.addEventListener('input', () => {
      toggleSeatmapButtons();
    });
  }
  
  // Toggle seatmap buttons visibility based on airline and flight number
  function toggleSeatmapButtons() {
    const airline = airlineInput?.value?.trim() || '';
    const flightNumber = flightNumberInput?.value?.trim() || '';
    const showButtons = airline && flightNumber;
    
    const pointsYeahBtn = document.querySelector('.bs-btn-pointsyeah-seatmap');
    const seatsAeroBtn = document.querySelector('.bs-btn-seats-aero-seatmap');
    
    if (pointsYeahBtn) {
      pointsYeahBtn.style.display = showButtons ? '' : 'none';
    }
    if (seatsAeroBtn) {
      seatsAeroBtn.style.display = showButtons ? '' : 'none';
    }
  }
  
  // Initial check on load
  toggleSeatmapButtons();
  
  // Switch button for From/To
  const switchBtn = document.getElementById('bs-flight-switch');
  if (switchBtn && fromInput && toInput) {
    switchBtn.addEventListener('click', () => {
      const temp = fromInput.value;
      fromInput.value = toInput.value;
      toInput.value = temp;
      
      // Add animation
      switchBtn.classList.add('bs-switch-rotate');
      setTimeout(() => {
        switchBtn.classList.remove('bs-switch-rotate');
      }, 300);
    });
  }
  
  // Save and Reset buttons for Flight Search
  const saveFlightBtn = document.getElementById('bs-save-flight');
  const resetFlightBtn = document.getElementById('bs-reset-flight');
  
  if (saveFlightBtn) {
    saveFlightBtn.addEventListener('click', () => {
      const flightData = getFlightInputData();
      saveFlightDataToStorage(flightData);
      showNotification('Flight data saved!', 'success');
    });
  }
  
  if (resetFlightBtn) {
    resetFlightBtn.addEventListener('click', () => {
      // Clear all flight input fields
      if (fromInput) fromInput.value = '';
      if (toInput) toInput.value = '';
      if (document.getElementById('bs-flight-depart')) document.getElementById('bs-flight-depart').value = '';
      if (document.getElementById('bs-flight-return')) document.getElementById('bs-flight-return').value = '';
      if (document.getElementById('bs-flight-cabin')) document.getElementById('bs-flight-cabin').value = 'economy';
      if (document.getElementById('bs-flight-adults')) document.getElementById('bs-flight-adults').value = '1';
      if (airlineInput) airlineInput.value = '';
      if (flightNumberInput) flightNumberInput.value = '';
      
      // Clear saved data
      localStorage.removeItem('bs-extension-flight-data');
      
      // Hide seatmap buttons
      toggleSeatmapButtons();
      
      showNotification('Flight data reset!', 'info');
    });
  }
  
  // Save and Reset buttons for Hotel Search
  const saveHotelBtn = document.getElementById('bs-save-hotel');
  const resetHotelBtn = document.getElementById('bs-reset-hotel');
  
  if (saveHotelBtn) {
    saveHotelBtn.addEventListener('click', () => {
      const hotelData = getHotelInputData();
      saveHotelDataToStorage(hotelData);
      showNotification('Hotel data saved!', 'success');
    });
  }
  
  if (resetHotelBtn) {
    resetHotelBtn.addEventListener('click', () => {
      // Clear all hotel input fields
      if (document.getElementById('bs-hotel-city')) document.getElementById('bs-hotel-city').value = '';
      if (document.getElementById('bs-hotel-checkin')) document.getElementById('bs-hotel-checkin').value = '';
      if (document.getElementById('bs-hotel-checkout')) document.getElementById('bs-hotel-checkout').value = '';
      if (document.getElementById('bs-hotel-adults')) document.getElementById('bs-hotel-adults').value = '2';
      if (document.getElementById('bs-hotel-rooms')) document.getElementById('bs-hotel-rooms').value = '1';
      
      // Clear saved data
      localStorage.removeItem('bs-extension-hotel-data');
      
      showNotification('Hotel data reset!', 'info');
    });
  }
  
  // Add collapsible functionality for My Credit Cards section
  const creditCardsHeader = document.querySelector('#bs-information-section .card-selection-panel .bs-section-header');
  if (creditCardsHeader) {
    creditCardsHeader.addEventListener('click', function() {
      const section = this.closest('.card-selection-panel');
      if (section) {
        section.classList.toggle('expanded');
        console.log('My Credit Cards section toggled');
      }
    });
  }
}

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

// Handle hotel button clicks
function handleHotelButtonClick(e) {
  e.preventDefault();
  
  const service = e.currentTarget.dataset.service;
  const hotelData = getHotelInputData();
  
  if (!validateHotelData(hotelData)) {
    showNotification('Bitte alle Pflichtfelder ausfüllen (City, Check-In, Check-Out)', 'error');
    return;
  }
  
  const url = generateHotelUrl(service, hotelData);
  
  if (url) {
    window.open(url, '_blank');
  }
}

// Handle Search button clicks
function handleSearchButtonClick(e) {
  e.preventDefault();
  
  const service = e.currentTarget.dataset.service;
  const url = generateSearchUrl(service);
  
  if (url) {
    window.open(url, '_blank');
  }
}

// Generate Search URLs
function generateSearchUrl(service) {
  // Get search term from input
  const searchTerm = document.getElementById('bs-search-term')?.value?.trim() || '';
  const termParam = searchTerm ? `?term=${encodeURIComponent(searchTerm)}` : '';
  
  const urls = {
    'travel-news': `https://www.inoreader.com/folder/Travel%20News${termParam}`,
    'hotel-points': `https://www.inoreader.com/folder/Buy%20Hotels${termParam}`,
    'airline-miles': `https://www.inoreader.com/folder/Buy%20Airlines${termParam}`,
    'credit-cards': searchTerm 
      ? `https://www.uscreditcardguide.com/en/?s=${encodeURIComponent(searchTerm)}&searchsubmit=U`
      : 'https://www.uscreditcardguide.com/en/',
    'search-engine': searchTerm 
      ? `https://cse.google.com/cse?cx=6527d99d498034300&q=${encodeURIComponent(searchTerm)}`
      : 'https://cse.google.com/cse?cx=6527d99d498034300'
  };
  
  return urls[service] || '#';
}


// Save flight data to localStorage
function saveFlightDataToStorage(data) {
  try {
    localStorage.setItem('bs-extension-flight-data', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving flight data:', error);
  }
}

// Save hotel data to localStorage
function saveHotelDataToStorage(data) {
  try {
    localStorage.setItem('bs-extension-hotel-data', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving hotel data:', error);
  }
}

// Save information data to localStorage
function saveInformationData() {
  try {
    const selectedCards = Array.from(window.selectedCards || new Set());
    const informationData = {
      selectedCards: selectedCards,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('bs-information-data', JSON.stringify(informationData));
    
    // Show success feedback
    showFeedback('Information data saved successfully!', 'success');
    console.log('Information data saved:', informationData);
  } catch (error) {
    console.error('Error saving information data:', error);
    showFeedback('Error saving data. Please try again.', 'error');
  }
}

// Clear information data from localStorage
function clearInformationData() {
  try {
    localStorage.removeItem('bs-information-data');
    
    // Clear selected cards
    if (window.selectedCards) {
      window.selectedCards.clear();
    }
    
    // Re-render the interface
    if (window.renderCardSelection) {
      window.renderCardSelection();
    }
    if (window.renderSelectedCards) {
      window.renderSelectedCards();
    }
    if (window.filterTransferPartnersBySelectedCards) {
      window.filterTransferPartnersBySelectedCards();
    }
    if (window.updateCounts) {
      window.updateCounts();
    }
    
    // Show success feedback
    showFeedback('Information data cleared successfully!', 'success');
    console.log('Information data cleared');
  } catch (error) {
    console.error('Error clearing information data:', error);
    showFeedback('Error clearing data. Please try again.', 'error');
  }
}

// Show feedback message
function showFeedback(message, type = 'info') {
  // Remove existing feedback
  const existingFeedback = document.querySelector('.bs-feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }
  
  // Create feedback element
  const feedback = document.createElement('div');
  feedback.className = `bs-feedback bs-feedback-${type}`;
  feedback.textContent = message;
  
  // Style the feedback
  feedback.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    max-width: 300px;
  `;
  
  // Set colors based on type
  if (type === 'success') {
    feedback.style.background = '#d1f2eb';
    feedback.style.color = '#0e6b47';
    feedback.style.border = '1px solid #a3e4d7';
  } else if (type === 'error') {
    feedback.style.background = '#fadbd8';
    feedback.style.color = '#a93226';
    feedback.style.border = '1px solid #f1948a';
  } else {
    feedback.style.background = '#e8f0fe';
    feedback.style.color = '#1a73e8';
    feedback.style.border = '1px solid #a3c4f3';
  }
  
  // Add to document
  document.body.appendChild(feedback);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.style.opacity = '0';
      feedback.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }, 300);
    }
  }, 3000);
}

// Make showFeedback available globally
window.showFeedback = showFeedback;

// Load hotel data from localStorage
function loadHotelDataFromStorage() {
  try {
    const data = localStorage.getItem('bs-extension-hotel-data');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading hotel data:', error);
    return null;
  }
}

// Load flight data from localStorage
function loadFlightDataFromStorage() {
  try {
    const data = localStorage.getItem('bs-extension-flight-data');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading flight data:', error);
    return null;
  }
}

// Restore flight data to input fields
function restoreFlightData() {
  const savedData = loadFlightDataFromStorage();
  if (!savedData) return;
  
  // Restore all input fields
  if (savedData.from) {
    const fromInput = document.getElementById('bs-flight-from');
    if (fromInput) fromInput.value = savedData.from;
  }
  
  if (savedData.to) {
    const toInput = document.getElementById('bs-flight-to');
    if (toInput) toInput.value = savedData.to;
  }
  
  if (savedData.depart) {
    const departInput = document.getElementById('bs-flight-depart');
    if (departInput) departInput.value = savedData.depart;
  }
  
  if (savedData.return) {
    const returnInput = document.getElementById('bs-flight-return');
    if (returnInput) returnInput.value = savedData.return;
  }
  
  if (savedData.cabin) {
    const cabinInput = document.getElementById('bs-flight-cabin');
    if (cabinInput) cabinInput.value = savedData.cabin;
  }
  
  if (savedData.adults) {
    const adultsInput = document.getElementById('bs-flight-adults');
    if (adultsInput) adultsInput.value = savedData.adults;
  }
  
  
  if (savedData.language) {
    const languageInput = document.getElementById('bs-flight-language');
    if (languageInput) languageInput.value = savedData.language;
  }
  
  if (savedData.currency) {
    const currencyInput = document.getElementById('bs-flight-currency');
    if (currencyInput) currencyInput.value = savedData.currency;
  }
  
  if (savedData.location) {
    const locationInput = document.getElementById('bs-flight-location');
    if (locationInput) locationInput.value = savedData.location;
  }
  
  if (savedData.airline) {
    const airlineInput = document.getElementById('bs-flight-airline');
    if (airlineInput) airlineInput.value = savedData.airline;
  }
  
  if (savedData.flightNumber) {
    const flightNumberInput = document.getElementById('bs-flight-number');
    if (flightNumberInput) flightNumberInput.value = savedData.flightNumber;
  }
  
  // Trigger seatmap button visibility check after restoration
  setTimeout(() => {
    const airlineInput = document.getElementById('bs-flight-airline');
    const flightNumberInput = document.getElementById('bs-flight-number');
    const airline = airlineInput?.value?.trim() || '';
    const flightNumber = flightNumberInput?.value?.trim() || '';
    const showButtons = airline && flightNumber;
    
    const pointsYeahBtn = document.querySelector('.bs-btn-pointsyeah-seatmap');
    const seatsAeroBtn = document.querySelector('.bs-btn-seats-aero-seatmap');
    
    if (pointsYeahBtn) {
      pointsYeahBtn.style.display = showButtons ? '' : 'none';
    }
    if (seatsAeroBtn) {
      seatsAeroBtn.style.display = showButtons ? '' : 'none';
    }
  }, 100);
}

// Restore hotel data to input fields
function restoreHotelData() {
  const savedData = loadHotelDataFromStorage();
  if (!savedData) return;
  
  if (savedData.city) {
    const cityInput = document.getElementById('bs-hotel-city');
    if (cityInput) cityInput.value = savedData.city;
  }
  
  if (savedData.checkin) {
    const checkinInput = document.getElementById('bs-hotel-checkin');
    if (checkinInput) checkinInput.value = savedData.checkin;
  }
  
  if (savedData.checkout) {
    const checkoutInput = document.getElementById('bs-hotel-checkout');
    if (checkoutInput) checkoutInput.value = savedData.checkout;
  }
  
  if (savedData.adults) {
    const adultsInput = document.getElementById('bs-hotel-adults');
    if (adultsInput) adultsInput.value = savedData.adults;
  }
  
  if (savedData.rooms) {
    const roomsInput = document.getElementById('bs-hotel-rooms');
    if (roomsInput) roomsInput.value = savedData.rooms;
  }
}

// Get flight input data
function getFlightInputData() {
  const fromInput = document.getElementById('bs-flight-from');
  const toInput = document.getElementById('bs-flight-to');
  
  // Extract IATA codes from airport data or fallback to input value
  let fromCode = '';
  let toCode = '';
  
  if (fromInput) {
    const fromAirportData = fromInput.dataset.airportData;
    if (fromAirportData) {
      try {
        const airport = JSON.parse(fromAirportData);
        fromCode = airport.iata || fromInput.value?.trim()?.toUpperCase() || '';
      } catch (e) {
        fromCode = fromInput.value?.trim()?.toUpperCase() || '';
      }
    } else {
      fromCode = fromInput.value?.trim()?.toUpperCase() || '';
    }
  }
  
  if (toInput) {
    const toAirportData = toInput.dataset.airportData;
    if (toAirportData) {
      try {
        const airport = JSON.parse(toAirportData);
        toCode = airport.iata || toInput.value?.trim()?.toUpperCase() || '';
      } catch (e) {
        toCode = toInput.value?.trim()?.toUpperCase() || '';
      }
    } else {
      toCode = toInput.value?.trim()?.toUpperCase() || '';
    }
  }

  return {
    from: fromCode,
    to: toCode,
    depart: document.getElementById('bs-flight-depart')?.value || '',
    return: document.getElementById('bs-flight-return')?.value || '',
    cabin: document.getElementById('bs-flight-cabin')?.value || 'economy',
    adults: parseInt(document.getElementById('bs-flight-adults')?.value || '1', 10),
    language: document.getElementById('bs-flight-language')?.value || 'en',
    currency: document.getElementById('bs-flight-currency')?.value || 'USD',
    location: document.getElementById('bs-flight-location')?.value || 'US',
    airline: document.getElementById('bs-flight-airline')?.value?.trim()?.toUpperCase() || '',
    flightNumber: document.getElementById('bs-flight-number')?.value?.trim() || ''
  };
}

// Get hotel input data
function getHotelInputData() {
      return {
    city: document.getElementById('bs-hotel-city')?.value?.trim() || '',
    checkin: document.getElementById('bs-hotel-checkin')?.value || '',
    checkout: document.getElementById('bs-hotel-checkout')?.value || '',
    adults: parseInt(document.getElementById('bs-hotel-adults')?.value || '2', 10),
    rooms: parseInt(document.getElementById('bs-hotel-rooms')?.value || '1', 10)
  };
}

// Validate flight data
function validateFlightData(data) {
  return data.from && data.to && data.depart;
}

// Validate hotel data
function validateHotelData(data) {
  return data.city && data.checkin && data.checkout;
}

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
  
  const urls = {
    'google-flights': `https://www.google.com/travel/flights/search?q=flights+from+${from}+to+${to}+${ret ? depart+'+to+'+ret : 'oneway+on+'+depart}+in+${cabin}+class&hl=${language}&curr=${currency}&gl=${location}`,
    
    'points-yeah': `https://www.pointsyeah.com/search?cabins=${pointsYeahCabin}&cabin=${pointsYeahCabin}&banks=Amex%2CCapital+One%2CChase&airlineProgram=AM%2CAC%2CKL%2CAS%2CAV%2CDL%2CEK%2CEY%2CAY%2CB6%2CQF%2CSQ%2CTK%2CUA%2CVS%2CVA&tripType=${ret ? '2' : '1'}&adults=${adults}&children=0&departure=${from}&arrival=${to}&departDate=${depart}&departDateSec=${depart}&returnDate=${ret || depart}&returnDateSec=${ret || depart}&multiday=false`,
    
    'award-tool': ret 
      ? `https://www.awardtool.com/flight?flightWay=roundtrip&pax=${adults}&children=0&cabins=${cabin}&range=false&rangeV2=false&from=${from}&to=${to}&programs=&targetId=&roundTripDepartureDate=${departTimestamp}&roundTripReturnDate=${returnTimestamp}`
      : `https://www.awardtool.com/flight?flightWay=oneway&pax=${adults}&children=0&cabins=${cabin}&range=true&rangeV2=false&from=${from}&to=${to}&programs=&targetId=&oneWayRangeStartDate=${departTimestamp}&oneWayRangeEndDate=${departTimestamp}`,
    
    'seats-aero': `https://seats.aero/search?min_seats=${adults}&applicable_cabin=${cabin}&additional_days=true&additional_days_num=7&max_fees=40000&date=${depart}&origins=${from}&destinations=${to}`,
    
    'point-me': `https://point.me/results?departureCity=${from}&departureIata=${from}&arrivalCity=${to}&arrivalIata=${to}&legType=${ret ? 'roundtrip' : 'oneway'}&classOfService=${cabin}&passengers=${adults}&departureDate=${depart}&arrivalDate=${ret || ''}`,
    
    'kayak': `https://www.kayak.com/flights/${from}-${to}/${depart}${ret ? '/' + ret : ''}/${adults}adults?sort=bestflight_a`,
    
    'skyscanner': `https://www.skyscanner.com/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${skyscannerDate}/${ret ? retDate : ''}?adults=${adults}&cabinclass=${skyscannerCabin}&currency=USD&locale=en-US&market=US`,
    
    'air-canada': ret
      ? `https://www.aircanada.com/aeroplan/redeem/availability/outbound?org0=${from}&dest0=${to}&org1=${to}&dest1=${from}&departureDate0=${depart}&departureDate1=${ret}&ADT=${adults}&YTH=0&CHD=0&INF=0&INS=0&lang=en-CA&tripType=R&marketCode=INT`
      : `https://www.aircanada.com/aeroplan/redeem/availability/outbound?org0=${from}&dest0=${to}&departureDate0=${depart}&ADT=${adults}&YTH=0&CHD=0&INF=0&INS=0&lang=en-CA&tripType=O&marketCode=INT`,
    
    'rovemiles': `https://www.rovemiles.com/search/flights?origin=${from}&destination=${to}&cabin=${cabin}&adults=${adults}&children=0&infants=0&payment=miles&start_date=${depart}`,
    
    'fare-class': `https://seats.aero/fareclass?from=${from}&to=${to}&date=${depart}&carriers=&connections=false`,
    
    'flight-connections': `https://www.flightconnections.com/de/fl%C3%BCge-von-${from.toLowerCase()}-nach-${to.toLowerCase()}`,
    
    'turbli': `https://turbli.com/${from}/${to}/${depart}/`,
    
    'pointsyeah-seatmap': data.airline && data.flightNumber ? `https://www.pointsyeah.com/seatmap/detail?airline=${encodeURIComponent(data.airline)}&departure=${from}&arrival=${to}&date=${depart}&flightNumber=${encodeURIComponent(data.flightNumber)}&cabins=Economy%2CPremium%20Economy%2CBusiness%2CFirst` : '#',
    
    'seats-aero-seatmap': data.airline && data.flightNumber ? `https://seats.aero/seatmap?airline=${encodeURIComponent(data.airline)}&from=${from}&to=${to}&date=${depart}&flight=${encodeURIComponent(data.flightNumber)}` : '#'
  };
  
  return urls[service] || '#';
}

// Generate hotel URLs
function generateHotelUrl(service, data) {
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
    'google-hotels': `https://www.google.com/travel/search?q=${encodeURIComponent(city)}&ts=CAESABogCgIaABIaEhQKBwjpDxABGAESBwjpDxABGAIYATICEAAqCQoFOgNVU0QaAA&ap=aAE&qs=OAA&hl=en-US&gl=us&ved=0CAAQ5JsGahcKEwiYgdOF74aQAxUAAAAAHQAAAAAQBg&checkin=${checkin}&checkout=${checkout}&adults=${adults}&rooms=${rooms}`,
    
    'hilton': `https://www.hilton.com/en/search/?query=${encodeURIComponent(city)}&arrivalDate=${checkin}&departureDate=${checkout}&flexibleDates=false&numRooms=${rooms}&numAdults=${adults}&numChildren=0`,
    
    'hyatt': `https://www.hyatt.com/search/hotels/de-DE/${encodeURIComponent(city)}?checkinDate=${checkin}&checkoutDate=${checkout}&rooms=${rooms}&adults=${adults}&kids=0&rate=Standard&rateFilter=woh`,
    
    'marriott': `https://www.marriott.com/de/search/findHotels.mi?fromToDate_submit=${toDateMarriott}&fromDate=${fromDateDotted}&toDate=${toDateDotted}&toDateDefaultFormat=${toDateMarriott}&fromDateDefaultFormat=${fromDateMarriott}&lengthOfStay=${nights}&childrenCount=0&roomCount=${rooms}&numAdultsPerRoom=${adults}&destinationAddress.destination=${encodeURIComponent(city)}&useRewardsPoints=true&deviceType=desktop-web&view=list&isInternalSearch=true&vsInitialRequest=false&searchType=InCity&singleSearch=true&flexibleDateSearchRateDisplay=false&isSearch=true&isRateCalendar=true&t-start=${checkin}&t-end=${checkout}&flexibleDateSearch=false&isTransient=true&initialRequest=true&fromToDate=${fromDateMarriott}&numberOfRooms=${rooms}`,
    
    'ihg': `https://www.ihg.com/hotels/us/en/find-hotels/hotel-search?qDest=${encodeURIComponent(city)}&qPt=POINTS&qCiD=${checkInIHG.day}&qCoD=${checkOutIHG.day}&qCiMy=${checkInIHG.monthYear}&qCoMy=${checkOutIHG.monthYear}&qAdlt=${adults}&qChld=0&qRms=${rooms}&qRtP=IVANI&qAkamaiCC=PL&srb_u=1&qExpndSrch=false&qSrt=sRT&qBrs=6c.hi.ex.sb.ul.ic.cp.cw.in.vn.cv.rs.ki.kd.ma.sp.va.sp.re.vx.nd.sx.we.lx.rn.sn.sn.sn.sn.sn.nu.ge&qWch=0&qSmP=0&qRad=30&qRdU=mi&setPMCookies=false&qLoSe=false`,
    
    'accor': `https://all.accor.com/booking/en/accor/hotels/${encodeURIComponent(city.toLowerCase())}?compositions=${adults}${rooms > 1 ? ',' + rooms : ''}&stayplus=true&sortBy=PRICE_LOW_TO_HIGH&dateIn=${checkin}&dateOut=${checkout}`,
    
    'wyndham': `https://www.wyndhamhotels.com/de-de/hotels/${encodeURIComponent(city.toLowerCase())}?brand_id=ALL&checkInDate=${checkin}&checkOutDate=${checkout}&useWRPoints=true&children=0&adults=${adults}&rooms=${rooms}`,
    
    'choice': `https://www.choicehotels.com/de-de/${encodeURIComponent(city.toLowerCase())}/hotels?adults=${adults}&checkInDate=${checkin}&checkOutDate=${checkout}&ratePlanCode=SRD&sort=price`,
    
    'melia': `https://www.melia.com/en/booking?checkIn=${checkin}&checkOut=${checkout}&rooms=${rooms}&adults=${adults}&destination=${encodeURIComponent(city)}&search=${encodeURIComponent(JSON.stringify({destination:{city:city,type:"DESTINATION",name:city.toLowerCase()},occupation:[{adults:adults}],calendar:{dates:[new Date(checkin).getTime(),new Date(checkout).getTime()],locale:"en"}}))}`,
    
    'best-western': `https://www.bestwestern.com/en_US/book/hotels-in-${encodeURIComponent(city.toLowerCase())}.html?checkIn=${checkin}&checkOut=${checkout}&adults=${adults}&rooms=${rooms}`,
    
    'radisson': `https://www.radissonhotels.com/en-us/booking/search-results?destination=${encodeURIComponent(city)}&checkInDate=${checkin}&checkOutDate=${checkout}&adults%5B%5D=${adults}&children%5B%5D=0&aoc%5B%5D=&searchType=lowest&promotionCode=&voucher=&brands=`,
    
    'gha': `https://de.ghadiscovery.com/search/hotels?keyword=${encodeURIComponent(city)}&clearBookingParams=1&types=all&sortBy=price&sortDirection=asc`,
    
    'rooms-aero': `https://rooms.aero/search?city=${encodeURIComponent(city)}&start=${checkin}&end=${checkout}&nights=${nights}`
  };
  
  return urls[service] || '#';
}


// Show notification
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.querySelector('.bs-notification');
  if (existing) {
    existing.remove();
  }
  
  // Create notification
  const notification = document.createElement('div');
  notification.className = `bs-notification bs-notification-${type}`;
  notification.textContent = message;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('bs-notification-hide');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Initialize collapse/expand functionality (removed - no longer needed without logo)
function initializeCollapsible() {
  // Functionality removed as logo toggle has been removed
}

// Setup observer to inject panel when page loads
function setupObserver() {
  // Try multiple times with different delays
  const delays = [100, 500, 1000, 2000, 3000];
  delays.forEach(delay => {
    setTimeout(() => injectExtensionPanel(), delay);
  });
  
  // Watch for DOM changes
  const observer = new MutationObserver(() => {
    if (!document.querySelector('.bs-extension-panel')) {
      injectExtensionPanel();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also watch for URL changes (for SPA navigation)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(() => injectExtensionPanel(), 500);
    }
  }).observe(document, { subtree: true, childList: true });
}

// Initialize airport autocomplete
function initializeAirportAutocomplete() {
  // Wait for airport data service to be available
  const initAutocomplete = () => {
    if (!window.airportDataService) {
      setTimeout(initAutocomplete, 100);
      return;
    }

    // Find airport input fields
    const fromInput = document.getElementById('bs-flight-from');
    const toInput = document.getElementById('bs-flight-to');

    if (fromInput && !fromInput.dataset.autocompleteInitialized) {
      new AirportAutocomplete(fromInput, {
        maxResults: 8,
        minQueryLength: 1
      });
      fromInput.dataset.autocompleteInitialized = 'true';
      console.log('Airport autocomplete initialized for FROM input');
    }

    if (toInput && !toInput.dataset.autocompleteInitialized) {
      new AirportAutocomplete(toInput, {
        maxResults: 8,
        minQueryLength: 1
      });
      toInput.dataset.autocompleteInitialized = 'true';
      console.log('Airport autocomplete initialized for TO input');
    }
  };

  // Start initialization
  initAutocomplete();
}

// Initialize extension
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupObserver);
  } else {
  setupObserver();
}

// Run injection immediately
setupObserver();

