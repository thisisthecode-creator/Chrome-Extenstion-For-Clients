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
          <div class="bs-toggle-item">
            <label class="bs-toggle-label" for="bs-calculator-toggle">Calculator</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-calculator-toggle">
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
        <button class="bs-action-btn bs-action-refresh" id="bs-refresh-flight" title="Refresh results">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10"/>
            <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14"/>
          </svg>
        </button>
        <div class="bs-header-controls">
          <div class="bs-auto-reload-toggle">
            <label class="bs-toggle-label" for="bs-auto-reload-toggle">Auto-reload</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-auto-reload-toggle" checked>
              <span class="bs-toggle-slider"></span>
            </label>
          </div>
          <div class="bs-auto-reload-toggle">
            <label class="bs-toggle-label" for="bs-external-links-toggle">Search Links</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-external-links-toggle">
              <span class="bs-toggle-slider"></span>
            </label>
          </div>
          <div class="bs-auto-reload-toggle">
            <label class="bs-toggle-label" for="bs-casm-toggle">CASM</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-casm-toggle">
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

      <!-- CASM Calculator Section -->
      <div class="bs-casm-calculator" id="bs-casm-calculator" style="display: none;">
        <!-- Input Row -->
        <div class="bs-casm-row">
          <div class="bs-casm-inputs">
            <div class="bs-casm-field">
              <label>Distance</label>
              <input type="number" id="bs-casm-distance" placeholder="Auto" step="0.1" min="0" />
            </div>
            
            <div class="bs-casm-field">
              <label>Airline</label>
              <select id="bs-casm-airline">
                <option value="">Select</option>
              </select>
            </div>
            
            <div class="bs-casm-field">
              <label>Cash</label>
              <input type="number" id="bs-casm-cash-price" placeholder="Price" step="0.01" min="0" />
            </div>

            <div class="bs-casm-field">
              <label>Region</label>
              <select id="bs-casm-region">
                <option value="North America">North America</option>
                <option value="Europe" selected>Europe</option>
                <option value="Asia–Pacific">Asia–Pacific</option>
                <option value="Latin America">Latin America</option>
                <option value="Middle East & Africa">Middle East & Africa</option>
              </select>
            </div>

            <div class="bs-casm-field">
              <label>Check-In Bags</label>
              <input type="number" id="bs-casm-bags" placeholder="0" min="0" value="1" />
            </div>

            <div class="bs-casm-field">
              <label>Bag Fee</label>
              <input type="number" id="bs-casm-bag-fee" placeholder="0" step="0.01" min="0" />
            </div>
          </div>
        </div>

        <!-- Results Row -->
        <div class="bs-casm-row bs-casm-results-row" id="bs-casm-results" style="display: none;">
          <div class="bs-casm-results">
            <div class="bs-casm-result">
              <span class="bs-casm-result-label">CASM Cost</span>
              <span class="bs-casm-result-value" id="bs-casm-cost">$0.00</span>
            </div>
            <div class="bs-casm-result">
              <span class="bs-casm-result-label">Cash</span>
              <span class="bs-casm-result-value" id="bs-casm-cash-display">—</span>
            </div>
            <div class="bs-casm-result bs-casm-margin">
              <span class="bs-casm-result-label">Margin</span>
              <span class="bs-casm-result-value">
                <span id="bs-casm-margin">$0.00</span>
                <span class="bs-casm-percentage" id="bs-casm-margin-pct">(0%)</span>
              </span>
            </div>
            <div class="bs-casm-result">
              <span class="bs-casm-result-label">Bag Cost</span>
              <span class="bs-casm-result-value" id="bs-casm-bag-cost">$0.00</span>
            </div>
            <div class="bs-casm-result bs-casm-total-cost">
              <span class="bs-casm-result-label">Total Cost</span>
              <span class="bs-casm-result-value" id="bs-casm-total-cost">$0.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hotel Search Section -->
    <div class="bs-section" id="bs-hotel-section" style="display: none;">
      <div class="bs-section-header">
        <svg class="bs-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6h14"/><path d="M4 14h16v7H4z"/>
        </svg>
        <span>Hotel Search</span>
        <button class="bs-action-btn bs-action-refresh" id="bs-refresh-hotel" title="Refresh results">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10"/>
            <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14"/>
          </svg>
        </button>
        <div class="bs-header-controls">
          <div class="bs-auto-reload-toggle">
            <label class="bs-toggle-label" for="bs-hotel-auto-reload-toggle">Auto-reload</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-hotel-auto-reload-toggle">
              <span class="bs-toggle-slider"></span>
            </label>
          </div>
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
          <div class="bs-header-controls">
            <div class="bs-auto-reload-toggle">
              <label class="bs-toggle-label" for="bs-info-cards-toggle">My Credit Cards</label>
              <label class="bs-toggle-switch">
                <input type="checkbox" id="bs-info-cards-toggle" checked>
                <span class="bs-toggle-slider"></span>
              </label>
            </div>
            <div class="bs-auto-reload-toggle">
              <label class="bs-toggle-label" for="bs-info-partners-toggle">Available Transfer Partners</label>
              <label class="bs-toggle-switch">
                <input type="checkbox" id="bs-info-partners-toggle" checked>
                <span class="bs-toggle-slider"></span>
              </label>
            </div>
            <div class="bs-auto-reload-toggle">
              <label class="bs-toggle-label" for="bs-info-selected-toggle">Selected Cards</label>
              <label class="bs-toggle-switch">
                <input type="checkbox" id="bs-info-selected-toggle" checked>
                <span class="bs-toggle-slider"></span>
              </label>
            </div>
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
        </div>
    
          
          <!-- Card Selection Panel -->
          <div class="card-selection-panel" id="bs-info-cards-panel">
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
    
    <!-- Calculator Section -->
    <div class="bs-section" id="bs-calculator-section" style="display: none; padding: 0;">
      <div style="background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(8px); border-radius: 16px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(to right, #fbbf24, #f59e0b); padding: 24px;">
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: white;">
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
              <h2 style="font-size: 20px; font-weight: 600; color: white; margin: 0;">Total Value Calculator</h2>
            </div>
            <button type="button" id="bs-calculator-info-btn" style="padding: 8px; color: rgba(255, 255, 255, 0.8); background: transparent; border: none; border-radius: 50%; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.color='white'; this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.color='rgba(255,255,255,0.8)'; this.style.background='transparent'">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Content -->
        <div style="padding: 24px;">
          <form id="bs-calculator-form" style="display: flex; flex-direction: column; gap: 32px;">
            <!-- Loyalty Program Section -->
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #f59e0b;">
                  <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                  <line x1="2" x2="22" y1="10" y2="10"></line>
                </svg>
                <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0;">Loyalty Program</h3>
              </div>
              
              <div style="background: linear-gradient(to right, #fefce8, #fff7ed); border-radius: 12px; padding: 16px; border: 1px solid #fef3c7;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                  <select id="bs-calculator-program" required style="flex: 1; border-radius: 8px; border: 1px solid #d1d5db; background: white; padding: 12px 16px; font-weight: 500; transition: all 0.2s; font-size: 14px;" onmouseover="this.style.borderColor='#fbbf24'" onfocus="this.style.borderColor='#f59e0b'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(251, 191, 36, 0.1)'" onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                    <optgroup label="💳 Credit Card Programs">
                    </optgroup>
                    <optgroup label="✈️ Airlines">
                    </optgroup>
                    <optgroup label="🏨 Hotels">
                    </optgroup>
                  </select>
                  <button type="button" id="bs-calculator-favorite" style="padding: 12px; border-radius: 50%; background: transparent; border: none; cursor: pointer; color: #9ca3af; transition: all 0.2s; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.color='#f59e0b'; this.style.background='#fef3c7'" onmouseout="this.style.color='#9ca3af'; this.style.background='transparent'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </button>
                </div>
                
                <!-- Historical Data Cards -->
                <div id="bs-calculator-history-cards" style="display: none; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                  <div style="background: white; border-radius: 8px; padding: 12px; border: 1px solid #fde68a; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                    <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #16a34a;">
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                        <polyline points="16 7 22 7 22 13"></polyline>
                      </svg>
                      <span style="font-size: 11px; font-weight: 500; color: #4b5563;">Current</span>
                    </div>
                    <span style="font-size: 14px; font-weight: 700; color: #111827;" id="bs-calculator-current">$-</span>
                  </div>
                  <div style="background: white; border-radius: 8px; padding: 12px; border: 1px solid #fde68a; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                    <span style="font-size: 11px; font-weight: 500; color: #4b5563; margin-bottom: 4px; display: block;">6-Month Avg</span>
                    <span style="font-size: 14px; font-weight: 700; color: #111827;" id="bs-calculator-avg6">$-</span>
                  </div>
                  <div style="background: white; border-radius: 8px; padding: 12px; border: 1px solid #fde68a; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                    <span style="font-size: 11px; font-weight: 500; color: #4b5563; margin-bottom: 4px; display: block;">12-Month Avg</span>
                    <span style="font-size: 14px; font-weight: 700; color: #111827;" id="bs-calculator-avg12">$-</span>
                  </div>
                  <div style="background: white; border-radius: 8px; padding: 12px; border: 1px solid #fde68a; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                    <span style="font-size: 11px; font-weight: 500; color: #4b5563; margin-bottom: 4px; display: block;">24-Month Avg</span>
                    <span style="font-size: 14px; font-weight: 700; color: #111827;" id="bs-calculator-avg24">$-</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Calculation Parameters -->
            <div style="display: flex; flex-direction: column; gap: 24px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #f59e0b;">
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
                <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0;">Calculation Parameters</h3>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                <!-- Left Column - Points & Miles -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                  <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                    <h4 style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>
                      </svg>
                      Points &amp; Miles
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                      <div>
                        <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Points/Miles Amount <span style="color: #ef4444;">*</span></label>
                        <input type="number" id="bs-calculator-miles" placeholder="0" min="0" required style="width: 100%; border-radius: 8px; border: 1px solid #d1d5db; padding: 12px; text-align: right; font-size: 18px; font-weight: 500; transition: all 0.2s;" onfocus="this.style.borderColor='#f59e0b'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(251, 191, 36, 0.1)'" onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                      </div>
                      <div>
                        <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Cost per 1,000 Points ($)</label>
                        <input type="number" id="bs-calculator-cost-per-1000" placeholder="0.00" min="0" step="0.01" style="width: 100%; border-radius: 8px; border: 1px solid #d1d5db; padding: 12px; text-align: right; transition: all 0.2s;" onfocus="this.style.borderColor='#f59e0b'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(251, 191, 36, 0.1)'" onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Right Column - Cash & Fees -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                  <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                    <h4 style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" x2="12" y1="2" y2="22"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                      Cash &amp; Fees
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                      <div>
                        <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Cash Price ($)</label>
                        <input type="number" id="bs-calculator-cash-price" placeholder="0.00" min="0" step="0.01" style="width: 100%; border-radius: 8px; border: 1px solid #d1d5db; padding: 12px; text-align: right; transition: all 0.2s;" onfocus="this.style.borderColor='#f59e0b'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(251, 191, 36, 0.1)'" onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                      </div>
                      <div>
                        <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Taxes &amp; Fees ($)</label>
                        <input type="number" id="bs-calculator-taxes" placeholder="0.00" min="0" step="0.01" style="width: 100%; border-radius: 8px; border: 1px solid #d1d5db; padding: 12px; text-align: right; transition: all 0.2s;" onfocus="this.style.borderColor='#f59e0b'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(251, 191, 36, 0.1)'" onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                      </div>
                      <div>
                        <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Credit Card Multiplier</label>
                        <input type="number" id="bs-calculator-multiplier" placeholder="0.0" min="0" step="0.1" style="width: 100%; border-radius: 8px; border: 1px solid #d1d5db; padding: 12px; text-align: right; transition: all 0.2s;" onfocus="this.style.borderColor='#f59e0b'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(251, 191, 36, 0.1)'" onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div style="display: flex; justify-content: center;">
                <button type="button" id="bs-calculator-reset" style="display: flex; align-items: center; gap: 8px; padding: 12px 24px; color: #4b5563; background: transparent; border: none; cursor: pointer; transition: all 0.2s; font-size: 14px;" onmouseover="this.style.color='#1f2937'" onmouseout="this.style.color='#4b5563'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                  </svg>
                  Reset Form
                </button>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <button type="button" id="bs-calculator-converter" style="display: flex; align-items: center; justify-content: center; gap: 12px; background: linear-gradient(to right, #10b981, #059669); color: white; padding: 16px 24px; border-radius: 12px; font-weight: 600; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: none; cursor: pointer; transition: all 0.2s; font-size: 14px;" onmouseover="this.style.background='linear-gradient(to right, #059669, #047857)'; this.style.transform='scale(1.05)'" onmouseout="this.style.background='linear-gradient(to right, #10b981, #059669)'; this.style.transform='scale(1)'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" x2="12" y1="2" y2="22"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  Currency Converter
                </button>
                <button type="submit" style="display: flex; align-items: center; justify-content: center; gap: 12px; background: linear-gradient(to right, #fbbf24, #f59e0b); color: white; padding: 16px 24px; border-radius: 12px; font-weight: 600; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: none; cursor: pointer; transition: all 0.2s; font-size: 14px;" onmouseover="this.style.background='linear-gradient(to right, #f59e0b, #d97706)'; this.style.transform='scale(1.05)'" onmouseout="this.style.background='linear-gradient(to right, #fbbf24, #f59e0b)'; this.style.transform='scale(1)'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                  Calculate Value
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Results Section -->
      <div id="bs-calculator-results" style="display: none; margin-top: 16px; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(8px); border-radius: 16px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <div style="background: linear-gradient(to right, #f97316, #ea580c); padding: 24px;">
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: white;">
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
              <h2 style="font-size: 20px; font-weight: 600; color: white; margin: 0;">Calculator Results</h2>
            </div>
            <button type="button" id="bs-calculator-results-info-btn" style="padding: 8px; color: rgba(255, 255, 255, 0.8); background: transparent; border: none; border-radius: 50%; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.color='white'; this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.color='rgba(255,255,255,0.8)'; this.style.background='transparent'">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </button>
          </div>
        </div>
        <div style="padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 400px;" id="bs-calculator-results-placeholder">
          <div style="text-align: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 64px; height: 64px; margin: 0 auto 16px; color: #fb923c;">
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
            <p style="font-size: 16px; color: #9ca3af; margin: 0;">Press Calculate to see the analysis</p>
          </div>
        </div>
        <div style="padding: 24px; display: none;" id="bs-calculator-results-content-wrapper">
          <div id="bs-calculator-results-content"></div>
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
    settings: settingsToggle ? settingsToggle.checked : false,
    calculator: false
  };
  
  const calculatorToggle = document.getElementById('bs-calculator-toggle');
  if (calculatorToggle) {
    toggleStates.calculator = calculatorToggle.checked;
  }
  
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
    settings: false, // Settings OFF by default
    calculator: false // Calculator OFF by default
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
  
  // Apply calculator toggle state
  if (calculatorToggle && calculatorSection) {
    calculatorToggle.checked = toggleStates.calculator;
    calculatorSection.style.display = toggleStates.calculator ? 'block' : 'none';
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

  // External links toggle
  const linksToggle = document.getElementById('bs-external-links-toggle');
  const linksContainer = document.getElementById('bs-external-links');
  if (linksToggle && linksContainer) {
    const saved = localStorage.getItem('bs-external-links-enabled');
    if (saved !== null) {
      linksToggle.checked = saved === 'true';
    }
    linksContainer.style.display = linksToggle.checked ? '' : 'none';
    linksToggle.addEventListener('change', () => {
      localStorage.setItem('bs-external-links-enabled', linksToggle.checked);
      linksContainer.style.display = linksToggle.checked ? '' : 'none';
    });
  }

  // Initialize CASM Calculator
  initializeCASMCalculator();

  // Add auto-reload functionality for flight inputs
  setupFlightInputAutoReload();
  
  // Hotel external links toggle
  const hotelLinksToggle = document.getElementById('bs-hotel-external-links-toggle');
  const hotelLinksContainer = document.getElementById('bs-hotel-external-links');
  if (hotelLinksToggle && hotelLinksContainer) {
    const savedHotelLinks = localStorage.getItem('bs-hotel-external-links-enabled');
    if (savedHotelLinks !== null) hotelLinksToggle.checked = savedHotelLinks === 'true';
    hotelLinksContainer.style.display = hotelLinksToggle.checked ? '' : 'none';
    hotelLinksToggle.addEventListener('change', () => {
      localStorage.setItem('bs-hotel-external-links-enabled', hotelLinksToggle.checked);
      hotelLinksContainer.style.display = hotelLinksToggle.checked ? '' : 'none';
    });
  }
  
  // Hotel auto-reload setup
  setupHotelInputAutoReload();
  
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

  // Information section sub-toggles
  const infoCardsToggle = document.getElementById('bs-info-cards-toggle');
  const infoPartnersToggle = document.getElementById('bs-info-partners-toggle');
  const infoSelectedToggle = document.getElementById('bs-info-selected-toggle');
  const infoCardsPanel = document.getElementById('bs-info-cards-panel');
  const infoPartnersPanel = document.getElementById('available-transfer-partners');
  const infoSelectedPanel = document.getElementById('selected-cards-comparison');

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
  
  // Calculator toggle
  const calculatorToggle = document.getElementById('bs-calculator-toggle');
  const calculatorSection = document.getElementById('bs-calculator-section');
  if (calculatorToggle && calculatorSection) {
    calculatorToggle.addEventListener('change', () => {
      if (calculatorToggle.checked) {
        calculatorSection.style.display = 'block';
        initializeCalculator();
      } else {
        calculatorSection.style.display = 'none';
      }
      saveToggleStates();
    });
    
    // Initialize calculator if section is visible
    if (calculatorSection.style.display !== 'none') {
      initializeCalculator();
    }
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
    }
  }
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
    if (saved !== null) autoToggle.checked = saved === 'true';
  }
}

