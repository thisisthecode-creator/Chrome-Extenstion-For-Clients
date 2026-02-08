// ==============================
// Google Flights Extension - Clean Version
// ==============================

// Apply saved Seats.aero API key to config as early as possible (API URL is always default)
(function applySeatsAeroSettings() {
  if (typeof window.config !== 'undefined' && window.config.api && window.config.api.seatsAero) {
    try {
      const key = localStorage.getItem('bs-seatsaero-api-key');
      if (key !== null && key !== undefined) window.config.api.seatsAero.key = (key || '').trim();
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'saveSeatsAeroSettings', baseUrl: '', key: (key !== null && key !== undefined) ? (key || '').trim() : '' }, () => {});
      }
    } catch (e) { /* ignore */ }
  }
})();

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
    <!-- Icon Logo with Section Toggles -->
    <div class="bs-logo-container" id="bs-logo-container">
      <div class="bs-logo-header">
        <a href="https://www.benefitsystems.io/" target="_blank" class="bs-logo-link">
          <img src="https://tools.benefitsystems.io/Benefit3.png" alt="Benefit Systems" class="bs-logo bs-logo-light" />
          <img src="" alt="Benefit Systems" class="bs-logo bs-logo-dark" id="bs-logo-dark" />
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
              <input type="checkbox" id="bs-hotel-toggle" checked>
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
        <span class="bs-section-icon" style="font-size: 20px; line-height: 1;">✈️</span>
        <span>Flight Search</span>
        <button class="bs-action-btn bs-action-info" id="bs-flight-transfer-info" title="Airline transfer ratios (Amex, Chase, Citi, etc.)" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span class="bs-action-info-label">Info</span>
        </button>
        <button class="bs-action-btn bs-action-refresh" id="bs-refresh-flight" title="Refresh results">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10"/>
            <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14"/>
          </svg>
          <span class="bs-action-btn-label">Refresh</span>
        </button>
        <button class="bs-action-btn bs-action-open-all" id="bs-flight-open-all" title="Open all flight search services">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          <span class="bs-action-btn-label">Open All</span>
        </button>
        <div class="bs-header-controls">
          <div class="bs-auto-reload-toggle">
            <label class="bs-toggle-label" for="bs-external-links-toggle">Search Links</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-external-links-toggle">
              <span class="bs-toggle-slider"></span>
            </label>
          </div>
          <div class="bs-auto-reload-toggle">
            <label class="bs-toggle-label" for="bs-flight-nonstop">Nonstop</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-flight-nonstop" title="Add nonstop filter to Google Flights">
              <span class="bs-toggle-slider"></span>
            </label>
          </div>
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
      </div>
      
      <div class="bs-inputs-grid">
        <div class="bs-input-group">
          <label>From</label>
          <input type="text" id="bs-flight-from" placeholder="New York" autocomplete="off" />
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
          <input type="text" id="bs-flight-to" placeholder="Vienna" autocomplete="off" />
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
          <select id="bs-flight-cabin" style="min-width: 160px;">
          <option value="economy">Economy</option>
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
      </div>
      
      <div class="bs-buttons-grid" id="bs-external-links" style="display:none;">
        <button class="bs-btn bs-btn-google-flights" data-service="google-flights">
          Google Flights
        </button>
        <button class="bs-btn bs-btn-points-yeah" data-service="points-yeah">
          PointsYeah
          <span class="bs-btn-badge bs-btn-badge-login" title="Login required">Login</span>
        </button>
        <button class="bs-btn bs-btn-award-tool" data-service="award-tool">
          AwardTool
          <span class="bs-btn-badge bs-btn-badge-login" title="Login required">Login</span>
        </button>
        <button class="bs-btn bs-btn-seats-aero" data-service="seats-aero">
          Seats.aero
          <span class="bs-btn-badge bs-btn-badge-login" title="Login required">Login</span>
        </button>
        <button class="bs-btn bs-btn-point-me" data-service="point-me">
          Point.me
          <span class="bs-btn-badge bs-btn-badge-login" title="Login required">Login</span>
        </button>
        <button class="bs-btn bs-btn-kayak" data-service="kayak">
          Kayak
        </button>
        <button class="bs-btn bs-btn-skyscanner" data-service="skyscanner">
          Skyscanner
        </button>
        <button class="bs-btn bs-btn-air-canada" data-service="air-canada">
          Air Canada
          <span class="bs-btn-badge bs-btn-badge-login" title="Login required">Login</span>
        </button>
        <button class="bs-btn bs-btn-rovemiles" data-service="rovemiles">
          Rovemiles
          <span class="bs-btn-badge bs-btn-badge-login" title="Login required">Login</span>
        </button>
        <button class="bs-btn bs-btn-fare-class" data-service="fare-class">
          Fare Class
          <span class="bs-btn-badge bs-btn-badge-login" title="Login required">Login</span>
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
    </div>

    <!-- Hotel Search Section -->
    <div class="bs-section" id="bs-hotel-section" style="display: none;">
      <div class="bs-section-header">
        <span class="bs-section-icon" style="font-size: 20px; line-height: 1;">🏨</span>
        <span>Hotel Search</span>
        <button class="bs-action-btn bs-action-info" id="bs-hotel-transfer-info" title="Hotel transfer ratios (Amex, Chase, Citi, etc.)" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span class="bs-action-info-label">Info</span>
        </button>
        <button class="bs-action-btn bs-action-info" id="bs-hotel-tiers" title="Hotel loyalty tiers and benefits" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span class="bs-action-info-label">Tiers</span>
        </button>
        <button class="bs-action-btn bs-action-refresh" id="bs-refresh-hotel" title="Refresh results">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10"/>
            <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14"/>
          </svg>
          <span class="bs-action-btn-label">Refresh</span>
        </button>
        <button class="bs-action-btn bs-action-open-all" id="bs-hotel-open-all" title="Open all hotel search services">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          <span class="bs-action-btn-label">Open All</span>
        </button>
        <div class="bs-header-controls">
          <div class="bs-auto-reload-toggle">
            <label class="bs-toggle-label" for="bs-hotel-external-links-toggle">Search Links</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-hotel-external-links-toggle">
              <span class="bs-toggle-slider"></span>
            </label>
          </div>
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
      
      <div class="bs-buttons-grid" id="bs-hotel-external-links" style="display:none;">
        <button class="bs-btn bs-btn-google-hotels" data-service="google-hotels">
          Google Hotels
        </button>
        <button class="bs-btn bs-btn-rooms-aero" data-service="rooms-aero">
          Rooms.aero
        </button>
        <button class="bs-btn bs-btn-points-yeah" data-service="pointsyeah-hotels">
          PointsYeah
          <span class="bs-btn-badge bs-btn-badge-login" title="Login required">Login</span>
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
        <button class="bs-btn bs-btn-melia" data-service="melia">
          Melia
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
        <button class="bs-btn bs-btn-preferred-hotels" data-service="preferred-hotels" title="Choice 1:2">
          Preferred Hotels
          <span class="bs-btn-badge bs-btn-badge-citi" title="Choice 1:2">Choice 1:2</span>
        </button>
        <button class="bs-btn bs-btn-iprefer" data-service="iprefer" title="Citi 1:4">
          iPrefer
          <span class="bs-btn-badge bs-btn-badge-citi" title="Citi 1:4">Citi 1:4</span>
        </button>
        <button class="bs-btn bs-btn-gha" data-service="gha">
          GHA
        </button>
      </div>
    </div>

    <!-- Calculation Section - REMOVED -->

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
          <div class="bs-settings-row bs-settings-row-theme">
            <div class="bs-settings-item bs-settings-item-theme">
              <label for="bs-theme-select">Theme</label>
              <select id="bs-theme-select" class="bs-settings-select" title="Extension and flight row appearance">
                <option value="light">Light</option>
                <option value="dark">Dark mode</option>
              </select>
            </div>
          </div>
          <div class="bs-settings-group-label">Flight row colors</div>
          <div class="bs-settings-row bs-settings-row-colors">
            <div class="bs-settings-item bs-settings-item-color">
              <label for="bs-color-nonstop">Nonstop</label>
              <div class="bs-settings-color-row">
                <input type="color" id="bs-color-nonstop" class="bs-settings-color-input" value="#e3ffdb" title="Nonstop flights row color">
                <input type="text" id="bs-color-nonstop-hex" class="bs-settings-color-hex" maxlength="7" placeholder="#e3ffdb" spellcheck="false">
              </div>
            </div>
            <div class="bs-settings-item bs-settings-item-color">
              <label for="bs-color-stops">1 stop</label>
              <div class="bs-settings-color-row">
                <input type="color" id="bs-color-stops" class="bs-settings-color-input" value="#ffecd1" title="1 stop flights row color">
                <input type="text" id="bs-color-stops-hex" class="bs-settings-color-hex" maxlength="7" placeholder="#ffecd1" spellcheck="false">
              </div>
            </div>
            <div class="bs-settings-item bs-settings-item-color">
              <label for="bs-color-multiple-stops">2+ stops</label>
              <div class="bs-settings-color-row">
                <input type="color" id="bs-color-multiple-stops" class="bs-settings-color-input" value="#fbd3d0" title="2+ stops flights row color">
                <input type="text" id="bs-color-multiple-stops-hex" class="bs-settings-color-hex" maxlength="7" placeholder="#fbd3d0" spellcheck="false">
              </div>
            </div>
          </div>
          <div class="bs-settings-row">
            <div class="bs-settings-item bs-settings-item-api-key">
              <label for="bs-seatsaero-api-key">Seats.aero API Key</label>
              <div class="bs-settings-input-row">
                <input type="password" id="bs-seatsaero-api-key" class="bs-settings-input" placeholder="Your key" autocomplete="off" spellcheck="false" title="Your Seats.aero partner API key. Required for award search.">
                <button type="button" class="bs-settings-key-toggle" id="bs-seatsaero-key-toggle" title="Show/hide key" aria-label="Show or hide API key">Show</button>
              </div>
            </div>
          </div>
          <div class="bs-settings-item bs-settings-link">
            <a href="https://www.benefitsystems.io/" target="_blank" class="bs-link">Benefit Systems</a>
          </div>
        </div>
      </div>
    </div>
    </div>
  `;
  
  // Insert panel at the top
  targetContainer.insertBefore(panel, targetContainer.firstChild);
  
  // Dark mode logo: use extension icon (icon128.png)
  const darkLogo = document.getElementById('bs-logo-dark');
  if (darkLogo && typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
    darkLogo.src = chrome.runtime.getURL('icon128.png');
  }
  
  // Initialize event listeners
  initializeEventListeners();
  
  // Initialize collapse/expand functionality
  initializeCollapsible();
  
  // Load and apply saved toggle states
  const toggleStates = loadToggleStates();
  applyToggleStates(toggleStates);
  
  // Apply saved theme and flight row colors
  applyDarkMode();
  applyFlightStopColors();
  
  // Restore saved flight data after a short delay to ensure inputs are ready
  setTimeout(() => {
    restoreFlightData();
    restoreHotelData();
    restoreSeatsAeroSettings();
    // Initialize airport autocomplete after inputs are ready
    initializeAirportAutocomplete();
    // Initialize transfer partners tooltip
    initializeTransferPartnersTooltip();
    // Initialize credit card multipliers
    initializeCreditCardMultipliers();
    // Initialize calculation section
    initializeCalculationSection();
  }, 100);
}

// Save toggle states to localStorage
function saveToggleStates() {
  const flightToggle = document.getElementById('bs-flight-toggle');
  const hotelToggle = document.getElementById('bs-hotel-toggle');
  const settingsToggle = document.getElementById('bs-settings-toggle');
  
  const toggleStates = {
    flight: flightToggle ? flightToggle.checked : false,
    hotel: hotelToggle ? hotelToggle.checked : false,
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
  
  // Default states if no saved data (all ON except Settings)
  return {
    flight: true,   // Flight Search ON by default
    hotel: true,    // Hotel Search ON by default
    search: true,   // Search ON by default
    information: true,  // Information ON by default
    calculation: true,  // Calculation ON by default
    rovemiles: true,    // Rovemiles ON by default
    settings: false     // Settings OFF by default (only one that stays off)
  };
}

// Apply toggle states to UI
function applyToggleStates(toggleStates) {
  const flightToggle = document.getElementById('bs-flight-toggle');
  const hotelToggle = document.getElementById('bs-hotel-toggle');
  const settingsToggle = document.getElementById('bs-settings-toggle');
  const flightSection = document.getElementById('bs-flight-section');
  const hotelSection = document.getElementById('bs-hotel-section');
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
  // Apply calculation toggle state
  // Also check for total calculator, rovemiles, hyatt calculator, and hilton calculator toggles
  const totalCalculatorToggle = document.getElementById('bs-total-calculator-toggle');
  const totalCalculatorSection = document.getElementById('bs-total-calculator-section');
  const hyattCalculatorToggle = document.getElementById('bs-hyatt-calculator-toggle');
  const hyattCalculatorSection = document.getElementById('bs-hyatt-calculator-section');
  const hiltonCalculatorToggle = document.getElementById('bs-hilton-calculator-toggle');
  const hiltonCalculatorSection = document.getElementById('bs-hilton-calculator-section');
  
  
  // Apply settings toggle state
  if (settingsToggle && settingsSection) {
    settingsToggle.checked = toggleStates.settings;
    settingsSection.style.display = toggleStates.settings ? 'block' : 'none';
  }
}

// Theme: apply Light or Dark (Google Flights) to panel and body
function applyTheme() {
  const theme = localStorage.getItem('bs-theme') || 'light';
  const isDark = theme === 'dark';
  const panel = document.querySelector('.bs-extension-panel');
  if (panel) {
    if (isDark) {
      panel.classList.add('bs-dark-mode');
      document.body.classList.add('bs-dark-mode');
    } else {
      panel.classList.remove('bs-dark-mode');
      document.body.classList.remove('bs-dark-mode');
    }
  }
  const themeSelect = document.getElementById('bs-theme-select');
  if (themeSelect) {
    themeSelect.value = theme;
  }
  applyFlightStopColors();
}

// Backward compatibility: applyDarkMode still used by old toggle if present
function applyDarkMode() {
  const theme = localStorage.getItem('bs-theme');
  if (theme !== undefined && theme !== null) {
    applyTheme();
    return;
  }
  const enabled = localStorage.getItem('bs-dark-mode-enabled') === 'true';
  if (enabled) localStorage.setItem('bs-theme', 'dark');
  else localStorage.setItem('bs-theme', 'light');
  applyTheme();
}

// Lighten/darken hex for gradients (0–1 factor)
function hexLighten(hex, factor) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
  r = Math.round(r + (255 - r) * factor);
  g = Math.round(g + (255 - g) * factor);
  b = Math.round(b + (255 - b) * factor);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}
function hexDarken(hex, factor) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
  r = Math.round(r * (1 - factor));
  g = Math.round(g * (1 - factor));
  b = Math.round(b * (1 - factor));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Relative luminance (0–1). Use dark text if luminance > threshold, else light text for contrast.
function hexLuminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 0xff) / 255;
  const g = ((n >> 8) & 0xff) / 255;
  const b = (n & 0xff) / 255;
  const [rs, gs, bs] = [r, g, b].map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
function textColorForBackground(hex) {
  return hexLuminance(hex) > 0.5 ? '#1a1a1a' : '#ffffff';
}

// Inject or update dynamic style for flight stop row colors (exact color from settings) + contrast text
function applyFlightStopColors() {
  const nonstop = (localStorage.getItem('bs-flight-color-nonstop') || '#e3ffdb').replace(/^#?/, '#');
  const stops = (localStorage.getItem('bs-flight-color-stops') || '#ffecd1').replace(/^#?/, '#');
  const multi = (localStorage.getItem('bs-flight-color-multiple-stops') || '#fbd3d0').replace(/^#?/, '#');

  const nonstopText = textColorForBackground(nonstop);
  const stopsText = textColorForBackground(stops);
  const multiText = textColorForBackground(multi);

  let css = '/* Benefit Systems – flight row colors (plain) + contrast text */\n';
  css += '.yR1fYc.bs-nonstop-flight { background: ' + nonstop + ' !important; border-color: ' + nonstop + ' !important; box-shadow: none !important; color: ' + nonstopText + ' !important; }\n';
  css += '.yR1fYc.bs-nonstop-flight * { color: ' + nonstopText + ' !important; }\n';
  css += '.yR1fYc.bs-stops-flight { background: ' + stops + ' !important; border-color: ' + stops + ' !important; box-shadow: none !important; color: ' + stopsText + ' !important; }\n';
  css += '.yR1fYc.bs-stops-flight * { color: ' + stopsText + ' !important; }\n';
  css += '.yR1fYc.bs-multiple-stops-flight { background: ' + multi + ' !important; border-color: ' + multi + ' !important; box-shadow: none !important; color: ' + multiText + ' !important; }\n';
  css += '.yR1fYc.bs-multiple-stops-flight * { color: ' + multiText + ' !important; }\n';
  css += 'body.bs-dark-mode .yR1fYc.bs-nonstop-flight { background: ' + nonstop + ' !important; border-color: ' + nonstop + ' !important; box-shadow: none !important; color: ' + nonstopText + ' !important; }\n';
  css += 'body.bs-dark-mode .yR1fYc.bs-nonstop-flight * { color: ' + nonstopText + ' !important; }\n';
  css += 'body.bs-dark-mode .yR1fYc.bs-stops-flight { background: ' + stops + ' !important; border-color: ' + stops + ' !important; box-shadow: none !important; color: ' + stopsText + ' !important; }\n';
  css += 'body.bs-dark-mode .yR1fYc.bs-stops-flight * { color: ' + stopsText + ' !important; }\n';
  css += 'body.bs-dark-mode .yR1fYc.bs-multiple-stops-flight { background: ' + multi + ' !important; border-color: ' + multi + ' !important; box-shadow: none !important; color: ' + multiText + ' !important; }\n';
  css += 'body.bs-dark-mode .yR1fYc.bs-multiple-stops-flight * { color: ' + multiText + ' !important; }\n';

  let el = document.getElementById('bs-flight-stop-colors');
  if (!el) {
    el = document.createElement('style');
    el.id = 'bs-flight-stop-colors';
    document.head.appendChild(el);
  }
  el.textContent = css;
}

// Initialize drag and drop for buttons
function initializeButtonDragAndDrop() {
  // Initialize flight buttons drag and drop
  const flightButtonsContainer = document.getElementById('bs-external-links');
  if (flightButtonsContainer) {
    setupDragAndDrop(flightButtonsContainer, 'bs-flight-buttons-order');
    restoreButtonOrder(flightButtonsContainer, 'bs-flight-buttons-order');
  }
  
  // Initialize hotel buttons drag and drop
  const hotelButtonsContainer = document.getElementById('bs-hotel-external-links');
  if (hotelButtonsContainer) {
    setupDragAndDrop(hotelButtonsContainer, 'bs-hotel-buttons-order');
    restoreButtonOrder(hotelButtonsContainer, 'bs-hotel-buttons-order');
  }
}

// Setup drag and drop for a button container
function setupDragAndDrop(container, storageKey) {
  const buttons = container.querySelectorAll('.bs-btn[data-service]');
  let draggedElement = null;
  
  buttons.forEach(button => {
    // Skip hidden buttons (seatmap buttons)
    if (button.style.display === 'none') {
      return;
    }
    
    button.draggable = true;
    button.classList.add('bs-draggable-btn');
    
    button.addEventListener('dragstart', (e) => {
      draggedElement = button;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', button.dataset.service);
      button.classList.add('bs-dragging');
      setTimeout(() => {
        button.style.display = 'none';
      }, 0);
    });
    
    button.addEventListener('dragend', (e) => {
      if (draggedElement) {
        draggedElement.style.display = '';
        draggedElement.classList.remove('bs-dragging');
        draggedElement = null;
      }
      // Remove all drag-over classes
      container.querySelectorAll('.bs-drag-over').forEach(el => {
        el.classList.remove('bs-drag-over');
      });
    });
    
    button.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      if (!draggedElement || button === draggedElement) {
        return;
      }
      
      const rect = button.getBoundingClientRect();
      const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
      
      if (next) {
        container.insertBefore(draggedElement, button.nextSibling);
      } else {
        container.insertBefore(draggedElement, button);
      }
      
      // Add visual feedback
      button.classList.add('bs-drag-over');
    });
    
    button.addEventListener('dragleave', (e) => {
      button.classList.remove('bs-drag-over');
    });
    
    button.addEventListener('drop', (e) => {
      e.preventDefault();
      button.classList.remove('bs-drag-over');
      
      // Save the new order
      saveButtonOrder(container, storageKey);
    });
  });
}


// Save button order to localStorage
function saveButtonOrder(container, storageKey) {
  const buttons = container.querySelectorAll('.bs-btn[data-service]');
  const order = Array.from(buttons)
    .filter(btn => btn.style.display !== 'none')
    .map(btn => btn.dataset.service);
  
  localStorage.setItem(storageKey, JSON.stringify(order));
  console.log(`Saved button order for ${storageKey}:`, order);
}

// Restore button order from localStorage
function restoreButtonOrder(container, storageKey) {
  const savedOrder = localStorage.getItem(storageKey);
  if (!savedOrder) {
    return; // No saved order, use default
  }
  
  try {
    const order = JSON.parse(savedOrder);
    const buttons = container.querySelectorAll('.bs-btn[data-service]');
    const buttonMap = new Map();
    const hiddenButtons = [];
    
    // Create a map of service -> button and collect hidden buttons
    buttons.forEach(btn => {
      if (btn.dataset.service) {
        if (btn.style.display === 'none') {
          hiddenButtons.push(btn);
        } else {
          buttonMap.set(btn.dataset.service, btn);
        }
      }
    });
    
    // Reorder visible buttons based on saved order
    order.forEach(service => {
      const button = buttonMap.get(service);
      if (button) {
        container.appendChild(button);
        buttonMap.delete(service); // Remove from map to track which ones were moved
      }
    });
    
    // Append any remaining visible buttons that weren't in the saved order
    buttonMap.forEach(button => {
      container.appendChild(button);
    });
    
    // Append hidden buttons at the end
    hiddenButtons.forEach(button => {
      container.appendChild(button);
    });
    
    console.log(`Restored button order for ${storageKey}:`, order);
  } catch (e) {
    console.error(`Error restoring button order for ${storageKey}:`, e);
  }
}

// Initialize all event listeners
function initializeEventListeners() {
  console.log('=== INITIALIZING EVENT LISTENERS ===');
  
  // Initialize drag and drop for buttons
  initializeButtonDragAndDrop();
  
  // Flight "Open All" button in header
  const flightOpenAllBtn = document.getElementById('bs-flight-open-all');
  if (flightOpenAllBtn) {
    flightOpenAllBtn.addEventListener('click', handleOpenAllFlights, { capture: true, once: false });
  }

  // Flight buttons
  const flightButtons = document.querySelectorAll('.bs-section:nth-child(1) .bs-btn');
  flightButtons.forEach(btn => {
    btn.addEventListener('click', handleFlightButtonClick);
  });

  // External links toggle
  const linksToggle = document.getElementById('bs-external-links-toggle');
  const linksContainer = document.getElementById('bs-external-links');
  if (linksToggle && linksContainer) {
    const saved = localStorage.getItem('bs-external-links-enabled');
    if (saved !== null) {
      linksToggle.checked = saved === 'true';
    } else {
      linksToggle.checked = true;
    }
    linksContainer.style.display = linksToggle.checked ? '' : 'none';
    linksToggle.addEventListener('change', () => {
      localStorage.setItem('bs-external-links-enabled', linksToggle.checked);
      linksContainer.style.display = linksToggle.checked ? '' : 'none';
    });
  }

  // Nonstop toggle (Google Flights): persist state
  const nonstopToggle = document.getElementById('bs-flight-nonstop');
  if (nonstopToggle) {
    const savedNonstop = localStorage.getItem('bs-flight-nonstop-enabled');
    if (savedNonstop !== null) nonstopToggle.checked = savedNonstop === 'true';
    nonstopToggle.addEventListener('change', () => {
      localStorage.setItem('bs-flight-nonstop-enabled', nonstopToggle.checked);
    });
  }

  // Add auto-reload functionality for flight inputs
  setupFlightInputAutoReload();
  
  // Hotel external links toggle
  const hotelLinksToggle = document.getElementById('bs-hotel-external-links-toggle');
  const hotelLinksContainer = document.getElementById('bs-hotel-external-links');
  if (hotelLinksToggle && hotelLinksContainer) {
    const savedHotelLinks = localStorage.getItem('bs-hotel-external-links-enabled');
    if (savedHotelLinks !== null) {
      hotelLinksToggle.checked = savedHotelLinks === 'true';
    } else {
      hotelLinksToggle.checked = true;
    }
    hotelLinksContainer.style.display = hotelLinksToggle.checked ? '' : 'none';
    hotelLinksToggle.addEventListener('change', () => {
      localStorage.setItem('bs-hotel-external-links-enabled', hotelLinksToggle.checked);
      hotelLinksContainer.style.display = hotelLinksToggle.checked ? '' : 'none';
    });
  }

  // Hotel auto-reload setup
  setupHotelInputAutoReload();
  
  // Hotel "Open All" button in header
  const hotelOpenAllBtn = document.getElementById('bs-hotel-open-all');
  if (hotelOpenAllBtn) {
    hotelOpenAllBtn.addEventListener('click', handleOpenAllHotels, { capture: true, once: false });
  }

  // Hotel buttons - only target buttons in the external links container
  const hotelButtons = document.querySelectorAll('#bs-hotel-external-links .bs-btn');
  hotelButtons.forEach(btn => {
    // Remove any existing listeners by cloning (if any were added before)
    const handler = function(e) {
      handleHotelButtonClick(e);
    };
    btn.addEventListener('click', handler, { capture: true, once: false });
  });
  
  // Section toggle functionality
  const flightToggle = document.getElementById('bs-flight-toggle');
  const hotelToggle = document.getElementById('bs-hotel-toggle');
  const settingsToggle = document.getElementById('bs-settings-toggle');
  const flightSection = document.getElementById('bs-flight-section');
  const hotelSection = document.getElementById('bs-hotel-section');
  const settingsSection = document.getElementById('bs-settings-section');
  
  console.log('Toggle elements found:', {
    flightToggle: !!flightToggle,
    hotelToggle: !!hotelToggle,
    settingsToggle: !!settingsToggle
  });
  
  console.log('Section elements found:', {
    flightSection: !!flightSection,
    hotelSection: !!hotelSection,
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
  
  // Calculation section toggle - Total Calculator sub-toggle
  const totalCalculatorToggle = document.getElementById('bs-total-calculator-toggle');
  const totalCalculatorSection = document.getElementById('bs-total-calculator-section');

  // Rovemiles section toggle - works within Calculation section
  const rovemilesToggle = document.getElementById('bs-rovemiles-toggle');
  const rovemilesSection = document.getElementById('bs-rovemiles-section');

  // Total Calculator - works independently, but needs calculation section to be visible
  if (totalCalculatorToggle && totalCalculatorSection) {
    const saved = localStorage.getItem('bs-total-calculator-enabled');
    if (saved !== null) totalCalculatorToggle.checked = saved === 'true';
    
    // Set initial visibility
    totalCalculatorSection.style.display = totalCalculatorToggle.checked ? '' : 'none';
    
    totalCalculatorToggle.addEventListener('change', () => {
      localStorage.setItem('bs-total-calculator-enabled', totalCalculatorToggle.checked);
      
      // Show/hide total calculator section based on its own toggle
      totalCalculatorSection.style.display = totalCalculatorToggle.checked ? '' : 'none';
      
    });
      }
      
  // Rovemiles - works within Calculation section, similar to Total Calculator
  if (rovemilesToggle && rovemilesSection) {
    const saved = localStorage.getItem('bs-rovemiles-enabled');
    if (saved !== null) rovemilesToggle.checked = saved === 'true';
    
    // Set initial visibility
    rovemilesSection.style.display = rovemilesToggle.checked ? '' : 'none';
    
    rovemilesToggle.addEventListener('change', () => {
      localStorage.setItem('bs-rovemiles-enabled', rovemilesToggle.checked);
      
      // Show/hide rovemiles section based on its own toggle
      rovemilesSection.style.display = rovemilesToggle.checked ? '' : 'none';
      
      saveToggleStates();
    });
  }

  // Hyatt Calculator - works within Calculation section, similar to Total Calculator and Rovemiles
  const hyattCalculatorToggle = document.getElementById('bs-hyatt-calculator-toggle');
  const hyattCalculatorSection = document.getElementById('bs-hyatt-calculator-section');
  
  if (hyattCalculatorToggle && hyattCalculatorSection) {
    const saved = localStorage.getItem('bs-hyatt-calculator-enabled');
    if (saved !== null) hyattCalculatorToggle.checked = saved === 'true';
    
    // Set initial visibility
    hyattCalculatorSection.style.display = hyattCalculatorToggle.checked ? '' : 'none';
    
    hyattCalculatorToggle.addEventListener('change', () => {
      localStorage.setItem('bs-hyatt-calculator-enabled', hyattCalculatorToggle.checked);
      
      // Show/hide hyatt calculator section based on its own toggle
      hyattCalculatorSection.style.display = hyattCalculatorToggle.checked ? '' : 'none';
      
      saveToggleStates();
    });
  }

  // Hilton Calculator - works within Calculation section, similar to Total Calculator, Rovemiles, and Hyatt Calculator
  const hiltonCalculatorToggle = document.getElementById('bs-hilton-calculator-toggle');
  const hiltonCalculatorSection = document.getElementById('bs-hilton-calculator-section');
  
  if (hiltonCalculatorToggle && hiltonCalculatorSection) {
    const saved = localStorage.getItem('bs-hilton-calculator-enabled');
    if (saved !== null) hiltonCalculatorToggle.checked = saved === 'true';
    
    // Set initial visibility
    hiltonCalculatorSection.style.display = hiltonCalculatorToggle.checked ? '' : 'none';
    
    hiltonCalculatorToggle.addEventListener('change', () => {
      localStorage.setItem('bs-hilton-calculator-enabled', hiltonCalculatorToggle.checked);
      
      // Show/hide hilton calculator section based on its own toggle
      hiltonCalculatorSection.style.display = hiltonCalculatorToggle.checked ? '' : 'none';
      
      saveToggleStates();
    });
  }
      

  // Information section sub-toggles
  const infoCardsToggle = document.getElementById('bs-info-cards-toggle');
  const infoPartnersToggle = document.getElementById('bs-info-partners-toggle');
  const infoSelectedToggle = document.getElementById('bs-info-selected-toggle');
  const infoPointsToggle = document.getElementById('bs-info-points-toggle');
  const infoCardsPanel = document.getElementById('bs-info-cards-panel');
  const infoPartnersPanel = document.getElementById('available-transfer-partners');
  const infoSelectedPanel = document.getElementById('selected-cards-comparison');
  const infoPointsPanel = document.getElementById('bs-points-tracker-panel');

  if (infoCardsToggle && infoCardsPanel) {
    const saved = localStorage.getItem('bs-info-cards-enabled');
    if (saved !== null) infoCardsToggle.checked = saved === 'true';
    infoCardsPanel.style.display = infoCardsToggle.checked ? '' : 'none';
    infoCardsToggle.addEventListener('change', () => {
      localStorage.setItem('bs-info-cards-enabled', infoCardsToggle.checked);
      infoCardsPanel.style.display = infoCardsToggle.checked ? '' : 'none';
    });
  }

  if (infoPartnersToggle && infoPartnersPanel) {
    const saved = localStorage.getItem('bs-info-partners-enabled');
    if (saved !== null) infoPartnersToggle.checked = saved === 'true';
    infoPartnersPanel.style.display = infoPartnersToggle.checked ? '' : 'none';
    infoPartnersToggle.addEventListener('change', () => {
      localStorage.setItem('bs-info-partners-enabled', infoPartnersToggle.checked);
      infoPartnersPanel.style.display = infoPartnersToggle.checked ? '' : 'none';
    });
  }

  if (infoSelectedToggle && infoSelectedPanel) {
    const saved = localStorage.getItem('bs-info-selected-enabled');
    if (saved !== null) infoSelectedToggle.checked = saved === 'true';
    infoSelectedPanel.style.display = infoSelectedToggle.checked ? '' : 'none';
    infoSelectedToggle.addEventListener('change', () => {
      localStorage.setItem('bs-info-selected-enabled', infoSelectedToggle.checked);
      infoSelectedPanel.style.display = infoSelectedToggle.checked ? '' : 'none';
    });
  }

  if (infoPointsToggle) {
    const saved = localStorage.getItem('bs-info-points-enabled');
    if (saved !== null) infoPointsToggle.checked = saved === 'true';
    
    // Function to handle panel visibility and initialization
    const updatePointsPanelVisibility = () => {
      let panel = document.getElementById('bs-points-tracker-panel');
      
      if (!panel) {
        // Panel doesn't exist, try to create it
        if (window.pointsTrackerUI) {
          window.pointsTrackerUI.init();
          // Wait a bit for panel to be created
          setTimeout(() => {
            panel = document.getElementById('bs-points-tracker-panel');
            if (panel) {
              panel.style.display = infoPointsToggle.checked ? '' : 'none';
            }
          }, 200);
        } else {
          // UI not initialized yet, wait and try again
          setTimeout(() => {
            if (window.pointsTrackerUI) {
              window.pointsTrackerUI.init();
              setTimeout(() => {
                panel = document.getElementById('bs-points-tracker-panel');
                if (panel) {
                  panel.style.display = infoPointsToggle.checked ? '' : 'none';
                }
              }, 200);
            }
          }, 500);
        }
      } else {
        // Panel exists, just update visibility
        panel.style.display = infoPointsToggle.checked ? '' : 'none';
      }
    };
    
    // Set initial visibility after a short delay to ensure UI is ready
    setTimeout(() => {
      updatePointsPanelVisibility();
    }, 500);
    
    // Also try after longer delays
    setTimeout(() => {
      updatePointsPanelVisibility();
    }, 1500);
    setTimeout(() => {
      updatePointsPanelVisibility();
    }, 3000);
    
    infoPointsToggle.addEventListener('change', () => {
      console.log('Points Tracker toggle changed to:', infoPointsToggle.checked);
      localStorage.setItem('bs-info-points-enabled', infoPointsToggle.checked);
      
      // Force initialization if panel doesn't exist and toggle is checked
      if (infoPointsToggle.checked) {
        let panel = document.getElementById('bs-points-tracker-panel');
        console.log('Toggle is ON, panel exists:', !!panel);
        
        if (!panel) {
          console.log('Panel does not exist, forcing initialization...');
          // Panel doesn't exist, force initialization
          if (window.pointsTrackerUI) {
            console.log('pointsTrackerUI exists, calling init()...');
            window.pointsTrackerUI.init();
            // Wait a bit and check again
            setTimeout(() => {
              panel = document.getElementById('bs-points-tracker-panel');
              console.log('After init, panel exists:', !!panel);
              if (panel) {
                panel.style.display = '';
                panel.style.visibility = 'visible';
                console.log('Panel made visible');
              } else {
                console.error('Panel still does not exist after init!');
              }
            }, 500);
          } else {
            console.log('pointsTrackerUI does not exist, waiting...');
            // Wait for UI to be available
            let checkCount = 0;
            const checkUI = setInterval(() => {
              checkCount++;
              if (window.pointsTrackerUI) {
                console.log(`pointsTrackerUI found after ${checkCount} attempts, calling init()...`);
                clearInterval(checkUI);
                window.pointsTrackerUI.init();
                // Check again after init
                setTimeout(() => {
                  panel = document.getElementById('bs-points-tracker-panel');
                  console.log('After delayed init, panel exists:', !!panel);
                  if (panel) {
                    panel.style.display = '';
                    panel.style.visibility = 'visible';
                    console.log('Panel made visible');
                  } else {
                    console.error('Panel still does not exist after delayed init!');
                  }
                }, 500);
              } else if (checkCount > 50) {
                console.error('pointsTrackerUI not found after 50 attempts, giving up');
                clearInterval(checkUI);
              }
            }, 100);
          }
        } else {
          // Panel exists, just show it
          console.log('Panel exists, making it visible...');
          panel.style.display = '';
          panel.style.visibility = 'visible';
          console.log('Panel visibility set');
        }
      } else {
        // Toggle is off, hide panel
        console.log('Toggle is OFF, hiding panel...');
        const panel = document.getElementById('bs-points-tracker-panel');
        if (panel) {
          panel.style.display = 'none';
          panel.style.visibility = 'hidden';
          console.log('Panel hidden');
        }
      }
      
      // Also call the update function
      updatePointsPanelVisibility();
    });
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

  // Theme (Light / Dark)
  const themeSelect = document.getElementById('bs-theme-select');
  if (themeSelect) {
    const savedTheme = localStorage.getItem('bs-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') themeSelect.value = savedTheme;
    themeSelect.addEventListener('change', () => {
      localStorage.setItem('bs-theme', themeSelect.value);
      applyTheme();
    });
  }

  // Flight row colors: sync color picker <-> hex input, persist, apply
  function initColorSetting(colorId, hexId, storageKey, defaultValue) {
    const picker = document.getElementById(colorId);
    const hexInput = document.getElementById(hexId);
    if (!picker || !hexInput) return;
    const saved = localStorage.getItem(storageKey);
    const value = (saved || defaultValue).replace(/^#?/, '#');
    picker.value = value.toLowerCase();
    hexInput.value = value;
    function saveAndApply() {
      const hex = hexInput.value.replace(/^#?/, '#');
      if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
        localStorage.setItem(storageKey, hex);
        picker.value = hex;
        applyFlightStopColors();
      }
    }
    picker.addEventListener('input', () => {
      hexInput.value = picker.value;
      saveAndApply();
    });
    hexInput.addEventListener('change', () => {
      const hex = hexInput.value.replace(/^#?/, '#');
      if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
        picker.value = hex;
        saveAndApply();
      }
    });
  }
  initColorSetting('bs-color-nonstop', 'bs-color-nonstop-hex', 'bs-flight-color-nonstop', '#e3ffdb');
  initColorSetting('bs-color-stops', 'bs-color-stops-hex', 'bs-flight-color-stops', '#ffecd1');
  initColorSetting('bs-color-multiple-stops', 'bs-color-multiple-stops-hex', 'bs-flight-color-multiple-stops', '#fbd3d0');

  // Seats.aero API URL and Key: save on change and sync to config + background
  const seatsAeroKeyInput = document.getElementById('bs-seatsaero-api-key');
  function saveSeatsAeroSettings() {
    const key = seatsAeroKeyInput ? (seatsAeroKeyInput.value || '').trim() : '';
    localStorage.setItem('bs-seatsaero-api-key', key || '');
    if (window.config && window.config.api && window.config.api.seatsAero) {
      window.config.api.seatsAero.key = key;
    }
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'saveSeatsAeroSettings', baseUrl: '', key: key || '' }, () => {});
    }
  }
  if (seatsAeroKeyInput) {
    seatsAeroKeyInput.addEventListener('change', saveSeatsAeroSettings);
    seatsAeroKeyInput.addEventListener('blur', saveSeatsAeroSettings);
    var seatsAeroSaveTimeout;
    seatsAeroKeyInput.addEventListener('input', function() {
      clearTimeout(seatsAeroSaveTimeout);
      seatsAeroSaveTimeout = setTimeout(saveSeatsAeroSettings, 400);
    });
  }
  const seatsAeroKeyToggle = document.getElementById('bs-seatsaero-key-toggle');
  if (seatsAeroKeyToggle && seatsAeroKeyInput) {
    seatsAeroKeyToggle.addEventListener('click', function() {
      const isPassword = seatsAeroKeyInput.type === 'password';
      seatsAeroKeyInput.type = isPassword ? 'text' : 'password';
      seatsAeroKeyToggle.textContent = isPassword ? 'Hide' : 'Show';
      seatsAeroKeyToggle.setAttribute('aria-label', isPassword ? 'Hide API key' : 'Show API key');
    });
  }
  
  
  console.log('=== EVENT LISTENERS INITIALIZATION COMPLETE ===');
  
  // Handle airport input changes (autocomplete will handle the logic)
  const fromInput = document.getElementById('bs-flight-from');
  const toInput = document.getElementById('bs-flight-to');
  const airlineInput = null;
  const flightNumberInput = null;
  
  // Removed airline/flight number inputs
  
  // Toggle seatmap buttons visibility based on airline and flight number
  function toggleSeatmapButtons() { /* no-op without airline/flight number */ }
  
  // Initial check on load
  toggleSeatmapButtons();
  
  // Switch button for From/To
  const switchBtn = document.getElementById('bs-flight-switch');
  if (switchBtn && fromInput && toInput) {
    switchBtn.addEventListener('click', () => {
      const temp = fromInput.value;
      fromInput.value = toInput.value;
      toInput.value = temp;
      
      // Swap airport data if available
      const tempData = fromInput.dataset.airportData;
      if (toInput.dataset.airportData) {
        fromInput.dataset.airportData = toInput.dataset.airportData;
      } else {
        delete fromInput.dataset.airportData;
      }
      if (tempData) {
        toInput.dataset.airportData = tempData;
      } else {
        delete toInput.dataset.airportData;
      }
      
      // Sync hotel city from new "To" destination
      setTimeout(() => {
        syncHotelCityFromFlight();
      }, 100);
      
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

  const flightTransferInfoBtn = document.getElementById('bs-flight-transfer-info');
  if (flightTransferInfoBtn) {
    flightTransferInfoBtn.addEventListener('click', showFlightTransferModal);
  }
  // Refresh button
  const refreshFlightBtn = document.getElementById('bs-refresh-flight');
  if (refreshFlightBtn) {
    refreshFlightBtn.addEventListener('click', () => {
      // Mark that we want to wait for full load on the next page
      try { sessionStorage.setItem('bs-wait-full-load', '1') } catch(_) {}
      autoReloadGoogleFlights();
    });
  }
  
  // Hotel refresh button
  const hotelTransferInfoBtn = document.getElementById('bs-hotel-transfer-info');
  if (hotelTransferInfoBtn) {
    hotelTransferInfoBtn.addEventListener('click', showHotelTransferModal);
  }
  const hotelTiersBtn = document.getElementById('bs-hotel-tiers');
  if (hotelTiersBtn) {
    hotelTiersBtn.addEventListener('click', showHotelTiersModal);
  }
  const refreshHotelBtn = document.getElementById('bs-refresh-hotel');
  if (refreshHotelBtn) {
    refreshHotelBtn.addEventListener('click', () => {
      autoReloadHotels();
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
      // airline/flight number removed
      
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

// Setup auto-reload functionality for flight inputs
function setupFlightInputAutoReload() {
  console.log('Setting up flight input auto-reload...');
  
  // Get all flight input elements
  const flightInputs = [
    document.getElementById('bs-flight-from'),
    document.getElementById('bs-flight-to'),
    document.getElementById('bs-flight-depart'),
    document.getElementById('bs-flight-return'),
    document.getElementById('bs-flight-cabin'),
    document.getElementById('bs-flight-adults')
  ];
  
  // Add change event listeners to each input
  flightInputs.forEach(input => {
    if (input) {
      console.log('Adding auto-reload listener to:', input.id);
      
      // Use different event types for different input types
      const eventType = input.type === 'text' || input.type === 'date' ? 'input' : 'change';
      
      input.addEventListener(eventType, function() {
        console.log('Flight input changed:', input.id, 'value:', input.value);
        
        // Check if auto-reload is enabled
        const autoReloadToggle = document.getElementById('bs-auto-reload-toggle');
        if (!autoReloadToggle || !autoReloadToggle.checked) {
          console.log('Auto-reload is disabled, skipping reload');
          return;
        }
        
        // For date inputs, use 'change' event instead of 'input' to avoid calendar navigation triggers
        if (input.type === 'date') {
          // Use a separate change event listener for date inputs
          input.addEventListener('change', function() {
            console.log('Date input changed:', input.id, 'value:', input.value);
            
            // Check if auto-reload is enabled
            const autoReloadToggle = document.getElementById('bs-auto-reload-toggle');
            if (!autoReloadToggle || !autoReloadToggle.checked) {
              console.log('Auto-reload is disabled, skipping reload');
              return;
            }
            
            // Debounce the auto-reload to avoid too many requests
            clearTimeout(this.autoReloadTimeout);
            this.autoReloadTimeout = setTimeout(() => {
              autoReloadGoogleFlights();
            }, 1000); // 1 second delay
          });
          return; // Skip the general input listener for date fields
        }
        
        // Debounce the auto-reload to avoid too many requests
        clearTimeout(this.autoReloadTimeout);
        this.autoReloadTimeout = setTimeout(() => {
          autoReloadGoogleFlights();
        }, 1000); // 1 second delay
      });
    }
  });
  
  // Add event listener to the toggle switch
  const autoReloadToggle = document.getElementById('bs-auto-reload-toggle');
  if (autoReloadToggle) {
    autoReloadToggle.addEventListener('change', function() {
      console.log('Auto-reload toggle changed:', this.checked);
      
      // Save toggle state to localStorage
      localStorage.setItem('bs-auto-reload-enabled', this.checked);
      
      if (this.checked) {
        console.log('Auto-reload enabled');
      } else {
        console.log('Auto-reload disabled');
        // Clear any pending auto-reload timeouts
        flightInputs.forEach(input => {
          if (input && input.autoReloadTimeout) {
            clearTimeout(input.autoReloadTimeout);
          }
        });
      }
    });
    
    // Load saved toggle state
    const savedState = localStorage.getItem('bs-auto-reload-enabled');
    if (savedState !== null) {
      autoReloadToggle.checked = savedState === 'true';
      console.log('Restored auto-reload state:', autoReloadToggle.checked);
    } else {
      autoReloadToggle.checked = false;
      console.log('Auto-reload defaulting to off');
    }
  }

  // Sync Flight Search Cabin to Award Flight Analysis Filter
  syncCabinToAwardFilter();
  
  // Sync hotel city from flight "To" destination
  setupHotelCitySync();
  
  // Sync hotel check-in and check-out dates from flight dates
  setupHotelDateSync();
}

// Sync hotel city from flight "To" destination
function setupHotelCitySync() {
  const toInput = document.getElementById('bs-flight-to');
  const hotelCityInput = document.getElementById('bs-hotel-city');
  
  if (!toInput || !hotelCityInput) {
    return;
  }
  
  // Listen for changes to flight "To" input
  toInput.addEventListener('change', function() {
    console.log('Flight "To" destination changed, syncing hotel city');
    syncHotelCityFromFlight();
  });
  
  // Also listen for input events (for autocomplete selection)
  toInput.addEventListener('input', function() {
    // Use a small delay to allow autocomplete to set the airportData
    setTimeout(() => {
      syncHotelCityFromFlight();
    }, 100);
  });
  
  // Sync on initial load if "To" input already has a value
  if (toInput.value || toInput.dataset.airportData) {
    setTimeout(() => {
      syncHotelCityFromFlight();
    }, 200);
  }
}

// Function to sync hotel city from flight "To" destination
function syncHotelCityFromFlight() {
  const toInput = document.getElementById('bs-flight-to');
  const hotelCityInput = document.getElementById('bs-hotel-city');
  
  if (!toInput || !hotelCityInput) {
    return;
  }
  
  // Try to get city from airport data first (set by autocomplete)
  const toAirportData = toInput.dataset.airportData;
  
  if (toAirportData) {
    try {
      const airport = JSON.parse(toAirportData);
      const cityName = airport.city || '';
      
      if (cityName) {
        hotelCityInput.value = cityName;
        // Trigger change event to update any dependent logic
        hotelCityInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('Hotel city synced from flight destination:', cityName);
        return;
      }
    } catch (e) {
      console.error('Error parsing airport data for city sync:', e);
    }
  }
  
  // Try to extract city name from input value if it's in format "City (IATA)"
  const inputValue = toInput.value?.trim() || '';
  const cityMatch = inputValue.match(/^(.+?)\s*\([A-Z]{3}\)$/);
  if (cityMatch) {
    const cityName = cityMatch[1].trim();
    if (cityName) {
      hotelCityInput.value = cityName;
      hotelCityInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('Hotel city synced from flight destination (parsed from input):', cityName);
      return;
    }
  }
}

// Sync hotel check-in and check-out dates from flight depart and return dates
function setupHotelDateSync() {
  const departInput = document.getElementById('bs-flight-depart');
  const returnInput = document.getElementById('bs-flight-return');
  const checkinInput = document.getElementById('bs-hotel-checkin');
  const checkoutInput = document.getElementById('bs-hotel-checkout');
  
  if (!departInput || !checkinInput || !checkoutInput) {
    return;
  }
  
  // Listen for changes to flight depart date
  departInput.addEventListener('change', function() {
    console.log('Flight depart date changed, syncing hotel dates');
    syncHotelDatesFromFlight();
  });
  
  // Listen for changes to flight return date
  if (returnInput) {
    returnInput.addEventListener('change', function() {
      console.log('Flight return date changed, syncing hotel dates');
      syncHotelDatesFromFlight();
    });
  }
  
  // Also listen for input events
  departInput.addEventListener('input', function() {
    setTimeout(() => {
      syncHotelDatesFromFlight();
    }, 100);
  });
  
  if (returnInput) {
    returnInput.addEventListener('input', function() {
      setTimeout(() => {
        syncHotelDatesFromFlight();
      }, 100);
    });
  }
  
  // Sync on initial load if dates are already set
  if (departInput.value || (returnInput && returnInput.value)) {
    setTimeout(() => {
      syncHotelDatesFromFlight();
    }, 200);
  }

  // When user changes Hotel Check-In manually, set Check-Out to Check-In + 1 day
  function setCheckoutFromCheckin() {
    const checkinVal = checkinInput.value;
    if (!checkinVal) return;
    const checkinDate = new Date(checkinVal + 'T12:00:00');
    if (isNaN(checkinDate.getTime())) return;
    checkinDate.setDate(checkinDate.getDate() + 1);
    const checkoutVal = checkinDate.toISOString().split('T')[0];
    if (checkoutInput.value !== checkoutVal) {
      checkoutInput.value = checkoutVal;
      checkoutInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  checkinInput.addEventListener('change', setCheckoutFromCheckin);
  checkinInput.addEventListener('input', function() {
    setTimeout(setCheckoutFromCheckin, 50);
  });
}

// Helper function to check if checkout date matches check-in + 1 day (auto-calculated)
function isCheckoutAutoCalculated(checkinDateString, checkoutDateString) {
  if (!checkinDateString || !checkoutDateString) return false;
  
  try {
    const checkinDate = new Date(checkinDateString);
    const checkoutDate = new Date(checkoutDateString);
    const expectedCheckout = new Date(checkinDate);
    expectedCheckout.setDate(expectedCheckout.getDate() + 1);
    
    // Compare dates (ignore time)
    return checkoutDate.toISOString().split('T')[0] === expectedCheckout.toISOString().split('T')[0];
  } catch (e) {
    return false;
  }
}

// Function to sync hotel check-in and check-out dates from flight depart and return dates
function syncHotelDatesFromFlight() {
  const departInput = document.getElementById('bs-flight-depart');
  const returnInput = document.getElementById('bs-flight-return');
  const checkinInput = document.getElementById('bs-hotel-checkin');
  const checkoutInput = document.getElementById('bs-hotel-checkout');
  
  if (!departInput || !checkinInput || !checkoutInput) {
    return;
  }
  
  const departDate = departInput.value;
  const returnDate = returnInput?.value || '';
  
  // Always update check-in date from depart date when depart date changes
  if (departDate) {
    checkinInput.value = departDate;
    checkinInput.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('Hotel check-in date synced from flight depart date:', departDate);
    
    // Always update check-out date based on return date or check-in + 1 day
    if (returnDate) {
      // If return date exists, use return date for check-out
      checkoutInput.value = returnDate;
      checkoutInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('Hotel check-out date synced from flight return date:', returnDate);
    } else {
      // If no return date, set check-out to check-in + 1 day
      const checkinDate = new Date(departDate);
      checkinDate.setDate(checkinDate.getDate() + 1);
      const checkoutDateString = checkinDate.toISOString().split('T')[0];
      checkoutInput.value = checkoutDateString;
      checkoutInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('Hotel check-out date synced to check-in + 1 day:', checkoutDateString);
    }
  }
}

// Sync Flight Search Cabin selection to Award Flight Analysis Filter
function syncCabinToAwardFilter() {
  const flightCabinSelect = document.getElementById('bs-flight-cabin');
  if (!flightCabinSelect) return;

  // Function to update the award filter
  function updateAwardFilter() {
    const cabinValue = flightCabinSelect.value;
    const awardFilter = document.getElementById('bs-standalone-cabin-filter');
    
    if (awardFilter) {
      // Map flight search cabin values to award filter values
      // Flight search has: economy, business, first
      // Award filter has: all, economy, premium-economy, business, first
      const cabinMapping = {
        'economy': 'economy',
        'business': 'business',
        'first': 'first'
      };
      
      const mappedValue = cabinMapping[cabinValue] || 'all';
      if (awardFilter.value !== mappedValue) {
        awardFilter.value = mappedValue;
        // Trigger change event to update results
        awardFilter.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  // Add event listener for cabin changes
  flightCabinSelect.addEventListener('change', updateAwardFilter);
  
  // Also sync on initial load if award filter exists
  // Use a small delay to ensure award section is created
  setTimeout(() => {
    updateAwardFilter();
  }, 500);
  
  // Also sync when award section is created (using periodic check)
  const checkInterval = setInterval(() => {
    const awardFilter = document.getElementById('bs-standalone-cabin-filter');
    if (awardFilter) {
      updateAwardFilter();
      clearInterval(checkInterval);
    }
  }, 1000);
  
  // Stop checking after 10 seconds
  setTimeout(() => {
    clearInterval(checkInterval);
  }, 10000);
}

// Auto-reload Google Flights with current input data
function autoReloadGoogleFlights() {
  console.log('Auto-reloading Google Flights...');
  
  const flightData = getFlightInputData();
  
  // Only auto-reload if we have the minimum required data: From, To, AND at least one date
  const hasFromTo = flightData.from && flightData.to;
  const hasDate = flightData.depart || flightData.return;
  
  if (hasFromTo && hasDate) {
    console.log('Auto-reloading with complete data:', flightData);
    
    const url = generateFlightUrl('google-flights', flightData);
    
    if (url) {
      // Save flight data to localStorage
      saveFlightDataToStorage(flightData);
      
      // Navigate to Google Flights with new parameters
      window.location.href = url;
    }
  } else {
    console.log('Not enough data for auto-reload:', {
      hasFromTo,
      hasDate,
      flightData: {
        from: flightData.from,
        to: flightData.to,
        depart: flightData.depart,
        return: flightData.return
      }
    });
  }
}

// Setup auto-reload for hotel inputs
function setupHotelInputAutoReload() {
  console.log('Setting up hotel input auto-reload...');
  const hotelInputs = [
    document.getElementById('bs-hotel-city'),
    document.getElementById('bs-hotel-checkin'),
    document.getElementById('bs-hotel-checkout'),
    document.getElementById('bs-hotel-adults'),
    document.getElementById('bs-hotel-rooms')
  ];

  hotelInputs.forEach(input => {
    if (!input) return;
    const eventType = input.type === 'text' || input.type === 'date' ? 'input' : 'change';
    input.addEventListener(eventType, function() {
      const autoToggle = document.getElementById('bs-hotel-auto-reload-toggle');
      if (!autoToggle || !autoToggle.checked) return;
      clearTimeout(this.autoReloadTimeout);
      this.autoReloadTimeout = setTimeout(() => {
        autoReloadHotels();
      }, 1000);
    });
  });

  const autoToggle = document.getElementById('bs-hotel-auto-reload-toggle');
  if (autoToggle) {
    autoToggle.addEventListener('change', function() {
      localStorage.setItem('bs-hotel-auto-reload-enabled', this.checked);
      if (!this.checked) {
        hotelInputs.forEach(input => input && input.autoReloadTimeout && clearTimeout(input.autoReloadTimeout));
      }
    });
    const saved = localStorage.getItem('bs-hotel-auto-reload-enabled');
    if (saved !== null) {
      autoToggle.checked = saved === 'true';
    } else {
      autoToggle.checked = false;
    }
  }
}

// Flag to prevent auto-reload when button is clicked
let hotelButtonClicked = false;

async function autoReloadHotels() {
  // Don't auto-reload if a button was just clicked
  if (hotelButtonClicked) {
    console.log('Skipping auto-reload - button was clicked');
    return;
  }
  console.log('Auto-reloading Google Hotels...');
  const hotelData = getHotelInputData();
  if (!validateHotelData(hotelData)) return;
  const url = await generateHotelUrl('google-hotels', hotelData);
  if (url) window.open(url, '_blank');
}

// Get Google Place ID from coordinates using reverse geocoding
// Note: This requires Google Geocoding API key. Without it, this will return null.
async function getPlaceIdFromCoordinates(latitude, longitude) {
  if (!latitude || !longitude) {
    return null;
  }
  
  const cacheKey = `placeid_${latitude}_${longitude}`;
  
  // Check cache first
  if (window.cacheService) {
    const cached = window.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  try {
    // Use Google Geocoding API reverse geocoding
    // Note: This requires a Google API key. You can add it to config.js if available
    // For now, we'll try without API key (may not work due to CORS/API key requirements)
    // Alternative: Use a proxy service or add API key to config
    const apiKey = window.config?.googleApiKey || '';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    
    // If no API key, try using a free alternative or return null
    if (!apiKey) {
      // Try using Nominatim's place_id (different from Google's, but may work for some services)
      // Or return null and let the URL work without placeId
      console.warn('Google API key not found. Radisson placeId lookup unavailable.');
      return null;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      // Get place_id from the first result
      const placeId = data.results[0].place_id;
      
      // Cache for 24 hours
      if (window.cacheService && placeId) {
        window.cacheService.set(cacheKey, placeId, 24 * 60 * 60 * 1000);
      }
      
      return placeId;
    }
    
    return null;
  } catch (error) {
    console.error('Place ID lookup error:', error);
    return null;
  }
}

// Geocode city name to get coordinates and location details
async function geocodeCity(cityName) {
  if (!cityName || !cityName.trim()) {
    return null;
  }
  
  const cacheKey = `geocode_${cityName.toLowerCase().trim()}`;
  
  // Check cache first
  if (window.cacheService) {
    const cached = window.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  try {
    // Use OpenStreetMap Nominatim API (free, no API key required)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BenefitSystems-Chrome-Extension' // Required by Nominatim
      }
    });
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      return null;
    }
    
    const result = data[0];
    const geocodeData = {
      city: result.address?.city || result.address?.town || result.address?.village || cityName,
      country: result.address?.country || '',
      countryCode: result.address?.country_code?.toUpperCase() || '',
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name || cityName,
      fullLocation: result.display_name || cityName
    };
    
    // Cache for 24 hours (cities don't change location often)
    if (window.cacheService) {
      window.cacheService.set(cacheKey, geocodeData, 24 * 60 * 60 * 1000);
    }
    
    return geocodeData;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

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
  
  // For PointsYeah, RoveMiles, and Melia, get geocoding data using the city from hotel input field
  let geocodeData = null;
  if (service === 'pointsyeah-hotels' || service === 'rovemiles-hotels' || service === 'rovemiles-hotels-loyal' || service === 'melia') {
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

// Handle "Open All" button click for flights - opens all flight search services in separate tabs
async function handleOpenAllFlights(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  
  const flightData = getFlightInputData();
  
  if (!validateFlightData(flightData)) {
    showNotification('Bitte alle Pflichtfelder ausfüllen (From, To, Depart)', 'error');
    return;
  }
  
  // Get all flight service buttons (excluding "Open All" and seatmap buttons which are hidden)
  const allButtons = document.querySelectorAll('#bs-external-links .bs-btn[data-service]');
  const services = Array.from(allButtons)
    .filter(btn => btn.style.display !== 'none') // Exclude hidden seatmap buttons
    .map(btn => btn.dataset.service);
  
  if (services.length === 0) {
    showNotification('No flight services found', 'error');
    return;
  }
  
  showNotification(`Opening ${services.length} flight search tabs...`, 'info');
  
  // Save flight data to localStorage
  saveFlightDataToStorage(flightData);
  
  // Open each service in a new tab with a small delay to avoid browser blocking
  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    const url = generateFlightUrl(service, flightData);
    
    if (url && url !== '#') {
      // Small delay between opening tabs to avoid browser popup blocking
      setTimeout(() => {
        window.open(url, '_blank');
      }, i * 100); // 100ms delay between each tab
    }
  }
}

// Handle "Open All" button click - opens all hotel search services in separate tabs
async function handleOpenAllHotels(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  
  // Set flag to prevent auto-reload
  hotelButtonClicked = true;
  
  // Clear any pending auto-reload timeouts
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
  
  const hotelData = getHotelInputData();
  
  if (!validateHotelData(hotelData)) {
    hotelButtonClicked = false;
    showNotification('Bitte alle Pflichtfelder ausfüllen (City, Check-In, Check-Out)', 'error');
    return;
  }
  
  // Get all hotel service buttons (excluding "Open All")
  const allButtons = document.querySelectorAll('#bs-hotel-external-links .bs-btn[data-service]');
  const services = Array.from(allButtons).map(btn => btn.dataset.service);
  
  if (services.length === 0) {
    hotelButtonClicked = false;
    showNotification('No hotel services found', 'error');
    return;
  }
  
  showNotification(`Opening ${services.length} hotel search tabs...`, 'info');
  
  // Get geocoding data once for services that need it
  const needsGeocoding = ['pointsyeah-hotels', 'rovemiles-hotels', 'rovemiles-hotels-loyal', 'melia'];
  const needsGeocode = services.some(service => needsGeocoding.includes(service));
  
  let geocodeData = null;
  if (needsGeocode) {
    const cityInput = document.getElementById('bs-hotel-city');
    const cityName = cityInput?.value?.trim() || hotelData.city;
    
    if (cityName) {
      geocodeData = await geocodeCity(cityName);
      if (!geocodeData) {
        showNotification('Could not geocode city. Some services may not work correctly.', 'warning');
      }
    }
  }
  
  // Open each service in a new tab with a small delay to avoid browser blocking
  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    const url = await generateHotelUrl(service, hotelData, geocodeData);
    
    if (url && url !== '#') {
      // Small delay between opening tabs to avoid browser popup blocking
      setTimeout(() => {
        window.open(url, '_blank');
      }, i * 100); // 100ms delay between each tab
    }
  }
  
  // Reset flag after all tabs are opened
  setTimeout(() => {
    hotelButtonClicked = false;
  }, services.length * 100 + 2000);
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
    
    // Also save to cache service
    if (window.cacheService) {
      const oneYearTTL = 365 * 24 * 60 * 60 * 1000;
      window.cacheService.set('selectedCards', selectedCards, oneYearTTL);
      console.log('Selected cards saved to cache:', selectedCards);
    }
    
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
    
    // Also clear from cache service
    if (window.cacheService) {
      window.cacheService.delete('selectedCards');
      console.log('Selected cards cleared from cache');
    }
    
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

// Calculate great circle distance between two airport codes (in miles)
async function calculateDistanceBetweenAirports(fromCode, toCode) {
  if (!fromCode || !toCode || !window.airportDataService) {
    return null;
  }

  try {
    const fromAirport = await window.airportDataService.getAirportByIATA(fromCode);
    const toAirport = await window.airportDataService.getAirportByIATA(toCode);

    if (!fromAirport || !toAirport) {
      return null;
    }

    // Haversine formula for great circle distance
    const R = 3958.8; // Earth radius in miles
    const lat1 = (fromAirport.latitude * Math.PI) / 180;
    const lat2 = (toAirport.latitude * Math.PI) / 180;
    const deltaLat = ((toAirport.latitude - fromAirport.latitude) * Math.PI) / 180;
    const deltaLon = ((toAirport.longitude - fromAirport.longitude) * Math.PI) / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  } catch (error) {
    console.error('Error calculating distance:', error);
    return null;
  }
}

// Extract airports from URL
function extractAirportsFromURL() {
  try {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    
    // Try different URL parameter formats
    let fromCode = searchParams.get('origins') || searchParams.get('from') || searchParams.get('departure');
    let toCode = searchParams.get('destinations') || searchParams.get('to') || searchParams.get('arrival');
    
    // Also check the query string format: flights+from+WAW+to+VIE
    const q = searchParams.get('q') || '';
    const match = q.match(/from\+([A-Z]{3}).*?to\+([A-Z]{3})/i);
    if (match && !fromCode) {
      fromCode = match[1].toUpperCase();
      toCode = match[2].toUpperCase();
    }
    
    // Try parsing from pathname
    const pathMatch = window.location.pathname.match(/\/([A-Z]{3})-([A-Z]{3})\//i);
    if (pathMatch && !fromCode) {
      fromCode = pathMatch[1].toUpperCase();
      toCode = pathMatch[2].toUpperCase();
    }
    
    return {
      from: fromCode ? fromCode.toUpperCase() : null,
      to: toCode ? toCode.toUpperCase() : null
    };
  } catch (error) {
    console.error('Error extracting airports from URL:', error);
    return { from: null, to: null };
  }
}

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
  
  if (savedData.location) {
    const locationInput = document.getElementById('bs-flight-location');
    if (locationInput) locationInput.value = savedData.location;
  }
  
  if (typeof savedData.nonstop === 'boolean') {
    const nonstopInput = document.getElementById('bs-flight-nonstop');
    if (nonstopInput) nonstopInput.checked = savedData.nonstop;
  }
  
  // Sync hotel city from flight "To" destination after restoring
  if (savedData.to) {
    setTimeout(() => {
      syncHotelCityFromFlight();
    }, 150);
  }
  
  // Sync hotel dates from flight dates after restoring
  if (savedData.depart || savedData.return) {
    setTimeout(() => {
      syncHotelDatesFromFlight();
    }, 150);
  }
  
  if (savedData.airline) {
    // airline removed
  }
  
  if (savedData.flightNumber) {
    // flight number removed
  }
  
  // Trigger seatmap button visibility check after restoration
  setTimeout(() => {
    // seatmap buttons remain hidden without airline/flight number
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

// Restore Seats.aero API key from localStorage into settings input and config (API URL is always default)
function restoreSeatsAeroSettings() {
  const key = localStorage.getItem('bs-seatsaero-api-key');
  const keyInput = document.getElementById('bs-seatsaero-api-key');
  if (keyInput && key !== null) keyInput.value = key || '';
  if (window.config && window.config.api && window.config.api.seatsAero) {
    if (key !== null && key !== undefined) window.config.api.seatsAero.key = (key || '').trim();
  }
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'saveSeatsAeroSettings', baseUrl: '', key: (key !== null && key !== undefined) ? (key || '').trim() : '' }, () => {});
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
    currency: 'USD',
    location: document.getElementById('bs-flight-location')?.value || 'US',
    nonstop: document.getElementById('bs-flight-nonstop')?.checked || false
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
  const { from, to, depart, return: ret, cabin, adults, language, currency, location, nonstop } = data;
  
  // Format dates for different services
  const skyscannerDate = depart.replace(/-/g, '');
  const retDate = ret ? ret.replace(/-/g, '') : '';
  const skyscannerCabin = cabin.replace(/_/g, '');
  
  // Convert cabin to PointsYeah format (capitalize first letter)
  const pointsYeahCabin = cabin.charAt(0).toUpperCase() + cabin.slice(1).replace(/_/g, ' ');
  
  // Convert date to Unix timestamp in seconds (not milliseconds)
  const departTimestamp = Math.floor(new Date(depart).getTime() / 1000);
  const returnTimestamp = ret ? Math.floor(new Date(ret).getTime() / 1000) : departTimestamp;
  
  // Build Google Flights URL (q= format); add +nonstop when Nonstop toggle is on
  const qBase = `flights+from+${from}+to+${to}+${ret ? depart+'+to+'+ret : 'oneway+on+'+depart}+${cabin}+class`;
  const qWithNonstop = nonstop ? qBase + '+nonstop' : qBase;
  const googleFlightsUrl = `https://www.google.com/travel/flights/search?q=${qWithNonstop}&hl=${language}&curr=${currency}&gl=${location}&tfu=EgYIABAAGAA`;
  
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
      
      // Note: originId and destinationId are internal IDs that Roame uses
      // The URL should work without them, but they might improve accuracy
      
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

