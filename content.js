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
    <!-- Icon Logo with Section Toggles -->
    <div class="bs-logo-container" id="bs-logo-container">
      <div class="bs-logo-header">
        <a href="https://tools.benefitsystems.io" target="_blank" class="bs-logo-link">
          <img src="${chrome.runtime.getURL('icon128.png')}" alt="Extension Icon" class="bs-logo" />
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
            <label class="bs-toggle-label" for="bs-calculation-toggle">Calculation</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-calculation-toggle">
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
              <input type="checkbox" id="bs-auto-reload-toggle">
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
      <div class="bs-section" id="bs-casm-calculator" style="display: none;">
        <div class="bs-section-header">
          <svg class="bs-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-3.14 3.14-8.24 0-11.38a3.37 3.37 0 0 0-2.61-.94A3.37 3.37 0 0 0 6.13 3H2v4.13a3.37 3.37 0 0 0 .94 2.61c3.14 3.14 8.24 3.14 11.38 0a3.37 3.37 0 0 0 .94-2.61V9"/>
          </svg>
          <span>CASM Calculator</span>
        </div>
        
        <!-- Input Controls - all in one row -->
        <div class="bs-inputs-grid">
          <div class="bs-input-group">
            <label>Distance</label>
            <input type="number" id="bs-casm-distance" placeholder="Auto" step="0.1" min="0" />
          </div>
          
          <div class="bs-input-group">
            <label>Airline</label>
            <select id="bs-casm-airline">
              <option value="">Select</option>
            </select>
          </div>
          
          <div class="bs-input-group">
            <label>Cash</label>
            <input type="number" id="bs-casm-cash-price" placeholder="Price" step="0.01" min="0" />
          </div>

          <div class="bs-input-group">
            <label>Region</label>
            <select id="bs-casm-region">
              <option value="North America">North America</option>
              <option value="Europe" selected>Europe</option>
              <option value="Asia–Pacific">Asia–Pacific</option>
              <option value="Latin America">Latin America</option>
              <option value="Middle East & Africa">Middle East & Africa</option>
            </select>
          </div>

          <div class="bs-input-group">
            <label>Check-In Bags</label>
            <input type="number" id="bs-casm-bags" placeholder="0" min="0" value="0" />
          </div>

          <div class="bs-input-group">
            <label>Bag Fee</label>
            <input type="number" id="bs-casm-bag-fee" placeholder="0" step="0.01" min="0" />
          </div>
        </div>

        <!-- Results Row -->
        <div class="bs-casm-results-row" id="bs-casm-results" style="display: none;">
          <div class="bs-casm-results-grid">
            <div class="bs-casm-result-item">
              <div class="bs-casm-result-label">CASM Cost</div>
              <div class="bs-casm-result-value" id="bs-casm-cost"></div>
            </div>
            <div class="bs-casm-result-item">
              <div class="bs-casm-result-label">Cash</div>
              <div class="bs-casm-result-value" id="bs-casm-cash-display"></div>
            </div>
            <div class="bs-casm-result-item bs-casm-result-margin">
              <div class="bs-casm-result-label">Margin</div>
              <div class="bs-casm-result-value" id="bs-casm-margin"></div>
            </div>
            <div class="bs-casm-result-item">
              <div class="bs-casm-result-label">Bag Cost</div>
              <div class="bs-casm-result-value" id="bs-casm-bag-cost"></div>
            </div>
            <div class="bs-casm-result-item bs-casm-result-total">
              <div class="bs-casm-result-label">Total Cost</div>
              <div class="bs-casm-result-value" id="bs-casm-total-cost"></div>
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
          <div class="bs-auto-reload-toggle">
            <label class="bs-toggle-label" for="bs-hotel-benefits-toggle">Hotel Benefits</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-hotel-benefits-toggle">
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

      <!-- Hotel Benefits Subsection -->
      <div class="bs-hotel-subsection" id="bs-hotel-benefits-section" style="display: none;">
        <div class="bs-hotel-benefits-content">
          <div class="bs-subsection-header">
            <div class="bs-subsection-header-content">
              <svg class="bs-subsection-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <div>
                <h3>Hotel Benefits</h3>
                <p class="bs-subsection-description">Compare hotel loyalty program benefits and status levels</p>
              </div>
            </div>
          </div>

          <div class="bs-hotel-benefits-container">
            <!-- Filter Bar -->
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

              <!-- Search Bar -->
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

              <!-- Quick Filter Buttons -->
              <div class="bs-hotel-benefits-quick-filters" id="bs-hotel-benefits-quick-filters">
                <!-- Quick filter buttons will be populated by JavaScript -->
              </div>

              <!-- Status Level Selectors (collapsible) -->
              <div class="bs-hotel-benefits-status-section" id="bs-hotel-benefits-status-section" style="display: none;">
                <h5>Set Current Status Levels</h5>
                <div class="bs-hotel-benefits-status-grid" id="bs-hotel-benefits-status-grid">
                  <!-- Status selectors will be populated by JavaScript -->
                </div>
              </div>
            </div>

            <!-- Benefits Table -->
            <div class="bs-hotel-benefits-table-container" id="bs-hotel-benefits-table-container">
              <!-- Benefits table will be populated by JavaScript -->
            </div>
          </div>
        </div>
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
            <div class="bs-auto-reload-toggle">
              <label class="bs-toggle-label" for="bs-info-points-toggle">Points Tracker</label>
              <label class="bs-toggle-switch">
                <input type="checkbox" id="bs-info-points-toggle" checked>
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

    <!-- Calculation Section -->
    <div class="bs-section" id="bs-calculation-section" style="display: none;">
      <div class="bs-section-header">
        <svg class="bs-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="9" y1="3" x2="9" y2="21"/>
          <line x1="15" y1="3" x2="15" y2="21"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="3" y1="15" x2="21" y2="15"/>
        </svg>
        <span>Calculation</span>
        <div class="bs-header-controls">
          <div class="bs-auto-reload-toggle">
            <label class="bs-toggle-label" for="bs-total-calculator-toggle">Total Calculator</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-total-calculator-toggle">
              <span class="bs-toggle-slider"></span>
            </label>
          </div>
          <div class="bs-auto-reload-toggle">
            <label class="bs-toggle-label" for="bs-rovemiles-toggle">Rovemiles</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-rovemiles-toggle">
              <span class="bs-toggle-slider"></span>
            </label>
          </div>
          <div class="bs-auto-reload-toggle">
            <label class="bs-toggle-label" for="bs-hyatt-calculator-toggle">Hyatt Calculator</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-hyatt-calculator-toggle">
              <span class="bs-toggle-slider"></span>
            </label>
          </div>
          <div class="bs-auto-reload-toggle">
            <label class="bs-toggle-label" for="bs-hilton-calculator-toggle">Hilton Calculator</label>
            <label class="bs-toggle-switch">
              <input type="checkbox" id="bs-hilton-calculator-toggle">
              <span class="bs-toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Total Calculator Subsection -->
      <div class="bs-calculation-subsection" id="bs-total-calculator-section">
        <div class="bs-calculator-card">
          <div class="bs-calculator-header bs-calculator-header-yellow">
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
                <h2 class="bs-calculator-title">Total Value Calculator</h2>
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
            <form id="bs-total-calculator-form" class="bs-calculator-form">
              <div class="bs-form-section">
                <div class="bs-form-section-header">
                  <svg class="bs-form-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                    <line x1="2" x2="22" y1="10" y2="10"></line>
                  </svg>
                  <h3 class="bs-form-section-title">Loyalty Program</h3>
                </div>
                <div class="bs-form-program-wrapper">
                  <div class="bs-form-program-select-wrapper">
                    <select id="bs-calc-program" class="bs-form-program-select" required>
                      <optgroup label="💳 Credit Card Programs"></optgroup>
                      <optgroup label="✈️ Airlines"></optgroup>
                      <optgroup label="🏨 Hotels"></optgroup>
                    </select>
                    <button type="button" class="bs-form-favorite-btn" title="Add to favorites">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    </button>
                  </div>
                  <div class="bs-form-historical-grid">
                    <div class="bs-form-historical-card">
                      <div class="bs-form-historical-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                          <polyline points="16 7 22 7 22 13"></polyline>
                        </svg>
                        <span class="bs-form-historical-label">Current</span>
                      </div>
                      <span class="bs-form-historical-value" id="bs-calc-historical-current">$-</span>
                    </div>
                    <div class="bs-form-historical-card">
                      <span class="bs-form-historical-label">6-Month Avg</span>
                      <span class="bs-form-historical-value" id="bs-calc-historical-6m">$-</span>
                    </div>
                    <div class="bs-form-historical-card">
                      <span class="bs-form-historical-label">12-Month Avg</span>
                      <span class="bs-form-historical-value" id="bs-calc-historical-12m">$-</span>
                    </div>
                    <div class="bs-form-historical-card">
                      <span class="bs-form-historical-label">24-Month Avg</span>
                      <span class="bs-form-historical-value" id="bs-calc-historical-24m">$-</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bs-form-section">
                <div class="bs-form-section-header">
                  <svg class="bs-form-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                  <h3 class="bs-form-section-title">Calculation Parameters</h3>
                </div>
                <div class="bs-form-params-grid">
                  <div class="bs-form-params-group">
                    <div class="bs-form-params-card">
                      <h4 class="bs-form-params-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>
                        </svg>
                        Points & Miles
                      </h4>
                      <div class="bs-form-params-fields">
                        <div class="bs-form-group">
                          <label for="bs-calc-miles">Points/Miles Amount <span class="bs-required">*</span></label>
                          <input type="number" id="bs-calc-miles" min="0" placeholder="0" required class="bs-form-input-right">
                        </div>
                        <div class="bs-form-group">
                          <label for="bs-calc-cost-per-1000">Cost per 1,000 Points ($)</label>
                          <input type="number" id="bs-calc-cost-per-1000" step="0.01" min="0" placeholder="0.00" class="bs-form-input-right">
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="bs-form-params-group">
                    <div class="bs-form-params-card">
                      <h4 class="bs-form-params-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="12" x2="12" y1="2" y2="22"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        Cash & Fees
                      </h4>
                      <div class="bs-form-params-fields">
                        <div class="bs-form-group">
                          <label for="bs-calc-cash-price">Cash Price ($)</label>
                          <input type="number" id="bs-calc-cash-price" step="0.01" min="0" placeholder="0.00" class="bs-form-input-right">
                        </div>
                        <div class="bs-form-group">
                          <label for="bs-calc-taxes-fees">Taxes & Fees ($)</label>
                          <input type="number" id="bs-calc-taxes-fees" step="0.01" min="0" placeholder="0.00" class="bs-form-input-right">
                        </div>
                        <div class="bs-form-group">
                          <label for="bs-calc-multiplier">Credit Card Multiplier</label>
                          <input type="number" id="bs-calc-multiplier" step="0.1" min="0" placeholder="0.0" class="bs-form-input-right">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bs-form-actions">
                <div class="bs-form-actions-center">
                  <button type="button" id="bs-calc-reset" class="bs-btn-reset">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                      <path d="M3 3v5h5"></path>
                    </svg>
                    Reset Form
                  </button>
                </div>
                <div class="bs-form-actions-buttons">
                  <button type="button" class="bs-btn-currency">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" x2="12" y1="2" y2="22"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    Currency Converter
                  </button>
                  <button type="submit" class="bs-btn-calculate">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
          <div id="bs-total-calculator-results" class="bs-calculator-results-card" style="display: none;">
            <!-- Results will be populated here -->
          </div>
          </div>
        </div>
      </div>

      <!-- Rovemiles Subsection -->
      <div class="bs-calculation-subsection" id="bs-rovemiles-section" style="display: none;">
      <div class="bs-calculator-content">
        <div class="bs-subsection-header">
          <div class="bs-subsection-header-content">
            <svg class="bs-subsection-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <div>
              <h3>Rovemiles Calculator</h3>
              <p class="bs-subsection-description">Calculate total cashback value from Rovemiles bookings</p>
            </div>
          </div>
        </div>
          <form id="bs-rovemiles-form" class="bs-calculator-form">
            <div class="bs-rovemiles-form-grid">
              <!-- Booking Information -->
            <div class="bs-form-card bs-form-card-blue">
              <div class="bs-form-card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>Booking Information</span>
              </div>
                <div class="bs-form-group">
                  <label for="bs-rove-total-cost">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Total Cost (USD) <span class="bs-required">*</span>
                  </label>
                  <div class="bs-input-wrapper">
                    <span class="bs-input-prefix">$</span>
                    <input type="text" id="bs-rove-total-cost" placeholder="800.00" required>
                  </div>
                </div>
                <div class="bs-form-group">
                  <label for="bs-rove-cash-price">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Cash Price (USD)
                  </label>
                  <div class="bs-input-wrapper">
                    <span class="bs-input-prefix">$</span>
                    <input type="text" id="bs-rove-cash-price" placeholder="350.00">
                  </div>
                  <div class="bs-input-hint">Optional: For indirect cost calculation</div>
              </div>
              <div class="bs-form-group">
                <label for="bs-rove-miles">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                    Rovemiles Earned <span class="bs-required">*</span>
                </label>
                <div class="bs-input-wrapper">
                    <input type="text" id="bs-rove-miles" placeholder="28000" required>
                  <span class="bs-input-suffix">miles</span>
                </div>
              </div>
            </div>

              <!-- Credit Card Settings -->
            <div class="bs-form-card bs-form-card-purple">
              <div class="bs-form-card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <span>Credit Card Settings</span>
              </div>
                <div class="bs-form-group">
                  <label for="bs-rove-program">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Credit Card Program
                  </label>
                  <select id="bs-rove-program"></select>
                </div>
                <div class="bs-form-group">
                  <label for="bs-rove-multiplier">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    Credit Card Multiplier
                  </label>
                  <div class="bs-input-wrapper">
                    <input type="text" id="bs-rove-multiplier" placeholder="1.0">
                    <span class="bs-input-suffix">x</span>
                  </div>
                  <div class="bs-input-hint">Earning rate per $1 spent</div>
              </div>
              <div class="bs-form-group">
                <label for="bs-rove-program-value">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                    Program Value (USD)
                </label>
                <div class="bs-input-wrapper">
                  <span class="bs-input-prefix">$</span>
                  <input type="text" id="bs-rove-program-value" placeholder="0.0000">
                </div>
                <div class="bs-input-hint">Optional: Override program value</div>
              </div>
            </div>

              <!-- Valuation Settings -->
            <div class="bs-form-card bs-form-card-amber">
              <div class="bs-form-card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <span>Valuation Settings</span>
              </div>
              <div class="bs-form-group">
                <label for="bs-rove-cpm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  Rove Miles CPM (USD) <span class="bs-required">*</span>
                </label>
                <div class="bs-input-wrapper">
                  <span class="bs-input-prefix">$</span>
                    <input type="text" id="bs-rove-cpm" placeholder="0.0195" required>
                </div>
                  <div class="bs-input-hint">Cost per mile for Rove Miles</div>
                </div>
              </div>
            </div>

            <div class="bs-form-actions">
              <button type="button" id="bs-rove-reset" class="bs-btn-secondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                Reset All Fields
              </button>
            </div>
          </form>
          <div id="bs-rovemiles-results" class="bs-rovemiles-results">
            <!-- Results will be populated here -->
          </div>
        </div>
      </div>

      <!-- Hyatt Calculator Subsection -->
      <div class="bs-calculation-subsection" id="bs-hyatt-calculator-section" style="display: none;">
        <div class="bs-calculator-content">
          <div class="bs-subsection-header">
            <div class="bs-subsection-header-content">
              <svg class="bs-subsection-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <div>
                <h3>Hyatt Points Calculator</h3>
                <p class="bs-subsection-description">Calculate World of Hyatt points earning, value, and redemption</p>
              </div>
            </div>
          </div>

          <div class="bs-hyatt-calculator">
            <!-- Points Earning Calculator -->
            <div class="bs-hyatt-section">
              <div class="bs-hyatt-section-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="16" height="20" x="4" y="2" rx="2"/>
                  <line x1="8" x2="16" y1="6" y2="6"/>
                </svg>
                <h4>Points Earning Calculator</h4>
              </div>
              <div class="bs-hyatt-form-card">
                <div class="bs-form-row">
                  <div class="bs-form-group">
                    <label for="bs-hyatt-base-cost">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                      Hotel Base Cost (USD) <span class="bs-required">*</span>
                    </label>
                    <div class="bs-input-wrapper">
                      <span class="bs-input-prefix">$</span>
                      <input type="number" id="bs-hyatt-base-cost" step="0.01" min="0" placeholder="0.00">
                    </div>
                  </div>
                  <div class="bs-form-group">
                    <label for="bs-hyatt-taxes-fees">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                      Taxes & Fees (USD)
                    </label>
                    <div class="bs-input-wrapper">
                      <span class="bs-input-prefix">$</span>
                      <input type="number" id="bs-hyatt-taxes-fees" step="0.01" min="0" placeholder="0.00">
                    </div>
                  </div>
                </div>
                <div class="bs-form-row">
                  <div class="bs-form-group">
                    <label for="bs-hyatt-elite-status">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      World of Hyatt Status
                    </label>
                    <select id="bs-hyatt-elite-status">
                      <option value="0">Member (No Bonus)</option>
                      <option value="0.10">Discoverist (10% bonus)</option>
                      <option value="0.20">Explorist (20% bonus)</option>
                      <option value="0.30">Globalist (30% bonus)</option>
                    </select>
                  </div>
                  <div class="bs-form-group">
                    <label for="bs-hyatt-credit-card">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                      Hyatt Credit Card
                    </label>
                    <select id="bs-hyatt-credit-card">
                      <option value="0">No Hyatt Credit Card</option>
                      <option value="4">Personal - World of Hyatt Card (4X points)</option>
                      <option value="4">Business - World of Hyatt Card (4X points)</option>
                    </select>
                  </div>
                </div>
                <div class="bs-hyatt-results-card">
                  <div class="bs-hyatt-result-item">
                    <span class="bs-hyatt-result-label">Total Points Earned</span>
                    <span class="bs-hyatt-result-value" id="bs-hyatt-earned-points">0 Points</span>
                  </div>
                  <div class="bs-hyatt-result-item">
                    <span class="bs-hyatt-result-label">Value</span>
                    <span class="bs-hyatt-result-value" id="bs-hyatt-earned-value">$0.00</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Points Value Calculator -->
            <div class="bs-hyatt-section">
              <div class="bs-hyatt-section-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
                <h4>Points Value Calculator</h4>
              </div>
              <div class="bs-hyatt-form-card">
                <div class="bs-form-row">
                  <div class="bs-form-group">
                    <label for="bs-hyatt-category">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      </svg>
                      Hotel Category
                    </label>
                    <select id="bs-hyatt-category">
                      <option value="1">Category 1</option>
                      <option value="2">Category 2</option>
                      <option value="3">Category 3</option>
                      <option value="4">Category 4</option>
                      <option value="5">Category 5</option>
                      <option value="6">Category 6</option>
                      <option value="7">Category 7</option>
                      <option value="8">Category 8</option>
                    </select>
                  </div>
                  <div class="bs-form-group">
                    <label for="bs-hyatt-rate-type">Award Availability</label>
                    <div class="bs-hyatt-rate-buttons">
                      <button type="button" class="bs-hyatt-rate-btn" data-rate="offPeak">Off-Peak</button>
                      <button type="button" class="bs-hyatt-rate-btn active" data-rate="standard">Standard</button>
                      <button type="button" class="bs-hyatt-rate-btn" data-rate="peak">Peak</button>
                    </div>
                  </div>
                </div>
                <div class="bs-form-group">
                  <label for="bs-hyatt-points">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    </svg>
                    Number of Points
                  </label>
                  <input type="number" id="bs-hyatt-points" min="0" step="1000" placeholder="0">
                </div>
                <div class="bs-hyatt-results-grid">
                  <div class="bs-hyatt-result-card">
                    <span class="bs-hyatt-result-label">Points Value</span>
                    <span class="bs-hyatt-result-value" id="bs-hyatt-points-value">$0.00</span>
                    <span class="bs-hyatt-result-note" id="bs-hyatt-cents-per-point">0.00¢ per point</span>
                  </div>
                  <div class="bs-hyatt-result-card">
                    <span class="bs-hyatt-result-label">Free Nights</span>
                    <span class="bs-hyatt-result-value" id="bs-hyatt-free-nights">0 night(s)</span>
                    <span class="bs-hyatt-result-note" id="bs-hyatt-category-note">Category 1 (Standard)</span>
                  </div>
                  <div class="bs-hyatt-result-card" id="bs-hyatt-cashback-card" style="display: none;">
                    <span class="bs-hyatt-result-label">Cashback Equivalent</span>
                    <span class="bs-hyatt-result-value" id="bs-hyatt-cashback-percent">0.00%</span>
                    <span class="bs-hyatt-result-note" id="bs-hyatt-cashback-note">for $0.00</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Redemption Value Calculator -->
            <div class="bs-hyatt-section">
              <div class="bs-hyatt-section-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <h4>Redemption Value Calculator</h4>
              </div>
              <div class="bs-hyatt-form-card">
                <div class="bs-form-row">
                  <div class="bs-form-group">
                    <label for="bs-hyatt-redemption-points">Cost In Points</label>
                    <div class="bs-hyatt-input-row">
                      <input type="number" id="bs-hyatt-redemption-points" min="0" step="1000" placeholder="0">
                      <select id="bs-hyatt-stay-time-points">
                        <option value="stay">Entire Stay</option>
                        <option value="day">Per Day</option>
                      </select>
                    </div>
                  </div>
                  <div class="bs-form-group">
                    <label for="bs-hyatt-cash-cost">Cost In Cash</label>
                    <div class="bs-hyatt-input-row">
                      <div class="bs-input-wrapper">
                        <span class="bs-input-prefix">$</span>
                        <input type="number" id="bs-hyatt-cash-cost" step="0.01" min="0" placeholder="0.00">
                      </div>
                      <select id="bs-hyatt-stay-time-cash">
                        <option value="stay">Entire Stay</option>
                        <option value="day">Per Day</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="bs-form-group">
                  <label for="bs-hyatt-total-days">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" x2="16" y1="2" y2="6"/>
                      <line x1="8" x2="8" y1="2" y2="6"/>
                      <line x1="3" x2="21" y1="10" y2="10"/>
                    </svg>
                    Total Days
                  </label>
                  <div class="bs-input-wrapper">
                    <input type="number" id="bs-hyatt-total-days" min="1" step="1" value="1" placeholder="1">
                    <span class="bs-input-suffix">Days</span>
                  </div>
                </div>
                <div class="bs-hyatt-results-grid">
                  <div class="bs-hyatt-result-card">
                    <span class="bs-hyatt-result-label">Points Value</span>
                    <span class="bs-hyatt-result-value" id="bs-hyatt-redemption-value">0.00¢ per point</span>
                    <span class="bs-hyatt-result-note" id="bs-hyatt-redemption-note">$0.0000 per point</span>
                  </div>
                  <div class="bs-hyatt-result-card">
                    <span class="bs-hyatt-result-label">Future Booking Value</span>
                    <span class="bs-hyatt-result-value" id="bs-hyatt-future-value">$0.00</span>
                    <span class="bs-hyatt-result-note">Based on earned points from stay</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Hilton Calculator Subsection -->
      <div class="bs-calculation-subsection" id="bs-hilton-calculator-section" style="display: none;">
        <div class="bs-calculator-content">
          <div class="bs-subsection-header">
            <div class="bs-subsection-header-content">
              <svg class="bs-subsection-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <div>
                <h3>Hilton Points Calculator</h3>
                <p class="bs-subsection-description">Calculate Hilton Honors points earning, value, and redemption</p>
              </div>
            </div>
          </div>

          <div class="bs-hyatt-calculator">
            <!-- Points Earning Calculator -->
            <div class="bs-hyatt-section">
              <div class="bs-hyatt-section-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
                <h4>Points Earning Calculator</h4>
              </div>
              <div class="bs-hyatt-form-card">
                <div class="bs-form-row">
                  <div class="bs-form-group">
                    <label for="bs-hilton-base-cost">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                      Hotel Base Cost (USD) <span class="bs-required">*</span>
                    </label>
                    <div class="bs-input-wrapper">
                      <span class="bs-input-prefix">$</span>
                      <input type="number" id="bs-hilton-base-cost" step="0.01" min="0" placeholder="0.00">
                    </div>
                  </div>
                  <div class="bs-form-group">
                    <label for="bs-hilton-taxes-fees">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                      Taxes & Fees (USD)
                    </label>
                    <div class="bs-input-wrapper">
                      <span class="bs-input-prefix">$</span>
                      <input type="number" id="bs-hilton-taxes-fees" step="0.01" min="0" placeholder="0.00">
                    </div>
                  </div>
                </div>
                <div class="bs-form-row">
                  <div class="bs-form-group">
                    <label for="bs-hilton-brand">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      </svg>
                      Hilton Brand
                    </label>
                    <select id="bs-hilton-brand">
                      <option value="10">All Brands (10X)</option>
                      <option value="5">Tru / Home2 (5X)</option>
                    </select>
                  </div>
                  <div class="bs-form-group">
                    <label for="bs-hilton-credit-card">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                      Hilton Credit Card
                    </label>
                    <select id="bs-hilton-credit-card">
                      <option value="0">No Hilton Credit Card</option>
                      <option value="7">7X - Hilton Card</option>
                      <option value="12">12X - Hilton Surpass</option>
                      <option value="12">12X - Hilton Business Card</option>
                      <option value="14">14X - Hilton Aspire</option>
                    </select>
                  </div>
                </div>
                <div class="bs-form-group">
                  <label for="bs-hilton-elite-status">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    Hilton Honors Status
                  </label>
                  <select id="bs-hilton-elite-status">
                    <option value="0">No Status (No Bonus)</option>
                    <option value="0.20">Hilton Silver (20% bonus)</option>
                    <option value="0.80">Hilton Gold (80% bonus)</option>
                    <option value="1">Hilton Diamond (100% bonus)</option>
                  </select>
                </div>
                <div class="bs-hyatt-results-card">
                  <div class="bs-hyatt-result-item">
                    <span class="bs-hyatt-result-label">Total Points Earned</span>
                    <span class="bs-hyatt-result-value" id="bs-hilton-total-points">0 Points</span>
                  </div>
                  <div class="bs-hyatt-result-item">
                    <span class="bs-hyatt-result-label">Value</span>
                    <span class="bs-hyatt-result-value" id="bs-hilton-points-value">$0.00</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Points Breakdown -->
            <div class="bs-hyatt-section">
              <div class="bs-hyatt-section-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                </svg>
                <h4>Points Breakdown</h4>
              </div>
              <div class="bs-hyatt-form-card">
                <div class="bs-hyatt-results-grid">
                  <div class="bs-hyatt-result-card">
                    <span class="bs-hyatt-result-label">Base Points</span>
                    <span class="bs-hyatt-result-value" id="bs-hilton-base-points">0 points</span>
                    <span class="bs-hyatt-result-note" id="bs-hilton-base-note">10X points per dollar</span>
                  </div>
                  <div class="bs-hyatt-result-card">
                    <span class="bs-hyatt-result-label">Elite Status Bonus</span>
                    <span class="bs-hyatt-result-value" id="bs-hilton-elite-bonus">0 points</span>
                    <span class="bs-hyatt-result-note" id="bs-hilton-elite-note">No elite status bonus</span>
                  </div>
                  <div class="bs-hyatt-result-card">
                    <span class="bs-hyatt-result-label">Credit Card Points</span>
                    <span class="bs-hyatt-result-value" id="bs-hilton-card-points">0 points</span>
                    <span class="bs-hyatt-result-note" id="bs-hilton-card-note">No Hilton credit card</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Points Value Calculator -->
            <div class="bs-hyatt-section">
              <div class="bs-hyatt-section-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
                <h4>Points Value Calculator</h4>
              </div>
              <div class="bs-hyatt-form-card">
                <div class="bs-hyatt-results-grid">
                  <div class="bs-hyatt-result-card">
                    <span class="bs-hyatt-result-label">Standard Hilton Value</span>
                    <span class="bs-hyatt-result-value">0.59¢ per point</span>
                    <span class="bs-hyatt-result-note">Average Hilton Honors point value</span>
                  </div>
                  <div class="bs-hyatt-result-card">
                    <span class="bs-hyatt-result-label">Your Points Value</span>
                    <span class="bs-hyatt-result-value" id="bs-hilton-your-value">$0.00</span>
                    <span class="bs-hyatt-result-note">Based on total points earned</span>
                  </div>
                  <div class="bs-hyatt-result-card">
                    <span class="bs-hyatt-result-label">Points Earned</span>
                    <span class="bs-hyatt-result-value" id="bs-hilton-earned-display">0</span>
                    <span class="bs-hyatt-result-note">From this stay</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Redemption Value Calculator -->
            <div class="bs-hyatt-section">
              <div class="bs-hyatt-section-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <h4>Redemption Value Calculator</h4>
              </div>
              <div class="bs-hyatt-form-card">
                <div class="bs-form-row">
                  <div class="bs-form-group">
                    <label for="bs-hilton-redemption-points">Cost In Points</label>
                    <div class="bs-hyatt-input-row">
                      <input type="number" id="bs-hilton-redemption-points" min="0" step="1000" placeholder="0">
                      <select id="bs-hilton-stay-time-points">
                        <option value="stay">Entire Stay</option>
                        <option value="day">Per Day</option>
                      </select>
                    </div>
                  </div>
                  <div class="bs-form-group">
                    <label for="bs-hilton-cash-cost">Cost In Cash</label>
                    <div class="bs-hyatt-input-row">
                      <div class="bs-input-wrapper">
                        <span class="bs-input-prefix">$</span>
                        <input type="number" id="bs-hilton-cash-cost" step="0.01" min="0" placeholder="0.00">
                      </div>
                      <select id="bs-hilton-stay-time-cash">
                        <option value="stay">Entire Stay</option>
                        <option value="day">Per Day</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="bs-form-group">
                  <label for="bs-hilton-total-days">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" x2="16" y1="2" y2="6"/>
                      <line x1="8" x2="8" y1="2" y2="6"/>
                      <line x1="3" x2="21" y1="10" y2="10"/>
                    </svg>
                    Total Days
                  </label>
                  <div class="bs-input-wrapper">
                    <input type="number" id="bs-hilton-total-days" min="1" step="1" value="1" placeholder="1">
                    <span class="bs-input-suffix">Days</span>
                  </div>
                </div>
                <div class="bs-hyatt-results-grid">
                  <div class="bs-hyatt-result-card">
                    <span class="bs-hyatt-result-label">Points Value</span>
                    <span class="bs-hyatt-result-value" id="bs-hilton-redemption-value">0.00¢ per point</span>
                    <span class="bs-hyatt-result-note" id="bs-hilton-redemption-note">$0.0000 per point</span>
                  </div>
                  <div class="bs-hyatt-result-card">
                    <span class="bs-hyatt-result-label">Future Booking Value</span>
                    <span class="bs-hyatt-result-value" id="bs-hilton-future-value">$0.00</span>
                    <span class="bs-hyatt-result-note">Based on earned points from stay</span>
                  </div>
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
    // Initialize calculation section
    initializeCalculationSection();
  }, 100);
}