function autoReloadHotels() {
  console.log('Auto-reloading Google Hotels...');
  const hotelData = getHotelInputData();
  if (!validateHotelData(hotelData)) return;
  const url = generateHotelUrl('google-hotels', hotelData);
  if (url) window.open(url, '_blank');
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

// Initialize Calculator
function initializeCalculator() {
  // Full loyalty programs list
  const loyaltyPrograms = window.loyaltyPrograms || [
    // Credit Card Programs
    { name: 'Amex (Membership Rewards)', pointValue: 0.0195, category: 'credit' },
    { name: 'Bilt (Rewards)', pointValue: 0.0210, category: 'credit' },
    { name: 'Capital One (Venture Miles)', pointValue: 0.0200, category: 'credit' },
    { name: 'Chase (Ultimate Rewards)', pointValue: 0.0193, category: 'credit' },
    { name: 'Citi (ThankYou Points)', pointValue: 0.0215, category: 'credit' },
    { name: 'Wells Fargo (Rewards)', pointValue: 0.0195, category: 'credit' },
    
    // Airlines
    { name: 'Aer Lingus (Avios)', pointValue: 0.0373, category: 'airline' },
    { name: 'Air Canada (Aeroplan)', pointValue: 0.0184, category: 'airline' },
    { name: 'Air Europa (SUMA)', pointValue: 0.0130, category: 'airline' },
    { name: 'Air France / KLM (Flying Blue)', pointValue: 0.0217, category: 'airline' },
    { name: 'Alaska Airlines (Mileage Plan)', pointValue: 0.0210, category: 'airline' },
    { name: 'American Airlines (AAdvantage)', pointValue: 0.0177, category: 'airline' },
    { name: 'ANA (Mileage Club)', pointValue: 0.0285, category: 'airline' },
    { name: 'Avianca (LifeMiles)', pointValue: 0.0285, category: 'airline' },
    { name: 'British Airways (Avios)', pointValue: 0.0257, category: 'airline' },
    { name: 'Cathay Pacific (Asia Miles)', pointValue: 0.0284, category: 'airline' },
    { name: 'Copa Airlines (ConnectMiles)', pointValue: 0.0150, category: 'airline' },
    { name: 'Delta (SkyMiles)', pointValue: 0.0134, category: 'airline' },
    { name: 'Emirates (Skywards)', pointValue: 0.0155, category: 'airline' },
    { name: 'Etihad (Guest)', pointValue: 0.0100, category: 'airline' },
    { name: 'EVA Air (Infinity MileageLands)', pointValue: 0.0250, category: 'airline' },
    { name: 'Hawaiian Airlines (Hawaiian Miles)', pointValue: 0.0209, category: 'airline' },
    { name: 'Iberia (Avios)', pointValue: 0.0305, category: 'airline' },
    { name: 'JetBlue (TrueBlue)', pointValue: 0.0124, category: 'airline' },
    { name: 'Lufthansa (Miles & More) US', pointValue: 0.0320, category: 'airline' },
    { name: 'Qatar Airways (Avios)', pointValue: 0.0096, category: 'airline' },
    { name: 'Singapore Airlines (KrisFlyer)', pointValue: 0.0233, category: 'airline' },
    { name: 'Southwest Airlines (Rapid Rewards)', pointValue: 0.0152, category: 'airline' },
    { name: 'TAP Air Portugal (Miles&Go)', pointValue: 0.0180, category: 'airline' },
    { name: 'Turkish Airlines (Miles & Smiles)', pointValue: 0.0110, category: 'airline' },
    { name: 'United Airlines (MileagePlus)', pointValue: 0.0190, category: 'airline' },
    { name: 'Virgin Atlantic (Flying Club)', pointValue: 0.0365, category: 'airline' },
    { name: 'Virgin Australia (Velocity)', pointValue: 0.0210, category: 'airline' },
    
    // Hotels
    { name: 'Accor (Live Limitless)', pointValue: 0.0200, category: 'hotel' },
    { name: 'Choice (Privileges)', pointValue: 0.0060, category: 'hotel' },
    { name: 'Hilton (Honors)', pointValue: 0.0059, category: 'hotel' },
    { name: 'Hyatt (World of Hyatt)', pointValue: 0.0219, category: 'hotel' },
    { name: 'IHG (One Rewards)', pointValue: 0.0068, category: 'hotel' },
    { name: 'Marriott (Bonvoy)', pointValue: 0.0094, category: 'hotel' },
    { name: 'Radisson (Rewards)', pointValue: 0.0120, category: 'hotel' },
    { name: 'Wyndham (Rewards)', pointValue: 0.0120, category: 'hotel' }
  ];
  
  // Populate program dropdown
  const programSelect = document.getElementById('bs-calculator-program');
  if (programSelect) {
    programSelect.innerHTML = '';
    const creditGroup = document.createElement('optgroup');
    creditGroup.label = '💳 Credit Card Programs';
    const airlineGroup = document.createElement('optgroup');
    airlineGroup.label = '✈️ Airlines';
    const hotelGroup = document.createElement('optgroup');
    hotelGroup.label = '🏨 Hotels';
    
    loyaltyPrograms.forEach(program => {
      const option = document.createElement('option');
      option.value = program.name;
      option.textContent = program.name;
      option.dataset.pointValue = program.pointValue;
      
      if (program.category === 'credit') {
        creditGroup.appendChild(option);
      } else if (program.category === 'airline') {
        airlineGroup.appendChild(option);
      } else if (program.category === 'hotel') {
        hotelGroup.appendChild(option);
      }
    });
    
    programSelect.appendChild(creditGroup);
    programSelect.appendChild(airlineGroup);
    programSelect.appendChild(hotelGroup);
  }
  
  // Form submission handler
  const form = document.getElementById('bs-calculator-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      calculateValue();
    });
  }
  
  // Program change handler to load history
  if (programSelect) {
    programSelect.addEventListener('change', () => {
      loadPointsHistory(programSelect.value);
    });
    // Load history for initial selection
    if (programSelect.value) {
      loadPointsHistory(programSelect.value);
    }
  }
  
  // Reset button handler
  const resetBtn = document.getElementById('bs-calculator-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (form) form.reset();
      const resultsDiv = document.getElementById('bs-calculator-results');
      const placeholder = document.getElementById('bs-calculator-results-placeholder');
      const contentWrapper = document.getElementById('bs-calculator-results-content-wrapper');
      if (resultsDiv) resultsDiv.style.display = 'none';
      if (placeholder) placeholder.style.display = 'flex';
      if (contentWrapper) contentWrapper.style.display = 'none';
    });
  }
}