/**
 * Resolve city name or airport code to a country slug for iPrefer/Preferred Hotels URLs.
 * Uses airport data (OpenFlights); works for city names (e.g. Vienna) and airport codes (e.g. VIE).
 * @param {string} cityOrIata - City name or IATA code
 * @returns {Promise<string|null>} Country slug (e.g. 'austria', 'united-states') or null if not found
 */
async function getCountrySlugFromCityOrAirport(cityOrIata) {
  if (!cityOrIata || !window.airportDataService) return null;
  const query = String(cityOrIata).trim();
  if (!query) return null;
  const results = await window.airportDataService.searchAirports(query, 1);
  const first = results && results[0];
  if (!first || !first.country) return null;
  const country = String(first.country).trim();
  if (!country) return null;
  const slug = country
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return slug || null;
}

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
      
      // Parse dates to extract day, month, year for alternative format
      let checkinDay = '', checkinMonth = '', checkinYear = '';
      let checkoutDay = '', checkoutMonth = '', checkoutYear = '';
      
      if (checkinFormatted.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parts = checkinFormatted.split('-');
        checkinYear = parts[0];
        checkinMonth = parts[1];
        checkinDay = parts[2];
      }
      
      if (checkoutFormatted.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parts = checkoutFormatted.split('-');
        checkoutYear = parts[0];
        checkoutMonth = parts[1];
        checkoutDay = parts[2];
      }
      
      // Note: Google Hotels uses the 'ts' parameter (base64-encoded protobuf) for dates and filters,
      // which is complex to generate. The explicit checkin/checkout parameters may not always
      // be recognized by Google Hotels, and users may need to manually set dates on the page.
      // Brand filters are also encoded in the 'ts' parameter, so "all brands" filter cannot
      // be automatically set via URL parameters. Users will need to manually select "all brands"
      // filter on the Google Hotels page.
      // We include the dates in the URL anyway in case Google starts recognizing them.
      return `https://www.google.com/travel/search?q=${encodeURIComponent(city)}&checkin=${checkinFormatted}&checkout=${checkoutFormatted}&adults=${adults}&rooms=${rooms}`;
    })(),
    
    'hilton': `https://www.hilton.com/en/search/?query=${encodeURIComponent(city)}&arrivalDate=${checkin}&departureDate=${checkout}&flexibleDates=false&numRooms=${rooms}&numAdults=${adults}&numChildren=0`,
    
    'hyatt': `https://www.hyatt.com/search/hotels/de-DE/${encodeURIComponent(city)}?checkinDate=${checkin}&checkoutDate=${checkout}&rooms=${rooms}&adults=${adults}&kids=0&rate=Standard&rateFilter=woh`,
    
    'marriott': `https://www.marriott.com/de/search/findHotels.mi?fromToDate_submit=${toDateMarriott}&fromDate=${fromDateDotted}&toDate=${toDateDotted}&toDateDefaultFormat=${toDateMarriott}&fromDateDefaultFormat=${fromDateMarriott}&lengthOfStay=${nights}&childrenCount=0&roomCount=${rooms}&numAdultsPerRoom=${adults}&destinationAddress.destination=${encodeURIComponent(city)}&useRewardsPoints=true&deviceType=desktop-web&view=list&isInternalSearch=true&vsInitialRequest=false&searchType=InCity&singleSearch=true&flexibleDateSearchRateDisplay=false&isSearch=true&isRateCalendar=true&t-start=${checkin}&t-end=${checkout}&flexibleDateSearch=false&isTransient=true&initialRequest=true&fromToDate=${fromDateMarriott}&numberOfRooms=${rooms}#/1/`,
    
    'ihg': `https://www.ihg.com/hotels/us/en/find-hotels/hotel-search?qDest=${encodeURIComponent(city)}&qPt=POINTS&qCiD=${checkInIHG.day}&qCoD=${checkOutIHG.day}&qCiMy=${checkInIHG.monthYear}&qCoMy=${checkOutIHG.monthYear}&qAdlt=${adults}&qChld=0&qRms=${rooms}&qRtP=IVANI&qAkamaiCC=PL&srb_u=1&qExpndSrch=false&qSrt=sRT&qBrs=6c.hi.ex.sb.ul.ic.cp.cw.in.vn.cv.rs.ki.kd.ma.sp.va.sp.re.vx.nd.sx.we.lx.rn.sn.sn.sn.sn.sn.nu.ge&qWch=0&qSmP=0&qRad=30&qRdU=mi&setPMCookies=false&qLoSe=false`,
    
    'accor': `https://all.accor.com/booking/en/accor/hotels/${encodeURIComponent(city.toLowerCase())}?compositions=${adults}${rooms > 1 ? ',' + rooms : ''}&stayplus=true&sortBy=PRICE_LOW_TO_HIGH&dateIn=${checkin}&dateOut=${checkout}`,
    
    'wyndham': `https://www.wyndhamhotels.com/de-de/hotels/${encodeURIComponent(city.toLowerCase())}?brand_id=ALL&checkInDate=${checkin}&checkOutDate=${checkout}&useWRPoints=true&children=0&adults=${adults}&rooms=${rooms}`,
    
    'choice': `https://www.choicehotels.com/de-de/${encodeURIComponent(city.toLowerCase())}/hotels?adults=${adults}&checkInDate=${checkin}&checkOutDate=${checkout}&ratePlanCode=SRD&sort=price`,
    
    'melia': (() => {
      // Melia booking URL: https://www.melia.com/en/booking?search=<encoded-json>
      const checkInTimestamp = new Date(checkin).getTime();
      const checkoutTimestamp = new Date(checkout).getTime();
      const cityName = (geocodeData?.city || city || '').trim();
      const countryName = (geocodeData?.country || '').trim();
      const destinationId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
      const destination = {
        city: cityName,
        country: countryName || undefined,
        hotelList: [],
        id: destinationId,
        type: 'DESTINATION',
        name: cityName.toLowerCase()
      };
      const searchData = {
        destination,
        occupation: [{ adults: Math.max(1, parseInt(adults, 10) || 2) }],
        calendar: { dates: [checkInTimestamp, checkoutTimestamp], locale: 'en' },
        hotels: [],
        dynamicServicesFilters: []
      };
      const searchJson = JSON.stringify(searchData);
      return `https://www.melia.com/en/booking?search=${encodeURIComponent(searchJson)}`;
    })(),
    
    'maxmypoint': `https://maxmypoint.com/?search=${encodeURIComponent(city)}`,
    
    'radisson': null, // Will be handled separately below due to async requirements
    
    'gha': `https://de.ghadiscovery.com/search/hotels?keyword=${encodeURIComponent(city)}&clearBookingParams=1&clearHotelSearchParams=1&room1Adults=${adults}&room1Children=0&startDate=${checkin}&endDate=${checkout}`,
    
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

  // iPrefer and Preferred Hotels: resolve city/airport to country slug, then build URL
  if (service === 'iprefer' || service === 'preferred-hotels') {
    const countrySlug = await getCountrySlugFromCityOrAirport(city);
    if (!countrySlug) {
      showNotification('City/airport not found. Try a city name or airport code (e.g. Vienna or VIE).', 'warning');
      return null;
    }
    const base = `https://${service === 'iprefer' ? 'iprefer' : 'preferredhotels'}.com/search/country/${countrySlug}?arrivalDate=${checkin}&departureDate=${checkout}&rateType=IPPOINTS&sortType=lowestPrice`;
    if (service === 'preferred-hotels') {
      return `${base}&numberOfAdults=${adults}`;
    }
    return base;
  }
  
  return urls[service] || '#';
}