// Save toggle states to localStorage
function saveToggleStates() {
  const flightToggle = document.getElementById('bs-flight-toggle');
  const hotelToggle = document.getElementById('bs-hotel-toggle');
  const searchToggle = document.getElementById('bs-search-toggle');
  const informationToggle = document.getElementById('bs-information-toggle');
  const calculationToggle = document.getElementById('bs-calculation-toggle');
  const rovemilesToggle = document.getElementById('bs-rovemiles-toggle');
  const settingsToggle = document.getElementById('bs-settings-toggle');
  
  const toggleStates = {
    flight: flightToggle ? flightToggle.checked : false,
    hotel: hotelToggle ? hotelToggle.checked : false,
    search: searchToggle ? searchToggle.checked : false,
    information: informationToggle ? informationToggle.checked : false,
    calculation: calculationToggle ? calculationToggle.checked : false,
    rovemiles: rovemilesToggle ? rovemilesToggle.checked : false,
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
    calculation: false,  // Calculation OFF by default
    rovemiles: false,  // Rovemiles OFF by default
    settings: false // Settings OFF by default
  };
}

// Apply toggle states to UI
function applyToggleStates(toggleStates) {
  const flightToggle = document.getElementById('bs-flight-toggle');
  const hotelToggle = document.getElementById('bs-hotel-toggle');
  const searchToggle = document.getElementById('bs-search-toggle');
  const informationToggle = document.getElementById('bs-information-toggle');
  const calculationToggle = document.getElementById('bs-calculation-toggle');
  const rovemilesToggle = document.getElementById('bs-rovemiles-toggle');
  const settingsToggle = document.getElementById('bs-settings-toggle');
  const flightSection = document.getElementById('bs-flight-section');
  const hotelSection = document.getElementById('bs-hotel-section');
  const searchSection = document.getElementById('bs-search-section');
  const informationSection = document.getElementById('bs-information-section');
  const calculationSection = document.getElementById('bs-calculation-section');
  const rovemilesSection = document.getElementById('bs-rovemiles-section');
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
  
  // Apply calculation toggle state
  // Also check for total calculator, rovemiles, hyatt calculator, and hilton calculator toggles
  const totalCalculatorToggle = document.getElementById('bs-total-calculator-toggle');
  const totalCalculatorSection = document.getElementById('bs-total-calculator-section');
  const hyattCalculatorToggle = document.getElementById('bs-hyatt-calculator-toggle');
  const hyattCalculatorSection = document.getElementById('bs-hyatt-calculator-section');
  const hiltonCalculatorToggle = document.getElementById('bs-hilton-calculator-toggle');
  const hiltonCalculatorSection = document.getElementById('bs-hilton-calculator-section');
  const totalCalcEnabled = totalCalculatorToggle && totalCalculatorToggle.checked;
  const rovemilesEnabled = rovemilesToggle && rovemilesToggle.checked;
  const hyattEnabled = hyattCalculatorToggle && hyattCalculatorToggle.checked;
  const hiltonEnabled = hiltonCalculatorToggle && hiltonCalculatorToggle.checked;
  
  if (calculationToggle && calculationSection) {
    calculationToggle.checked = toggleStates.calculation;
    // Show calculation section if calculation toggle is on OR any sub-calculator is on
    if (toggleStates.calculation || totalCalcEnabled || rovemilesEnabled || hyattEnabled || hiltonEnabled) {
      calculationSection.style.display = 'block';
    } else {
      calculationSection.style.display = 'none';
    }
  }
  
  // Apply total calculator toggle state (within calculation section)
  if (totalCalculatorToggle && totalCalculatorSection) {
    const saved = localStorage.getItem('bs-total-calculator-enabled');
    if (saved !== null) totalCalculatorToggle.checked = saved === 'true';
    // Only show total calculator if calculation section is visible
    if (calculationSection && calculationSection.style.display !== 'none') {
      totalCalculatorSection.style.display = totalCalculatorToggle.checked ? '' : 'none';
    } else {
      totalCalculatorSection.style.display = 'none';
    }
  }
  
  // Apply rovemiles toggle state (within calculation section)
  if (rovemilesToggle && rovemilesSection) {
    rovemilesToggle.checked = toggleStates.rovemiles;
    // Only show rovemiles if calculation section is visible
    if (calculationSection && calculationSection.style.display !== 'none') {
      rovemilesSection.style.display = toggleStates.rovemiles ? '' : 'none';
    } else {
      rovemilesSection.style.display = 'none';
    }
  }

  // Apply hyatt calculator toggle state (within calculation section)
  if (hyattCalculatorToggle && hyattCalculatorSection) {
    const saved = localStorage.getItem('bs-hyatt-calculator-enabled');
    if (saved !== null) hyattCalculatorToggle.checked = saved === 'true';
    // Only show hyatt calculator if calculation section is visible
    if (calculationSection && calculationSection.style.display !== 'none') {
      hyattCalculatorSection.style.display = hyattCalculatorToggle.checked ? '' : 'none';
    } else {
      hyattCalculatorSection.style.display = 'none';
    }
  }

  // Apply hilton calculator toggle state (within calculation section)
  if (hiltonCalculatorToggle && hiltonCalculatorSection) {
    const saved = localStorage.getItem('bs-hilton-calculator-enabled');
    if (saved !== null) hiltonCalculatorToggle.checked = saved === 'true';
    // Only show hilton calculator if calculation section is visible
    if (calculationSection && calculationSection.style.display !== 'none') {
      hiltonCalculatorSection.style.display = hiltonCalculatorToggle.checked ? '' : 'none';
    } else {
      hiltonCalculatorSection.style.display = 'none';
    }
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

  // External links toggle
  const linksToggle = document.getElementById('bs-external-links-toggle');
  const linksContainer = document.getElementById('bs-external-links');
  if (linksToggle && linksContainer) {
    const saved = localStorage.getItem('bs-external-links-enabled');
    if (saved !== null) {
      linksToggle.checked = saved === 'true';
    } else {
      linksToggle.checked = false;
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
    if (savedHotelLinks !== null) {
      hotelLinksToggle.checked = savedHotelLinks === 'true';
    } else {
      hotelLinksToggle.checked = false;
    }
    hotelLinksContainer.style.display = hotelLinksToggle.checked ? '' : 'none';
    hotelLinksToggle.addEventListener('change', () => {
      localStorage.setItem('bs-hotel-external-links-enabled', hotelLinksToggle.checked);
      hotelLinksContainer.style.display = hotelLinksToggle.checked ? '' : 'none';
    });
  }

  // Hotel Benefits Toggle
  const hotelBenefitsToggle = document.getElementById('bs-hotel-benefits-toggle');
  const hotelBenefitsSection = document.getElementById('bs-hotel-benefits-section');
  if (hotelBenefitsToggle && hotelBenefitsSection) {
    const savedHotelBenefits = localStorage.getItem('bs-hotel-benefits-enabled');
    if (savedHotelBenefits !== null) hotelBenefitsToggle.checked = savedHotelBenefits === 'true';
    hotelBenefitsSection.style.display = hotelBenefitsToggle.checked ? '' : 'none';
    hotelBenefitsToggle.addEventListener('change', () => {
      localStorage.setItem('bs-hotel-benefits-enabled', hotelBenefitsToggle.checked);
      hotelBenefitsSection.style.display = hotelBenefitsToggle.checked ? '' : 'none';
      if (hotelBenefitsToggle.checked) {
        initializeHotelBenefits();
      }
    });
    // Initialize if already enabled
    if (hotelBenefitsToggle.checked) {
      initializeHotelBenefits();
    }
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
  
  const calculationToggle = document.getElementById('bs-calculation-toggle');
  const calculationSection = document.getElementById('bs-calculation-section');
  
  console.log('Toggle elements found:', {
    flightToggle: !!flightToggle,
    hotelToggle: !!hotelToggle,
    searchToggle: !!searchToggle,
    informationToggle: !!informationToggle,
    calculationToggle: !!calculationToggle,
    settingsToggle: !!settingsToggle
  });
  
  console.log('Section elements found:', {
    flightSection: !!flightSection,
    hotelSection: !!hotelSection,
    searchSection: !!searchSection,
    informationSection: !!informationSection,
    calculationSection: !!calculationSection,
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
      
      // If total calculator is enabled, ensure calculation section is visible
      if (totalCalculatorToggle.checked && calculationSection) {
        calculationSection.style.display = 'block';
      }
      
      // Update calculation section visibility
      const rovemilesEnabled = rovemilesToggle && rovemilesToggle.checked;
      const hyattEnabled = document.getElementById('bs-hyatt-calculator-toggle')?.checked;
      if (calculationSection && calculationToggle) {
        if (calculationToggle.checked || totalCalculatorToggle.checked || rovemilesEnabled || hyattEnabled) {
          calculationSection.style.display = 'block';
    } else {
          calculationSection.style.display = 'none';
        }
      }
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
      
      // If rovemiles is enabled, ensure calculation section is visible
      if (rovemilesToggle.checked && calculationSection) {
        calculationSection.style.display = 'block';
      }
      
      // Update calculation section visibility
      const totalCalcEnabled = totalCalculatorToggle && totalCalculatorToggle.checked;
      const hyattEnabled = document.getElementById('bs-hyatt-calculator-toggle')?.checked;
      if (calculationSection && calculationToggle) {
        if (calculationToggle.checked || totalCalcEnabled || rovemilesToggle.checked || hyattEnabled) {
          calculationSection.style.display = 'block';
        } else {
          calculationSection.style.display = 'none';
        }
      }
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
      
      // If hyatt calculator is enabled, ensure calculation section is visible
      if (hyattCalculatorToggle.checked && calculationSection) {
        calculationSection.style.display = 'block';
      }
      
      // Update calculation section visibility
      const totalCalcEnabled = totalCalculatorToggle && totalCalculatorToggle.checked;
      const rovemilesEnabled = rovemilesToggle && rovemilesToggle.checked;
      const hiltonEnabled = document.getElementById('bs-hilton-calculator-toggle')?.checked;
      if (calculationSection && calculationToggle) {
        if (calculationToggle.checked || totalCalcEnabled || rovemilesEnabled || hyattCalculatorToggle.checked || hiltonEnabled) {
          calculationSection.style.display = 'block';
        } else {
          calculationSection.style.display = 'none';
        }
      }
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
      
      // If hilton calculator is enabled, ensure calculation section is visible
      if (hiltonCalculatorToggle.checked && calculationSection) {
        calculationSection.style.display = 'block';
      }
      
      // Update calculation section visibility
      const totalCalcEnabled = totalCalculatorToggle && totalCalculatorToggle.checked;
      const rovemilesEnabled = rovemilesToggle && rovemilesToggle.checked;
      const hyattEnabled = hyattCalculatorToggle && hyattCalculatorToggle.checked;
      if (calculationSection && calculationToggle) {
        if (calculationToggle.checked || totalCalcEnabled || rovemilesEnabled || hyattEnabled || hiltonCalculatorToggle.checked) {
          calculationSection.style.display = 'block';
        } else {
          calculationSection.style.display = 'none';
        }
      }
      saveToggleStates();
    });
  }
      
  // Main calculation toggle - works with Total Calculator, Rovemiles, Hyatt Calculator, and Hilton Calculator
  if (calculationToggle && calculationSection) {
    // Load saved state
    const savedCalcState = localStorage.getItem('bs-calculation-enabled');
    if (savedCalcState !== null) {
      calculationToggle.checked = savedCalcState === 'true';
    }
    
    // Set initial visibility - show if calculation toggle is on OR any sub-calculator is on
    const totalCalcEnabled = totalCalculatorToggle && totalCalculatorToggle.checked;
    const rovemilesEnabled = rovemilesToggle && rovemilesToggle.checked;
    const hyattEnabled = hyattCalculatorToggle && hyattCalculatorToggle.checked;
    const hiltonEnabled = hiltonCalculatorToggle && hiltonCalculatorToggle.checked;
    if (calculationToggle.checked || totalCalcEnabled || rovemilesEnabled || hyattEnabled || hiltonEnabled) {
      calculationSection.style.display = 'block';
      // Ensure total calculator visibility matches its toggle
      if (totalCalculatorToggle && totalCalculatorSection) {
        totalCalculatorSection.style.display = totalCalculatorToggle.checked ? '' : 'none';
      }
      // Ensure rovemiles visibility matches its toggle
      if (rovemilesToggle && rovemilesSection) {
        rovemilesSection.style.display = rovemilesToggle.checked ? '' : 'none';
      }
      // Ensure hyatt calculator visibility matches its toggle
      if (hyattCalculatorToggle && hyattCalculatorSection) {
        hyattCalculatorSection.style.display = hyattCalculatorToggle.checked ? '' : 'none';
      }
      // Ensure hilton calculator visibility matches its toggle
      if (hiltonCalculatorToggle && hiltonCalculatorSection) {
        hiltonCalculatorSection.style.display = hiltonCalculatorToggle.checked ? '' : 'none';
      }
    } else {
      calculationSection.style.display = 'none';
    }
    
    calculationToggle.addEventListener('change', () => {
      localStorage.setItem('bs-calculation-enabled', calculationToggle.checked);
      
      if (calculationToggle.checked) {
        // Show calculation section
        calculationSection.style.display = 'block';
        // Ensure total calculator visibility matches its toggle
        if (totalCalculatorToggle && totalCalculatorSection) {
          totalCalculatorSection.style.display = totalCalculatorToggle.checked ? '' : 'none';
        }
        // Ensure rovemiles visibility matches its toggle
        if (rovemilesToggle && rovemilesSection) {
          rovemilesSection.style.display = rovemilesToggle.checked ? '' : 'none';
        }
        // Ensure hyatt calculator visibility matches its toggle
        if (hyattCalculatorToggle && hyattCalculatorSection) {
          hyattCalculatorSection.style.display = hyattCalculatorToggle.checked ? '' : 'none';
        }
        // Ensure hilton calculator visibility matches its toggle
        if (hiltonCalculatorToggle && hiltonCalculatorSection) {
          hiltonCalculatorSection.style.display = hiltonCalculatorToggle.checked ? '' : 'none';
        }
      } else {
        // Check if any sub-calculator is enabled
        const totalCalcEnabled = totalCalculatorToggle && totalCalculatorToggle.checked;
        const rovemilesEnabled = rovemilesToggle && rovemilesToggle.checked;
        const hyattEnabled = hyattCalculatorToggle && hyattCalculatorToggle.checked;
        const hiltonEnabled = hiltonCalculatorToggle && hiltonCalculatorToggle.checked;
        
        if (totalCalcEnabled || rovemilesEnabled || hyattEnabled || hiltonEnabled) {
          // If any sub-calculator is on, keep section visible
          calculationSection.style.display = 'block';
        } else {
          // Only hide if all sub-calculators are also off
          calculationSection.style.display = 'none';
        }
      }
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
    } else {
      autoReloadToggle.checked = false;
      console.log('Auto-reload defaulting to off');
    }
  }

  // Sync Flight Search Cabin to Award Flight Analysis Filter
  syncCabinToAwardFilter();
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

// Extract airline from Google Flights and auto-fill CPM airline dropdown
window.extractAndFillAirlineFromGoogleFlights = function extractAndFillAirlineFromGoogleFlights() {
  try {
    console.log('[BS Extension] ===== Starting airline extraction from Google Flights =====')
    
    // Get CPM airline dropdown first to check if it exists and is populated
    const airlineSelect = document.getElementById('bs-casm-airline')
    if (!airlineSelect) {
      console.log('[BS Extension] ❌ CPM airline dropdown not found')
      return
    }
    
    console.log('[BS Extension] Dropdown found, current options count:', airlineSelect.options.length)
    
    // Wait for dropdown to be populated with options (need at least 2 options: default + one airline)
    if (airlineSelect.options.length <= 1) {
      console.log('[BS Extension] ⏳ Dropdown not populated yet (options:', airlineSelect.options.length, '), waiting...')
      // Track retry attempts
      if (!window.__airlineRetryCount) {
        window.__airlineRetryCount = 0
      }
      window.__airlineRetryCount++
      
      // Retry up to 15 times (7.5 seconds total)
      if (window.__airlineRetryCount < 15) {
        setTimeout(() => {
          window.extractAndFillAirlineFromGoogleFlights()
        }, 500)
      } else {
        console.log('[BS Extension] ❌ Max retries reached, giving up on airline auto-fill')
        window.__airlineRetryCount = 0
      }
      return
    }
    
    // Reset retry count if dropdown is populated
    window.__airlineRetryCount = 0
    
    // Check if already filled - only skip if it's a valid airline value (not empty or "Select")
    const currentValue = airlineSelect.value || ''
    const firstOption = airlineSelect.options[0]?.value || ''
    const isDefaultValue = !currentValue || currentValue === '' || currentValue === firstOption || currentValue === 'Select'
    
    if (!isDefaultValue) {
      console.log('[BS Extension] ✅ CPM airline already filled with valid value:', currentValue, '- skipping extraction')
      return
    }
    
    console.log('[BS Extension] 🔍 CPM airline needs to be filled (current value:', currentValue, ', is default:', isDefaultValue, ')')
    
    // STEP 1: Try to find airline from the FIRST top flight card (same as price extraction)
    // This ensures we get the airline from the first/top flight (class="U3gSDe ETvUZc")
    let airlineName = null
    console.log('[BS Extension] Step 1: Looking for first top flight card (U3gSDe ETvUZc)...')
    
    // First, try to find the first top flight card (same selector as price extraction)
    const topFlightCards = document.querySelectorAll('.U3gSDe.ETvUZc, [class*="U3gSDe"][class*="ETvUZc"]')
    console.log('[BS Extension] Found', topFlightCards.length, 'top flight cards')
    
    if (topFlightCards.length > 0) {
      const firstTopFlight = topFlightCards[0]
      console.log('[BS Extension] ✅ Found first top flight card with class U3gSDe ETvUZc')
      
      // Look for airline within this first top flight card
      const airlineContainer = firstTopFlight.querySelector('.sSHqwe.tPgKwe.ogfYpf')
      console.log('[BS Extension] Looking for airline container (.sSHqwe.tPgKwe.ogfYpf) in first top flight...')
      
      if (airlineContainer) {
        console.log('[BS Extension] ✅ Found airline container in first top flight')
        const span = airlineContainer.querySelector('span')
        if (span) {
          let spanText = span.textContent?.trim() || span.innerText?.trim() || ''
          console.log('[BS Extension] Found airline span text:', spanText)
          
          // If text contains a comma, use only the first part (before the comma)
          if (spanText && spanText.includes(',')) {
            spanText = spanText.split(',')[0].trim()
            console.log('[BS Extension] Multiple airlines found in top flight, using first one:', spanText)
          }
          
          if (spanText && spanText.length > 1 && spanText.length < 50 &&
              !spanText.match(/^(Operated|by|Total|duration|hr|min|stop|stops|Nonstop|Direct)$/i)) {
            airlineName = spanText
            console.log('[BS Extension] ✅✅✅ EXTRACTED airline name from first top flight card:', airlineName)
          } else {
            console.log('[BS Extension] ⚠️ Span text filtered out (length:', spanText.length, ', matches filter:', spanText.match(/^(Operated|by|Total|duration|hr|min|stop|stops|Nonstop|Direct)$/i), ')')
          }
        } else {
          console.log('[BS Extension] ⚠️ No span found inside airline container')
        }
      } else {
        console.log('[BS Extension] ⚠️ Airline container not found in first top flight card')
      }
    } else {
      console.log('[BS Extension] ⚠️ No top flight cards found with class U3gSDe ETvUZc')
    }
    
    // Fallback: try to find the first flight result element
    if (!airlineName) {
      const flightResultSelectors = [
        'li.pIav2d',
        '.yR1fYc',
        '.mxvQLc',
        '[data-testid*="flight"]',
        '[jsname*="flight"]'
      ]
      
      let firstFlightElement = null
      for (const selector of flightResultSelectors) {
        const flightElements = document.querySelectorAll(selector)
        if (flightElements.length > 0) {
          firstFlightElement = flightElements[0] // Get the FIRST flight
          console.log('[BS Extension] Found first flight element with selector:', selector)
          break
        }
      }
      
      // If we found a flight element, look for airline within it
      if (firstFlightElement) {
        const airlineContainer = firstFlightElement.querySelector('.sSHqwe.tPgKwe.ogfYpf')
        if (airlineContainer) {
          const span = airlineContainer.querySelector('span')
          if (span) {
            let spanText = span.textContent?.trim() || span.innerText?.trim() || ''
            
            // If text contains a comma, use only the first part (before the comma)
            if (spanText && spanText.includes(',')) {
              spanText = spanText.split(',')[0].trim()
              console.log('[BS Extension] Multiple airlines found in first flight, using first one:', spanText)
            }
            
            if (spanText && spanText.length > 1 && spanText.length < 50 &&
                !spanText.match(/^(Operated|by|Total|duration|hr|min|stop|stops|Nonstop|Direct)$/i)) {
              airlineName = spanText
              console.log('[BS Extension] Found airline name from first flight element:', airlineName)
            }
          }
        }
      }
    }
    
    // Fallback: if we didn't find it in the first flight, try direct selectors (but still prioritize first match)
    if (!airlineName) {
      const selectors = [
        // First try to find span inside the div (most specific)
        '.sSHqwe.tPgKwe.ogfYpf span',
        // Then try the div itself
        '.sSHqwe.tPgKwe.ogfYpf',
        // Try with attribute selectors
        '[class*="sSHqwe"][class*="tPgKwe"][class*="ogfYpf"] span',
        // Try div with all three classes
        'div.sSHqwe.tPgKwe.ogfYpf span',
        'div.sSHqwe.tPgKwe.ogfYpf'
      ]
      
      for (const selector of selectors) {
        const element = document.querySelector(selector) // Use querySelector to get FIRST match only
        if (element) {
          let text = ''
          if (element.tagName === 'DIV' || element.classList.contains('sSHqwe')) {
            const span = element.querySelector('span')
            if (span) {
              text = span.textContent?.trim() || span.innerText?.trim() || ''
            }
            // If no span found, use div's own text
            if (!text) {
              text = element.textContent?.trim() || element.innerText?.trim() || ''
            }
          } else {
            text = element.textContent?.trim() || element.innerText?.trim() || ''
          }
          
          // If text contains a comma, use only the first part (before the comma)
          if (text && text.includes(',')) {
            text = text.split(',')[0].trim()
            console.log('[BS Extension] Multiple airlines found, using first one:', text)
          }
          
          // Skip if text is too short or too long, or contains common non-airline words
          if (text && text.length > 1 && text.length < 50 && 
              !text.match(/^(Operated|by|Total|duration|hr|min|stop|stops|Nonstop|Direct)$/i)) {
            airlineName = text
            console.log('[BS Extension] Found airline name with selector', selector, ':', airlineName)
            break
          }
        }
      }
    }
    
    if (!airlineName) {
      console.log('[BS Extension] ❌ Could not extract airline name from first top flight')
      console.log('[BS Extension] Trying fallback methods...')
      // Don't return yet - try fallback methods below
    }
    
    // STEP 2: Create a mapping for common airline name variations
    console.log('[BS Extension] Step 2: Creating airline name mappings...')
    const airlineMappings = {
      'Austrian': 'Austrian Airlines',
      'Lufthansa': 'Lufthansa',
      'Swiss': 'Swiss',
      'British Airways': 'British Airways',
      'Air France': 'Air France',
      'KLM': 'KLM',
      'Delta': 'Delta Air Lines',
      'United': 'United Airlines',
      'American': 'American Airlines',
      'SAS': 'SAS',
      'Finnair': 'Finnair',
      'Iberia': 'Iberia',
      'Emirates': 'Emirates',
      'Qatar': 'Qatar Airways',
      'Singapore': 'Singapore Airlines',
      'Cathay': 'Cathay Pacific',
      'Cathay Pacific': 'Cathay Pacific',
      'ANA': 'ANA',
      'Japan Airlines': 'Japan Airlines',
      'Qantas': 'Qantas',
      'LOT': 'LOT Polish Airlines',
      'Turkish': 'Turkish Airlines',
      'Turkish Airlines': 'Turkish Airlines',
      // Add more variations
      'Turkish Air': 'Turkish Airlines',
      'THY': 'Turkish Airlines'
    }
    
    // If we still don't have an airline name, try fallback extraction
    if (!airlineName) {
      console.log('[BS Extension] Step 2b: Trying fallback extraction methods...')
      // Try direct selectors as fallback
      const fallbackSelectors = [
        '.sSHqwe.tPgKwe.ogfYpf span',
        'div.sSHqwe.tPgKwe.ogfYpf span',
        '.sSHqwe.tPgKwe.ogfYpf'
      ]
      
      for (const selector of fallbackSelectors) {
        const element = document.querySelector(selector)
        if (element) {
          let text = ''
          if (element.tagName === 'DIV' || element.classList.contains('sSHqwe')) {
            const span = element.querySelector('span')
            if (span) {
              text = span.textContent?.trim() || span.innerText?.trim() || ''
            }
            if (!text) {
              text = element.textContent?.trim() || element.innerText?.trim() || ''
            }
          } else {
            text = element.textContent?.trim() || element.innerText?.trim() || ''
          }
          
          if (text && text.includes(',')) {
            text = text.split(',')[0].trim()
          }
          
          if (text && text.length > 1 && text.length < 50 &&
              !text.match(/^(Operated|by|Total|duration|hr|min|stop|stops|Nonstop|Direct)$/i)) {
            airlineName = text
            console.log('[BS Extension] ✅ Found airline via fallback selector', selector, ':', airlineName)
            break
          }
        }
      }
    }
    
    if (!airlineName) {
      console.log('[BS Extension] ❌ Could not extract airline name from any method')
      return
    }
    
    // Get mapped name
    const mappedName = airlineMappings[airlineName] || airlineName
    console.log('[BS Extension] Step 3: Mapped airline name:', airlineName, '->', mappedName)
    
    // STEP 3: Match airline name to dropdown options
    console.log('[BS Extension] Step 4: Matching airline to dropdown options...')
    const options = Array.from(airlineSelect.options)
    console.log('[BS Extension] Available dropdown options:', options.length, 'options')
    let matchedOption = null
    
    // Normalize strings for comparison (remove extra spaces, convert to lowercase)
    const normalize = (str) => str.toLowerCase().trim().replace(/\s+/g, ' ')
    const normalizedMappedName = normalize(mappedName)
    const normalizedAirlineName = normalize(airlineName)
    
    // Try to find exact or partial match
    for (const option of options) {
      const optionText = option.textContent || option.innerText || ''
      const optionValue = option.value || ''
      
      // Extract just the airline name from option text (remove CASM info like "Turkish Airlines (CASM: 5.2¢)")
      const airlineNameFromText = optionText.split('(')[0].trim()
      const normalizedOptionText = normalize(airlineNameFromText)
      const normalizedOptionValue = normalize(optionValue)
      const normalizedFullOptionText = normalize(optionText)
      
      // Check multiple matching strategies (prioritize exact matches)
      // 1. Exact match with option value (case-insensitive)
      if (normalizedOptionValue === normalizedMappedName ||
          normalizedOptionValue === normalizedAirlineName) {
        matchedOption = option
        console.log('[BS Extension] Exact match found (by value):', optionValue, 'with text:', optionText)
        break
      }
      
      // 2. Exact match with airline name from text (before CASM info)
      if (normalizedOptionText === normalizedMappedName ||
          normalizedOptionText === normalizedAirlineName) {
        matchedOption = option
        console.log('[BS Extension] Exact match found (by text):', optionValue, 'with text:', optionText)
        break
      }
      
      // 3. Exact match with full option text
      if (normalizedFullOptionText === normalizedMappedName ||
          normalizedFullOptionText === normalizedAirlineName) {
        matchedOption = option
        console.log('[BS Extension] Exact match found (by full text):', optionValue, 'with text:', optionText)
        break
      }
      
      // 4. Contains match (one contains the other) - check option value
      if (normalizedOptionValue.includes(normalizedMappedName) ||
          normalizedMappedName.includes(normalizedOptionValue) ||
          normalizedOptionValue.includes(normalizedAirlineName) ||
          normalizedAirlineName.includes(normalizedOptionValue)) {
        matchedOption = option
        console.log('[BS Extension] Partial match found (by value):', optionValue, 'with text:', optionText)
        break
      }
      
      // 5. Special case: if extracted name is a single word (like "Turkish"), check if it's the start of option text or value
      // This should be checked BEFORE general contains match to prioritize exact prefix matches
      if (normalizedAirlineName.split(' ').length === 1) {
        // Check if option text or value starts with the extracted name + space
        if (normalizedOptionText.startsWith(normalizedAirlineName + ' ') || 
            normalizedOptionValue.startsWith(normalizedAirlineName + ' ') ||
            normalizedOptionText === normalizedAirlineName + ' airlines' ||
            normalizedOptionValue === normalizedAirlineName + ' airlines') {
          matchedOption = option
          console.log('[BS Extension] ✅✅✅ PREFIX MATCH found (single word airline):', optionValue, 'with text:', optionText, 'for extracted:', airlineName)
          break
        }
      }
      
      // 6. Contains match - check airline name from text (prioritize when extracted name is shorter, like "Turkish" matching "Turkish Airlines")
      if (normalizedOptionText.includes(normalizedMappedName) ||
          normalizedMappedName.includes(normalizedOptionText) ||
          normalizedOptionText.includes(normalizedAirlineName) ||
          normalizedAirlineName.includes(normalizedOptionText)) {
        matchedOption = option
        console.log('[BS Extension] Partial match found (by text):', optionValue, 'with text:', optionText, 'for extracted:', airlineName)
        break
      }
      
      // 7. Contains match - check full option text
      if (normalizedFullOptionText.includes(normalizedMappedName) ||
          normalizedMappedName.includes(normalizedFullOptionText) ||
          normalizedFullOptionText.includes(normalizedAirlineName) ||
          normalizedAirlineName.includes(normalizedFullOptionText)) {
        matchedOption = option
        console.log('[BS Extension] Partial match found (by full text):', optionValue, 'with text:', optionText)
        break
      }
    }
    
    if (matchedOption) {
      console.log('[BS Extension] Step 5: Setting dropdown value and triggering calculation...')
      
      // Set the value
      airlineSelect.value = matchedOption.value
      console.log('[BS Extension] ✅✅✅ Successfully set airline dropdown value to:', matchedOption.value)
      console.log('[BS Extension]   Option text:', matchedOption.textContent)
      console.log('[BS Extension]   Current dropdown value after setting:', airlineSelect.value)
      
      // Verify the value was set
      if (airlineSelect.value === matchedOption.value) {
        console.log('[BS Extension] ✅ Verified: Dropdown value successfully set')
      } else {
        console.error('[BS Extension] ❌ ERROR: Dropdown value was NOT set correctly! Expected:', matchedOption.value, 'Got:', airlineSelect.value)
        // Try setting it again
        airlineSelect.value = matchedOption.value
        console.log('[BS Extension] Retried setting value, new value:', airlineSelect.value)
      }
      
      // Force a re-render by removing and re-adding the selected attribute
      Array.from(airlineSelect.options).forEach(opt => opt.selected = false)
      matchedOption.selected = true
      airlineSelect.value = matchedOption.value
      
      // Dispatch events to trigger any listeners
      airlineSelect.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
      airlineSelect.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
      airlineSelect.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }))
      console.log('[BS Extension] Dispatched change, input, and blur events')
      
      // Trigger CASM calculation - try multiple ways to ensure it runs
      const triggerCalculation = () => {
        console.log('[BS Extension] 🔄 Attempting to trigger CASM calculation...')
        
        // Method 1: Try to find and call the function from window (made globally accessible)
        if (typeof window.calculateCASM === 'function') {
          try {
            console.log('[BS Extension] Calling window.calculateCASM()...')
            window.calculateCASM()
            console.log('[BS Extension] ✅✅✅ CASM calculation triggered via window.calculateCASM')
            return true
          } catch (e) {
            console.error('[BS Extension] ❌ Error calling window.calculateCASM:', e)
          }
        } else {
          console.log('[BS Extension] ⚠️ window.calculateCASM is not a function. Type:', typeof window.calculateCASM)
        }
        
        // Method 2: Try to find the calculateCASM function in the closure
        // Look for it in various places
        const casmButton = document.querySelector('#bs-casm-calculator button, [onclick*="calculateCASM"]')
        if (casmButton) {
          console.log('[BS Extension] Found CASM button, clicking it...')
          casmButton.click()
          return true
        }
        
        console.log('[BS Extension] ⚠️ Could not find CASM calculation trigger method')
        return false
      }
      
      // Trigger calculation multiple times with delays to ensure it runs
      let triggered = false
      setTimeout(() => {
        if (triggerCalculation()) triggered = true
      }, 100)
      setTimeout(() => {
        if (!triggered) triggerCalculation()
      }, 300)
      setTimeout(() => {
        if (!triggered) triggerCalculation()
      }, 600)
      setTimeout(() => {
        if (!triggered) {
          console.log('[BS Extension] ⚠️ Final attempt to trigger calculation...')
          triggerCalculation()
        }
      }, 1000)
    } else {
      console.log('[BS Extension] ❌❌❌ Could not match airline name to dropdown option.')
      console.log('[BS Extension]   Extracted airline:', airlineName)
      console.log('[BS Extension]   Mapped airline:', mappedName)
      console.log('[BS Extension]   Available options count:', options.length)
      console.log('[BS Extension]   First 5 options:', options.slice(0, 5).map(o => ({ value: o.value, text: o.textContent?.substring(0, 50) })))
      
      // Try one more time with a delay in case dropdown is still populating
      if (!window.__airlineFinalRetry) {
        window.__airlineFinalRetry = true
        console.log('[BS Extension] Will retry airline extraction in 1 second...')
        setTimeout(() => {
          window.__airlineFinalRetry = false
          window.extractAndFillAirlineFromGoogleFlights()
        }, 1000)
      }
    }
  } catch (error) {
    console.error('[BS Extension] Error extracting airline from Google Flights:', error)
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
      
      console.log('[BS Extension] Populated airline dropdown with', airlineSelect.options.length, 'options')
      
      // After dropdown is populated, try to auto-fill airline (multiple attempts)
      setTimeout(() => {
        if (typeof window.extractAndFillAirlineFromGoogleFlights === 'function') {
          window.extractAndFillAirlineFromGoogleFlights()
        }
      }, 300)
      
      // Also try after a longer delay in case Google Flights elements load later
      setTimeout(() => {
        if (typeof window.extractAndFillAirlineFromGoogleFlights === 'function') {
          window.extractAndFillAirlineFromGoogleFlights()
        }
      }, 2000)
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
      // Try to auto-fill airline from Google Flights (multiple attempts)
      setTimeout(() => {
        extractAndFillAirlineFromGoogleFlights();
      }, 500);
      setTimeout(() => {
        extractAndFillAirlineFromGoogleFlights();
      }, 2000);
      setTimeout(() => {
        extractAndFillAirlineFromGoogleFlights();
      }, 4000);
    }
  });
  
  // Try to auto-fill airline when CASM is enabled (on page load)
  if (casmToggle.checked) {
    setTimeout(() => {
      extractAndFillAirlineFromGoogleFlights();
    }, 1000);
    setTimeout(() => {
      extractAndFillAirlineFromGoogleFlights();
    }, 3000);
  }
  
  // Watch for airline elements and top flight cards appearing dynamically
  if (typeof window.extractAndFillAirlineFromGoogleFlights === 'function') {
    const airlineObserver = new MutationObserver((mutations) => {
      let shouldCheck = false
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) { // Element node
              // Check if the added node or its children contain airline elements or top flight cards
              if (node.querySelector && (
                node.querySelector('.sSHqwe.tPgKwe.ogfYpf') ||
                node.querySelector('.U3gSDe.ETvUZc') ||
                node.classList?.contains('sSHqwe') ||
                node.classList?.contains('tPgKwe') ||
                node.classList?.contains('ogfYpf') ||
                node.classList?.contains('U3gSDe') ||
                node.classList?.contains('ETvUZc')
              )) {
                shouldCheck = true
                break
              }
            }
          }
        }
        if (shouldCheck) break
      }
      
      if (shouldCheck && casmToggle.checked && airlineSelect) {
        // Check if dropdown needs to be filled (empty or just "Select")
        const needsFilling = !airlineSelect.value || airlineSelect.value === '' || airlineSelect.value === 'Select'
        if (needsFilling) {
          // Debounce the check
          clearTimeout(window.__airlineCheckTimeout)
          window.__airlineCheckTimeout = setTimeout(() => {
            extractAndFillAirlineFromGoogleFlights()
          }, 500)
        }
      }
    })
    
    // Start observing the document body for airline elements and top flight cards
    airlineObserver.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    // Store observer for cleanup if needed
    window.__airlineObserver = airlineObserver
  }

  // Removed manual calculate distance button (auto-filled from URL or inputs)

  // Get baggage inputs
  // Note: calculateCASM function is defined below and will be assigned to window.calculateCASM
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

    // Listen to flight cabin dropdown changes
    const flightCabinSelect = document.getElementById('bs-flight-cabin');
    if (flightCabinSelect) {
      flightCabinSelect.addEventListener('change', calculateCASM);
    }

    // Listen to return date changes for round trip distance calculation
    const returnDateInput = document.getElementById('bs-flight-return');
    if (returnDateInput) {
      returnDateInput.addEventListener('change', calculateCASM);
      returnDateInput.addEventListener('input', calculateCASM);
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
    
    // Make function globally accessible for airline auto-fill (re-assign on each call to ensure it's available)
    window.calculateCASM = calculateCASM

    const distance = parseFloat(distanceInput?.value) || 0;
    const airline = airlineSelect?.value || '';
    const cashPrice = parseFloat(cashPriceInput?.value) || 0;
    const region = regionSelect?.value || 'Europe';
    const bags = Math.max(0, parseFloat(bagsInput?.value) || 0);
    const bagFee = parseFloat(bagFeeInput?.value) || 0;
    
    // Get cabin from flight search dropdown
    const flightCabinSelect = document.getElementById('bs-flight-cabin');
    const flightCabin = flightCabinSelect?.value || 'economy';
    
    // Check if return date is set (round trip)
    const returnDateInput = document.getElementById('bs-flight-return');
    const isRoundTrip = returnDateInput && returnDateInput.value && returnDateInput.value.trim() !== '';
    
    // Double distance for round trip
    const effectiveDistance = isRoundTrip ? distance * 2 : distance;
    
    // Apply 4x multiplier for business or first class
    const multiplier = (flightCabin === 'business' || flightCabin === 'first') ? 4 : 1;

    if (!distance || !airline) {
      resultsDiv.style.display = 'none';
      return;
    }

    const casm = window.getAirlineCASM(airline);
    if (!casm) {
      resultsDiv.style.display = 'none';
      return;
    }

    // Calculate base CASM-based cost (convert cents to dollars) without multiplier
    // Use effective distance (doubled for round trip)
    const baseCasmCost = (casm * effectiveDistance) / 100;
    
    // Apply multiplier to get total CASM cost
    const casmCostWithMultiplier = baseCasmCost * multiplier;

    // Calculate baggage expected cost (only if bags >= 1)
    const bagExpectedCostTotal = bags >= 1 
      ? bags * (window.getExpectedBagCostPerBag ? window.getExpectedBagCostPerBag(region) : 7.75)
      : 0;

    // Total operating cost = (CASM * multiplier) + baggage (only if bags >= 1)
    const totalOperatingCost = casmCostWithMultiplier + bagExpectedCostTotal;

    // Bag revenue if bag fee provided and bags >= 1
    const bagRevenue = (bags >= 1 && bagFee > 0) ? bags * bagFee : 0;

    // Calculate margin (including bag revenue if provided)
    const totalRevenue = cashPrice + bagRevenue;
    const margin = totalRevenue > 0 ? totalRevenue - totalOperatingCost : (cashPrice > 0 ? cashPrice - totalOperatingCost : null);
    const marginPct = totalRevenue > 0 && margin !== null ? ((margin / totalRevenue) * 100).toFixed(1) : null;

    // Update display with badge-style formatting (matching Award Flight Analysis)
    const costEl = document.getElementById('bs-casm-cost');
    const bagCostEl = document.getElementById('bs-casm-bag-cost');
    const bagCostContainer = bagCostEl?.closest('.bs-casm-result-item');
    const totalCostEl = document.getElementById('bs-casm-total-cost');
    const cashEl = document.getElementById('bs-casm-cash-display');
    const marginEl = document.getElementById('bs-casm-margin');

    // CASM Cost - clean black text
    if (costEl) {
      costEl.innerHTML = `<span style="color:#000000;font-size:14px;font-weight:600;">💰 $${casmCostWithMultiplier.toFixed(2)}</span>`;
    }
    
    // Cash - clean black text
    if (cashEl) {
      if (cashPrice > 0) {
        cashEl.innerHTML = `<span style="color:#000000;font-size:14px;font-weight:600;">💵 $${cashPrice.toFixed(2)}</span>`;
      } else {
        cashEl.innerHTML = `<span style="color:#666666;font-size:14px;font-weight:500;">—</span>`;
      }
    }

    // Margin - clean black text with Save/More indicator
    if (marginEl) {
      if (margin !== null && marginPct !== null) {
        const marginText = margin >= 0 ? 'Save' : 'More';
        const marginPctText = `${Math.abs(parseFloat(marginPct))}%`;
        
        marginEl.innerHTML = `<span style="color:#000000;font-size:14px;font-weight:600;">$${Math.abs(margin).toFixed(2)} ${marginText} ${marginPctText}</span>`;
      } else if (margin !== null) {
        marginEl.innerHTML = `<span style="color:#000000;font-size:14px;font-weight:600;">$${Math.abs(margin).toFixed(2)}</span>`;
      } else {
        marginEl.innerHTML = `<span style="color:#666666;font-size:14px;font-weight:500;">$0.00</span>`;
      }
    }
    
    // Bag Cost - clean black text
    if (bagCostEl) {
      if (bags >= 1) {
        bagCostEl.innerHTML = `<span style="color:#000000;font-size:14px;font-weight:600;">💰 $${bagExpectedCostTotal.toFixed(2)}</span>`;
        if (bagCostContainer) bagCostContainer.style.display = '';
      } else {
        if (bagCostContainer) bagCostContainer.style.display = 'none';
      }
    }
    
    // Total Cost - bold black text
    if (totalCostEl) {
      totalCostEl.innerHTML = `<span style="color:#000000;font-size:16px;font-weight:700;">$${totalOperatingCost.toFixed(2)}</span>`;
    }

    resultsDiv.style.display = 'block';
  }
  
  // Make calculateCASM globally accessible immediately after function definition
  window.calculateCASM = calculateCASM

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
  const currencyBtn = document.querySelector('.bs-btn-currency');
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

  // Initialize Currency Converter button
  if (currencyBtn) {
    currencyBtn.addEventListener('click', () => {
      if (window.currencyConverter) {
        window.currencyConverter.open();
      } else if (window.initializeCurrencyConverter) {
        window.initializeCurrencyConverter();
        setTimeout(() => {
          if (window.currencyConverter) {
            window.currencyConverter.open();
          }
        }, 100);
      }
    });
  }
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
  },
  {
    id: 'radisson',
    name: 'Radisson',
    currentLevel: 1,
    totalLevels: 3,
    levels: [
      { level: 1, name: 'Club', color: 'bg-gray-100 text-gray-800', benefits: ['Points earning', 'Member rates', 'Free WiFi', 'Points toward free N', 'No blackout dates', 'Member promotions', 'Mobile check-in'] },
      { level: 2, name: 'Premium\n(15 N)', color: 'bg-gray-300 text-gray-800', benefits: ['15% bonus points', 'Late Check-Out 2pm', 'Preferred rooms', 'Welcome gift'] },
      { level: 3, name: 'VIP\n(30 N)', color: 'bg-yellow-200 text-yellow-800', benefits: ['25% bonus points', 'Suite upgrade', 'Late Check-Out 4pm', 'Welcome amenity', 'Guaranteed availability', 'Early Check-In', 'Club lounge access', 'Free breakfast'] }
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

// Initialize Hotel Benefits
function initializeHotelBenefits() {
  const benefitsSection = document.getElementById('bs-hotel-benefits-section');
  if (!benefitsSection) return;

  // Get current level for a hotel program from Supabase
  async function getCurrentLevel(hotelId) {
    try {
      const data = await HotelStatusLevelsService.getByProgramId(hotelId);
      return data?.current_level || 1;
    } catch (error) {
      console.error('Error getting current level:', error);
      return 1;
    }
  }

  // Get validity date for a hotel program from Supabase
  async function getValidityDate(hotelId) {
    try {
      const data = await HotelStatusLevelsService.getByProgramId(hotelId);
      return data?.valid_until || null;
    } catch (error) {
      console.error('Error getting validity date:', error);
      return null;
    }
  }

  // Update status level in Supabase
  async function updateStatus(hotelId, newLevel) {
    try {
      const program = HOTEL_PROGRAMS.find(p => p.id === hotelId);
      if (!program) {
        console.error('Program not found:', hotelId);
        return;
      }

      const levelData = program.levels.find(l => l.level === newLevel);
      const levelName = levelData?.name || `Level ${newLevel}`;

      await HotelStatusLevelsService.upsert(
        hotelId,
        program.name,
        newLevel,
        levelName,
        null
      );

      // Update local state
      const hotel = hotelStatuses.find(h => h.id === hotelId);
      if (hotel) hotel.currentLevel = newLevel;

      await renderBenefitsTable();
      await renderStatusSelectors();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  // Update validity date in Supabase
  async function updateValidityDate(hotelId, newDate) {
    try {
      const program = HOTEL_PROGRAMS.find(p => p.id === hotelId);
      if (!program) {
        console.error('Program not found:', hotelId);
        return;
      }

      const existing = await HotelStatusLevelsService.getByProgramId(hotelId);
      const currentLevel = existing?.current_level || 1;
      const levelData = program.levels.find(l => l.level === currentLevel);
      const levelName = levelData?.name || `Level ${currentLevel}`;

      await HotelStatusLevelsService.upsert(
        hotelId,
        program.name,
        currentLevel,
        levelName,
        newDate || null
      );

      await renderBenefitsTable();
    } catch (error) {
      console.error('Error updating validity date:', error);
    }
  }

  // Initialize hotel programs with levels from Supabase
  let hotelStatuses = [];
  let isLoading = false;

  // Load hotel statuses from Supabase
  async function loadHotelStatuses() {
    if (isLoading) return;
    isLoading = true;

    try {
      // Fetch all hotel status levels from Supabase
      await HotelStatusLevelsService.fetchAll();

      // Initialize hotel programs with Supabase data
      hotelStatuses = await Promise.all(HOTEL_PROGRAMS.map(async (program) => {
        const supabaseData = await HotelStatusLevelsService.getByProgramId(program.id);
        return {
          ...program,
          currentLevel: supabaseData?.current_level || 1
        };
      }));

      // Re-render everything with fresh data
      renderQuickFilters();
      await renderBenefitsTable();
      if (isStatusSectionExpanded) {
        await renderStatusSelectors();
      }
    } catch (error) {
      console.error('Error loading hotel statuses:', error);
      // Fallback to default levels if Supabase fails
      hotelStatuses = HOTEL_PROGRAMS.map(program => ({
        ...program,
        currentLevel: 1
      }));
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

    // Load all validity dates from Supabase
    const validityData = await Promise.all(
      hotelStatuses.map(async (hotel) => {
        const validityDate = await getValidityDate(hotel.id);
        return { hotelId: hotel.id, validityDate };
      })
    );

    const validityMap = new Map(validityData.map(item => [item.hotelId, item.validityDate]));

    container.innerHTML = hotelStatuses.map(hotel => {
      const isFavorite = favoritePrograms.includes(hotel.id);
      const validityDate = validityMap.get(hotel.id) || null;
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

  // Render benefits table (async to load validity dates from Supabase)
  async function renderBenefitsTable() {
    const container = document.getElementById('bs-hotel-benefits-table-container');
    if (!container) return;

    const filteredPrograms = filterPrograms();
    
    // Get all unique levels
    const allLevels = Array.from(new Set(hotelStatuses.flatMap(h => h.levels.map(l => l.level)))).sort((a, b) => a - b);

    if (filteredPrograms.length === 0) {
      container.innerHTML = '<div class="bs-hotel-benefits-no-results">No programs match your filters.</div>';
      return;
    }

    // Show loading state
    container.innerHTML = '<div class="bs-hotel-benefits-loading">Loading benefits data...</div>';

    // Load all validity dates from Supabase
    const validityData = await Promise.all(
      filteredPrograms.map(async (hotel) => {
        const validityDate = await getValidityDate(hotel.id);
        return { hotelId: hotel.id, validityDate };
      })
    );

    const validityMap = new Map(validityData.map(item => [item.hotelId, item.validityDate]));

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

  // Initial render - load data from Supabase first
  loadHotelStatuses();
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