// Load points purchase history from Supabase
async function loadPointsHistory(programName) {
  const historyCards = document.getElementById('bs-calculator-history-cards');
  const currentEl = document.getElementById('bs-calculator-current');
  const avg6El = document.getElementById('bs-calculator-avg6');
  const avg12El = document.getElementById('bs-calculator-avg12');
  const avg24El = document.getElementById('bs-calculator-avg24');
  
  if (!historyCards || !currentEl || !avg6El || !avg12El || !avg24El) {
    console.warn('Calculator history elements not found');
    return;
  }
  
  // Validate program parameter
  if (!programName) {
    console.log('No program name provided, hiding history cards');
    historyCards.style.display = 'none';
    return;
  }
  
  try {
    const supabaseUrl = 'https://saegzrncsjcsvgcjkniv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZWd6cm5jc2pjc3ZnY2prbml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3ODgxNDYsImV4cCI6MjA0NzM2NDE0Nn0.w1eHVcuvDUoqhcMCYenKKA9URAtG4YbW3j5GcDgvu3Y';
    
    console.log('Fetching points history for program:', programName);
    
    // Build query matching React hook: .eq('loyalty', program).order('start_date', { ascending: false })
    const url = `${supabaseUrl}/rest/v1/points_history?loyalty=eq.${encodeURIComponent(programName)}&order=start_date.desc&select=*`;
    
    console.log('Supabase URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
    
    console.log('Supabase response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase query error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log('Points history data received:', data);
    console.log('Number of records:', data?.length || 0);
    
    if (!data || data.length === 0) {
      console.log('No data found for program:', programName);
      historyCards.style.display = 'none';
      return;
    }
    
    // Transform data to match React hook format (for consistency)
    const transformedData = data.map(item => ({
      id: item.id,
      loyalty: item.loyalty,
      startDate: item.start_date,
      endDate: item.end_date,
      pricePerThousand: item.price_per_thousand,
      bonus: item.bonus
    }));
    
    console.log('Transformed data:', transformedData.slice(0, 3));
    
    // Calculate moving averages (matching React hook logic exactly)
    const current = transformedData[0]?.pricePerThousand || null;
    
    const avg6 = transformedData.slice(0, 6).reduce((sum, item) => 
      sum + (item.pricePerThousand || 0), 0) / Math.min(transformedData.length, 6);
    
    const avg12 = transformedData.slice(0, 12).reduce((sum, item) => 
      sum + (item.pricePerThousand || 0), 0) / Math.min(transformedData.length, 12);
    
    const avg24 = transformedData.slice(0, 24).reduce((sum, item) => 
      sum + (item.pricePerThousand || 0), 0) / Math.min(transformedData.length, 24);
    
    console.log('Calculated averages:', { current, avg6, avg12, avg24 });
    
    // Display the values
    currentEl.textContent = current !== null ? `$${current.toFixed(2)}` : '-';
    avg6El.textContent = avg6 > 0 ? `$${avg6.toFixed(2)}` : '-';
    avg12El.textContent = avg12 > 0 ? `$${avg12.toFixed(2)}` : '-';
    avg24El.textContent = avg24 > 0 ? `$${avg24.toFixed(2)}` : '-';
    
    historyCards.style.display = 'grid';
    // Responsive grid: 2 columns on mobile, 4 on larger screens
    if (window.innerWidth >= 640) {
      historyCards.style.gridTemplateColumns = 'repeat(4, 1fr)';
    } else {
      historyCards.style.gridTemplateColumns = 'repeat(2, 1fr)';
    }
    
    // Add resize listener to update grid on window resize (only once)
    if (!historyCards.dataset.resizeListenerAdded) {
      const updateGrid = () => {
        if (historyCards.style.display === 'grid') {
          if (window.innerWidth >= 640) {
            historyCards.style.gridTemplateColumns = 'repeat(4, 1fr)';
          } else {
            historyCards.style.gridTemplateColumns = 'repeat(2, 1fr)';
          }
        }
      };
      window.addEventListener('resize', updateGrid);
      historyCards.dataset.resizeListenerAdded = 'true';
    }
    
    console.log('Successfully loaded and displayed points history');
    
  } catch (error) {
    console.error('Error loading points history:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      programName: programName
    });
    historyCards.style.display = 'none';
  }
}

// Calculate value function
function calculateValue() {
  const programSelect = document.getElementById('bs-calculator-program');
  const milesInput = document.getElementById('bs-calculator-miles');
  const costPer1000Input = document.getElementById('bs-calculator-cost-per-1000');
  const cashPriceInput = document.getElementById('bs-calculator-cash-price');
  const taxesInput = document.getElementById('bs-calculator-taxes');
  const multiplierInput = document.getElementById('bs-calculator-multiplier');
  const resultsDiv = document.getElementById('bs-calculator-results');
  const resultsContent = document.getElementById('bs-calculator-results-content');
  
  if (!programSelect || !milesInput || !resultsDiv || !resultsContent) return;
  
  const milesAmount = parseFloat(milesInput.value) || 0;
  if (milesAmount <= 0) {
    alert('Please enter a valid miles/points amount');
    return;
  }
  
  const selectedOption = programSelect.options[programSelect.selectedIndex];
  const selectedProgramPointValue = parseFloat(selectedOption.dataset.pointValue) || 0.019;
  const costPer1000Miles = parseFloat(costPer1000Input.value) || 0;
  const cashPrice = parseFloat(cashPriceInput.value) || 0;
  const taxesFees = parseFloat(taxesInput.value) || 0;
  const milesMultiplier = parseFloat(multiplierInput.value) || 0;
  
  // Calculate points value based on cost or program value
  const isZeroCostMiles = costPer1000Miles === 0;
  const pointValueToUse = isZeroCostMiles ? selectedProgramPointValue : 
    (costPer1000Miles ? costPer1000Miles / 1000 : selectedProgramPointValue);
  
  // Calculate the total cost in points
  const pointsValue = isZeroCostMiles ? 0 : (milesAmount * pointValueToUse);
  
  // Calculate miles earned from cash price and taxes
  const milesEarned = milesMultiplier > 0 ? cashPrice * milesMultiplier : 0;
  const milesEarnedValue = milesEarned * selectedProgramPointValue;
  
  const milesEarnedFromTaxes = milesMultiplier > 0 ? taxesFees * milesMultiplier : 0;
  const milesEarnedFromTaxesValue = milesEarnedFromTaxes * selectedProgramPointValue;
  
  // Calculate effective prices
  const effectiveCashPrice = cashPrice - milesEarnedValue;
  const effectivePointsPrice = pointsValue + taxesFees - milesEarnedFromTaxesValue;
  
  // Calculate value per point based on cash price saved
  const cashPriceSaved = cashPrice > 0 ? cashPrice : pointsValue;
  const valuePerPoint = milesAmount > 0 ? cashPriceSaved / milesAmount : pointValueToUse;
  
  // Calculate savings percentage
  const totalSavings = effectiveCashPrice - effectivePointsPrice;
  const savingsPercent = effectiveCashPrice > 0 ? 
    (totalSavings / effectiveCashPrice) * 100 : 0;
  
  const isGoodValue = isZeroCostMiles || valuePerPoint >= pointValueToUse;
  
  // Generate recommendation
  let recommendation = '';
  if (isZeroCostMiles) {
    recommendation = `Points have zero acquisition cost. Total value is $${pointsValue.toFixed(2)}.`;
  } else if (cashPrice === 0 && taxesFees === 0) {
    recommendation = `Points value calculation: ${(valuePerPoint * 100).toFixed(2)} cents per point, total value $${pointsValue.toFixed(2)}.`;
  } else if (cashPrice > 0) {
    const costBasis = costPer1000Miles
      ? `your cost of ${(pointValueToUse * 100).toFixed(2)} cents per point`
      : `the standard ${(selectedProgramPointValue * 100).toFixed(2)} cents per point`;
    
    if (milesMultiplier === 0) {
      recommendation = `No points earning on cash purchase. You're getting ${(valuePerPoint * 100).toFixed(2)} cents per point value vs ${costBasis}.`;
    } else if (valuePerPoint >= pointValueToUse * 1.5) {
      recommendation = `Excellent redemption value! You're getting ${(valuePerPoint * 100).toFixed(2)} cents per point, well above ${costBasis}.`;
    } else if (valuePerPoint >= pointValueToUse) {
      recommendation = `Good redemption value. You're getting ${(valuePerPoint * 100).toFixed(2)} cents per point, above ${costBasis}.`;
    } else {
      recommendation = `Consider paying cash. You're only getting ${(valuePerPoint * 100).toFixed(2)} cents per point, below ${costBasis}.`;
    }
  } else {
    const valueDescription = costPer1000Miles
      ? `your cost of ${(pointValueToUse * 100).toFixed(2)} cents per point`
      : `standard valuation of ${(selectedProgramPointValue * 100).toFixed(2)} cents per point`;
    recommendation = `Using ${valueDescription}.`;
  }
  
  // Build results HTML with modern styling
  let html = '<div style="display: grid; gap: 16px;">';
  
  // Points Value
  html += `<div style="padding: 16px; background: white; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="font-weight: 600; margin-bottom: 8px; color: #374151; font-size: 14px;">Points Value</div>
    <div style="font-size: 28px; font-weight: 700; color: #2563eb; margin-bottom: 4px;">$${pointsValue.toFixed(2)}</div>
    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${milesAmount.toLocaleString()} points × ${(pointValueToUse * 100).toFixed(2)}¢/point</div>
  </div>`;
  
  // Purchase Cost (if applicable)
  const purchaseCost = costPer1000Miles > 0 ? (milesAmount / 1000) * costPer1000Miles : 0;
  if (purchaseCost > 0) {
    html += `<div style="padding: 16px; background: white; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="font-weight: 600; margin-bottom: 8px; color: #374151; font-size: 14px;">Purchase Cost</div>
      <div style="font-size: 22px; font-weight: 700; color: #f59e0b;">$${purchaseCost.toFixed(2)}</div>
    </div>`;
  }
  
  // Effective Points Price
  html += `<div style="padding: 16px; background: white; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="font-weight: 600; margin-bottom: 8px; color: #374151; font-size: 14px;">Effective Points Price</div>
    <div style="font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 4px;">$${effectivePointsPrice.toFixed(2)}</div>
    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Points value + Taxes${milesEarnedFromTaxesValue > 0 ? ` - Miles earned from taxes ($${milesEarnedFromTaxesValue.toFixed(2)})` : ''}</div>
  </div>`;
  
  // Miles Earned (if multiplier provided)
  if (milesMultiplier > 0 && cashPrice > 0) {
    html += `<div style="padding: 16px; background: linear-gradient(to right, #dbeafe, #e0f2fe); border-radius: 12px; border: 1px solid #93c5fd; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="font-weight: 600; margin-bottom: 8px; color: #1e40af; font-size: 14px;">Miles Earned from Cash Purchase</div>
      <div style="font-size: 22px; font-weight: 700; color: #1e40af; margin-bottom: 4px;">${milesEarned.toLocaleString()} miles ($${milesEarnedValue.toFixed(2)} value)</div>
      <div style="font-size: 12px; color: #1e40af; margin-top: 4px; opacity: 0.8;">${cashPrice.toFixed(2)} × ${milesMultiplier}x multiplier</div>
    </div>`;
  }
  
  // Effective Cash Price (if cash price provided)
  if (cashPrice > 0) {
    html += `<div style="padding: 16px; background: white; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="font-weight: 600; margin-bottom: 8px; color: #374151; font-size: 14px;">Effective Cash Price</div>
      <div style="font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 4px;">$${effectiveCashPrice.toFixed(2)}</div>
      <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Cash price${milesEarnedValue > 0 ? ` - Miles earned value ($${milesEarnedValue.toFixed(2)})` : ''}</div>
    </div>`;
  }
  
  // Savings/Value Comparison
  if (cashPrice > 0) {
    const isGoodDeal = totalSavings > 0;
    html += `<div style="padding: 16px; background: ${isGoodDeal ? 'linear-gradient(to right, #dcfce7, #d1fae5)' : 'linear-gradient(to right, #fee2e2, #fecaca)'}; border-radius: 12px; border: 1px solid ${isGoodDeal ? '#4ade80' : '#f87171'}; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="font-weight: 600; margin-bottom: 8px; color: ${isGoodDeal ? '#14532d' : '#991b1b'}; font-size: 14px;">
        ${isGoodDeal ? 'Savings' : 'Additional Cost'}
      </div>
      <div style="font-size: 32px; font-weight: 700; color: ${isGoodDeal ? '#14532d' : '#991b1b'}; margin-bottom: 4px;">
        ${isGoodDeal ? '+' : ''}$${Math.abs(totalSavings).toFixed(2)}
      </div>
      <div style="font-size: 14px; color: ${isGoodDeal ? '#14532d' : '#991b1b'}; margin-top: 4px; opacity: 0.9;">
        ${Math.abs(savingsPercent).toFixed(1)}% ${isGoodDeal ? 'savings' : 'more expensive'} vs effective cash price
      </div>
    </div>`;
    
    html += `<div style="padding: 16px; background: white; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="font-weight: 600; margin-bottom: 8px; color: #374151; font-size: 14px;">Value per Point</div>
      <div style="font-size: 22px; font-weight: 700; color: #2563eb; margin-bottom: 4px;">${(valuePerPoint * 100).toFixed(2)}¢</div>
      <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Based on cash price</div>
    </div>`;
  }
  
  // Recommendation
  html += `<div style="padding: 16px; background: ${isGoodValue ? 'linear-gradient(to right, #dcfce7, #d1fae5)' : 'linear-gradient(to right, #fef3c7, #fde68a)'}; border-radius: 12px; border: 1px solid ${isGoodValue ? '#4ade80' : '#fbbf24'}; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="font-weight: 600; margin-bottom: 8px; color: ${isGoodValue ? '#14532d' : '#92400e'}; font-size: 14px;">Recommendation</div>
    <div style="font-size: 14px; color: ${isGoodValue ? '#14532d' : '#92400e'}; line-height: 1.6;">${recommendation}</div>
  </div>`;
  
  html += '</div>';
  
  const placeholder = document.getElementById('bs-calculator-results-placeholder');
  const contentWrapper = document.getElementById('bs-calculator-results-content-wrapper');
  
  resultsContent.innerHTML = html;
  
  if (placeholder && contentWrapper) {
    placeholder.style.display = 'none';
    contentWrapper.style.display = 'block';
  }
  
  resultsDiv.style.display = 'block';
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

// Sync CASM cash price to Award Flight Analysis inputs
function syncCashPriceToAwardAnalysis() {
  const casmCashInput = document.getElementById('bs-casm-cash-price');
  if (!casmCashInput) return;

  const casmCashPrice = casmCashInput.value.trim();
  
  // Only sync if there's a value
  if (!casmCashPrice) return;
  
  // Sync to global programs panel cash price input
  const globalCashInput = document.getElementById('bs-cash-price-input');
  if (globalCashInput) {
    globalCashInput.value = casmCashPrice;
    // Trigger both input and change events to ensure the panel updates
    globalCashInput.dispatchEvent(new Event('input', { bubbles: true }));
    globalCashInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Sync to standalone award section cash price input
  const standaloneCashInput = document.getElementById('bs-standalone-cash-price');
  if (standaloneCashInput) {
    standaloneCashInput.value = casmCashPrice;
    // Trigger input event which should trigger the update (debounced)
    standaloneCashInput.dispatchEvent(new Event('input', { bubbles: true }));
    // Also trigger change event to ensure immediate update
    standaloneCashInput.dispatchEvent(new Event('change', { bubbles: true }));
    // Also try to call the update function directly if available
    setTimeout(() => {
      if (typeof window.updateStandaloneAwardResults === 'function') {
        window.updateStandaloneAwardResults();
      } else if (typeof updateStandaloneAwardResults === 'function') {
        updateStandaloneAwardResults();
      }
    }, 150);
  }
}

// Initialize CASM Calculator
function initializeCASMCalculator() {
  const casmToggle = document.getElementById('bs-casm-toggle');
  const casmCalculator = document.getElementById('bs-casm-calculator');
  const airlineSelect = document.getElementById('bs-casm-airline');
  const distanceInput = document.getElementById('bs-casm-distance');
  const cashPriceInput = document.getElementById('bs-casm-cash-price');
  const resultsDiv = document.getElementById('bs-casm-results');

  if (!casmToggle || !casmCalculator) return;

  // Populate airline dropdown
  if (airlineSelect && window.getAirlinesList) {
    const airlines = window.getAirlinesList();
    airlines.forEach(airline => {
      const casm = window.getAirlineCASM(airline);
      if (casm) {
        const option = document.createElement('option');
        option.value = airline;
        option.textContent = `${airline} (CASM: ${casm.toFixed(1)}¢)`;
        airlineSelect.appendChild(option);
      }
    });
  }

  // Toggle CASM calculator visibility
  const savedCasmState = localStorage.getItem('bs-casm-enabled');
  if (savedCasmState !== null) {
    casmToggle.checked = savedCasmState === 'true';
    casmCalculator.style.display = casmToggle.checked ? 'block' : 'none';
  }

  casmToggle.addEventListener('change', () => {
    localStorage.setItem('bs-casm-enabled', casmToggle.checked);
    casmCalculator.style.display = casmToggle.checked ? 'block' : 'none';
    
    if (casmToggle.checked) {
      // Try to auto-fill from URL or inputs
      autoFillCASMFromURL();
    }
  });

  // Removed manual calculate distance button (auto-filled from URL or inputs)

  // Get baggage inputs
  const regionSelect = document.getElementById('bs-casm-region');
  const bagsInput = document.getElementById('bs-casm-bags');
  const bagFeeInput = document.getElementById('bs-casm-bag-fee');

  // Auto-calculate when inputs change
  if (distanceInput) {
    distanceInput.addEventListener('input', calculateCASM);
    distanceInput.addEventListener('change', calculateCASM);
  }

  if (airlineSelect) {
    airlineSelect.addEventListener('change', calculateCASM);
  }

  if (cashPriceInput) {
    cashPriceInput.addEventListener('input', () => {
      calculateCASM();
      syncCashPriceToAwardAnalysis();
    });
    cashPriceInput.addEventListener('change', () => {
      calculateCASM();
      syncCashPriceToAwardAnalysis();
    });
    cashPriceInput.addEventListener('blur', () => {
      syncCashPriceToAwardAnalysis();
    });
  }

  if (regionSelect) {
    regionSelect.addEventListener('change', calculateCASM);
  }

  if (bagsInput) {
    bagsInput.addEventListener('input', calculateCASM);
    bagsInput.addEventListener('change', calculateCASM);
  }

  if (bagFeeInput) {
    bagFeeInput.addEventListener('input', calculateCASM);
    bagFeeInput.addEventListener('change', calculateCASM);
  }

  // Calculate CASM with baggage costs
  function calculateCASM() {
    if (!resultsDiv) return;

    const distance = parseFloat(distanceInput?.value) || 0;
    const airline = airlineSelect?.value || '';
    const cashPrice = parseFloat(cashPriceInput?.value) || 0;
    const region = regionSelect?.value || 'Europe';
    const bags = Math.max(0, parseFloat(bagsInput?.value) || 0);
    const bagFee = parseFloat(bagFeeInput?.value) || 0;

    if (!distance || !airline) {
      resultsDiv.style.display = 'none';
      return;
    }

    const casm = window.getAirlineCASM(airline);
    if (!casm) {
      resultsDiv.style.display = 'none';
      return;
    }

    // Calculate CASM-based cost (convert cents to dollars)
    const casmCost = (casm * distance) / 100;

    // Calculate baggage expected cost
    const expectedBagCostPerBag = window.getExpectedBagCostPerBag ? window.getExpectedBagCostPerBag(region) : 7.75;
    const bagExpectedCostTotal = bags * expectedBagCostPerBag;

    // Total operating cost = CASM + baggage
    const totalOperatingCost = casmCost + bagExpectedCostTotal;

    // Bag revenue if bag fee provided
    const bagRevenue = bags * bagFee;

    // Calculate margin (including bag revenue if provided)
    const totalRevenue = cashPrice + bagRevenue;
    const margin = totalRevenue > 0 ? totalRevenue - totalOperatingCost : (cashPrice > 0 ? cashPrice - totalOperatingCost : null);
    const marginPct = totalRevenue > 0 && margin !== null ? ((margin / totalRevenue) * 100).toFixed(1) : null;

    // Update display
    const costEl = document.getElementById('bs-casm-cost');
    const bagCostEl = document.getElementById('bs-casm-bag-cost');
    const totalCostEl = document.getElementById('bs-casm-total-cost');
    const cashEl = document.getElementById('bs-casm-cash-display');
    const marginEl = document.getElementById('bs-casm-margin');
    const marginPctEl = document.getElementById('bs-casm-margin-pct');

    if (costEl) costEl.textContent = `$${casmCost.toFixed(2)}`;
    if (bagCostEl) bagCostEl.textContent = `$${bagExpectedCostTotal.toFixed(2)}`;
    if (totalCostEl) totalCostEl.textContent = `$${totalOperatingCost.toFixed(2)}`;
    if (cashEl) cashEl.textContent = cashPrice > 0 ? `$${cashPrice.toFixed(2)}` : '—';

    // Calculate and display margin
    if (margin !== null) {
      if (marginEl) {
        marginEl.textContent = `$${margin.toFixed(2)}`;
        marginEl.style.color = margin >= 0 ? '#4caf50' : '#f44336';
      }
      if (marginPctEl && marginPct !== null) {
        marginPctEl.textContent = `(${margin >= 0 ? '+' : ''}${marginPct}%)`;
        marginPctEl.style.color = margin >= 0 ? '#4caf50' : '#f44336';
      }
    } else {
      if (marginEl) {
        marginEl.textContent = '$0.00';
        marginEl.style.color = '#666';
      }
      if (marginPctEl) {
        marginPctEl.textContent = '(0%)';
        marginPctEl.style.color = '#666';
      }
    }

    resultsDiv.style.display = 'block';
  }

  // Auto-fill from URL
  async function autoFillCASMFromURL() {
    // First try URL
    const urlAirports = extractAirportsFromURL();
    if (urlAirports.from && urlAirports.to) {
      const distance = await calculateDistanceBetweenAirports(urlAirports.from, urlAirports.to);
      if (distance !== null && distanceInput) {
        distanceInput.value = distance.toFixed(1);
      }
    } else {
      // Fallback to form inputs
      const flightData = getFlightInputData();
      if (flightData.from && flightData.to) {
        const distance = await calculateDistanceBetweenAirports(flightData.from, flightData.to);
        if (distance !== null && distanceInput) {
          distanceInput.value = distance.toFixed(1);
        }
      }
    }

    calculateCASM();
  }

  // Auto-fill on load if enabled
  if (casmToggle.checked) {
    setTimeout(autoFillCASMFromURL, 500);
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
  
  if (savedData.currency) {
    const currencyInput = document.getElementById('bs-flight-currency');
    if (currencyInput) currencyInput.value = savedData.currency;
  }
  
  if (savedData.location) {
    const locationInput = document.getElementById('bs-flight-location');
    if (locationInput) locationInput.value = savedData.location;
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
    location: document.getElementById('bs-flight-location')?.value || 'US'
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
    'google-flights': `https://www.google.com/travel/flights/search?q=flights+from+${from}+to+${to}+${ret ? depart+'+to+'+ret : 'oneway+on+'+depart}+${cabin}+class+nonstop&hl=${language}&curr=${currency}&gl=${location}+tfu=EgYIAxAAGAA`,
    
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
    
    'pointsyeah-seatmap': data.airline && data.flightNumber ? `https://www.pointsyeah.com/seatmap/detail?airline=${encodeURIComponent(data.airline)}&departure=${from}&arrival=${to}&date=${depart}&flightNumber=${encodeURIComponent(data.flightNumber)}&cabins=Economy%2CPremium%20Economy%2CBusiness%2CFirst` : '#',
    
    'seats-aero-seatmap': data.airline && data.flightNumber ? `https://seats.aero/seatmap?airline=${encodeURIComponent(data.airline)}&from=${from}&to=${to}&date=${depart}&flight=${encodeURIComponent(data.flightNumber)}&stops=0` : '#'
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