// Hotel transfer ratios modal (Amex, Chase, Citi, etc.) – fallback when Supabase unavailable
const HOTEL_TRANSFER_ROWS_FALLBACK = [
  { partner: 'Accor', program: 'Live Limitless', rateLabel: 'Fixed Points Value', amex: null, chase: null, citi: '1:0.5', capOne: '1:0.5', bilt: '1:0.67', wellsFargo: null, rove: '1:0.67' },
  { partner: 'Choice', program: 'Privileges', rateLabel: 'Fixed Points Rates', amex: '1:1', chase: null, citi: '1:2', capOne: '1:1', bilt: null, wellsFargo: '1:2', rove: null },
  { partner: 'Hyatt', program: 'World of Hyatt', rateLabel: 'Fixed Points Rates', amex: null, chase: '1:1', citi: null, capOne: null, bilt: '1:1', wellsFargo: null, rove: null },
  { partner: 'iPrefer', program: 'iPrefer', rateLabel: 'Fixed Points Rates', amex: null, chase: null, citi: '1:4', capOne: null, bilt: null, wellsFargo: null, rove: null },
  { partner: 'Preferred Hotels & Resorts', program: 'iPrefer', rateLabel: 'Fixed Points Rates', viaLabel: 'Choice → Preferred Hotels', amex: null, chase: null, citi: '1:2', capOne: null, bilt: null, wellsFargo: null, rove: null },
  { partner: 'Wyndham', program: 'Rewards', rateLabel: 'Fixed Points Rates', amex: null, chase: null, citi: '1:1', capOne: '1:1', bilt: null, wellsFargo: null, rove: null },
  { partner: 'Hilton', program: 'Honors', rateLabel: 'Dynamic Points Rates', amex: '1:2', chase: null, citi: null, capOne: null, bilt: '1:1', wellsFargo: null, rove: null },
  { partner: 'IHG', program: 'One Rewards', rateLabel: 'Dynamic Points Rates', amex: '1:1', chase: '1:1', citi: null, capOne: null, bilt: '1:1', wellsFargo: null, rove: null },
  { partner: 'Marriott', program: 'Bonvoy', rateLabel: 'Dynamic Points Rates', amex: '1:1', chase: '1:1', citi: null, capOne: null, bilt: '1:1', wellsFargo: null, rove: null },
  { partner: 'The Leading Hotels of the World', program: 'Leaders Club', rateLabel: 'Dynamic Points Rates', amex: null, chase: null, citi: '1:0.2', capOne: null, bilt: null, wellsFargo: null, rove: null }
];

function renderHotelTransferRows(rows) {
  return (rows || []).map(r => {
    const isFixedRates = (r.rateLabel || '') === 'Fixed Points Rates';
    const partnerPrefix = isFixedRates ? '⭐ ' : '';
    return `
    <tr data-rate-label="${(r.rateLabel || '').replace(/"/g, '&quot;')}">
      <td class="bs-transfer-td-partner">
        <div class="bs-transfer-partner-name">${partnerPrefix}${r.partner}</div>
        <div class="bs-transfer-partner-program">${r.program}</div>
        ${r.rateLabel ? `<div class="bs-transfer-rate-label">${r.rateLabel}${r.viaLabel ? ' ' + r.viaLabel : ''}</div>` : r.viaLabel ? `<div class="bs-transfer-via-label">${r.viaLabel}</div>` : ''}
      </td>
      <td class="bs-transfer-td"><span class="${getRatioCellClass(r.amex)}" data-ratio="${r.amex || ''}">${r.amex || '–'}</span></td>
      <td class="bs-transfer-td"><span class="${getRatioCellClass(r.chase)}" data-ratio="${r.chase || ''}">${r.chase || '–'}</span></td>
      <td class="bs-transfer-td"><span class="${getRatioCellClass(r.citi)}" data-ratio="${r.citi || ''}">${r.citi || '–'}</span></td>
      <td class="bs-transfer-td"><span class="${getRatioCellClass(r.capOne)}" data-ratio="${r.capOne || ''}">${r.capOne || '–'}</span></td>
      <td class="bs-transfer-td"><span class="${getRatioCellClass(r.bilt)}" data-ratio="${r.bilt || ''}">${r.bilt || '–'}</span></td>
      <td class="bs-transfer-td"><span class="${getRatioCellClass(r.wellsFargo)}" data-ratio="${r.wellsFargo || ''}">${r.wellsFargo || '–'}</span></td>
      <td class="bs-transfer-td"><span class="${getRatioCellClass(r.rove)}" data-ratio="${r.rove || ''}">${r.rove || '–'}</span></td>
    </tr>
  `;
  }).join('');
}

function getRatioCellClass(ratio) {
  if (!ratio) return '';
  if (ratio === '1:0.2') return 'bs-ratio-poor';
  if (['1:0.5', '1:0.67'].includes(ratio)) return 'bs-ratio-ok';
  return 'bs-ratio-good';
}

function ratioToPercentage(ratio) {
  if (!ratio || ratio === '–') return '–';
  const m = ratio.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
  if (!m) return ratio;
  const a = parseFloat(m[1]);
  const b = parseFloat(m[2]);
  if (a === 0) return '–';
  const pct = Math.round((b / a) * 100);
  return pct + '%';
}

// For sorting ratio columns: "1:2" -> 2, "1:1" -> 1, "" -> -1 (sorts last)
function ratioToSortValue(ratio) {
  if (!ratio || ratio === '–') return -1;
  const m = ratio.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
  if (!m) return -1;
  return parseFloat(m[2]);
}

function applyTransferModalView(modal, view) {
  if (!modal) return;
  const isPct = view === 'percentage';
  modal.querySelectorAll('.bs-transfer-table .bs-transfer-td span[data-ratio]').forEach(span => {
    const ratio = span.getAttribute('data-ratio') || '';
    span.textContent = isPct ? ratioToPercentage(ratio) : (ratio || '–');
  });
  modal.querySelectorAll('.bs-transfer-view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === view);
  });
}

// Update counts summary for visible rows (respects filter + search)
// Total unique programs = only rows that have at least one transfer in a selected (checked) column
function updateTransferModalCounts(tbody, countsEl) {
  if (!tbody || !countsEl) return;
  const table = tbody.closest('table');
  const cardCols = [
    { key: 'amex', label: 'Amex', idx: 1 },
    { key: 'chase', label: 'Chase', idx: 2 },
    { key: 'citi', label: 'Citi', idx: 3 },
    { key: 'capOne', label: 'Capital One', idx: 4 },
    { key: 'bilt', label: 'Bilt', idx: 5 },
    { key: 'wellsFargo', label: 'Wells Fargo', idx: 6 },
    { key: 'rove', label: 'Rove', idx: 7 }
  ];
  const selectedCols = table ? cardCols.filter(({ key }) => !table.classList.contains('bs-hide-col-' + key)) : cardCols;
  const counts = { amex: 0, chase: 0, citi: 0, capOne: 0, bilt: 0, wellsFargo: 0, rove: 0 };
  let visibleTotal = 0;
  tbody.querySelectorAll('tr').forEach(tr => {
    if (tr.classList.contains('bs-transfer-loading-row') || tr.style.display === 'none') return;
    let hasRatioInSelectedColumn = false;
    cardCols.forEach(({ key, idx }) => {
      const cell = tr.cells[idx];
      const span = cell && cell.querySelector('span[data-ratio]');
      const ratio = span && (span.getAttribute('data-ratio') || '').trim();
      if (ratio) {
        counts[key]++;
        if (selectedCols.some(c => c.key === key)) hasRatioInSelectedColumn = true;
      }
    });
    if (hasRatioInSelectedColumn) visibleTotal++;
  });
  if (countsEl) countsEl.textContent = 'Total unique programs: ' + visibleTotal;
  if (table) {
    cardCols.forEach(({ key }) => {
      const th = table.querySelector('thead th[data-column="' + key + '"]');
      const countSpan = th && th.querySelector('.bs-transfer-col-count');
      if (countSpan) countSpan.textContent = counts[key];
    });
  }
}

const TRANSFER_CARD_COLUMNS = ['amex', 'chase', 'citi', 'capOne', 'bilt', 'wellsFargo', 'rove'];

function bindTransferColumnToggles(table) {
  if (!table) return;
  const modal = table.closest('.bs-transfer-modal-backdrop');
  const togglesWrap = modal && modal.querySelector('.bs-transfer-col-toggles');
  if (togglesWrap) {
    // Use always-visible column checkboxes so hidden columns can be re-added in the same view
    const tbody = table.querySelector('tbody');
    const countsEl = modal && modal.querySelector('.bs-transfer-counts');
    const refreshCounts = () => updateTransferModalCounts(tbody, countsEl);
    TRANSFER_CARD_COLUMNS.forEach(col => {
      const check = togglesWrap.querySelector('.bs-transfer-col-toggle[data-column="' + col + '"]');
      if (!check) return;
      check.addEventListener('change', function () {
        table.classList.toggle('bs-hide-col-' + col, !this.checked);
        refreshCounts();
      });
    });
    return;
  }
  // Fallback: add checkbox inside each th (column header disappears when hidden)
  const tbody = table.querySelector('tbody');
  const countsEl = modal && modal.querySelector('.bs-transfer-counts');
  const refreshCounts = () => updateTransferModalCounts(tbody, countsEl);
  TRANSFER_CARD_COLUMNS.forEach(col => {
    const th = table.querySelector('thead th[data-column="' + col + '"]');
    if (!th || th.querySelector('.bs-transfer-col-toggle')) return;
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'bs-transfer-col-toggle';
    check.dataset.column = col;
    check.checked = true;
    check.title = 'Show or hide this column';
    th.insertBefore(check, th.firstChild);
    check.addEventListener('click', (e) => e.stopPropagation());
    check.addEventListener('change', function () {
      table.classList.toggle('bs-hide-col-' + col, !this.checked);
      refreshCounts();
    });
  });
}

function openModalAsPdf(modalBox, title) {
  if (!modalBox) return;
  const header = modalBox.querySelector('.bs-transfer-modal-header');
  const body = modalBox.querySelector('.bs-transfer-modal-body');
  if (!header || !body) return;
  const headerClone = header.cloneNode(true);
  headerClone.querySelectorAll('.bs-transfer-modal-close, .bs-transfer-modal-pdf-btn').forEach(el => el.remove());
  const bodyClone = body.cloneNode(true);
  // Remove column count badges (e.g. "Amex 4") so PDF header shows only "Amex", "Chase", etc.
  bodyClone.querySelectorAll('.bs-transfer-col-count').forEach(el => el.remove());
  // Remove sort UI so PDF doesn't show "Sort" or arrows
  bodyClone.querySelectorAll('.bs-transfer-sort-arrow').forEach(el => el.remove());
  bodyClone.querySelectorAll('th[title="Sort"]').forEach(el => el.removeAttribute('title'));
  // Update "Total unique programs" to visible row count (clone has same display:none as current view)
  const table = bodyClone.querySelector('.bs-transfer-table');
  const countsEl = bodyClone.querySelector('.bs-transfer-counts');
  if (table && countsEl) {
    const isRowHidden = (tr) => {
      const s = (tr.getAttribute('style') || '').toLowerCase();
      return s.includes('display') && s.includes('none');
    };
    const dataRows = Array.from(table.querySelectorAll('tbody tr')).filter(
      tr => !tr.classList.contains('bs-transfer-loading-row') && !isRowHidden(tr)
    );
    countsEl.textContent = 'Total unique programs: ' + dataRows.length;
  }
  const hideColCss = `
.bs-transfer-table.bs-hide-col-amex th[data-column="amex"],.bs-transfer-table.bs-hide-col-amex td:nth-child(2){display:none !important;}
.bs-transfer-table.bs-hide-col-chase th[data-column="chase"],.bs-transfer-table.bs-hide-col-chase td:nth-child(3){display:none !important;}
.bs-transfer-table.bs-hide-col-citi th[data-column="citi"],.bs-transfer-table.bs-hide-col-citi td:nth-child(4){display:none !important;}
.bs-transfer-table.bs-hide-col-capOne th[data-column="capOne"],.bs-transfer-table.bs-hide-col-capOne td:nth-child(5){display:none !important;}
.bs-transfer-table.bs-hide-col-bilt th[data-column="bilt"],.bs-transfer-table.bs-hide-col-bilt td:nth-child(6){display:none !important;}
.bs-transfer-table.bs-hide-col-wellsFargo th[data-column="wellsFargo"],.bs-transfer-table.bs-hide-col-wellsFargo td:nth-child(7){display:none !important;}
.bs-transfer-table.bs-hide-col-rove th[data-column="rove"],.bs-transfer-table.bs-hide-col-rove td:nth-child(8){display:none !important;}
`;
  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${(title || 'Export').replace(/</g, '&lt;')}</title>
<style>
@page{size:auto;margin:12mm;}
body{font-family:system-ui,-apple-system,sans-serif;margin:12px;color:#202124;font-size:12px;}
.bs-transfer-modal-header{background:#f8f9fa;padding:10px 14px;border-bottom:1px solid #e8eaed;margin-bottom:0;}
.bs-transfer-modal-title{margin:0 0 4px 0;font-size:16px;font-weight:600;}
.bs-transfer-modal-explanation,.bs-transfer-modal-filter-explanation{margin:0;font-size:11px;color:#5f6368;}
.bs-transfer-modal-body{padding:10px 14px;}
.bs-transfer-controls,.bs-transfer-view-switch-wrap,.bs-transfer-col-row,.bs-transfer-search-wrap{display:none;}
.bs-transfer-table-wrap{margin-bottom:10px;overflow:visible;}
.bs-transfer-table-wrap table{width:100%;border-collapse:collapse;font-size:11px;table-layout:fixed;}
.bs-transfer-table th,.bs-transfer-table td{padding:5px 6px;border:1px solid #e8eaed;box-sizing:border-box;}
.bs-transfer-table th{background:#f1f3f4;font-weight:600;}
.bs-transfer-table th:first-child,.bs-transfer-table td:first-child{text-align:left;width:1%;white-space:nowrap;border-right:2px solid #dadce0;}
.bs-transfer-table th:not(:first-child),.bs-transfer-table td:not(:first-child){text-align:center;min-width:0;border-left:2px solid #dadce0;}
.bs-transfer-sort-arrow{display:none !important;}
.bs-transfer-counts,.bs-transfer-legend{margin-top:8px;font-size:11px;color:#5f6368;}
.bs-hotel-benefits-filter-bar,.bs-hotel-benefits-search,.bs-hotel-benefits-quick-filters,.bs-hotel-benefits-status-section{display:none !important;}
.bs-hotel-benefits-table-container{margin-top:12px;}
.bs-hotel-benefits-table th,.bs-hotel-benefits-table td{padding:6px;border:1px solid #e5e7eb;}
.bs-hotel-benefits-table thead th{background:#f9fafb;}
${hideColCss}
</style></head><body>
<div class="bs-transfer-modal-header">${headerClone.innerHTML}</div>
<div class="bs-transfer-modal-body">${bodyClone.innerHTML}</div>
</body></html>`;
  const win = window.open('', '_blank');
  if (!win) {
    showNotification('Allow pop-ups to save as PDF', 'info');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 250);
}

function createHotelTransferModal() {
  const backdrop = document.createElement('div');
  backdrop.className = 'bs-transfer-modal-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  const box = document.createElement('div');
  box.className = 'bs-transfer-modal-box';
  box.innerHTML = `
    <div class="bs-transfer-modal-header">
      <div class="bs-transfer-modal-header-text">
        <h3 class="bs-transfer-modal-title">Hotels – Transfer Ratios</h3>
        <p class="bs-transfer-modal-explanation">Card points → hotel points. <strong>1:1</strong> = same value; <strong>1:2</strong> = 1000 pts → 2000 points. Columns = card program.</p>
        <div class="bs-transfer-modal-filter-explanation">
          <div>Fixed Points Rates ⭐ — points rates do not follow cash prices; rates vary by season.</div>
          <div>Fixed Points Value — e.g. Accor: 1000 Accor Points = 20€.</div>
          <div>Dynamic Points Rates — points needed depend on the cash rate of the booking.</div>
        </div>
      </div>
      <button type="button" class="bs-action-btn bs-transfer-modal-pdf-btn" title="Save as PDF">📥 PDF</button>
      <button type="button" class="bs-action-btn bs-transfer-modal-close" title="Close">&times;</button>
    </div>
    <div class="bs-transfer-modal-body">
      <div class="bs-transfer-controls">
        <div class="bs-transfer-view-switch-wrap">
          <span class="bs-transfer-view-label">View:</span>
          <div class="bs-transfer-view-switch">
            <button type="button" class="bs-transfer-view-btn" data-view="ratio">Ratio</button>
            <button type="button" class="bs-transfer-view-btn active" data-view="percentage">Percentage</button>
          </div>
          <span class="bs-transfer-view-label bs-transfer-filter-label">Filter:</span>
          <div class="bs-transfer-filter-wrap">
            <button type="button" class="bs-transfer-filter-btn active" data-filter="">All</button>
            <button type="button" class="bs-transfer-filter-btn" data-filter="Fixed Points Rates" title="Show only starred (Fixed Points Rates)">⭐ Fixed Points Rates</button>
            <button type="button" class="bs-transfer-filter-btn" data-filter="Fixed Points Value">Fixed Points Value</button>
            <button type="button" class="bs-transfer-filter-btn" data-filter="Dynamic Points Rates">Dynamic Points Rates</button>
          </div>
        </div>
        <div class="bs-transfer-col-row">
          <span class="bs-transfer-view-label">Columns:</span>
          <div class="bs-transfer-col-toggles">
            <label><input type="checkbox" class="bs-transfer-col-toggle" data-column="amex" checked> Amex</label>
            <label><input type="checkbox" class="bs-transfer-col-toggle" data-column="chase" checked> Chase</label>
            <label><input type="checkbox" class="bs-transfer-col-toggle" data-column="citi" checked> Citi</label>
            <label><input type="checkbox" class="bs-transfer-col-toggle" data-column="capOne" checked> Capital One</label>
            <label><input type="checkbox" class="bs-transfer-col-toggle" data-column="bilt" checked> Bilt</label>
            <label><input type="checkbox" class="bs-transfer-col-toggle" data-column="wellsFargo" checked> Wells Fargo</label>
            <label><input type="checkbox" class="bs-transfer-col-toggle" data-column="rove" checked> Rove</label>
          </div>
        </div>
      </div>
      <div class="bs-transfer-search-wrap">
        <input type="text" class="bs-transfer-search" placeholder="Search partners or programs..." autocomplete="off" />
      </div>
      <div class="bs-transfer-table-wrap">
        <table class="bs-transfer-table bs-transfer-table-sortable">
          <thead>
            <tr>
              <th class="bs-transfer-th bs-transfer-th-partner bs-transfer-th-sortable" data-column="partner" title="Sort">Hotel / Program <span class="bs-transfer-sort-arrow"></span></th>
              <th class="bs-transfer-th bs-transfer-th-sortable" data-column="amex" title="Sort">Amex <span class="bs-transfer-sort-arrow"></span><span class="bs-transfer-col-count"></span></th>
              <th class="bs-transfer-th bs-transfer-th-sortable" data-column="chase" title="Sort">Chase <span class="bs-transfer-sort-arrow"></span><span class="bs-transfer-col-count"></span></th>
              <th class="bs-transfer-th bs-transfer-th-sortable" data-column="citi" title="Sort">Citi <span class="bs-transfer-sort-arrow"></span><span class="bs-transfer-col-count"></span></th>
              <th class="bs-transfer-th bs-transfer-th-sortable" data-column="capOne" title="Sort">Capital One <span class="bs-transfer-sort-arrow"></span><span class="bs-transfer-col-count"></span></th>
              <th class="bs-transfer-th bs-transfer-th-sortable" data-column="bilt" title="Sort">Bilt <span class="bs-transfer-sort-arrow"></span><span class="bs-transfer-col-count"></span></th>
              <th class="bs-transfer-th bs-transfer-th-sortable" data-column="wellsFargo" title="Sort">Wells Fargo <span class="bs-transfer-sort-arrow"></span><span class="bs-transfer-col-count"></span></th>
              <th class="bs-transfer-th bs-transfer-th-sortable" data-column="rove" title="Sort">Rove <span class="bs-transfer-sort-arrow"></span><span class="bs-transfer-col-count"></span></th>
            </tr>
          </thead>
          <tbody>
            <tr class="bs-transfer-loading-row"><td colspan="8">Loading…</td></tr>
          </tbody>
        </table>
      </div>
      <div class="bs-transfer-counts" aria-live="polite"></div>
      <div class="bs-transfer-legend">
        <span class="bs-transfer-legend-item"><span class="bs-ratio-good">●</span> Good (1:1 or better)</span>
        <span class="bs-transfer-legend-item"><span class="bs-ratio-ok">●</span> OK</span>
        <span class="bs-transfer-legend-item"><span class="bs-ratio-poor">●</span> Poor</span>
        <span class="bs-transfer-legend-item" style="color:#5f6368">– No transfer</span>
      </div>
    </div>
  `;
  backdrop.appendChild(box);
  const close = () => {
    backdrop.classList.remove('bs-transfer-modal-visible');
  };
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  box.querySelector('.bs-transfer-modal-close').addEventListener('click', close);
  const pdfBtn = box.querySelector('.bs-transfer-modal-pdf-btn');
  if (pdfBtn) pdfBtn.addEventListener('click', () => openModalAsPdf(box, 'Hotels – Transfer Ratios'));
  const searchInput = box.querySelector('.bs-transfer-search');
  const tbody = box.querySelector('.bs-transfer-table tbody');
  const filterWrap = box.querySelector('.bs-transfer-filter-wrap');
  function applyHotelVisibility() {
    if (!tbody) return;
    const modal = tbody.closest('.bs-transfer-modal-backdrop');
    const wrap = modal && modal.querySelector('.bs-transfer-filter-wrap');
    const search = modal && modal.querySelector('.bs-transfer-search');
    const q = (search && search.value.trim()) ? search.value.trim().toLowerCase() : '';
    const activeFilterBtn = wrap && wrap.querySelector('.bs-transfer-filter-btn.active');
    const filterValue = (activeFilterBtn && activeFilterBtn.getAttribute('data-filter')) || '';
    tbody.querySelectorAll('tr').forEach(tr => {
      if (tr.classList.contains('bs-transfer-loading-row')) {
        tr.style.display = filterValue ? 'none' : '';
        return;
      }
      const rateLabel = (tr.getAttribute('data-rate-label') || '').trim();
      const matchFilter = !filterValue || rateLabel === filterValue || (rateLabel && filterValue && rateLabel.toLowerCase() === filterValue.toLowerCase());
      const matchSearch = !q || tr.textContent.toLowerCase().includes(q);
      tr.style.display = matchFilter && matchSearch ? '' : 'none';
    });
    const countsEl = modal && modal.querySelector('.bs-transfer-counts');
    updateTransferModalCounts(tbody, countsEl);
  }
  if (searchInput && tbody) {
    searchInput.addEventListener('input', applyHotelVisibility);
  }
  if (filterWrap) {
    filterWrap.querySelectorAll('.bs-transfer-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterWrap.querySelectorAll('.bs-transfer-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyHotelVisibility();
      });
    });
  }
  backdrop.querySelectorAll('.bs-transfer-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      applyTransferModalView(backdrop, view);
    });
  });
  const table = box.querySelector('.bs-transfer-table');
  bindTransferColumnToggles(table);
  const thead = table && table.querySelector('thead tr');
  const HOTEL_COL_INDEX = { partner: 0, amex: 1, chase: 2, citi: 3, capOne: 4, bilt: 5, wellsFargo: 6, rove: 7 };
  let sortColumn = null;
  let sortDir = 1;
  function getHotelSortValue(tr, col) {
    const idx = HOTEL_COL_INDEX[col];
    if (col === 'partner') {
      return (tr.cells[0] && tr.cells[0].textContent || '').trim().toLowerCase();
    }
    const cell = tr.cells[idx];
    if (!cell) return -1;
    const span = cell.querySelector('span[data-ratio]');
    const ratio = span ? (span.getAttribute('data-ratio') || '') : '';
    return ratioToSortValue(ratio);
  }
  function sortHotelTable(col) {
    if (!tbody) return;
    if (sortColumn === col) sortDir = -sortDir;
    else { sortColumn = col; sortDir = 1; }
    const isPartner = col === 'partner';
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.sort((a, b) => {
      const va = getHotelSortValue(a, col);
      const vb = getHotelSortValue(b, col);
      if (isPartner) return sortDir * (va < vb ? -1 : va > vb ? 1 : 0);
      return sortDir * (va - vb);
    });
    rows.forEach(r => tbody.appendChild(r));
    thead.querySelectorAll('.bs-transfer-th-sortable').forEach(th => {
      const arrow = th.querySelector('.bs-transfer-sort-arrow');
      const c = th.getAttribute('data-column');
      if (c === sortColumn) {
        th.classList.add('bs-transfer-th-sorted');
        if (arrow) { arrow.textContent = sortDir === 1 ? '↑' : '↓'; arrow.classList.add('bs-transfer-sort-arrow-visible'); }
      } else {
        th.classList.remove('bs-transfer-th-sorted');
        if (arrow) { arrow.textContent = ''; arrow.classList.remove('bs-transfer-sort-arrow-visible'); }
      }
    });
  }
  if (thead && tbody) {
    thead.querySelectorAll('.bs-transfer-th-sortable').forEach(th => {
      th.addEventListener('click', () => sortHotelTable(th.getAttribute('data-column')));
    });
  }
  backdrop._applyHotelVisibility = applyHotelVisibility;
  applyTransferModalView(backdrop, 'percentage');
  return backdrop;
}

async function showHotelTransferModal() {
  let modal = document.getElementById('bs-hotel-transfer-modal');
  if (!modal) {
    modal = createHotelTransferModal();
    modal.id = 'bs-hotel-transfer-modal';
    document.body.appendChild(modal);
  }
  const tbody = modal.querySelector('.bs-transfer-table tbody');
  const searchInput = modal.querySelector('.bs-transfer-search');
  const filterWrap = modal.querySelector('.bs-transfer-filter-wrap');
  if (searchInput) searchInput.value = '';
  if (filterWrap) {
    filterWrap.querySelectorAll('.bs-transfer-filter-btn').forEach(b => b.classList.remove('active'));
    const allBtn = filterWrap.querySelector('.bs-transfer-filter-btn[data-filter=""]');
    if (allBtn) allBtn.classList.add('active');
  }
  modal.classList.add('bs-transfer-modal-visible');
  let rows = [];
  try {
    if (window.transferPartnersService && typeof window.transferPartnersService.getHotelTransferRowsLive === 'function') {
      rows = await window.transferPartnersService.getHotelTransferRowsLive();
    }
  } catch (e) {
    console.warn('Hotel transfer partners live fetch failed, using fallback', e);
  }
  if (!rows || rows.length === 0) rows = HOTEL_TRANSFER_ROWS_FALLBACK;
  if (tbody) {
    tbody.innerHTML = renderHotelTransferRows(rows);
    applyTransferModalView(modal, 'percentage');
    if (modal._applyHotelVisibility) modal._applyHotelVisibility();
  }
}

// Tiers modal – same UI/UX as Info (transfer) modal, content = Hotel Benefits
function createHotelTiersModal() {
  const backdrop = document.createElement('div');
  backdrop.className = 'bs-transfer-modal-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  const box = document.createElement('div');
  box.className = 'bs-transfer-modal-box bs-hotel-tiers-modal-box';
  box.innerHTML = `
    <div class="bs-transfer-modal-header">
      <div class="bs-transfer-modal-header-text">
        <h3 class="bs-transfer-modal-title">Tiers</h3>
        <p class="bs-transfer-modal-explanation">Compare hotel loyalty program benefits and status levels.</p>
      </div>
      <button type="button" class="bs-action-btn bs-transfer-modal-pdf-btn" title="Save as PDF">📥 PDF</button>
      <button type="button" class="bs-action-btn bs-transfer-modal-close" title="Close">&times;</button>
    </div>
    <div class="bs-transfer-modal-body">
      <div class="bs-hotel-benefits-container">
        <div class="bs-hotel-benefits-filter-bar">
          <div class="bs-hotel-benefits-filter-header">
            <h4>Hotel Benefits Management</h4>
            <div class="bs-hotel-benefits-filter-actions">
              <button type="button" class="bs-hotel-benefits-btn" id="bs-hotel-benefits-favorites-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span>Show Favorites</span>
              </button>
              <button type="button" class="bs-hotel-benefits-btn" id="bs-hotel-benefits-status-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
                <span>Show Status</span>
              </button>
            </div>
          </div>
          <div class="bs-hotel-benefits-search">
            <div class="bs-input-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="text" id="bs-hotel-benefits-search" placeholder="Search benefits (e.g., 'suite', 'breakfast', 'lounge')...">
              <button type="button" class="bs-hotel-benefits-clear-search" id="bs-hotel-benefits-clear-search" style="display: none;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="bs-hotel-benefits-quick-filters" id="bs-hotel-benefits-quick-filters"></div>
          <div class="bs-hotel-benefits-status-section" id="bs-hotel-benefits-status-section" style="display: none;">
            <h5>Set Current Status Levels</h5>
            <div class="bs-hotel-benefits-status-grid" id="bs-hotel-benefits-status-grid"></div>
          </div>
        </div>
        <div class="bs-hotel-benefits-table-container" id="bs-hotel-benefits-table-container"></div>
      </div>
    </div>
  `;
  backdrop.appendChild(box);
  const close = () => backdrop.classList.remove('bs-transfer-modal-visible');
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  box.querySelector('.bs-transfer-modal-close').addEventListener('click', close);
  const tiersPdfBtn = box.querySelector('.bs-transfer-modal-pdf-btn');
  if (tiersPdfBtn) tiersPdfBtn.addEventListener('click', () => openModalAsPdf(box, 'Tiers'));
  return backdrop;
}

function attachHotelBenefitsListeners() {
  const searchInput = document.getElementById('bs-hotel-benefits-search');
  const clearSearchBtn = document.getElementById('bs-hotel-benefits-clear-search');
  const favoritesBtn = document.getElementById('bs-hotel-benefits-favorites-btn');
  const statusBtn = document.getElementById('bs-hotel-benefits-status-btn');
  const statusSection = document.getElementById('bs-hotel-benefits-status-section');
  if (!searchInput) return;
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    if (clearSearchBtn) {
      clearSearchBtn.style.display = searchTerm ? 'block' : 'none';
    }
    renderBenefitsTable().catch(err => console.error('Error rendering benefits table:', err));
  });
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchTerm = '';
      clearSearchBtn.style.display = 'none';
      renderBenefitsTable().catch(err => console.error('Error rendering benefits table:', err));
    });
  }
  if (favoritesBtn) {
    favoritesBtn.addEventListener('click', () => {
      showOnlyFavorites = !showOnlyFavorites;
      const span = favoritesBtn.querySelector('span');
      if (span) span.textContent = showOnlyFavorites ? 'Show All' : 'Show Favorites';
      renderBenefitsTable().catch(err => console.error('Error rendering benefits table:', err));
    });
  }
  if (statusBtn && statusSection) {
    statusBtn.addEventListener('click', () => {
      isStatusSectionExpanded = !isStatusSectionExpanded;
      statusSection.style.display = isStatusSectionExpanded ? 'block' : 'none';
      const span = statusBtn.querySelector('span');
      if (span) span.textContent = isStatusSectionExpanded ? 'Hide Status' : 'Show Status';
      if (isStatusSectionExpanded) {
        renderStatusSelectors().catch(err => console.error('Error rendering status selectors:', err));
      }
    });
  }
}

function showHotelTiersModal() {
  let modal = document.getElementById('bs-hotel-tiers-modal');
  if (!modal) {
    modal = createHotelTiersModal();
    modal.id = 'bs-hotel-tiers-modal';
    document.body.appendChild(modal);
    modal._tiersInitialized = true;
    attachHotelBenefitsListeners();
  }
  modal.classList.add('bs-transfer-modal-visible');
  if (typeof loadHotelStatuses === 'function') {
    loadHotelStatuses();
  }
}

// Airline transfer ratios modal – fallback when Supabase unavailable
const AIRLINE_TRANSFER_ROWS_FALLBACK = [
  { partner: 'Aer Lingus', program: 'Avios', alliance: 'OneWorld', amex: '1:1', chase: '1:1', citi: null, capOne: null, bilt: '1:1', wellsFargo: '1:1', rove: null },
  { partner: 'Aeromexico', program: 'Club Premier', alliance: 'SkyTeam', amex: '1:1.6', chase: null, citi: null, capOne: '1:1', bilt: null, wellsFargo: null, rove: '1:1' },
  { partner: 'Air Canada', program: 'Aeroplan', alliance: 'Star Alliance', amex: '1:1', chase: '1:1', citi: null, capOne: '1:1', bilt: '1:1', wellsFargo: null, rove: null },
  { partner: 'Air France / KLM', program: 'Flying Blue', alliance: 'SkyTeam', amex: '1:1', chase: '1:1', citi: '1:1', capOne: '1:1', bilt: '1:1', wellsFargo: '1:1', rove: '1:1' },
  { partner: 'Air India', program: 'Maharaja Club', alliance: 'Star Alliance', amex: null, chase: null, citi: null, capOne: null, bilt: null, wellsFargo: null, rove: '1:1' },
  { partner: 'Alaska Airlines', program: 'Mileage Plan', alliance: 'OneWorld', amex: null, chase: null, citi: null, capOne: null, bilt: '1:1', wellsFargo: null, rove: null },
  { partner: 'American Airlines', program: 'AAdvantage', alliance: 'OneWorld', amex: null, chase: null, citi: '1:1', capOne: null, bilt: null, wellsFargo: null, rove: null },
  { partner: 'ANA', program: 'Mileage Club', alliance: 'Star Alliance', amex: '1:1', chase: null, citi: null, capOne: null, bilt: null, wellsFargo: null, rove: null },
  { partner: 'Avianca', program: 'LifeMiles', alliance: 'Star Alliance', amex: '1:1', chase: null, citi: '1:1', capOne: '1:1', bilt: '1:1', wellsFargo: '1:1', rove: null },
  { partner: 'British Airways', program: 'Avios', alliance: 'OneWorld', amex: '1:1', chase: '1:1', citi: null, capOne: '1:1', bilt: '1:1', wellsFargo: '1:1', rove: null },
  { partner: 'Cathay Pacific', program: 'Asia Miles', alliance: 'OneWorld', amex: '1:0.8', chase: null, citi: '1:1', capOne: '1:1', bilt: '1:1', wellsFargo: null, rove: '1:1' },
  { partner: 'Delta', program: 'SkyMiles', alliance: 'SkyTeam', amex: '1:1', chase: null, citi: null, capOne: null, bilt: null, wellsFargo: null, rove: null },
  { partner: 'Emirates', program: 'Skywards', alliance: null, amex: '1:0.8', chase: null, citi: '1:0.8', capOne: '1:0.75', bilt: '1:1', wellsFargo: null, rove: null },
  { partner: 'Etihad', program: 'Guest', alliance: null, amex: '1:1', chase: null, citi: '1:1', capOne: '1:1', bilt: '1:1', wellsFargo: null, rove: '1:1' },
  { partner: 'EVA Air', program: 'MileageLands', alliance: 'Star Alliance', amex: null, chase: null, citi: '1:1', capOne: '1:0.75', bilt: null, wellsFargo: null, rove: null },
  { partner: 'Finnair', program: 'Plus', alliance: 'OneWorld', amex: null, chase: null, citi: null, capOne: '1:1', bilt: null, wellsFargo: null, rove: '1:1' },
  { partner: 'Iberia', program: 'Avios', alliance: 'OneWorld', amex: '1:1', chase: '1:1', citi: null, capOne: null, bilt: '1:1', wellsFargo: '1:1', rove: null },
  { partner: 'Japan Airlines', program: 'Mileage', alliance: 'OneWorld', amex: null, chase: null, citi: null, capOne: null, bilt: '1:1', wellsFargo: null, rove: null },
  { partner: 'JetBlue', program: 'TrueBlue', alliance: null, amex: '1:0.8', chase: '1:1', citi: '1:1', capOne: '1:0.6', bilt: null, wellsFargo: null, rove: null },
  { partner: 'Lufthansa', program: 'Miles and More', alliance: 'Star Alliance', amex: null, chase: null, citi: null, capOne: null, bilt: null, wellsFargo: null, rove: '1:1' },
  { partner: 'Qantas', program: 'Frequent Flyer', alliance: 'OneWorld', amex: '1:1', chase: null, citi: '1:1', capOne: '1:1', bilt: null, wellsFargo: null, rove: null },
  { partner: 'Qatar Airways', program: 'Privilege Club', alliance: 'OneWorld', amex: '1:1', chase: null, citi: '1:1', capOne: null, bilt: '1:1', wellsFargo: null, rove: '1:1' },
  { partner: 'Singapore Airlines', program: 'KrisFlyer', alliance: 'Star Alliance', amex: '1:1', chase: '1:1', citi: '1:1', capOne: '1:1', bilt: null, wellsFargo: null, rove: null },
  { partner: 'Southwest', program: 'Rapid Rewards', alliance: null, amex: null, chase: '1:1', citi: null, capOne: null, bilt: '1:1', wellsFargo: null, rove: null },
  { partner: 'Spirit Airlines', program: 'Free Spirit', alliance: null, amex: null, chase: null, citi: null, capOne: null, bilt: '1:1', wellsFargo: null, rove: null },
  { partner: 'TAP Portugal', program: 'Miles & Go', alliance: 'Star Alliance', amex: null, chase: null, citi: null, capOne: '1:1', bilt: '1:1', wellsFargo: null, rove: null },
  { partner: 'Thai Airways', program: 'Royal Orchid Plus', alliance: 'Star Alliance', amex: null, chase: null, citi: '1:1', capOne: null, bilt: null, wellsFargo: null, rove: '1:1' },
  { partner: 'Turkish Airlines', program: 'Miles & Smiles', alliance: 'Star Alliance', amex: null, chase: null, citi: '1:1', capOne: '1:1', bilt: '1:1', wellsFargo: null, rove: '1:1' },
  { partner: 'United', program: 'MileagePlus', alliance: 'Star Alliance', amex: null, chase: '1:1', citi: null, capOne: null, bilt: '1:1', wellsFargo: null, rove: null },
  { partner: 'Vietnam Airlines', program: 'Lotusmiles', alliance: 'SkyTeam', amex: null, chase: null, citi: null, capOne: null, bilt: null, wellsFargo: null, rove: '1:1' },
  { partner: 'Virgin Atlantic', program: 'Flying Club', alliance: 'SkyTeam', amex: '1:1', chase: '1:1', citi: '1:1', capOne: '1:1', bilt: '1:1', wellsFargo: '1:1', rove: null }
];

function renderAirlineTransferRows(rows) {
  return (rows || []).map(r => `
    <tr data-alliance="${(r.alliance || 'No').replace(/"/g, '&quot;')}">
      <td class="bs-transfer-td-partner">
        <div class="bs-transfer-partner-name">${r.partner}</div>
        <div class="bs-transfer-partner-program">${r.program}</div>
        ${r.alliance ? `<div class="bs-transfer-partner-program">${r.alliance}</div>` : ''}
      </td>
      <td class="bs-transfer-td"><span class="${getAirlineRatioCellClass(r.amex)}" data-ratio="${r.amex || ''}">${r.amex || '–'}</span></td>
      <td class="bs-transfer-td"><span class="${getAirlineRatioCellClass(r.chase)}" data-ratio="${r.chase || ''}">${r.chase || '–'}</span></td>
      <td class="bs-transfer-td"><span class="${getAirlineRatioCellClass(r.citi)}" data-ratio="${r.citi || ''}">${r.citi || '–'}</span></td>
      <td class="bs-transfer-td"><span class="${getAirlineRatioCellClass(r.capOne)}" data-ratio="${r.capOne || ''}">${r.capOne || '–'}</span></td>
      <td class="bs-transfer-td"><span class="${getAirlineRatioCellClass(r.bilt)}" data-ratio="${r.bilt || ''}">${r.bilt || '–'}</span></td>
      <td class="bs-transfer-td"><span class="${getAirlineRatioCellClass(r.wellsFargo)}" data-ratio="${r.wellsFargo || ''}">${r.wellsFargo || '–'}</span></td>
      <td class="bs-transfer-td"><span class="${getAirlineRatioCellClass(r.rove)}" data-ratio="${r.rove || ''}">${r.rove || '–'}</span></td>
    </tr>
  `).join('');
}

function getAirlineRatioCellClass(ratio) {
  if (!ratio) return '';
  if (['1:0.6', '1:0.75'].includes(ratio)) return 'bs-ratio-ok';
  if (ratio === '1:0.8') return 'bs-ratio-warn';
  return 'bs-ratio-good';
}

function createFlightTransferModal() {
  const backdrop = document.createElement('div');
  backdrop.className = 'bs-transfer-modal-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  const box = document.createElement('div');
  box.className = 'bs-transfer-modal-box';
  box.innerHTML = `
    <div class="bs-transfer-modal-header">
      <div class="bs-transfer-modal-header-text">
        <h3 class="bs-transfer-modal-title">Airlines – Transfer Ratios</h3>
        <p class="bs-transfer-modal-explanation">Card points → airline miles. <strong>1:1</strong> = 1000 pts → 1000 miles. Columns = card program. Use search to filter.</p>
      </div>
      <button type="button" class="bs-action-btn bs-transfer-modal-pdf-btn" title="Save as PDF">📥 PDF</button>
      <button type="button" class="bs-action-btn bs-transfer-modal-close" title="Close">&times;</button>
    </div>
    <div class="bs-transfer-modal-body">
      <div class="bs-transfer-controls">
        <div class="bs-transfer-view-switch-wrap">
          <span class="bs-transfer-view-label">View:</span>
          <div class="bs-transfer-view-switch">
            <button type="button" class="bs-transfer-view-btn" data-view="ratio">Ratio</button>
            <button type="button" class="bs-transfer-view-btn active" data-view="percentage">Percentage</button>
          </div>
          <span class="bs-transfer-view-label bs-transfer-filter-label">Alliance:</span>
          <div class="bs-transfer-filter-wrap">
            <button type="button" class="bs-transfer-filter-btn active" data-filter="">All</button>
            <button type="button" class="bs-transfer-filter-btn" data-filter="OneWorld">OneWorld</button>
            <button type="button" class="bs-transfer-filter-btn" data-filter="SkyTeam">SkyTeam</button>
            <button type="button" class="bs-transfer-filter-btn" data-filter="Star Alliance">Star Alliance</button>
            <button type="button" class="bs-transfer-filter-btn" data-filter="No">No</button>
          </div>
        </div>
        <div class="bs-transfer-col-row">
          <span class="bs-transfer-view-label">Columns:</span>
          <div class="bs-transfer-col-toggles">
            <label><input type="checkbox" class="bs-transfer-col-toggle" data-column="amex" checked> Amex</label>
            <label><input type="checkbox" class="bs-transfer-col-toggle" data-column="chase" checked> Chase</label>
            <label><input type="checkbox" class="bs-transfer-col-toggle" data-column="citi" checked> Citi</label>
            <label><input type="checkbox" class="bs-transfer-col-toggle" data-column="capOne" checked> Capital One</label>
            <label><input type="checkbox" class="bs-transfer-col-toggle" data-column="bilt" checked> Bilt</label>
            <label><input type="checkbox" class="bs-transfer-col-toggle" data-column="wellsFargo" checked> Wells Fargo</label>
            <label><input type="checkbox" class="bs-transfer-col-toggle" data-column="rove" checked> Rove</label>
          </div>
        </div>
      </div>
      <div class="bs-transfer-search-wrap">
        <input type="text" class="bs-transfer-search" placeholder="Search airlines, programs or alliances..." autocomplete="off" />
      </div>
      <div class="bs-transfer-table-wrap">
        <table class="bs-transfer-table bs-transfer-table-sortable">
          <thead>
            <tr>
              <th class="bs-transfer-th bs-transfer-th-partner bs-transfer-th-sortable" data-column="partner" title="Sort">Airline / Program <span class="bs-transfer-sort-arrow"></span></th>
              <th class="bs-transfer-th bs-transfer-th-sortable" data-column="amex" title="Sort">Amex <span class="bs-transfer-sort-arrow"></span><span class="bs-transfer-col-count"></span></th>
              <th class="bs-transfer-th bs-transfer-th-sortable" data-column="chase" title="Sort">Chase <span class="bs-transfer-sort-arrow"></span><span class="bs-transfer-col-count"></span></th>
              <th class="bs-transfer-th bs-transfer-th-sortable" data-column="citi" title="Sort">Citi <span class="bs-transfer-sort-arrow"></span><span class="bs-transfer-col-count"></span></th>
              <th class="bs-transfer-th bs-transfer-th-sortable" data-column="capOne" title="Sort">Capital One <span class="bs-transfer-sort-arrow"></span><span class="bs-transfer-col-count"></span></th>
              <th class="bs-transfer-th bs-transfer-th-sortable" data-column="bilt" title="Sort">Bilt <span class="bs-transfer-sort-arrow"></span><span class="bs-transfer-col-count"></span></th>
              <th class="bs-transfer-th bs-transfer-th-sortable" data-column="wellsFargo" title="Sort">Wells Fargo <span class="bs-transfer-sort-arrow"></span><span class="bs-transfer-col-count"></span></th>
              <th class="bs-transfer-th bs-transfer-th-sortable" data-column="rove" title="Sort">Rove <span class="bs-transfer-sort-arrow"></span><span class="bs-transfer-col-count"></span></th>
            </tr>
          </thead>
          <tbody>
            <tr class="bs-transfer-loading-row"><td colspan="8">Loading…</td></tr>
          </tbody>
        </table>
      </div>
      <div class="bs-transfer-counts" aria-live="polite"></div>
      <div class="bs-transfer-legend">
        <span class="bs-transfer-legend-item"><span class="bs-ratio-good">●</span> Good (1:1+)</span>
        <span class="bs-transfer-legend-item"><span class="bs-ratio-warn">●</span> Fair</span>
        <span class="bs-transfer-legend-item"><span class="bs-ratio-ok">●</span> OK</span>
        <span class="bs-transfer-legend-item" style="color:#5f6368">– No transfer</span>
      </div>
    </div>
  `;
  backdrop.appendChild(box);
  const close = () => {
    backdrop.classList.remove('bs-transfer-modal-visible');
  };
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  box.querySelector('.bs-transfer-modal-close').addEventListener('click', close);
  const flightPdfBtn = box.querySelector('.bs-transfer-modal-pdf-btn');
  if (flightPdfBtn) flightPdfBtn.addEventListener('click', () => openModalAsPdf(box, 'Airlines – Transfer Ratios'));
  const searchInput = box.querySelector('.bs-transfer-search');
  const tbody = box.querySelector('.bs-transfer-table tbody');
  const filterWrap = box.querySelector('.bs-transfer-filter-wrap');
  function applyAirlineVisibility() {
    if (!tbody) return;
    const modal = tbody.closest('.bs-transfer-modal-backdrop');
    const wrap = modal && modal.querySelector('.bs-transfer-filter-wrap');
    const search = modal && modal.querySelector('.bs-transfer-search');
    const q = (search && search.value.trim()) ? search.value.trim().toLowerCase() : '';
    const activeFilterBtn = wrap && wrap.querySelector('.bs-transfer-filter-btn.active');
    const filterValue = (activeFilterBtn && activeFilterBtn.getAttribute('data-filter')) || '';
    tbody.querySelectorAll('tr').forEach(tr => {
      if (tr.classList.contains('bs-transfer-loading-row')) {
        tr.style.display = filterValue ? 'none' : '';
        return;
      }
      const alliance = (tr.getAttribute('data-alliance') || '').trim();
      const matchFilter = !filterValue || alliance === filterValue;
      const matchSearch = !q || tr.textContent.toLowerCase().includes(q);
      tr.style.display = matchFilter && matchSearch ? '' : 'none';
    });
    const countsEl = modal && modal.querySelector('.bs-transfer-counts');
    updateTransferModalCounts(tbody, countsEl);
  }
  if (searchInput && tbody) {
    searchInput.addEventListener('input', applyAirlineVisibility);
  }
  if (filterWrap) {
    filterWrap.querySelectorAll('.bs-transfer-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterWrap.querySelectorAll('.bs-transfer-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyAirlineVisibility();
      });
    });
  }
  backdrop.querySelectorAll('.bs-transfer-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      applyTransferModalView(backdrop, view);
    });
  });
  const table = box.querySelector('.bs-transfer-table');
  bindTransferColumnToggles(table);
  const thead = table && table.querySelector('thead tr');
  const AIRLINE_COL_INDEX = { partner: 0, amex: 1, chase: 2, citi: 3, capOne: 4, bilt: 5, wellsFargo: 6, rove: 7 };
  let sortColumn = null;
  let sortDir = 1; // 1 = asc, -1 = desc
  function getSortValue(tr, col) {
    const idx = AIRLINE_COL_INDEX[col];
    if (col === 'partner') {
      return (tr.cells[0] && tr.cells[0].textContent || '').trim().toLowerCase();
    }
    const cell = tr.cells[idx];
    if (!cell) return -1;
    const span = cell.querySelector('span[data-ratio]');
    const ratio = span ? (span.getAttribute('data-ratio') || '') : '';
    return ratioToSortValue(ratio);
  }
  function sortAirlineTable(col) {
    if (!tbody) return;
    if (sortColumn === col) sortDir = -sortDir;
    else { sortColumn = col; sortDir = 1; }
    const isPartner = col === 'partner';
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.sort((a, b) => {
      const va = getSortValue(a, col);
      const vb = getSortValue(b, col);
      if (isPartner) return sortDir * (va < vb ? -1 : va > vb ? 1 : 0);
      return sortDir * (va - vb);
    });
    rows.forEach(r => tbody.appendChild(r));
    thead.querySelectorAll('.bs-transfer-th-sortable').forEach(th => {
      const arrow = th.querySelector('.bs-transfer-sort-arrow');
      const c = th.getAttribute('data-column');
      if (c === sortColumn) {
        th.classList.add('bs-transfer-th-sorted');
        if (arrow) { arrow.textContent = sortDir === 1 ? '↑' : '↓'; arrow.classList.add('bs-transfer-sort-arrow-visible'); }
      } else {
        th.classList.remove('bs-transfer-th-sorted');
        if (arrow) { arrow.textContent = ''; arrow.classList.remove('bs-transfer-sort-arrow-visible'); }
      }
    });
  }
  if (thead && tbody) {
    thead.querySelectorAll('.bs-transfer-th-sortable').forEach(th => {
      th.addEventListener('click', () => sortAirlineTable(th.getAttribute('data-column')));
    });
  }
  backdrop._applyAirlineVisibility = applyAirlineVisibility;
  applyTransferModalView(backdrop, 'percentage');
  return backdrop;
}

async function showFlightTransferModal() {
  let modal = document.getElementById('bs-flight-transfer-modal');
  if (!modal) {
    modal = createFlightTransferModal();
    modal.id = 'bs-flight-transfer-modal';
    document.body.appendChild(modal);
  }
  const tbody = modal.querySelector('.bs-transfer-table tbody');
  const searchInput = modal.querySelector('.bs-transfer-search');
  const filterWrap = modal.querySelector('.bs-transfer-filter-wrap');
  if (searchInput) searchInput.value = '';
  if (filterWrap) {
    filterWrap.querySelectorAll('.bs-transfer-filter-btn').forEach(b => b.classList.remove('active'));
    const allBtn = filterWrap.querySelector('.bs-transfer-filter-btn[data-filter=""]');
    if (allBtn) allBtn.classList.add('active');
  }
  modal.classList.add('bs-transfer-modal-visible');
  let rows = [];
  try {
    if (window.transferPartnersService && typeof window.transferPartnersService.getAirlineTransferRowsLive === 'function') {
      rows = await window.transferPartnersService.getAirlineTransferRowsLive();
    }
  } catch (e) {
    console.warn('Airline transfer partners live fetch failed, using fallback', e);
  }
  if (!rows || rows.length === 0) rows = AIRLINE_TRANSFER_ROWS_FALLBACK;
  if (tbody) {
    tbody.innerHTML = renderAirlineTransferRows(rows);
    applyTransferModalView(modal, 'percentage');
    if (modal._applyAirlineVisibility) modal._applyAirlineVisibility();
  }
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


// Remove Google Flights footer (class plvncb) so it cannot be changed or used
function removePlvncbFooter() {
  document.querySelectorAll('.plvncb').forEach(el => { try { el.remove(); } catch (_) {} });
}

// Setup observer to inject panel when page loads
function setupObserver() {
  // Try multiple times with different delays
  const delays = [100, 500, 1000, 2000, 3000];
  delays.forEach(delay => {
    setTimeout(() => injectExtensionPanel(), delay);
  });

  // Remove Google Flights footer immediately and after delays (in case it's added later)
  removePlvncbFooter();
  [200, 1000, 3000].forEach(delay => setTimeout(removePlvncbFooter, delay));

  // Watch for DOM changes
  const observer = new MutationObserver(() => {
    if (!document.querySelector('.bs-extension-panel')) {
      injectExtensionPanel();
    }
    removePlvncbFooter();
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

  // If a manual refresh was triggered, wait for full load indicators
  try {
    if (sessionStorage.getItem('bs-wait-full-load') === '1') {
      waitForFullLoad().then(() => {
        try { sessionStorage.removeItem('bs-wait-full-load') } catch(_) {}
        showNotification('Page fully loaded', 'success');
      });
    }
  } catch(_) {}
}

// Wait for full load: window load + core results present
function waitForFullLoad() {
  return new Promise((resolve) => {
    const done = () => resolve();

    const checkDomReady = () => {
      const hasResults = document.querySelector('.XwbuFf') && (document.querySelector('li.pIav2d, .yR1fYc, .mxvQLc'));
      if (hasResults) {
        done();
        return true;
      }
      return false;
    };

    if (document.readyState === 'complete' && checkDomReady()) {
      return done();
    }

    window.addEventListener('load', () => {
      if (checkDomReady()) return done();
      const obs = new MutationObserver(() => {
        if (checkDomReady()) {
          obs.disconnect();
          done();
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }, { once: true });
  });
}

// Initialize Calculation Section
function initializeCalculationSection() {
  // Populate program dropdowns
  populateProgramDropdowns();
  
  // Initialize Total Calculator
  initializeTotalCalculator();
  
  // Initialize Rovemiles Calculator
  initializeRovemilesCalculator();
  
  // Initialize Hyatt Calculator
  initializeHyattCalculator();
  
  // Initialize Hilton Calculator
  initializeHiltonCalculator();
}

// Populate program dropdowns for calculators
function populateProgramDropdowns() {
  // Wait for loyalty programs to be available
  if (!window.loyaltyPrograms) {
    setTimeout(populateProgramDropdowns, 100);
    return;
  }

  const calcProgramSelect = document.getElementById('bs-calc-program');
  const roveProgramSelect = document.getElementById('bs-rove-program');

  if (calcProgramSelect) {
    const creditGroup = calcProgramSelect.querySelector('optgroup[label="💳 Credit Card Programs"]');
    const airlineGroup = calcProgramSelect.querySelector('optgroup[label="✈️ Airlines"]');
    const hotelGroup = calcProgramSelect.querySelector('optgroup[label="🏨 Hotels"]');

    // Clear existing options first to prevent duplicates
    if (creditGroup) creditGroup.innerHTML = '';
    if (airlineGroup) airlineGroup.innerHTML = '';
    if (hotelGroup) hotelGroup.innerHTML = '';

    window.loyaltyPrograms.forEach(program => {
      const option = document.createElement('option');
      option.value = program.name;
      option.textContent = `${program.name} (${(program.pointValue * 100).toFixed(2)}¢)`;

      if (program.category === 'credit' && creditGroup) {
        creditGroup.appendChild(option);
      } else if (program.category === 'airline' && airlineGroup) {
        airlineGroup.appendChild(option);
      } else if (program.category === 'hotel' && hotelGroup) {
        hotelGroup.appendChild(option);
      }
    });
  }

  if (roveProgramSelect) {
    // Clear existing options first
    roveProgramSelect.innerHTML = '';
    
    window.loyaltyPrograms.forEach(program => {
      const option = document.createElement('option');
      option.value = program.name;
      option.textContent = `${program.name} (${program.pointValue.toFixed(4)} USD/mile)`;
      roveProgramSelect.appendChild(option);
    });
  }
}

// Fetch historical data for a program from Supabase
async function fetchHistoricalData(programName) {
  try {
    const supabaseUrl = 'https://saegzrncsjcsvgcjkniv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZWd6cm5jc2pjc3ZnY2prbml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3ODgxNDYsImV4cCI6MjA0NzM2NDE0Nn0.w1eHVcuvDUoqhcMCYenKKA9URAtG4YbW3j5GcDgvu3Y';
    
    if (!programName) {
      return null;
    }

    // Fetch all entries for this program from points_history table
    const response = await fetch(
      `${supabaseUrl}/rest/v1/points_history?loyalty=eq.${encodeURIComponent(programName)}&order=start_date.desc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      }
    );

    if (!response.ok) {
      console.log('No historical data found in Supabase for', programName);
      return null;
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      return null;
    }

    // Sort by start_date (newest first) - already sorted by query, but ensure it
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);
      return dateB - dateA;
    });

    // Current is the most recent entry's price_per_thousand
    const current = sortedData[0]?.price_per_thousand || null;

    // Calculate moving averages
    const avg6 = sortedData.slice(0, 6).reduce((sum, item) => 
      sum + (item.price_per_thousand || 0), 0) / Math.min(sortedData.length, 6);
    
    const avg12 = sortedData.slice(0, 12).reduce((sum, item) => 
      sum + (item.price_per_thousand || 0), 0) / Math.min(sortedData.length, 12);
    
    const avg24 = sortedData.slice(0, 24).reduce((sum, item) => 
      sum + (item.price_per_thousand || 0), 0) / Math.min(sortedData.length, 24);

    return {
      current: current,
      avg6m: isNaN(avg6) ? null : avg6,
      avg12m: isNaN(avg12) ? null : avg12,
      avg24m: isNaN(avg24) ? null : avg24
    };
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return null;
  }
}

// Update historical data display
async function updateHistoricalData(programName) {
  const currentEl = document.getElementById('bs-calc-historical-current');
  const avg6mEl = document.getElementById('bs-calc-historical-6m');
  const avg12mEl = document.getElementById('bs-calc-historical-12m');
  const avg24mEl = document.getElementById('bs-calc-historical-24m');

  // Reset to default
  if (currentEl) currentEl.textContent = '$-';
  if (avg6mEl) avg6mEl.textContent = '$-';
  if (avg12mEl) avg12mEl.textContent = '$-';
  if (avg24mEl) avg24mEl.textContent = '$-';

  if (!programName) return;

  const historicalData = await fetchHistoricalData(programName);
  
  if (historicalData) {
    const formatValue = (value) => {
      if (value === null || value === undefined) return '$-';
      return `$${value.toFixed(2)}`;
    };

    if (currentEl && historicalData.current !== null) {
      currentEl.textContent = formatValue(historicalData.current);
    }
    if (avg6mEl && historicalData.avg6m !== null) {
      avg6mEl.textContent = formatValue(historicalData.avg6m);
    }
    if (avg12mEl && historicalData.avg12m !== null) {
      avg12mEl.textContent = formatValue(historicalData.avg12m);
    }
    if (avg24mEl && historicalData.avg24m !== null) {
      avg24mEl.textContent = formatValue(historicalData.avg24m);
    }
  }
}

// Initialize Total Calculator
function initializeTotalCalculator() {
  const form = document.getElementById('bs-total-calculator-form');
  const resetBtn = document.getElementById('bs-calc-reset');
  const programSelect = document.getElementById('bs-calc-program');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateTotalValue();
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      const resultsDiv = document.getElementById('bs-total-calculator-results');
      if (resultsDiv) resultsDiv.style.display = 'none';
      // Reset historical data
      updateHistoricalData('');
    });
  }

  // Update historical data when program changes
  if (programSelect) {
    programSelect.addEventListener('change', (e) => {
      updateHistoricalData(e.target.value);
    });
    
    // Load initial historical data if program is already selected
    if (programSelect.value) {
      updateHistoricalData(programSelect.value);
    }
  }

  // Currency Converter removed – all calculations use USD only
}

// Calculate Total Value
function calculateTotalValue() {
  const programName = document.getElementById('bs-calc-program')?.value;
  const milesAmount = parseFloat(document.getElementById('bs-calc-miles')?.value || 0);
  const costPer1000 = parseFloat(document.getElementById('bs-calc-cost-per-1000')?.value || 0);
  const cashPrice = parseFloat(document.getElementById('bs-calc-cash-price')?.value || 0);
  const taxesFees = parseFloat(document.getElementById('bs-calc-taxes-fees')?.value || 0);
  const multiplier = parseFloat(document.getElementById('bs-calc-multiplier')?.value || 0);

  if (!programName || !milesAmount) {
    showNotification('Please fill in required fields', 'error');
    return;
  }

  const program = window.loyaltyPrograms?.find(p => p.name === programName);
  const programPointValue = program ? program.pointValue : 0.019;

  // Calculate points value
  // If cost per 1000 is provided and > 0, use that as the actual purchase cost
  // If cost per 1000 is 0 or not provided, set points value to 0
  const pointsValue = costPer1000 > 0 
    ? (milesAmount / 1000) * costPer1000 
    : 0;

  // Calculate cost to purchase points (same as pointsValue if costPer1000 is provided)
  const purchaseCost = costPer1000 > 0 ? (milesAmount / 1000) * costPer1000 : 0;

  // Calculate miles earned from cash purchase
  const milesEarned = cashPrice * multiplier;
  const milesEarnedValue = milesEarned * programPointValue;

  // Calculate miles earned from taxes/fees
  const milesEarnedFromTaxes = taxesFees * multiplier;
  const milesEarnedFromTaxesValue = milesEarnedFromTaxes * programPointValue;

  // Effective prices
  const effectiveCashPrice = cashPrice - milesEarnedValue;
  // If costPer1000 is provided, pointsValue already includes the purchase cost
  // So we don't add purchaseCost again
  const effectivePointsPrice = costPer1000 > 0 
    ? pointsValue + taxesFees - milesEarnedFromTaxesValue
    : pointsValue + taxesFees - milesEarnedFromTaxesValue + purchaseCost;

  // Calculate value per point
  // If cash price is provided, calculate based on cash price
  // Otherwise, calculate based on total cost
  const totalCost = costPer1000 > 0 
    ? pointsValue + taxesFees
    : pointsValue + taxesFees + purchaseCost;
  const valuePerPoint = cashPrice > 0 ? (cashPrice / milesAmount) : (totalCost / milesAmount);

  // Calculate savings
  const savings = effectiveCashPrice - effectivePointsPrice;
  const savingsPercent = effectiveCashPrice > 0 ? (savings / effectiveCashPrice) * 100 : 0;

  // Determine if good value (value per point >= program point value)
  const isGoodValue = valuePerPoint >= programPointValue;
  const recommendation = isGoodValue 
    ? `Good value! You're getting ${(valuePerPoint / programPointValue).toFixed(2)}x the program's typical value.`
    : `Consider if this redemption provides sufficient value. You're getting ${(valuePerPoint / programPointValue).toFixed(2)}x the program's typical value.`;

  // Display results
  displayTotalCalculatorResults({
    valuePerPoint,
    savingsPercent,
    savings,
    effectiveCashPrice,
    effectivePointsPrice,
    pointsValue,
    taxesFees,
    purchaseCost,
    cashPrice,
    milesEarnedValue,
    milesEarnedFromTaxesValue,
    programPointValue,
    isGoodValue,
    recommendation,
    costPer1000 // Pass costPer1000 to determine if purchase cost should be shown separately
  });
}

// Display Total Calculator Results
function displayTotalCalculatorResults(results) {
  const resultsDiv = document.getElementById('bs-total-calculator-results');
  if (!resultsDiv) return;

  const formatNumber = (num) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const savingsAmount = Math.abs(results.effectiveCashPrice - results.effectivePointsPrice);
  const valueRatio = results.programPointValue > 0 ? (results.valuePerPoint / results.programPointValue) : 0;

  resultsDiv.innerHTML = `
    <div class="bs-calculator-card">
      <div class="bs-calculator-header bs-calculator-header-orange">
        <div class="bs-calculator-header-content">
          <div class="bs-calculator-header-left">
            <svg class="bs-calculator-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="16" height="20" x="4" y="2" rx="2"></rect>
              <line x1="8" x2="16" y1="6" y2="6"></line>
              <line x1="16" x2="16" y1="14" y2="18"></line>
              <path d="M16 10h.01"></path>
              <path d="M12 10h.01"></path>
              <path d="M8 10h.01"></path>
              <path d="M12 14h.01"></path>
              <path d="M8 14h.01"></path>
              <path d="M12 18h.01"></path>
              <path d="M8 18h.01"></path>
            </svg>
            <h2 class="bs-calculator-title">Calculator Results</h2>
          </div>
          <button class="bs-calculator-info-btn" type="button" aria-label="Show information">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="bs-calculator-body">
        <div class="bs-calculator-results-content">
          <!-- Total Savings Hero Section -->
          <div class="bs-results-savings-hero">
            <div class="bs-savings-hero-card ${results.savings >= 0 ? 'bs-savings-positive' : 'bs-savings-negative'}">
              <div class="bs-savings-hero-icon">
                ${results.savings >= 0 
                  ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
                  : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
                }
              </div>
              <div class="bs-savings-hero-content">
                <div class="bs-savings-hero-label">Total Savings</div>
                <div class="bs-savings-hero-amount">$${formatNumber(Math.abs(results.savings))}</div>
                <div class="bs-savings-hero-percentage ${results.savingsPercent >= 0 ? 'bs-percentage-positive' : 'bs-percentage-negative'}">
                  ${results.savingsPercent >= 0 ? '+' : ''}${formatNumber(results.savingsPercent)}% savings
                </div>
              </div>
            </div>
          </div>

          <!-- Key Metrics Grid -->
          <div class="bs-results-metrics-grid">
            <div class="bs-metric-card">
              <div class="bs-metric-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <span class="bs-metric-label">Value per Point</span>
              </div>
              <div class="bs-metric-value">$${formatNumber(results.valuePerPoint)}</div>
              <div class="bs-metric-badge ${valueRatio >= 1 ? 'bs-badge-success' : 'bs-badge-warning'}">
                ${valueRatio.toFixed(2)}x program value
              </div>
            </div>

            <div class="bs-metric-card">
              <div class="bs-metric-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span class="bs-metric-label">Program Value</span>
              </div>
              <div class="bs-metric-value">$${formatNumber(results.programPointValue)}</div>
              <div class="bs-metric-sub">per point</div>
            </div>

            <div class="bs-metric-card">
              <div class="bs-metric-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <span class="bs-metric-label">Cash Price</span>
              </div>
              <div class="bs-metric-value">$${formatNumber(results.cashPrice)}</div>
              <div class="bs-metric-sub">base price</div>
            </div>

            <div class="bs-metric-card">
              <div class="bs-metric-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <span class="bs-metric-label">Points Value</span>
              </div>
              <div class="bs-metric-value">$${formatNumber(results.pointsValue)}</div>
              <div class="bs-metric-sub">${results.costPer1000 > 0 ? 'purchase cost' : 'calculated value'}</div>
            </div>
          </div>

      <div class="bs-price-comparison">
        <div class="bs-comparison-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          <span>Price Comparison</span>
        </div>
        <div class="bs-comparison-cards">
          <div class="bs-price-card ${results.effectiveCashPrice <= results.effectivePointsPrice ? 'bs-best-value' : ''}">
            <div class="bs-price-badge">${results.effectiveCashPrice <= results.effectivePointsPrice ? 'Best Value' : ''}</div>
            <div class="bs-price-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              <span>Cash Price</span>
            </div>
            <div class="bs-price-details">
              <div class="bs-price-line">
                <span class="bs-price-line-label">Base Price</span>
                <span class="bs-price-line-value">$${formatNumber(results.cashPrice)}</span>
              </div>
              ${results.milesEarnedValue > 0 ? `
              <div class="bs-price-line bs-price-line-discount">
                <span class="bs-price-line-label">Miles Earned Value</span>
                <span class="bs-price-line-value">-$${formatNumber(results.milesEarnedValue)}</span>
              </div>
              ` : ''}
              <div class="bs-price-total">
                <span>Effective Total</span>
                <span>$${formatNumber(results.effectiveCashPrice)}</span>
              </div>
            </div>
          </div>
          
          <div class="bs-price-card ${results.effectiveCashPrice > results.effectivePointsPrice ? 'bs-best-value' : ''}">
            <div class="bs-price-badge">${results.effectiveCashPrice > results.effectivePointsPrice ? 'Best Value' : ''}</div>
            <div class="bs-price-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span>Points Value</span>
            </div>
            <div class="bs-price-details">
              <div class="bs-price-line">
                <span class="bs-price-line-label">${results.costPer1000 > 0 ? 'Purchase Cost' : 'Points Value'}</span>
                <span class="bs-price-line-value">$${formatNumber(results.pointsValue)}</span>
              </div>
              <div class="bs-price-line">
                <span class="bs-price-line-label">Taxes & Fees</span>
                <span class="bs-price-line-value">$${formatNumber(results.taxesFees)}</span>
              </div>
              ${results.milesEarnedFromTaxesValue > 0 ? `
              <div class="bs-price-line bs-price-line-discount">
                <span class="bs-price-line-label">Miles Earned Value</span>
                <span class="bs-price-line-value">-$${formatNumber(results.milesEarnedFromTaxesValue)}</span>
              </div>
              ` : ''}
              <div class="bs-price-total">
                <span>Effective Total</span>
                <span>$${formatNumber(results.effectivePointsPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bs-recommendation ${results.isGoodValue ? 'bs-good-value' : 'bs-consider-value'}">
        <div class="bs-recommendation-icon">
          ${results.isGoodValue 
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
          }
        </div>
        <div class="bs-recommendation-content">
          <div class="bs-recommendation-title">Recommendation</div>
          <div class="bs-recommendation-text">${results.recommendation}</div>
        </div>
      </div>
        </div>
      </div>
    </div>
  `;

  resultsDiv.style.display = 'block';
  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Initialize Rovemiles Calculator
function initializeRovemilesCalculator() {
  const form = document.getElementById('bs-rovemiles-form');
  const resetBtn = document.getElementById('bs-rove-reset');
  const totalCostInput = document.getElementById('bs-rove-total-cost');
  const cashPriceInput = document.getElementById('bs-rove-cash-price');
  const milesInput = document.getElementById('bs-rove-miles');
  const multiplierInput = document.getElementById('bs-rove-multiplier');
  const cpmInput = document.getElementById('bs-rove-cpm');
  const programSelect = document.getElementById('bs-rove-program');
  const programValueInput = document.getElementById('bs-rove-program-value');

  if (!form) return;

  // Set default CPM
  if (cpmInput && !cpmInput.value) {
    cpmInput.value = '0.0177';
  }

  // Calculate on input change
  const inputs = [totalCostInput, cashPriceInput, milesInput, multiplierInput, cpmInput, programSelect, programValueInput];
  inputs.forEach(input => {
    if (input) {
      input.addEventListener('input', calculateRovemiles);
      input.addEventListener('change', calculateRovemiles);
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      if (cpmInput) cpmInput.value = '0.0177';
      const resultsDiv = document.getElementById('bs-rovemiles-results');
      if (resultsDiv) resultsDiv.innerHTML = '';
    });
  }

  // Initial calculation
  calculateRovemiles();
}

// Calculate Rovemiles
function calculateRovemiles() {
  const totalCost = parseFloat(document.getElementById('bs-rove-total-cost')?.value?.replace(/[^\d.]/g, '') || 0);
  const cashPrice = parseFloat(document.getElementById('bs-rove-cash-price')?.value?.replace(/[^\d.]/g, '') || 0);
  const rovemilesMiles = parseFloat(document.getElementById('bs-rove-miles')?.value?.replace(/[^\d]/g, '') || 0);
  const multiplier = parseFloat(document.getElementById('bs-rove-multiplier')?.value?.replace(/[^\d.]/g, '') || 0);
  const roveMilesCPM = parseFloat(document.getElementById('bs-rove-cpm')?.value?.replace(/[^\d.]/g, '') || 0.0177);
  const programName = document.getElementById('bs-rove-program')?.value;
  const programValueOverride = document.getElementById('bs-rove-program-value')?.value?.replace(/[^\d.]/g, '');

  if (!totalCost || !rovemilesMiles || !roveMilesCPM) {
    return;
  }

  const program = window.loyaltyPrograms?.find(p => p.name === programName) || window.loyaltyPrograms?.[0];
  const programValue = programValueOverride ? parseFloat(programValueOverride) : (program ? program.pointValue : 0.019);

  // Calculate credit card points earned
  const creditCardPoints = totalCost * multiplier;

  // Calculate credit card cashback (using higher of program value or CPM)
  const ccCashbackWithProgram = creditCardPoints * programValue;
  const ccCashbackWithCPM = creditCardPoints * roveMilesCPM;
  const creditCardCashback = Math.max(ccCashbackWithProgram, ccCashbackWithCPM);

  // Calculate Rovemiles cashback
  const rovemilesCashback = rovemilesMiles * roveMilesCPM;

  // Total cashback
  const totalCashback = creditCardCashback + rovemilesCashback;
  const cashbackPercentage = totalCost > 0 ? (totalCashback / totalCost) * 100 : 0;

  // Effective USD per 1,000 Rove miles
  const effectiveUsdPerThousand = cashPrice > 0 ? ((totalCost - cashPrice) / rovemilesMiles) * 1000 : 0;

  // Display results
  displayRovemilesResults({
    totalCashback,
    cashbackPercentage,
    creditCardCashback,
    creditCardPoints,
    rovemilesCashback,
    rovemilesMiles,
    effectiveUsdPerThousand,
    usingCPM: ccCashbackWithCPM > ccCashbackWithProgram,
    programName: program?.name || '',
    programValue,
    roveMilesCPM
  });
}

// Display Rovemiles Results
function displayRovemilesResults(results) {
  const resultsDiv = document.getElementById('bs-rovemiles-results');
  if (!resultsDiv) return;

  const formatCurrency = (num) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  resultsDiv.innerHTML = `
    <div class="bs-rovemiles-results-content">
      <!-- Hero Section: Total Cashback -->
      <div class="bs-rovemiles-hero">
        <div class="bs-rovemiles-total-card">
          <div class="bs-rovemiles-total-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span>Total Cashback Value</span>
          </div>
            <div class="bs-rovemiles-total-amount">$${formatCurrency(results.totalCashback)}</div>
          <div class="bs-rovemiles-reward-rate">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            <span>${formatCurrency(results.cashbackPercentage)}% Reward Rate</span>
          </div>
        </div>
      </div>
      
      <!-- Breakdown Section -->
      <div class="bs-rovemiles-breakdown">
        <div class="bs-breakdown-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          <span>Cashback Breakdown</span>
        </div>
        
        <div class="bs-rovemiles-breakdown-grid">
          <!-- Credit Card Cashback Card -->
          <div class="bs-rovemiles-breakdown-card">
            <div class="bs-rovemiles-breakdown-card-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              <span>Credit Card Cashback</span>
            </div>
            <div class="bs-rovemiles-breakdown-amount">$${formatCurrency(results.creditCardCashback)}</div>
            <div class="bs-rovemiles-breakdown-details">
              <div class="bs-rovemiles-breakdown-detail">
                <span class="bs-breakdown-detail-label">Points Earned</span>
                <span class="bs-breakdown-detail-value">${results.creditCardPoints.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div class="bs-rovemiles-breakdown-detail">
                <span class="bs-breakdown-detail-label">Valuation Method</span>
                <span class="bs-breakdown-detail-value">${results.usingCPM ? 'CPM' : 'Program Value'}</span>
              </div>
            </div>
            <div class="bs-rovemiles-breakdown-note">
              ${results.usingCPM 
                ? `CPM @ $${results.roveMilesCPM.toFixed(4)}/Point (higher value)`
                : `${results.programName} @ $${results.programValue.toFixed(4)}/Point`
              }
            </div>
          </div>
          
          <!-- Rovemiles Cashback Card -->
          <div class="bs-rovemiles-breakdown-card">
            <div class="bs-rovemiles-breakdown-card-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Rovemiles Cashback</span>
            </div>
            <div class="bs-rovemiles-breakdown-amount">$${formatCurrency(results.rovemilesCashback)}</div>
            <div class="bs-rovemiles-breakdown-details">
              <div class="bs-rovemiles-breakdown-detail">
                <span class="bs-breakdown-detail-label">Miles Earned</span>
                <span class="bs-breakdown-detail-value">${results.rovemilesMiles.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div class="bs-rovemiles-breakdown-detail">
                <span class="bs-breakdown-detail-label">CPM Rate</span>
                <span class="bs-breakdown-detail-value">$${results.roveMilesCPM.toFixed(4)}</span>
              </div>
            </div>
            <div class="bs-rovemiles-breakdown-note">
              @ $${results.roveMilesCPM.toFixed(4)}/Mile
            </div>
          </div>
          
          ${results.effectiveUsdPerThousand > 0 ? `
          <!-- Effective Cost Card -->
          <div class="bs-rovemiles-breakdown-card">
            <div class="bs-rovemiles-breakdown-card-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <span>Effective Cost per 1,000 Rove Miles</span>
            </div>
            <div class="bs-rovemiles-breakdown-amount">$${formatCurrency(results.effectiveUsdPerThousand)}</div>
            <div class="bs-rovemiles-breakdown-details">
              <div class="bs-rovemiles-breakdown-detail">
                <span class="bs-breakdown-detail-label">USD per 1,000 Miles</span>
                <span class="bs-breakdown-detail-value">$${formatCurrency(results.effectiveUsdPerThousand)}</span>
              </div>
            </div>
            <div class="bs-rovemiles-breakdown-note">
              Calculation: (Cost − Cash) ÷ Miles × 1,000
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// Initialize airport autocomplete
// initializeAirportAutocomplete is now provided by AIRPORT_AUTOCOMPLETE_COMPLETE.js
// The function is defined globally in that file and will be called from setupObserver

// Initialize Hyatt Calculator
function initializeHyattCalculator() {
  // Hyatt categories data
  const categories = [
    { level: 1, standard: 5000, offPeak: 3500, peak: 6500 },
    { level: 2, standard: 8000, offPeak: 6500, peak: 9500 },
    { level: 3, standard: 12000, offPeak: 9000, peak: 15000 },
    { level: 4, standard: 15000, offPeak: 12000, peak: 18000 },
    { level: 5, standard: 20000, offPeak: 17000, peak: 23000 },
    { level: 6, standard: 25000, offPeak: 21000, peak: 29000 },
    { level: 7, standard: 30000, offPeak: 25000, peak: 35000 },
    { level: 8, standard: 40000, offPeak: 35000, peak: 45000 }
  ];

  const pointValue = 0.0219; // $0.0219 per point

  // Get all input elements
  const baseCostInput = document.getElementById('bs-hyatt-base-cost');
  const taxesFeesInput = document.getElementById('bs-hyatt-taxes-fees');
  const eliteStatusSelect = document.getElementById('bs-hyatt-elite-status');
  const creditCardSelect = document.getElementById('bs-hyatt-credit-card');
  const categorySelect = document.getElementById('bs-hyatt-category');
  const rateTypeButtons = document.querySelectorAll('.bs-hyatt-rate-btn');
  const pointsInput = document.getElementById('bs-hyatt-points');
  const redemptionPointsInput = document.getElementById('bs-hyatt-redemption-points');
  const cashCostInput = document.getElementById('bs-hyatt-cash-cost');
  const stayTimePointsSelect = document.getElementById('bs-hyatt-stay-time-points');
  const stayTimeCashSelect = document.getElementById('bs-hyatt-stay-time-cash');
  const totalDaysInput = document.getElementById('bs-hyatt-total-days');
  if (!baseCostInput) return;

  // Calculate earned points
  function calculateEarnedPoints() {
    const baseCost = parseFloat(baseCostInput.value) || 0;
    const taxesFees = parseFloat(taxesFeesInput.value) || 0;
    const eliteStatus = parseFloat(eliteStatusSelect.value) || 0;
    const creditCard = parseFloat(creditCardSelect.value) || 0;

    const basePoints = baseCost * 5;
    const bonusPoints = basePoints * eliteStatus;
    const cardPoints = (baseCost + taxesFees) * creditCard;

    return Math.floor(basePoints + bonusPoints + cardPoints);
  }

  // Update earned points display
  function updateEarnedPoints() {
    const earnedPoints = calculateEarnedPoints();
    const earnedValue = earnedPoints * pointValue;

    const earnedPointsEl = document.getElementById('bs-hyatt-earned-points');
    const earnedValueEl = document.getElementById('bs-hyatt-earned-value');

    if (earnedPointsEl) {
      earnedPointsEl.textContent = `${earnedPoints.toLocaleString()} Points`;
    }
    if (earnedValueEl) {
      earnedValueEl.textContent = `$${earnedValue.toFixed(2)}`;
    }

    // Auto-fill points if earned points > 0
    if (earnedPoints > 0 && pointsInput) {
      pointsInput.value = earnedPoints;
      updatePointsValue();
    }
  }

  // Update points value calculator
  function updatePointsValue() {
    const points = parseFloat(pointsInput.value) || 0;
    const category = parseInt(categorySelect.value) || 1;
    const rateType = document.querySelector('.bs-hyatt-rate-btn.active')?.dataset.rate || 'standard';
    
    const categoryData = categories[category - 1];
    const pointsPerNight = categoryData[rateType];
    const pointsValue = points * pointValue;
    const freeNights = pointsPerNight > 0 ? (points / pointsPerNight).toFixed(1) : '0';
    
    const rateTypeLabel = rateType === 'offPeak' ? 'Off-Peak' : rateType === 'standard' ? 'Standard' : 'Peak';

    const pointsValueEl = document.getElementById('bs-hyatt-points-value');
    const centsPerPointEl = document.getElementById('bs-hyatt-cents-per-point');
    const freeNightsEl = document.getElementById('bs-hyatt-free-nights');
    const categoryNoteEl = document.getElementById('bs-hyatt-category-note');

    if (pointsValueEl) pointsValueEl.textContent = `$${pointsValue.toFixed(2)}`;
    if (centsPerPointEl) centsPerPointEl.textContent = `${(pointValue * 100).toFixed(2)}¢ per point`;
    if (freeNightsEl) freeNightsEl.textContent = `${freeNights} night(s)`;
    if (categoryNoteEl) categoryNoteEl.textContent = `Category ${category} (${rateTypeLabel})`;

    // Update cashback if base cost is provided
    const baseCost = parseFloat(baseCostInput.value) || 0;
    const taxesFees = parseFloat(taxesFeesInput.value) || 0;
    const totalCost = baseCost + taxesFees;

    const cashbackCard = document.getElementById('bs-hyatt-cashback-card');
    if (totalCost > 0 && cashbackCard) {
      const cashbackPercent = (pointsValue / totalCost) * 100;
      const cashbackPercentEl = document.getElementById('bs-hyatt-cashback-percent');
      const cashbackNoteEl = document.getElementById('bs-hyatt-cashback-note');

      if (cashbackPercentEl) cashbackPercentEl.textContent = `${cashbackPercent.toFixed(2)}%`;
      if (cashbackNoteEl) cashbackNoteEl.textContent = `for $${totalCost.toFixed(2)}`;
      cashbackCard.style.display = 'block';
    } else if (cashbackCard) {
      cashbackCard.style.display = 'none';
    }
  }

  // Update redemption value calculator
  function updateRedemptionValue() {
    const redemptionPoints = parseFloat(redemptionPointsInput.value) || 0;
    const cashCost = parseFloat(cashCostInput.value) || 0;
    const totalDays = parseFloat(totalDaysInput.value) || 1;
    const stayTimePoints = stayTimePointsSelect.value;
    const stayTimeCash = stayTimeCashSelect.value;

    let totalPointsCost = redemptionPoints;
    if (stayTimePoints === 'day') {
      totalPointsCost = redemptionPoints * totalDays;
    }

    let totalCashCost = cashCost;
    if (stayTimeCash === 'day') {
      totalCashCost = cashCost * totalDays;
    }

    const centsPerPoint = totalPointsCost > 0 ? (totalCashCost / totalPointsCost) * 100 : 0;
    const dollarsPerPoint = centsPerPoint / 100;

    const earnedPoints = calculateEarnedPoints();
    const futureValue = (centsPerPoint / 100) * earnedPoints;

    const redemptionValueEl = document.getElementById('bs-hyatt-redemption-value');
    const redemptionNoteEl = document.getElementById('bs-hyatt-redemption-note');
    const futureValueEl = document.getElementById('bs-hyatt-future-value');

    if (redemptionValueEl) {
      redemptionValueEl.textContent = centsPerPoint > 0 ? `${centsPerPoint.toFixed(2)}¢ per point` : '0.00¢ per point';
    }
    if (redemptionNoteEl) {
      redemptionNoteEl.textContent = centsPerPoint > 0 ? `$${dollarsPerPoint.toFixed(4)} per point` : 'No value';
    }
    if (futureValueEl) {
      futureValueEl.textContent = `$${futureValue > 0 ? futureValue.toFixed(2) : '0.00'}`;
    }
  }


  // Event listeners
  [baseCostInput, taxesFeesInput, eliteStatusSelect, creditCardSelect].forEach(el => {
    if (el) {
      el.addEventListener('input', updateEarnedPoints);
      el.addEventListener('change', updateEarnedPoints);
    }
  });

  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      updatePointsValue();
    });
  }

  rateTypeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      rateTypeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updatePointsValue();
    });
  });

  if (pointsInput) {
    pointsInput.addEventListener('input', updatePointsValue);
  }

  [redemptionPointsInput, cashCostInput, stayTimePointsSelect, stayTimeCashSelect, totalDaysInput].forEach(el => {
    if (el) {
      el.addEventListener('input', updateRedemptionValue);
      el.addEventListener('change', updateRedemptionValue);
    }
  });

  // Initial calculations
  updateEarnedPoints();
  updatePointsValue();
  updateRedemptionValue();
}

// Initialize Hilton Calculator
function initializeHiltonCalculator() {
  const pointValue = 0.0059; // $0.0059 per point (0.59¢ per point)

  // Get all input elements
  const baseCostInput = document.getElementById('bs-hilton-base-cost');
  const taxesFeesInput = document.getElementById('bs-hilton-taxes-fees');
  const brandSelect = document.getElementById('bs-hilton-brand');
  const creditCardSelect = document.getElementById('bs-hilton-credit-card');
  const eliteStatusSelect = document.getElementById('bs-hilton-elite-status');
  const redemptionPointsInput = document.getElementById('bs-hilton-redemption-points');
  const cashCostInput = document.getElementById('bs-hilton-cash-cost');
  const stayTimePointsSelect = document.getElementById('bs-hilton-stay-time-points');
  const stayTimeCashSelect = document.getElementById('bs-hilton-stay-time-cash');
  const totalDaysInput = document.getElementById('bs-hilton-total-days');
  if (!baseCostInput) return;

  // Credit card status mapping (card value -> status index)
  const cardStatusMap = {
    7: 0,   // Hilton Card -> No Status
    12: 1,  // Hilton Surpass/Business -> Silver
    14: 2   // Hilton Aspire -> Gold
  };

  // Calculate total points
  function calculateTotalPoints() {
    const baseCost = parseFloat(baseCostInput.value) || 0;
    const taxesFees = parseFloat(taxesFeesInput.value) || 0;
    const brand = parseInt(brandSelect.value) || 10;
    const creditCard = parseInt(creditCardSelect.value) || 0;
    const eliteStatus = parseFloat(eliteStatusSelect.value) || 0;

    // Base points from hotel stay (10x or 5x depending on brand)
    const basePoints = baseCost * brand;
    
    // Elite status bonus
    const eliteBonus = basePoints * eliteStatus;
    
    // Credit card points (on both base cost and taxes)
    const totalSpend = baseCost + taxesFees;
    const cardPoints = totalSpend * creditCard;
    
    // Total points
    const total = Math.floor(basePoints + eliteBonus + cardPoints);

    return {
      total,
      basePoints: Math.floor(basePoints),
      eliteBonus: Math.floor(eliteBonus),
      cardPoints: Math.floor(cardPoints),
      brand,
      eliteStatus
    };
  }

  // Update points display
  function updatePointsDisplay() {
    const result = calculateTotalPoints();
    const pointsValue = result.total * pointValue;

    const totalPointsEl = document.getElementById('bs-hilton-total-points');
    const pointsValueEl = document.getElementById('bs-hilton-points-value');
    const yourValueEl = document.getElementById('bs-hilton-your-value');
    const earnedDisplayEl = document.getElementById('bs-hilton-earned-display');
    const basePointsEl = document.getElementById('bs-hilton-base-points');
    const baseNoteEl = document.getElementById('bs-hilton-base-note');
    const eliteBonusEl = document.getElementById('bs-hilton-elite-bonus');
    const eliteNoteEl = document.getElementById('bs-hilton-elite-note');
    const cardPointsEl = document.getElementById('bs-hilton-card-points');
    const cardNoteEl = document.getElementById('bs-hilton-card-note');

    if (totalPointsEl) totalPointsEl.textContent = `${result.total.toLocaleString()} Points`;
    if (pointsValueEl) pointsValueEl.textContent = `$${pointsValue.toFixed(2)}`;
    if (yourValueEl) yourValueEl.textContent = `$${pointsValue.toFixed(2)}`;
    if (earnedDisplayEl) earnedDisplayEl.textContent = result.total.toLocaleString();

    if (basePointsEl) basePointsEl.textContent = `${result.basePoints.toLocaleString()} points`;
    if (baseNoteEl) baseNoteEl.textContent = `${result.brand}X points per dollar on base cost`;

    if (eliteBonusEl) eliteBonusEl.textContent = `${result.eliteBonus.toLocaleString()} points`;
    if (eliteNoteEl) {
      if (result.eliteStatus > 0) {
        eliteNoteEl.textContent = `${(result.eliteStatus * 100).toFixed(0)}% bonus on base points`;
      } else {
        eliteNoteEl.textContent = 'No elite status bonus';
      }
    }

    if (cardPointsEl) cardPointsEl.textContent = `${result.cardPoints.toLocaleString()} points`;
    if (cardNoteEl) {
      const creditCard = parseInt(creditCardSelect.value) || 0;
      if (creditCard > 0) {
        cardNoteEl.textContent = `${creditCard}X points per dollar on total spend`;
      } else {
        cardNoteEl.textContent = 'No Hilton credit card';
      }
    }
  }

  // Update redemption value calculator
  function updateRedemptionValue() {
    const redemptionPoints = parseFloat(redemptionPointsInput.value) || 0;
    const cashCost = parseFloat(cashCostInput.value) || 0;
    const totalDays = parseFloat(totalDaysInput.value) || 1;
    const stayTimePoints = stayTimePointsSelect.value;
    const stayTimeCash = stayTimeCashSelect.value;

    let totalPointsCost = redemptionPoints;
    if (stayTimePoints === 'day') {
      totalPointsCost = redemptionPoints * totalDays;
    }

    let totalCashCost = cashCost;
    if (stayTimeCash === 'day') {
      totalCashCost = cashCost * totalDays;
    }

    const centsPerPoint = totalPointsCost > 0 ? (totalCashCost / totalPointsCost) * 100 : 0;
    const dollarsPerPoint = centsPerPoint / 100;

    const result = calculateTotalPoints();
    const futureValue = (centsPerPoint / 100) * result.total;

    const redemptionValueEl = document.getElementById('bs-hilton-redemption-value');
    const redemptionNoteEl = document.getElementById('bs-hilton-redemption-note');
    const futureValueEl = document.getElementById('bs-hilton-future-value');

    if (redemptionValueEl) {
      redemptionValueEl.textContent = centsPerPoint > 0 ? `${centsPerPoint.toFixed(2)}¢ per point` : '0.00¢ per point';
    }
    if (redemptionNoteEl) {
      redemptionNoteEl.textContent = centsPerPoint > 0 ? `$${dollarsPerPoint.toFixed(4)} per point` : 'No value';
    }
    if (futureValueEl) {
      futureValueEl.textContent = `$${futureValue > 0 ? futureValue.toFixed(2) : '0.00'}`;
    }
  }

  // Update elite status when card changes
  function updateEliteStatusFromCard() {
    const creditCard = parseInt(creditCardSelect.value) || 0;
    const cardStatusIndex = cardStatusMap[creditCard];
    
    if (cardStatusIndex !== undefined) {
      const statusOptions = [
        { value: 0, label: 'No Status' },
        { value: 0.20, label: 'Hilton Silver' },
        { value: 0.80, label: 'Hilton Gold' },
        { value: 1, label: 'Hilton Diamond' }
      ];
      
      const cardStatusValue = statusOptions[cardStatusIndex].value;
      const currentStatusValue = parseFloat(eliteStatusSelect.value) || 0;
      
      // Only update if card status is higher than current selection
      if (cardStatusValue > currentStatusValue) {
        eliteStatusSelect.value = cardStatusValue;
      }
    }
  }

  // Event listeners
  [baseCostInput, taxesFeesInput, brandSelect, creditCardSelect, eliteStatusSelect].forEach(el => {
    if (el) {
      el.addEventListener('input', () => {
        updatePointsDisplay();
        updateRedemptionValue();
      });
      el.addEventListener('change', () => {
        updatePointsDisplay();
        updateRedemptionValue();
      });
    }
  });

  // Special handling for credit card change to update elite status
  if (creditCardSelect) {
    creditCardSelect.addEventListener('change', () => {
      updateEliteStatusFromCard();
      updatePointsDisplay();
      updateRedemptionValue();
    });
  }

  [redemptionPointsInput, cashCostInput, stayTimePointsSelect, stayTimeCashSelect, totalDaysInput].forEach(el => {
    if (el) {
      el.addEventListener('input', updateRedemptionValue);
      el.addEventListener('change', updateRedemptionValue);
    }
  });

  // Initial calculations
  updatePointsDisplay();
  updateRedemptionValue();
}

// Hotel Programs Data
const HOTEL_PROGRAMS = [
  {
    id: 'accor',
    name: 'Accor',
    currentLevel: 1,
    totalLevels: 5,
    levels: [
      { level: 1, name: 'Classic', color: 'bg-gray-100 text-gray-800', benefits: ['Member rate', 'Free WiFi', 'Exclusive offers', 'Partner benefits', 'Car rental services'] },
      { level: 2, name: 'Silver\n(10 N)', color: 'bg-gray-300 text-gray-800', benefits: ['24% Bonus Points', 'Welcome drink', 'Priority Welcome', 'Late Check-Out', '13% off airport lounges'] },
      { level: 3, name: 'Gold\n(30 N)', color: 'bg-yellow-200 text-yellow-800', benefits: ['48% Bonus Points', 'Guaranteed room availability', 'Room upgrade', 'Early Check-In or Late Check-Out', '14% off airport lounges'] },
      { level: 4, name: 'Platinum\n(60 N)', color: 'bg-gray-400 text-white', benefits: ['76% Bonus Points', 'Suite Night Upgrade', 'Lounge access', 'Premium Wi-Fi', '15% off airport lounges', 'Early Check-In', 'Late Check-Out'] },
      { level: 5, name: 'Diamond\n(10,4k€)', color: 'bg-blue-500 text-white', benefits: ['100% Bonus Points', 'Free breakfast on weekends', 'Dining & Spa Rewards', 'Free Gold Status'] }
    ]
  },
  {
    id: 'choice',
    name: 'Choice',
    currentLevel: 1,
    totalLevels: 4,
    levels: [
      { level: 1, name: 'Member', color: 'bg-gray-100 text-gray-800', benefits: ['Points earning', 'Member rates', 'Mobile check-in', 'Points toward free N', 'No blackout dates'] },
      { level: 2, name: 'Gold\n(10 N)', color: 'bg-yellow-200 text-yellow-800', benefits: ['10% Bonus Points', 'Late Check-Out', 'Preferred rooms', 'Welcome gift'] },
      { level: 3, name: 'Platinum\n(20 N)', color: 'bg-gray-400 text-white', benefits: ['25% Bonus Points', 'Room upgrade', 'Late Check-Out 4pm', 'Welcome amenity'] },
      { level: 4, name: 'Diamond\n(40 N)', color: 'bg-blue-500 text-white', benefits: ['50% Bonus Points', 'Suite upgrade', 'Late Check-Out 6pm', 'Executive lounge', 'Guaranteed availability', 'Free breakfast'] }
    ]
  },
  {
    id: 'hilton',
    name: 'Hilton',
    currentLevel: 1,
    totalLevels: 4,
    levels: [
      { level: 1, name: 'Member', color: 'bg-gray-100 text-gray-800', benefits: ['Guaranteed Hilton Honors Discount rate', 'Points toward free N', 'No resort fees on reward stays', 'Digital Check-in', 'Digital Key', 'Free WiFi', 'Fifth N free on reward stays', 'Member rates', 'Points earning'] },
      { level: 2, name: 'Silver\n(10 N)', color: 'bg-gray-300 text-gray-800', benefits: ['20% Bonus Points', 'Free bottled water', 'Elite Rollover Nights', 'All-Inclusive Spa Discount', 'Exclusive Hilton Honors Experiences'] },
      { level: 3, name: 'Gold\n(40 N)', color: 'bg-yellow-200 text-yellow-800', benefits: ['80% Bonus Points', 'Space-available room upgrade', 'Daily Food and Beverage Credit or Continental Breakfast', 'Milestone Bonuses'] },
      { level: 4, name: 'Diamond\n(60 N)', color: 'bg-blue-500 text-white', benefits: ['100% Bonus Points', 'Suite upgrade', 'Executive lounge access', 'Diamond status extension', 'Premium WiFi', '48-hour room guarantee', 'Elite status gifting'] }
    ]
  },
  {
    id: 'hyatt',
    name: 'Hyatt',
    currentLevel: 1,
    totalLevels: 4,
    levels: [
      { level: 1, name: 'Member', color: 'bg-gray-100 text-gray-800', benefits: ['5 points per dollar spent', 'Free WiFi', 'Waived resort fees on award stays', 'Points earning', 'Member rates'] },
      { level: 2, name: 'Discoverist\n(10 N)', color: 'bg-green-200 text-green-800', benefits: ['10% Bonus Points', 'Premium WiFi', 'Late Check-Out 2pm', 'Preferred room upgrade', 'Elite check-in', 'Complimentary bottled water'] },
      { level: 3, name: 'Explorist\n(30 N)', color: 'bg-yellow-200 text-yellow-800', benefits: ['20% Bonus Points', 'Upgrade to best room excluding suites', '72 hours guaranteed availability', 'Category 1-4 free night certificate', '4 Club Access Awards'] },
      { level: 4, name: 'Globalist\n(60 N)', color: 'bg-purple-500 text-white', benefits: ['30% Bonus Points', 'Suite upgrade included', 'Late Check-Out 4pm', 'Club lounge access or free breakfast', '5 Suite Upgrade Awards', 'Category 1-7 free night certificate', '3 Guest of Honor Awards', 'Globalist concierge', '48 hours guaranteed availability'] }
    ]
  },
  {
    id: 'ihg',
    name: 'IHG',
    currentLevel: 1,
    totalLevels: 5,
    levels: [
      { level: 1, name: 'Club Member', color: 'bg-gray-100 text-gray-800', benefits: ['Earn Points toward Reward Nights and More', 'No Blackout Dates for Reward Nights', 'Member Rates', 'Member Promotions', 'Free WiFi', 'Late Check-Out 2PM (subject to availability)'] },
      { level: 2, name: 'Silver Elite\n(10 N)', color: 'bg-gray-300 text-gray-800', benefits: ['20% Bonus Points', 'Points Don\'t Expire'] },
      { level: 3, name: 'Gold Elite\n(20 N)', color: 'bg-yellow-200 text-yellow-800', benefits: ['40% Bonus Points', 'Rollover Nights for Next Year\'s Status', 'Start Earning Milestone Rewards'] },
      { level: 4, name: 'Platinum Elite\n(40 N)', color: 'bg-gray-400 text-white', benefits: ['60% Bonus Points', 'Guaranteed Room Availability (72 hrs)', 'Complimentary Upgrade', 'Welcome Amenity at Check-In (Points or drink/snack)', 'Early Check-In', 'Reward Night Discounts', 'Hertz Gold Plus Rewards Five Star Status'] },
      { level: 5, name: 'Diamond Elite\n(70 N)', color: 'bg-blue-500 text-white', benefits: ['100% Bonus Points', 'Dedicated Diamond Support', 'Welcome Amenity at Check-In (Free breakfast, points or drink/snack)', 'Hertz President\'s Circle Status'] }
    ]
  },
  {
    id: 'marriott',
    name: 'Marriott',
    currentLevel: 1,
    totalLevels: 6,
    levels: [
      { level: 1, name: 'Member', color: 'bg-gray-100 text-gray-800', benefits: ['Points earning', 'Member rates', 'Free WiFi', 'Mobile check-in', 'Mobile key', 'No blackout dates'] },
      { level: 2, name: 'Silver Elite\n(10 N)', color: 'bg-gray-300 text-gray-800', benefits: ['10% Bonus Points', 'Late Check-Out 2pm', 'Preferred rooms', 'Priority support'] },
      { level: 3, name: 'Gold Elite\n(25 N)', color: 'bg-yellow-200 text-yellow-800', benefits: ['25% Bonus Points', 'Room upgrade', 'Late Check-Out 4pm', 'Enhanced WiFi', 'Welcome gift'] },
      { level: 4, name: 'Platinum Elite\n(50 N)', color: 'bg-gray-400 text-white', benefits: ['50% Bonus Points', 'Suite upgrade', 'Club lounge access', 'Free breakfast'] },
      { level: 5, name: 'Titanium Elite\n(75 N)', color: 'bg-gray-600 text-white', benefits: ['75% Bonus Points', 'Enhanced suite upgrade', '48h upgrade guarantee'] },
      { level: 6, name: 'Ambassador Elite\n(100 N)', color: 'bg-purple-600 text-white', benefits: ['100% Bonus Points', 'Guaranteed suite upgrade', 'Late Check-Out anytime', 'Personal ambassador'] }
    ]
  },
  {
    id: 'wyndham',
    name: 'Wyndham',
    currentLevel: 1,
    totalLevels: 4,
    levels: [
      { level: 1, name: 'Blue', color: 'bg-blue-100 text-blue-800', benefits: ['Points earning', 'Member rates', 'Free WiFi', 'Points toward free N', 'No blackout dates', 'Member promotions'] },
      { level: 2, name: 'Gold\n(5 N)', color: 'bg-yellow-200 text-yellow-800', benefits: ['10% Bonus Points', 'Late Check-Out 2pm', 'Preferred rooms', 'Bonus points promotions'] },
      { level: 3, name: 'Platinum\n(15 N)', color: 'bg-gray-400 text-white', benefits: ['15% Bonus Points', 'Room upgrade', 'Late Check-Out 4pm', 'Welcome amenity', 'Guaranteed availability', 'Early Check-In', 'Caesars Rewards status match', 'Avis/Budget car rental upgrade'] },
      { level: 4, name: 'Diamond\n(40 N)', color: 'bg-blue-500 text-white', benefits: ['30% Bonus Points', 'Late Check-Out 6pm', 'VIP treatment', 'Exclusive offers', 'Free Gold Status', 'Points bonus', 'Suite upgrade'] }
    ]
  }
];

// Supabase Hotel Status Levels Service
const HotelStatusLevelsService = {
  supabaseUrl: window.config?.api?.supabase?.url || 'https://saegzrncsjcsvgcjkniv.supabase.co',
  supabaseKey: window.config?.api?.supabase?.key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZWd6cm5jc2pjc3ZnY2prbml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3ODgxNDYsImV4cCI6MjA0NzM2NDE0Nn0.w1eHVcuvDUoqhcMCYenKKA9URAtG4YbW3j5GcDgvu3Y',
  cache: new Map(),
  lastFetch: null,
  cacheTTL: 5 * 60 * 1000, // 5 minutes

  // Fetch all hotel status levels from Supabase
  async fetchAll() {
    try {
      const url = `${this.supabaseUrl}/rest/v1/hotel_status_levels?select=*&is_active=eq.true&order=program_name.asc`;
      
      let data = [];
      
      // Try using httpClient first (with background fetch support)
      if (window.httpClient) {
        try {
          data = await window.httpClient.request(url, {
            useBackground: true,
            cache: false, // Always fetch fresh data
            headers: {
              'apikey': this.supabaseKey,
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            }
          }) || [];
        } catch (httpError) {
          console.warn('httpClient request failed, trying direct fetch:', httpError);
          // Fallback to direct fetch
          const response = await fetch(url, {
            headers: {
              'apikey': this.supabaseKey,
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            }
          });
          
          if (response.ok) {
            data = await response.json() || [];
          }
        }
      } else {
        // Direct fetch if httpClient is not available
        const response = await fetch(url, {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          }
        });
        
        if (response.ok) {
          data = await response.json() || [];
        }
      }

      // Ensure data is an array
      if (!Array.isArray(data)) {
        data = data ? [data] : [];
      }

      // Update cache
      this.cache.clear();
      data.forEach(item => {
        this.cache.set(item.program_id, item);
      });
      this.lastFetch = Date.now();

      return data;
    } catch (error) {
      console.error('Error fetching hotel status levels from Supabase:', error);
      return [];
    }
  },

  // Get hotel status level by program ID
  async getByProgramId(programId) {
    // Check cache first
    if (this.cache.has(programId)) {
      return this.cache.get(programId);
    }

    // If cache is stale or empty, fetch all
    if (!this.lastFetch || (Date.now() - this.lastFetch) > this.cacheTTL) {
      await this.fetchAll();
    }

    return this.cache.get(programId) || null;
  },

  // Update or create hotel status level
  async upsert(programId, programName, currentLevel, levelName, validUntil) {
    try {
      const existing = await this.getByProgramId(programId);
      
      const payload = {
        program_id: programId,
        program_name: programName,
        current_level: currentLevel,
        level_name: levelName || null,
        valid_until: validUntil || null,
        is_active: true
      };

      let url, method;
      if (existing) {
        // Update existing record
        url = `${this.supabaseUrl}/rest/v1/hotel_status_levels?program_id=eq.${encodeURIComponent(programId)}`;
        method = 'PATCH';
      } else {
        // Create new record
        url = `${this.supabaseUrl}/rest/v1/hotel_status_levels`;
        method = 'POST';
      }

      // Try using httpClient first (with background fetch support)
      let response, result;
      
      if (window.httpClient && window.httpClient.backgroundFetch) {
        try {
          const responseData = await window.httpClient.backgroundFetch(url, {
            method: method,
            headers: {
              'apikey': this.supabaseKey,
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(payload)
          });
          
          result = Array.isArray(responseData) ? responseData[0] : responseData;
        } catch (httpError) {
          console.warn('httpClient request failed, trying direct fetch:', httpError);
          // Fallback to direct fetch
          response = await fetch(url, {
            method: method,
            headers: {
              'apikey': this.supabaseKey,
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            throw new Error(`Supabase request failed: ${response.status} ${response.statusText}`);
          }

          result = await response.json();
        }
      } else {
        // Direct fetch if httpClient is not available
        response = await fetch(url, {
          method: method,
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Supabase request failed: ${response.status} ${response.statusText}`);
        }

        result = await response.json();
      }

      const updatedItem = Array.isArray(result) ? result[0] : result;
      
      // Update cache
      if (updatedItem) {
        this.cache.set(programId, updatedItem);
      }
      
      return updatedItem;
    } catch (error) {
      console.error('Error upserting hotel status level to Supabase:', error);
      throw error;
    }
  },

  // Delete hotel status level (set is_active to false)
  async delete(programId) {
    try {
      const url = `${this.supabaseUrl}/rest/v1/hotel_status_levels?program_id=eq.${encodeURIComponent(programId)}`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ is_active: false })
      });

      if (!response.ok) {
        throw new Error(`Supabase request failed: ${response.status} ${response.statusText}`);
      }

      // Remove from cache
      this.cache.delete(programId);
      
      return true;
    } catch (error) {
      console.error('Error deleting hotel status level from Supabase:', error);
      throw error;
    }
  }
};

// User's current level and valid_until: stored in extension only (survives cookie/cache clear)
const HOTEL_STATUS_LOCAL_KEY = 'bs-hotel-status-levels';
const HotelStatusLocalStorage = {
  async get() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.get([HOTEL_STATUS_LOCAL_KEY], (result) => {
            const raw = result[HOTEL_STATUS_LOCAL_KEY];
            resolve(typeof raw === 'object' && raw !== null ? raw : {});
          });
        });
      }
    } catch (e) {
      console.warn('chrome.storage.local not available, using localStorage', e);
    }
    try {
      const raw = localStorage.getItem(HOTEL_STATUS_LOCAL_KEY);
      return Promise.resolve(raw ? JSON.parse(raw) : {});
    } catch (e) {
      return {};
    }
  },
  async set(data) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.set({ [HOTEL_STATUS_LOCAL_KEY]: data }, resolve);
        });
      }
    } catch (e) {
      console.warn('chrome.storage.local not available, using localStorage', e);
    }
    try {
      localStorage.setItem(HOTEL_STATUS_LOCAL_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save hotel status to localStorage', e);
    }
  },
  async getForProgram(programId) {
    const all = await this.get();
    const entry = all[programId];
    return {
      currentLevel: entry && typeof entry.currentLevel === 'number' ? entry.currentLevel : 1,
      validUntil: entry && (entry.validUntil === null || typeof entry.validUntil === 'string') ? entry.validUntil : null
    };
  },
  async setForProgram(programId, { currentLevel, validUntil }) {
    const all = await this.get();
    all[programId] = { currentLevel, validUntil: validUntil || null };
    await this.set(all);
  }
};

// Initialize Hotel Benefits - REMOVED

// Wait for page to be fully loaded before initializing
  async function updateStatus(hotelId, newLevel) {
    try {
      const hotel = hotelStatuses.find(h => h.id === hotelId);
      if (!hotel) {
        console.error('Program not found:', hotelId);
        return;
      }
      await HotelStatusLocalStorage.setForProgram(hotelId, {
        currentLevel: newLevel,
        validUntil: hotel.validUntil ?? null
      });
      hotel.currentLevel = newLevel;
      await renderBenefitsTable();
      await renderStatusSelectors();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  async function updateValidityDate(hotelId, newDate) {
    try {
      const hotel = hotelStatuses.find(h => h.id === hotelId);
      if (!hotel) {
        console.error('Program not found:', hotelId);
        return;
      }
      await HotelStatusLocalStorage.setForProgram(hotelId, {
        currentLevel: hotel.currentLevel,
        validUntil: newDate || null
      });
      hotel.validUntil = newDate || null;
      await renderBenefitsTable();
      if (isStatusSectionExpanded) {
        await renderStatusSelectors();
      }
    } catch (error) {
      console.error('Error updating validity date:', error);
    }
  }

  // Initialize hotel programs with levels from Supabase
  let hotelStatuses = [];
  let isLoading = false;

  // Load all data from Supabase hotel_status_levels; user's current_level and valid_until from extension storage only
  async function loadHotelStatuses() {
    if (isLoading) return;
    isLoading = true;

    try {
      let supabaseRows = [];
      try {
        supabaseRows = await HotelStatusLevelsService.fetchAll();
      } catch (e) {
        console.warn('Supabase fetch failed, using HOTEL_PROGRAMS fallback', e);
      }

      const localData = await HotelStatusLocalStorage.get();
      const fallbackByProgram = new Map(HOTEL_PROGRAMS.map(p => [p.id, p]));

      if (Array.isArray(supabaseRows) && supabaseRows.length > 0) {
        hotelStatuses = supabaseRows.map((row) => {
          const programId = row.program_id || '';
          const programName = row.program_name || programId;
          let levels = [];
          if (row.level_definitions && Array.isArray(row.level_definitions) && row.level_definitions.length > 0) {
            levels = row.level_definitions.map((def) => ({
              level: def.level,
              name: def.name || `Level ${def.level}`,
              color: def.color || 'bg-gray-100 text-gray-800',
              benefits: Array.isArray(def.benefits) ? def.benefits : []
            }));
          } else {
            const fallback = fallbackByProgram.get(programId);
            if (fallback && fallback.levels) levels = fallback.levels;
          }
          const local = localData[programId];
          const currentLevel = local && typeof local.currentLevel === 'number' ? local.currentLevel : 1;
          const validUntil = local && (local.validUntil === null || typeof local.validUntil === 'string') ? local.validUntil : null;
          return {
            id: programId,
            name: programName,
            levels,
            totalLevels: levels.length,
            currentLevel,
            validUntil
          };
        });
      } else {
        hotelStatuses = HOTEL_PROGRAMS.map((program) => {
          const local = localData[program.id];
          return {
            ...program,
            currentLevel: local && typeof local.currentLevel === 'number' ? local.currentLevel : 1,
            validUntil: local && (local.validUntil === null || typeof local.validUntil === 'string') ? local.validUntil : null
          };
        });
      }
      hotelStatuses.sort((a, b) => (b.currentLevel - a.currentLevel));

      renderQuickFilters();
      await renderBenefitsTable();
      if (isStatusSectionExpanded) {
        await renderStatusSelectors();
      }
    } catch (error) {
      console.error('Error loading hotel statuses:', error);
      const localData = await HotelStatusLocalStorage.get().catch(() => ({}));
      hotelStatuses = HOTEL_PROGRAMS.map((program) => {
        const local = localData[program.id];
        return {
          ...program,
          currentLevel: local && typeof local.currentLevel === 'number' ? local.currentLevel : 1,
          validUntil: local && (local.validUntil === null || typeof local.validUntil === 'string') ? local.validUntil : null
        };
      });
      hotelStatuses.sort((a, b) => (b.currentLevel - a.currentLevel));
      renderQuickFilters();
      renderBenefitsTable().catch(err => console.error('Error rendering benefits table:', err));
    } finally {
      isLoading = false;
    }
  }

  // State
  let showOnlyFavorites = false;
  let searchTerm = '';
  let selectedFilters = [];
  let isStatusSectionExpanded = false;
  let favoritePrograms = JSON.parse(localStorage.getItem('favoriteHotelPrograms') || '[]');

  // Get benefit icon
  function getBenefitIcon(benefit) {
    const benefitLower = benefit.toLowerCase();
    if (benefitLower.includes('points') || benefitLower.includes('bonus')) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    }
    if (benefitLower.includes('upgrade') || benefitLower.includes('room')) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';
    }
    if (benefitLower.includes('lounge') || benefitLower.includes('club')) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
    }
    if (benefitLower.includes('wifi')) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>';
    }
    if (benefitLower.includes('check-out') || benefitLower.includes('check-in')) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    }
    if (benefitLower.includes('breakfast') || benefitLower.includes('amenity')) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  }

  // Get minimum level for benefit
  function getMinimumLevelForBenefit(benefitName) {
    const results = [];
    hotelStatuses.forEach(hotel => {
      let minLevel = Infinity;
      let minLevelName = '';
      let minLevelColor = '';
      
      hotel.levels.forEach(level => {
        const hasBenefit = level.benefits.some(benefit => {
          const benefitLower = benefit.toLowerCase();
          const searchLower = benefitName.toLowerCase();
          const regex = new RegExp(`\\b${searchLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          return regex.test(benefitLower);
        });
        
        if (hasBenefit && level.level < minLevel) {
          minLevel = level.level;
          minLevelName = level.name;
          minLevelColor = level.color;
        }
      });
      
      if (minLevel !== Infinity) {
        results.push({
          hotelName: hotel.name,
          level: minLevel,
          levelName: minLevelName,
          color: minLevelColor
        });
      }
    });
    
    return results.sort((a, b) => a.level - b.level);
  }

  // Format date DD/MM/YY
  function formatDateDDMMYY(isoDate) {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return '';
    const [year, month, day] = parts;
    const yy = year.slice(2);
    return `${day}/${month}/${yy}`;
  }

  // Get days remaining
  function getDaysRemaining(isoDate) {
    if (!isoDate) return 0;
    const today = new Date();
    const validUntil = new Date(isoDate);
    const diffTime = validUntil.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Format current level
  function formatCurrentLevel(hotel) {
    const percentage = Math.round((hotel.currentLevel / hotel.totalLevels) * 100);
    return {
      levelText: `${hotel.currentLevel}/${hotel.totalLevels}`,
      percentage
    };
  }

  // Toggle favorite
  function toggleFavorite(hotelId) {
    if (favoritePrograms.includes(hotelId)) {
      favoritePrograms = favoritePrograms.filter(id => id !== hotelId);
    } else {
      favoritePrograms.push(hotelId);
    }
    localStorage.setItem('favoriteHotelPrograms', JSON.stringify(favoritePrograms));
    renderBenefitsTable().catch(err => console.error('Error rendering benefits table:', err));
    renderStatusSelectors().catch(err => console.error('Error rendering status selectors:', err));
  }

  // Filter programs
  function filterPrograms() {
    return hotelStatuses.filter(hotel => {
      if (showOnlyFavorites && !favoritePrograms.includes(hotel.id)) {
        return false;
      }
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const hasMatchingBenefit = hotel.levels.some(level => 
          level.benefits.some(benefit => {
            const benefitLower = benefit.toLowerCase();
            const regex = new RegExp(`\\b${searchLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            return regex.test(benefitLower);
          })
        );
        if (!hasMatchingBenefit) return false;
      }
      
      if (selectedFilters.length > 0) {
        const allFiltersPresent = selectedFilters.every(filter => {
          const filterLower = filter.toLowerCase();
          return hotel.levels.some(level => 
            level.benefits.some(benefit => {
              const benefitLower = benefit.toLowerCase();
              const regex = new RegExp(`\\b${filterLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
              return regex.test(benefitLower);
            })
          );
        });
        return allFiltersPresent;
      }
      
      return true;
    });
  }

  // Render quick filter buttons
  function renderQuickFilters() {
    const container = document.getElementById('bs-hotel-benefits-quick-filters');
    if (!container) return;

    const quickFilters = [
      { name: 'Breakfast', icon: '🍽️' },
      { name: 'Suite', icon: '🏨' },
      { name: 'Lounge', icon: '👥' },
      { name: 'Upgrade', icon: '⬆️' },
      { name: 'WiFi', icon: '📶' },
      { name: 'Early Check-In', icon: '⏰' },
      { name: 'Late Check-Out', icon: '⏰' }
    ];

    container.innerHTML = quickFilters.map(filter => {
      const minLevels = getMinimumLevelForBenefit(filter.name);
      const programsWithStatus = minLevels.filter(result => {
        const hotel = hotelStatuses.find(h => h.name === result.hotelName);
        return hotel && hotel.currentLevel >= result.level;
      });

      return `
        <button type="button" class="bs-hotel-benefits-quick-filter ${selectedFilters.includes(filter.name) ? 'active' : ''}" 
                data-filter="${filter.name}">
          <span>${filter.icon} ${filter.name}</span>
          <span class="bs-hotel-benefits-filter-count">${programsWithStatus.length}/${minLevels.length}</span>
        </button>
      `;
    }).join('');

    // Add event listeners
    container.querySelectorAll('.bs-hotel-benefits-quick-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        const filterName = btn.dataset.filter;
        if (selectedFilters.includes(filterName)) {
          selectedFilters = selectedFilters.filter(f => f !== filterName);
        } else {
          selectedFilters.push(filterName);
        }
        renderQuickFilters();
        renderBenefitsTable().catch(err => console.error('Error rendering benefits table:', err));
      });
    });
  }

  // Render status selectors (async to load validity dates from Supabase)
  async function renderStatusSelectors() {
    const container = document.getElementById('bs-hotel-benefits-status-grid');
    if (!container) return;

    // Show loading state
    container.innerHTML = '<div class="bs-hotel-benefits-loading">Loading status levels...</div>';

    container.innerHTML = hotelStatuses.map(hotel => {
      const isFavorite = favoritePrograms.includes(hotel.id);
      const validityDate = hotel.validUntil ?? null;
      const validity = validityDate ? formatDateDDMMYY(validityDate) : '';
      const daysRemaining = validityDate ? getDaysRemaining(validityDate) : null;
      const isExpired = daysRemaining !== null && daysRemaining < 0;

      return `
        <div class="bs-hotel-benefits-status-item">
          <div class="bs-hotel-benefits-status-header">
            <label>${hotel.name}</label>
            <button type="button" class="bs-hotel-benefits-favorite-btn ${isFavorite ? 'active' : ''}" 
                    data-hotel-id="${hotel.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
          </div>
          <select class="bs-hotel-benefits-status-select" data-hotel-id="${hotel.id}">
            ${hotel.levels.map(level => 
              `<option value="${level.level}" ${hotel.currentLevel === level.level ? 'selected' : ''}>${level.name}</option>`
            ).join('')}
          </select>
          <div class="bs-hotel-benefits-validity">
            <label>Valid until</label>
            <div class="bs-hotel-benefits-validity-input">
              <input type="date" class="bs-hotel-benefits-date-input" data-hotel-id="${hotel.id}" 
                     value="${validityDate || ''}" min="2020-01-01" max="2030-12-31">
              ${validityDate ? `
                <button type="button" class="bs-hotel-benefits-clear-date" data-hotel-id="${hotel.id}">✕</button>
              ` : ''}
            </div>
            ${validityDate && daysRemaining !== null ? `
              <div class="bs-hotel-benefits-validity-info">
                <span class="bs-hotel-benefits-validity-date">${validity}</span>
                <span class="bs-hotel-benefits-validity-days ${isExpired ? 'expired' : daysRemaining <= 30 ? 'warning' : 'ok'}">
                  ${isExpired ? `Expired ${Math.abs(daysRemaining)}d ago` : `${daysRemaining}d left`}
                </span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Add event listeners
    container.querySelectorAll('.bs-hotel-benefits-status-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const hotelId = e.target.dataset.hotelId;
        const newLevel = parseInt(e.target.value);
        updateStatus(hotelId, newLevel);
        // Update local state
        const hotel = hotelStatuses.find(h => h.id === hotelId);
        if (hotel) hotel.currentLevel = newLevel;
      });
    });

    container.querySelectorAll('.bs-hotel-benefits-date-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const hotelId = e.target.dataset.hotelId;
        updateValidityDate(hotelId, e.target.value);
      });
    });

    container.querySelectorAll('.bs-hotel-benefits-clear-date').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const hotelId = e.target.dataset.hotelId;
        updateValidityDate(hotelId, '');
      });
    });

    container.querySelectorAll('.bs-hotel-benefits-favorite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const hotelId = e.target.closest('.bs-hotel-benefits-favorite-btn').dataset.hotelId;
        toggleFavorite(hotelId);
      });
    });
  }

  // Render benefits table (validity from extension local storage)
  async function renderBenefitsTable() {
    const container = document.getElementById('bs-hotel-benefits-table-container');
    if (!container) return;

    const filtered = filterPrograms();
    // Sort: highest tier (max level) first, then A–Z by program name
    const filteredPrograms = [...filtered].sort((a, b) => {
      const maxA = a.levels && a.levels.length ? Math.max(...a.levels.map(l => l.level)) : 0;
      const maxB = b.levels && b.levels.length ? Math.max(...b.levels.map(l => l.level)) : 0;
      if (maxB !== maxA) return maxB - maxA;
      return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
    });

    // Get all unique levels
    const allLevels = Array.from(new Set(hotelStatuses.flatMap(h => h.levels.map(l => l.level)))).sort((a, b) => a - b);

    if (filteredPrograms.length === 0) {
      container.innerHTML = '<div class="bs-hotel-benefits-no-results">No programs match your filters.</div>';
      return;
    }

    // Show loading state
    container.innerHTML = '<div class="bs-hotel-benefits-loading">Loading benefits data...</div>';

    const validityMap = new Map(filteredPrograms.map(h => [h.id, h.validUntil ?? null]));

    container.innerHTML = `
      <div class="bs-hotel-benefits-legend">
        <div class="bs-hotel-benefits-legend-item">
          <div class="bs-hotel-benefits-legend-color" style="background: #a78bfa;"></div>
          <span>My Level</span>
        </div>
        <div class="bs-hotel-benefits-legend-item">
          <div class="bs-hotel-benefits-legend-color" style="background: #4ade80;"></div>
          <span>Minimum Level for Selected Benefit(s)</span>
        </div>
      </div>
      <div class="bs-hotel-benefits-table-wrapper">
        <table class="bs-hotel-benefits-table">
          <thead>
            <tr>
              <th>Hotelchain</th>
              ${allLevels.map(level => `<th>Level ${level}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${filteredPrograms.map(hotel => {
              const validityDate = validityMap.get(hotel.id) || null;
              const validity = validityDate ? formatDateDDMMYY(validityDate) : '';
              const daysRemaining = validityDate ? getDaysRemaining(validityDate) : null;
              const isExpired = daysRemaining !== null && daysRemaining < 0;
              const levelInfo = formatCurrentLevel(hotel);
              const isFavorite = favoritePrograms.includes(hotel.id);

              // Get highest required level for search/filters
              let highestRequiredLevel = null;
              const searchTerms = selectedFilters.length > 0 ? selectedFilters : (searchTerm ? [searchTerm] : []);
              for (const term of searchTerms) {
                if (!term) continue;
                const minLevels = getMinimumLevelForBenefit(term);
                const hotelMinLevel = minLevels.find(result => result.hotelName === hotel.name);
                if (hotelMinLevel && (highestRequiredLevel === null || hotelMinLevel.level > highestRequiredLevel)) {
                  highestRequiredLevel = hotelMinLevel.level;
                }
              }

              return `
                <tr>
                  <td class="bs-hotel-benefits-hotel-name">
                    <div class="bs-hotel-benefits-hotel-header">
                      <div>
                        <div class="bs-hotel-benefits-hotel-title">${hotel.name}${isFavorite ? ' ⭐' : ''}</div>
                        ${validityDate ? `
                          <div class="bs-hotel-benefits-validity-badge">
                            <span class="bs-hotel-benefits-validity-date-small">${validity}</span>
                            <span class="bs-hotel-benefits-validity-days-small ${isExpired ? 'expired' : daysRemaining <= 30 ? 'warning' : 'ok'}">
                              ${isExpired ? `Expired ${Math.abs(daysRemaining)}d ago` : `${daysRemaining}d left`}
                            </span>
                          </div>
                        ` : ''}
                        <div class="bs-hotel-benefits-level-badge">
                          <span>Level ${levelInfo.levelText}</span>
                          <span>${levelInfo.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  ${allLevels.map(level => {
                    const levelData = hotel.levels.find(l => l.level === level);
                    const isCurrentLevel = hotel.currentLevel === level;
                    const isMinimumLevel = highestRequiredLevel !== null && highestRequiredLevel === level;

                    if (!levelData) {
                      return '<td class="bs-hotel-benefits-empty">N/A</td>';
                    }

                    return `
                      <td class="bs-hotel-benefits-level-cell ${isCurrentLevel ? 'current' : ''} ${isMinimumLevel ? 'minimum' : ''}">
                        <div class="bs-hotel-benefits-level-header">
                          <span class="bs-hotel-benefits-level-badge ${levelData.color}">${levelData.name.replace('\n', ' ')}</span>
                        </div>
                        <div class="bs-hotel-benefits-benefits-list">
                          ${levelData.benefits.map(benefit => `
                            <div class="bs-hotel-benefits-benefit-item">
                              ${getBenefitIcon(benefit)}
                              <span>${benefit}</span>
                            </div>
                          `).join('')}
                        </div>
                      </td>
                    `;
                  }).join('')}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Event listeners
  const searchInput = document.getElementById('bs-hotel-benefits-search');
  const clearSearchBtn = document.getElementById('bs-hotel-benefits-clear-search');
  const favoritesBtn = document.getElementById('bs-hotel-benefits-favorites-btn');
  const statusBtn = document.getElementById('bs-hotel-benefits-status-btn');
  const statusSection = document.getElementById('bs-hotel-benefits-status-section');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      if (searchTerm) {
        clearSearchBtn.style.display = 'block';
      } else {
        clearSearchBtn.style.display = 'none';
      }
      renderBenefitsTable().catch(err => console.error('Error rendering benefits table:', err));
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchTerm = '';
      clearSearchBtn.style.display = 'none';
      renderBenefitsTable().catch(err => console.error('Error rendering benefits table:', err));
    });
  }

  if (favoritesBtn) {
    favoritesBtn.addEventListener('click', () => {
      showOnlyFavorites = !showOnlyFavorites;
      favoritesBtn.querySelector('span').textContent = showOnlyFavorites ? 'Show All' : 'Show Favorites';
      renderBenefitsTable().catch(err => console.error('Error rendering benefits table:', err));
    });
  }

  if (statusBtn && statusSection) {
    statusBtn.addEventListener('click', () => {
      isStatusSectionExpanded = !isStatusSectionExpanded;
      statusSection.style.display = isStatusSectionExpanded ? 'block' : 'none';
      statusBtn.querySelector('span').textContent = isStatusSectionExpanded ? 'Hide Status' : 'Show Status';
      if (isStatusSectionExpanded) {
        renderStatusSelectors().catch(err => console.error('Error rendering status selectors:', err));
      }
    });
  }

// Wait for page to be fully loaded before initializing
function waitForPageFullyLoaded() {
  return new Promise((resolve) => {
    // If page is already fully loaded
    if (document.readyState === 'complete') {
      // Wait a bit more for dynamic content to render
      setTimeout(() => {
        resolve();
      }, 500);
      return;
    }

    // Wait for window load event (all resources loaded)
    if (document.readyState === 'loading') {
      window.addEventListener('load', () => {
        // Additional wait for dynamic content
        setTimeout(() => {
          resolve();
        }, 500);
      }, { once: true });
    } else {
      // Interactive state - wait for load event
      window.addEventListener('load', () => {
        setTimeout(() => {
          resolve();
        }, 500);
      }, { once: true });
    }
  });
}

// Initialize extension with error handling
(function() {
  'use strict';
  
  try {
    // Log extension version for debugging
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
      const manifest = chrome.runtime.getManifest();
      console.log(`[BS Extension] Version ${manifest.version} loading...`);
    }
    
    // Wait for page to be fully loaded before initializing
    waitForPageFullyLoaded().then(() => {
      console.log('[BS Extension] Page fully loaded, initializing extension...');
      try {
        setupObserver();
      } catch (error) {
        console.error('[BS Extension] Error in setupObserver:', error);
        // Fallback: try again after a delay
        setTimeout(() => {
          try {
            setupObserver();
          } catch (e) {
            console.error('[BS Extension] Fallback initialization failed:', e);
          }
        }, 1000);
      }
    }).catch((error) => {
      console.error('[BS Extension] Error waiting for page load:', error);
      // Fallback: try to initialize anyway after a delay
      setTimeout(() => {
        try {
          setupObserver();
        } catch (e) {
          console.error('[BS Extension] Fallback initialization failed:', e);
        }
      }, 2000);
    });
  } catch (error) {
    console.error('[BS Extension] Critical initialization error:', error);
    // Attempt graceful fallback
    if (typeof setupObserver === 'function') {
      setTimeout(() => {
        try {
          setupObserver();
        } catch (e) {
          console.error('[BS Extension] Fallback initialization failed:', e);
        }
      }, 2000);
    }
  }
})();

