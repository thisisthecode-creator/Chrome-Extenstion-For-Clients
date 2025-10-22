// Transfer Partners Tooltip Component
// Shows airline transfer partners with ratios on hover

// Initialize global variables
window.selectedCards = new Set();

// Global sorting state
let currentSort = { field: null, direction: 'asc' };

// Setup sorting functionality
function setupSorting() {
  console.log('Setting up sorting functionality...');
  // Use event delegation on the document to handle dynamically added elements
  if (!window.sortingInitialized) {
    document.addEventListener('click', function(event) {
      console.log('Click event detected:', event.target);
      if (event.target.closest('.sort-button')) {
        console.log('Sort button clicked!');
        const button = event.target.closest('.sort-button');
        const sortable = button.closest('.sortable');
        const sortField = sortable?.dataset.sort;
        
        console.log('Sort field:', sortField);
        if (sortField) {
          console.log('Sorting by:', sortField);
          
          // Toggle direction if same field, otherwise set to desc
          if (currentSort.field === sortField) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
          } else {
            currentSort.direction = 'desc';
          }
          currentSort.field = sortField;
          
          console.log('Current sort state:', currentSort);
          
          // Update sort indicators
          updateSortIndicators();
          
          // Sort the cards
          sortCards();
        }
      }
    });
    window.sortingInitialized = true;
    console.log('Sorting functionality initialized');
  } else {
    console.log('Sorting already initialized');
  }
}

function updateSortIndicators() {
  // Clear all indicators
  document.querySelectorAll('.sort-indicator').forEach(indicator => {
    indicator.textContent = '';
    indicator.className = 'sort-indicator';
  });
  
  // Set active indicator
  if (currentSort.field) {
    const activeButton = document.querySelector(`[data-sort="${currentSort.field}"] .sort-indicator`);
    if (activeButton) {
      activeButton.textContent = currentSort.direction === 'asc' ? '↑' : '↓';
      activeButton.className = 'sort-indicator active';
    }
  }
}

function sortCards() {
  const tbody = document.querySelector('#selected-cards-grid tbody');
  if (!tbody) {
    console.log('No tbody found for sorting');
    return;
  }
  
  const rows = Array.from(tbody.querySelectorAll('tr'));
  console.log('Found rows to sort:', rows.length);
  
  if (rows.length === 0) {
    console.log('No rows found to sort');
    return;
  }
  
  rows.sort((a, b) => {
    let aValue, bValue;
    
    if (currentSort.field === 'card-name') {
      // For card names, sort alphabetically
      const aCell = a.querySelector('.card-name-cell .card-name');
      const bCell = b.querySelector('.card-name-cell .card-name');
      const aText = aCell?.textContent || '';
      const bText = bCell?.textContent || '';
      aValue = aText.toLowerCase();
      bValue = bText.toLowerCase();
      console.log(`Card name sorting: ${aText} vs ${bText}`);
      
      // String comparison for alphabetical sorting
      const comparison = aValue.localeCompare(bValue);
      const result = currentSort.direction === 'asc' ? comparison : -comparison;
      console.log(`Sort result: ${result}`);
      return result;
    } else if (currentSort.field === 'annual-fee') {
      // For annual fee, look in the annual-fee column
      const aCell = a.querySelector('.annual-fee-col .multiplier-value');
      const bCell = b.querySelector('.annual-fee-col .multiplier-value');
      const aText = aCell?.textContent || '$0';
      const bText = bCell?.textContent || '$0';
      aValue = parseFloat(aText.replace('$', '')) || 0;
      bValue = parseFloat(bText.replace('$', '')) || 0;
      console.log(`Annual fee sorting: ${aText} (${aValue}) vs ${bText} (${bValue})`);
      
      const comparison = aValue - bValue;
      const result = currentSort.direction === 'asc' ? comparison : -comparison;
      console.log(`Sort result: ${result}`);
      return result;
    } else {
      // For multiplier fields, look in the specific column
      const aCell = a.querySelector(`.${currentSort.field}-col .multiplier-value`);
      const bCell = b.querySelector(`.${currentSort.field}-col .multiplier-value`);
      const aText = aCell?.textContent || '1x';
      const bText = bCell?.textContent || '1x';
      aValue = parseFloat(aText.replace('x', '')) || 1;
      bValue = parseFloat(bText.replace('x', '')) || 1;
      console.log(`${currentSort.field} sorting: ${aText} (${aValue}) vs ${bText} (${bValue})`);
      
      const comparison = aValue - bValue;
      const result = currentSort.direction === 'asc' ? comparison : -comparison;
      console.log(`Sort result: ${result}`);
      return result;
    }
  });
  
  // Clear tbody and re-append sorted rows
  tbody.innerHTML = '';
  rows.forEach(row => {
    tbody.appendChild(row);
  });
  
  console.log('Sorting completed');
}

// Setup enhanced tooltips for better user experience
function setupEnhancedTooltips() {
  console.log('Setting up enhanced tooltips...');
  
  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.id = 'enhanced-tooltip';
  tooltip.style.cssText = `
    position: absolute;
    background: #202124;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
    max-width: 200px;
  `;
  document.body.appendChild(tooltip);
  
  // Add event listeners for tooltips
  document.addEventListener('mouseover', function(event) {
    if (event.target.closest('.sort-button')) {
      const button = event.target.closest('.sort-button');
      const title = button.getAttribute('title');
      
      if (title) {
        showTooltip(event, title);
      }
    }
  });
  
  document.addEventListener('mouseout', function(event) {
    if (event.target.closest('.sort-button')) {
      hideTooltip();
    }
  });
  
  document.addEventListener('mousemove', function(event) {
    if (event.target.closest('.sort-button')) {
      updateTooltipPosition(event);
    }
  });
  
  function showTooltip(event, text) {
    tooltip.textContent = text;
    tooltip.style.opacity = '1';
    updateTooltipPosition(event);
  }
  
  function hideTooltip() {
    tooltip.style.opacity = '0';
  }
  
  function updateTooltipPosition(event) {
    const rect = event.target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    let top = rect.top - tooltipRect.height - 8;
    
    // Keep tooltip within viewport
    if (left < 8) left = 8;
    if (left + tooltipRect.width > window.innerWidth - 8) {
      left = window.innerWidth - tooltipRect.width - 8;
    }
    if (top < 8) {
      top = rect.bottom + 8;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }
}

class TransferPartnersTooltip {
  constructor(triggerElement) {
    this.trigger = triggerElement;
    this.tooltip = null;
    this.isVisible = false;
    this.hideTimeout = null;
    
    this.init();
  }

  init() {
    this.createTooltip();
    this.bindEvents();
  }

  createTooltip() {
    // Create tooltip container
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'transfer-partners-tooltip';
    this.tooltip.style.display = 'none';
    
    // Add to document
    document.body.appendChild(this.tooltip);
  }

  bindEvents() {
    // Show on mouse enter
    this.trigger.addEventListener('mouseenter', async () => {
      await this.showTooltip();
    });

    // Hide on mouse leave
    this.trigger.addEventListener('mouseleave', () => {
      this.hideTooltip();
    });

    // Keep tooltip visible when hovering over it
    this.tooltip.addEventListener('mouseenter', () => {
      this.clearHideTimeout();
    });

    this.tooltip.addEventListener('mouseleave', () => {
      this.hideTooltip();
    });
  }

  async showTooltip() {
    this.clearHideTimeout();
    this.isVisible = true;
    await this.renderContent();
    this.positionTooltip();
    this.tooltip.style.display = 'block';
  }

  hideTooltip() {
    this.hideTimeout = setTimeout(() => {
      this.isVisible = false;
      this.tooltip.style.display = 'none';
    }, 100);
  }

  clearHideTimeout() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  positionTooltip() {
    const triggerRect = this.trigger.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Position below the trigger by default
    let top = triggerRect.bottom + 8;
    let left = triggerRect.left;

    // Adjust if tooltip would go off screen
    if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width - 16;
    }

    if (top + tooltipRect.height > viewportHeight) {
      // Position above the trigger instead
      top = triggerRect.top - tooltipRect.height - 8;
    }

    if (left < 16) {
      left = 16;
    }

    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = `${left}px`;
  }

  async renderContent() {
    try {
      console.log('Transfer Partners Tooltip: Starting to render content...');
      console.log('window.getTransferPartnersData exists:', !!window.getTransferPartnersData);
      
      const partners = window.getTransferPartnersData ? await window.getTransferPartnersData() : [];
      console.log('Partners loaded:', partners.length, partners);
      
      // Group by type
      const airlines = partners.filter(p => p.type === 'Airline');
      const hotels = partners.filter(p => p.type === 'Hotel');
      console.log('Airlines:', airlines.length, 'Hotels:', hotels.length);

    this.tooltip.innerHTML = `
      <div class="tooltip-header">
        <h3>Transfer Partners & Ratios</h3>
        <div class="tooltip-subtitle">Credit Card → Airline/Hotel Programs</div>
      </div>
      
      <div class="tooltip-content">
        <div class="partners-section">
          <h4>Airlines</h4>
          <div class="partners-grid">
            ${airlines.slice(0, 12).map(partner => this.renderPartnerCard(partner)).join('')}
          </div>
        </div>
        
        <div class="partners-section">
          <h4>Hotels</h4>
          <div class="partners-grid">
            ${hotels.slice(0, 8).map(partner => this.renderPartnerCard(partner)).join('')}
          </div>
        </div>
        
        <div class="tooltip-footer">
          <div class="ratio-legend">
            <span class="legend-item">
              <span class="legend-color amex"></span>
              <span>Amex</span>
            </span>
            <span class="legend-item">
              <span class="legend-color chase"></span>
              <span>Chase</span>
            </span>
            <span class="legend-item">
              <span class="legend-color citi"></span>
              <span>Citi</span>
            </span>
            <span class="legend-item">
              <span class="legend-color capital-one"></span>
              <span>Capital One</span>
            </span>
            <span class="legend-item">
              <span class="legend-color bilt"></span>
              <span>Bilt</span>
            </span>
          </div>
        </div>
      </div>
    `;
    } catch (error) {
      console.error('Error rendering transfer partners content:', error);
      this.tooltip.innerHTML = `
        <div class="tooltip-header">
          <h3>Transfer Partners & Ratios</h3>
          <div class="tooltip-subtitle">Loading...</div>
        </div>
        <div class="tooltip-content">
          <div style="text-align: center; padding: 20px; color: #5f6368;">
            Loading transfer partners from database...
          </div>
        </div>
      `;
    }
  }

  renderPartnerCard(partner) {
    return `
      <div class="partner-card">
        <div class="partner-header">
          <div class="partner-name">${partner.name}</div>
          <div class="partner-program">${partner.program}</div>
        </div>
        <div class="partner-alliance">${partner.alliance}</div>
        <div class="partner-ratios">
          <div class="ratio-row">
            <span class="ratio-label">Amex:</span>
            <span class="ratio-value amex">${partner.amex}</span>
          </div>
          <div class="ratio-row">
            <span class="ratio-label">Chase:</span>
            <span class="ratio-value chase">${partner.chase}</span>
          </div>
          <div class="ratio-row">
            <span class="ratio-label">Citi:</span>
            <span class="ratio-value citi">${partner.citi}</span>
          </div>
          <div class="ratio-row">
            <span class="ratio-label">Cap1:</span>
            <span class="ratio-value capital-one">${partner.capital_one}</span>
          </div>
          <div class="ratio-row">
            <span class="ratio-label">Bilt:</span>
            <span class="ratio-value bilt">${partner.bilt}</span>
          </div>
        </div>
      </div>
    `;
  }

  destroy() {
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }
  }
}

// Initialize transfer partners tooltip
function initializeTransferPartnersTooltip() {
  const infoButton = document.getElementById('bs-transfer-partners-info');
  if (infoButton && !infoButton.dataset.tooltipInitialized) {
    new TransferPartnersTooltip(infoButton);
    infoButton.dataset.tooltipInitialized = 'true';
  }
}

// Initialize Information section content
function initializeInformationContent() {
  console.log('Initializing Information section content...');
  
  // Check if the Information section exists
  const informationSection = document.getElementById('bs-information-section');
  if (!informationSection) {
    console.log('Information section not found, skipping initialization');
    return;
  }
  
  console.log('Information section found, initializing content...');
  
  // Load and display combined data (cards and transfer partners)
  loadCombinedData();
  
  // Load saved information data
  loadInformationDataFromStorage();
}

// Load transfer partners data for Information section
async function loadTransferPartnersForInformation() {
  try {
    console.log('Loading transfer partners for Information section...');
    
    if (!window.getTransferPartnersData) {
      console.error('getTransferPartnersData function not available');
      return;
    }
    
    const partners = await window.getTransferPartnersData();
    console.log('Loaded partners for Information section:', partners.length);
    
    const contentContainer = document.getElementById('transfer-partners-content');
    if (contentContainer) {
      renderTransferPartnersForInformation(partners, contentContainer);
    }
  } catch (error) {
    console.error('Error loading transfer partners for Information section:', error);
  }
}

// Render transfer partners in Information section
function renderTransferPartnersForInformation(partners, container) {
  console.log('Rendering transfer partners for Information section...');
  
  // Group partners by type
  const airlinePartners = partners.filter(p => p.type === 'Airline');
  const hotelPartners = partners.filter(p => p.type === 'Hotel');
  
  console.log(`Found ${airlinePartners.length} airline partners and ${hotelPartners.length} hotel partners`);
  
  // Create the content
  let html = `
    <div class="transfer-partners-info-content">
      <div class="partners-section">
        <h4>✈️ Airlines (${airlinePartners.length})</h4>
        <div class="partners-grid">
          ${airlinePartners.map(partner => renderPartnerCard(partner)).join('')}
        </div>
      </div>
      
      <div class="partners-section">
        <h4>🏨 Hotels (${hotelPartners.length})</h4>
        <div class="partners-grid">
          ${hotelPartners.map(partner => renderPartnerCard(partner)).join('')}
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  console.log('Transfer partners rendered in Information section');
}

// Render individual partner card
function renderPartnerCard(partner) {
  // Get available programs from selected cards
  const availablePrograms = new Set();
  if (window.selectedCards && window.selectedCards.size > 0) {
    const selectedCardsData = window.allCards.filter(card => window.selectedCards.has(card.id.toString()));
    selectedCardsData.forEach(card => {
      const program = card.program;
      if (program) {
        if (program.includes('Amex (Membership Rewards)')) {
          availablePrograms.add('amex');
        } else if (program.includes('Chase (Ultimate Rewards)')) {
          availablePrograms.add('chase');
        } else if (program.includes('Citi (ThankYou Points)')) {
          availablePrograms.add('citi');
        } else if (program.includes('Capital One (Venture Miles)')) {
          availablePrograms.add('capital_one');
        } else if (program.includes('Bilt (Rewards)')) {
          availablePrograms.add('bilt');
        } else if (program.includes('Wells Fargo (Rewards)')) {
          availablePrograms.add('wells_fargo');
        }
      }
    });
  }
  
  // Only show ratios for available programs
  const allRatios = [
    { name: 'Amex', value: partner.amex, color: '#006fcf', key: 'amex' },
    { name: 'Chase', value: partner.chase, color: '#0f5132', key: 'chase' },
    { name: 'Citi', value: partner.citi, color: '#0566c3', key: 'citi' },
    { name: 'Capital One', value: partner.capital_one, color: '#dc2626', key: 'capital_one' },
    { name: 'Bilt', value: partner.bilt, color: '#7c3aed', key: 'bilt' },
    { name: 'Wells Fargo', value: partner.wells_fargo, color: '#d97706', key: 'wells_fargo' }
  ];
  
  // Filter to only show ratios for selected credit card programs
  const ratios = allRatios.filter(ratio => {
    const hasValue = ratio.value && ratio.value !== 'N/A';
    const isAvailable = availablePrograms.size === 0 || availablePrograms.has(ratio.key);
    return hasValue && isAvailable;
  });
  
  return `
    <div class="partner-card">
      <div class="partner-header">
        <h5>${partner.name}</h5>
        <span class="partner-program">${partner.program}</span>
        ${partner.alliance && partner.alliance !== 'None' ? `<span class="partner-alliance">${partner.alliance}</span>` : ''}
      </div>
      <div class="partner-ratios">
        ${ratios.map(ratio => `
          <div class="ratio-item" style="border-left: 3px solid ${ratio.color}">
            <span class="ratio-card">${ratio.name}</span>
            <span class="ratio-value">${ratio.value}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Combined Credit Cards & Transfer Partners functionality
let selectedCards = new Set();
window.window.allCards = [];
let filteredCards = [];
window.window.allTransferPartners = [];
let filteredTransferPartners = [];

// Initialize combined credit cards and transfer partners
function initializeCreditCardMultipliers() {
  console.log('Initializing combined credit cards and transfer partners...');
  
  const checkForInformationSection = () => {
    const informationSection = document.getElementById('bs-information-section');
    console.log('Looking for Information section...', informationSection);
    
    if (informationSection) {
      console.log('Information section found, initializing combined functionality...');
      loadCombinedData();
      bindCreditCardEvents();
    } else {
      console.log('Information section not found, retrying...');
      setTimeout(checkForInformationSection, 100);
    }
  };
  
  checkForInformationSection();
}

// Load combined data (credit cards and transfer partners)
async function loadCombinedData() {
  try {
    console.log('Loading combined data...');
    
    // Load credit cards
    if (!window.getCreditCardsData) {
      console.error('getCreditCardsData function not available');
      return;
    }
    
    window.window.allCards = await window.getCreditCardsData();
    console.log('Loaded credit cards:', window.window.allCards.length);
    
    // Load transfer partners
    if (!window.getTransferPartnersData) {
      console.error('getTransferPartnersData function not available');
      return;
    }
    
    window.window.allTransferPartners = await window.getTransferPartnersData();
    console.log('Loaded transfer partners:', window.window.allTransferPartners.length);
    
    filteredCards = [...window.window.allCards];
    filteredTransferPartners = [...window.window.allTransferPartners];
    
  // Update the total cards count
  updateTotalCardsCount();
  
  renderCardSelection();
  renderSelectedCards();
  renderAvailableTransferPartners();
  
  // Initialize transfer partners search
  initializeTransferPartnersSearch();
  } catch (error) {
    console.error('Error loading combined data:', error);
  }
}

// Render card selection grid
function renderCardSelection() {
  const grid = document.getElementById('card-selection-grid');
  if (!grid) {
    console.log('Card selection grid not found');
    return;
  }
  
  if (!window.window.allCards || window.window.allCards.length === 0) {
    console.log('No cards data available for selection');
    return;
  }
  
  console.log('Rendering card selection grid...');
  
  const html = filteredCards.map(card => {
    // Get all multiplier categories
    const categories = [
      { name: 'Airfare', value: card.airfare_multiplier, icon: '✈️' },
      { name: 'Hotels', value: card.hotels_multiplier, icon: '🏨' },
      { name: 'Travel', value: card.travel_multiplier, icon: '🧳' },
      { name: 'Dining', value: card.restaurants_multiplier, icon: '🍽️' },
      { name: 'Rental', value: card.rental_multiplier, icon: '🚗' },
      { name: 'Ads', value: card.ads_multiplier, icon: '📱' }
    ].filter(cat => cat.value > 1);

    return `
      <div class="card-selection-item ${window.selectedCards && window.selectedCards.has(card.id.toString()) ? 'selected' : ''}" 
           data-card-id="${card.id}">
        <div class="card-selection-content">
          <input type="checkbox" class="card-checkbox" data-card-id="${card.id}" ${window.selectedCards && window.selectedCards.has(card.id.toString()) ? 'checked' : ''}>
          <div class="card-logo">${getCardLogo(card.card_type)}</div>
          <div class="card-details">
            <div class="card-name">${card.name}</div>
            <div class="card-fee">$${card.annual_fee || '0'} annual fee</div>
            <div class="card-multipliers">
              ${categories.length > 0 ? categories.map(cat => `
                <div class="multiplier-item">
                  <span class="multiplier-icon">${cat.icon}</span>
                  <span class="multiplier-value">${cat.value}x</span>
                </div>
              `).join('') : '<div class="no-multipliers">Standard 1x on all purchases</div>'}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  grid.innerHTML = html;
  
  // Add event listeners to checkboxes
  grid.querySelectorAll('.card-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const cardId = this.dataset.cardId;
      console.log('Checkbox changed for card:', cardId);
      toggleCardSelection(cardId);
    });
  });
}

// Toggle card selection
function toggleCardSelection(cardId) {
  console.log('=== TOGGLE CARD SELECTION ===');
  console.log('Toggling card selection for ID:', cardId);
  console.log('Current selectedCards before:', window.selectedCards ? Array.from(window.selectedCards) : 'undefined');
  
  if (!window.selectedCards) {
    window.selectedCards = new Set();
    console.log('Initialized selectedCards Set');
  }
  
  const cardIdStr = cardId.toString();
  
  if (window.selectedCards.has(cardIdStr)) {
    window.selectedCards.delete(cardIdStr);
    console.log('Card deselected:', cardId);
  } else {
    window.selectedCards.add(cardIdStr);
    console.log('Card selected:', cardId);
  }
  
  console.log('Selected cards after:', Array.from(window.selectedCards));
  
  // Update the UI with a small delay to ensure DOM is ready
  setTimeout(() => {
    console.log('Updating UI components...');
    renderCardSelection();
    renderSelectedCards();
    filterTransferPartnersBySelectedCards();
    updateCounts();
    
    // Collapse My Credit Cards section if cards are selected (keep collapsed by default)
    const creditCardsSection = document.querySelector('#bs-information-section .card-selection-panel');
    if (creditCardsSection && window.selectedCards && window.selectedCards.size > 0) {
      console.log('Cards selected, collapsing My Credit Cards section');
      creditCardsSection.classList.remove('expanded');
    }
    
    console.log('UI update complete');
  }, 10);
}

// Make functions available globally
window.toggleCardSelection = toggleCardSelection;
window.renderCardSelection = renderCardSelection;
window.renderSelectedCards = renderSelectedCards;
window.filterTransferPartnersBySelectedCards = filterTransferPartnersBySelectedCards;
window.updateCounts = updateCounts;

// Load saved information data from localStorage
function loadInformationDataFromStorage() {
  try {
    const savedData = localStorage.getItem('bs-information-data');
    if (savedData) {
      const informationData = JSON.parse(savedData);
      console.log('Loading saved information data:', informationData);
      
      if (informationData.selectedCards && Array.isArray(informationData.selectedCards)) {
        // Restore selected cards
        if (!window.selectedCards) {
          window.selectedCards = new Set();
        }
        
        // Clear current selections
        window.selectedCards.clear();
        
        // Add saved selections
        informationData.selectedCards.forEach(cardId => {
          window.selectedCards.add(cardId.toString());
        });
        
        console.log('Restored selected cards:', Array.from(window.selectedCards));
        
        // Update UI
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
        
        // Show feedback
        if (window.showFeedback) {
          window.showFeedback('Information data loaded successfully!', 'success');
        }
      }
    }
  } catch (error) {
    console.error('Error loading information data from storage:', error);
  }
}

// Make loadInformationDataFromStorage available globally
window.loadInformationDataFromStorage = loadInformationDataFromStorage;

// Handle card selection
function handleCardSelection(event) {
  const cardId = event.target.closest('.card-selection-item').dataset.cardId;
  
  if (event.target.checked) {
    selectedCards.add(cardId);
  } else {
    selectedCards.delete(cardId);
  }
  
  console.log('Selected cards:', selectedCards.size);
  renderSelectedCards();
  filterTransferPartnersBySelectedCards();
  updateCounts();
}

// Render selected cards in comparison table format
function renderSelectedCards() {
  console.log('renderSelectedCards called');
  const grid = document.getElementById('selected-cards-grid');
  if (!grid) {
    console.log('Selected cards grid not found');
    return;
  }
  
  if (!window.window.allCards || window.window.allCards.length === 0) {
    console.log('No cards data available');
    return;
  }
  
  const selectedCardsData = window.window.allCards.filter(card => window.selectedCards && window.selectedCards.has(card.id.toString()));
  console.log('Selected cards data:', selectedCardsData.length, 'cards');
  console.log('All cards available:', window.window.allCards.length);
  console.log('Selected cards Set:', window.selectedCards ? Array.from(window.selectedCards) : 'undefined');
  
  if (selectedCardsData.length === 0) {
    console.log('No cards selected, showing empty message');
    grid.innerHTML = '<div class="no-cards-selected">No cards selected</div>';
    return;
  }

  // Create comparison table with all categories always visible
  const html = `
    <div class="selected-cards-comparison">
      <div class="comparison-header">
        <h4>Selected Cards (${selectedCardsData.length})</h4>
      </div>
      
      <div class="comparison-table-container">
        <table class="comparison-table">
          <thead>
            <tr>
              <th class="card-name-header sortable" data-sort="card-name">
                <button class="sort-button" title="Card Name - Sort alphabetically">
                  Card
                  <span class="sort-indicator"></span>
                </button>
              </th>
              <th class="annual-fee-col sortable" data-sort="annual-fee">
                <button class="sort-button" title="Annual Fee - Sort by fee amount">
                  💰
                  <span class="sort-indicator"></span>
                </button>
              </th>
              <th class="airfare-col sortable" data-sort="airfare">
                <button class="sort-button" title="Airfare">
                  ✈️
                  <span class="sort-indicator"></span>
                </button>
              </th>
              <th class="hotels-col sortable" data-sort="hotels">
                <button class="sort-button" title="Hotels">
                  🏨
                  <span class="sort-indicator"></span>
                </button>
              </th>
              <th class="travel-col sortable" data-sort="travel">
                <button class="sort-button" title="Travel">
                  🧳
                  <span class="sort-indicator"></span>
                </button>
              </th>
              <th class="rental-col sortable" data-sort="rental">
                <button class="sort-button" title="Rental Cars">
                  🚗
                  <span class="sort-indicator"></span>
                </button>
              </th>
              <th class="restaurants-col sortable" data-sort="restaurants">
                <button class="sort-button" title="Restaurants">
                  🍽️
                  <span class="sort-indicator"></span>
                </button>
              </th>
              <th class="ads-col sortable" data-sort="ads">
                <button class="sort-button" title="Advertising">
                  📱
                  <span class="sort-indicator"></span>
                </button>
              </th>
              <th class="other-col sortable" data-sort="other">
                <button class="sort-button" title="Other">
                  💳
                  <span class="sort-indicator"></span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
      ${selectedCardsData.map(card => {
        const getMultiplierDisplay = (value, category) => {
          if (!value || value === 0) return { text: '1x • 2.71%', color: 'orange', rank: '' };
          
          // Calculate percentage (simplified calculation)
          const percentage = (value * 2.71).toFixed(2) + '%';
          
          // Determine color and rank based on value
          let color = 'orange';
          let rank = '';
          
          if (value >= 4) {
            color = 'green';
            rank = '1';
          } else if (value >= 3) {
            color = 'yellow';
            rank = '2';
          } else if (value >= 2) {
            color = 'yellow';
            rank = '3';
          }
          
          return { text: `${value}x • ${percentage}`, color, rank };
        };

        const airfare = getMultiplierDisplay(card.airfare_multiplier, 'airfare');
        const hotels = getMultiplierDisplay(card.hotels_multiplier, 'hotels');
        const travel = getMultiplierDisplay(card.travel_multiplier, 'travel');
        const rental = getMultiplierDisplay(card.rental_multiplier, 'rental');
        const restaurants = getMultiplierDisplay(card.restaurants_multiplier, 'restaurants');
        const ads = getMultiplierDisplay(card.ads_multiplier, 'ads');
        const other = getMultiplierDisplay(card.other_multiplier, 'other');

        // Get top 3 categories for this card
        const categories = [
          { name: 'Airfare', value: card.airfare_multiplier, icon: '✈️' },
          { name: 'Hotels', value: card.hotels_multiplier, icon: '🏨' },
          { name: 'Travel', value: card.travel_multiplier, icon: '🧳' },
          { name: 'Dining', value: card.restaurants_multiplier, icon: '🍽️' },
          { name: 'Rental', value: card.rental_multiplier, icon: '🚗' },
          { name: 'Ads', value: card.ads_multiplier, icon: '📱' }
        ];
        
        const topCategories = categories
          .filter(cat => cat.value > 1)
          .sort((a, b) => b.value - a.value)
          .slice(0, 3);

        // Get background color based on value (6 levels for better differentiation)
        const getBackgroundColor = (value, type) => {
          if (type === 'multiplier') {
            // For multipliers: 6 levels from excellent to poor
            if (value >= 10) return 'bg-emerald-100 border border-emerald-200'; // Excellent (10x+)
            if (value >= 5) return 'bg-green-100 border border-green-200';      // Very Good (5x+)
            if (value >= 3) return 'bg-lime-100 border border-lime-200';        // Good (3x+)
            if (value >= 2) return 'bg-yellow-100 border border-yellow-200';    // Fair (2x+)
            if (value >= 1) return 'bg-orange-100 border border-orange-200';    // Poor (1x+)
            return 'bg-gray-50 border border-gray-100';                         // None (0x)
          } else if (type === 'annual-fee') {
            // For annual fees: green for low fees, red for high fees
            if (value <= 100) return 'bg-green-50 text-green-700'; // Low fee
            if (value <= 300) return 'bg-yellow-50 text-yellow-700'; // Medium fee
            return 'bg-red-50 text-red-700'; // High fee
          }
          return 'bg-gray-50 border border-gray-100';
        };

        return `
          <tr class="card-row">
            <td class="card-name-cell">
              <div class="card-info">
                <div class="card-logo">${getCardLogo(card.card_type)}</div>
                <div class="card-details">
                  <div class="card-name">${card.name}</div>
                  <div class="card-program">${card.program || 'Credit Card'}</div>
                </div>
              </div>
            </td>
            <td class="annual-fee-col">
              <div class="multiplier-value ${getBackgroundColor(card.annual_fee || 0, 'annual-fee')}">$${card.annual_fee || '0'}</div>
            </td>
            <td class="airfare-col">
              <div class="multiplier-value ${getBackgroundColor(card.airfare_multiplier || 1, 'multiplier')}">${card.airfare_multiplier || 1}x</div>
            </td>
            <td class="hotels-col">
              <div class="multiplier-value ${getBackgroundColor(card.hotels_multiplier || 1, 'multiplier')}">${card.hotels_multiplier || 1}x</div>
            </td>
            <td class="travel-col">
              <div class="multiplier-value ${getBackgroundColor(card.travel_multiplier || 1, 'multiplier')}">${card.travel_multiplier || 1}x</div>
            </td>
            <td class="rental-col">
              <div class="multiplier-value ${getBackgroundColor(card.rental_multiplier || 1, 'multiplier')}">${card.rental_multiplier || 1}x</div>
            </td>
            <td class="restaurants-col">
              <div class="multiplier-value ${getBackgroundColor(card.restaurants_multiplier || 1, 'multiplier')}">${card.restaurants_multiplier || 1}x</div>
            </td>
            <td class="ads-col">
              <div class="multiplier-value ${getBackgroundColor(card.ads_multiplier || 1, 'multiplier')}">${card.ads_multiplier || 1}x</div>
            </td>
            <td class="other-col">
              <div class="multiplier-value ${getBackgroundColor(card.other_multiplier || 1, 'multiplier')}">${card.other_multiplier || 1}x</div>
            </td>
          </tr>
        `;
      }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  grid.innerHTML = html;
  
  // Add sorting functionality with event delegation
  setupSorting();
  
  // Add enhanced tooltips for better user experience
  setupEnhancedTooltips();
  
  // My Credit Cards section is collapsed by default (handled by CSS)
}

// Helper function to get card logo based on card_type
function getCardLogo(cardType) {
  if (!cardType) return '<div class="card-logo-fallback">💳</div>';
  
  const networkLower = cardType.toLowerCase();
  
  // Handle exact database values: "Visa"
  if (networkLower === 'visa') {
    return `
      <div class="card-logo-container">
        <img 
          src="https://logotypy.net/wp-content/uploads/2023/09/logo-visa.jpg" 
          alt="Visa" 
          class="card-logo-img"
          onerror="this.outerHTML='<div class=\\'card-logo-fallback visa\\'>VISA</div>'"
        />
      </div>
    `;
  }
  
  // Handle exact database values: "Mastercard"
  if (networkLower === 'mastercard') {
    return `
      <div class="card-logo-container">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/1280px-MasterCard_Logo.svg.png" 
          alt="Mastercard" 
          class="card-logo-img"
          onerror="this.outerHTML='<div class=\\'card-logo-fallback mastercard\\'><div class=\\'mastercard-circles\\'></div></div>'"
        />
      </div>
    `;
  }
  
  // Handle exact database values: "Amex" - check multiple variations
  if (networkLower === 'amex' || networkLower === 'american express' || networkLower === 'americanexpress') {
    return `
      <div class="card-logo-container">
        <img 
          src="https://www.americanexpress.com/content/dam/amex/us/merchant/supplies-uplift/product/images/img-WEBLOGO1-01.jpg" 
          alt="American Express" 
          class="card-logo-img"
          onerror="this.outerHTML='<div class=\\'card-logo-fallback amex\\'>AMEX</div>'"
        />
      </div>
    `;
  }
  
  // Default fallback
  return '<div class="card-logo-fallback">💳</div>';
}

// Bind credit card events
function bindCreditCardEvents() {
  // Search input
  const searchInput = document.getElementById('card-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', handleCardSearch);
  }
  
  // Category filter removed
  
  // View options
  const viewOptions = document.querySelectorAll('.view-option input');
  viewOptions.forEach(option => {
    option.addEventListener('change', renderSelectedCards);
  });
}

// Handle card search
function handleCardSearch(event) {
  const query = event.target.value.toLowerCase();
  
  if (query === '') {
    filteredCards = [...window.allCards];
  } else {
    filteredCards = window.allCards.filter(card => 
      card.name.toLowerCase().includes(query) ||
      card.program.toLowerCase().includes(query) ||
      card.category.toLowerCase().includes(query)
    );
  }
  
  renderCardSelection();
}

  // Handle card filter (removed category filtering)
  function handleCardFilter(event) {
    // Only handle search input, no category filtering
    const searchInput = document.getElementById('card-search-input');
    if (searchInput && event.target === searchInput) {
      const query = searchInput.value.toLowerCase();
      if (query) {
        filteredCards = window.allCards.filter(card => 
          card.name.toLowerCase().includes(query) ||
          card.program.toLowerCase().includes(query)
        );
      } else {
        filteredCards = [...window.allCards];
      }
      renderCardSelection();
    }
  }

// Filter transfer partners based on selected cards
function filterTransferPartnersBySelectedCards() {
  console.log('filterTransferPartnersBySelectedCards called');
  console.log('Selected cards size:', window.selectedCards ? window.selectedCards.size : 0);
  
  if (!window.selectedCards || window.selectedCards.size === 0) {
    // If no cards selected, hide the partners section
    const partnersSection = document.getElementById('available-transfer-partners');
    if (partnersSection) {
      partnersSection.style.display = 'none';
    }
    console.log('No cards selected, hiding partners section');
    return;
  } else {
    // Get selected cards data
    const selectedCardsData = window.window.allCards.filter(card => window.selectedCards.has(card.id.toString()));
    console.log('Selected cards data:', selectedCardsData.length, 'cards');
    
    // Get credit card programs from selected cards
    const availablePrograms = new Set();
    selectedCardsData.forEach(card => {
      // Map card programs to transfer partner program types
      const program = card.program;
      console.log(`Card: ${card.name}, Program: ${program}`);
      if (program) {
        if (program.includes('Amex (Membership Rewards)')) {
          availablePrograms.add('amex');
          console.log('Added amex program');
        } else if (program.includes('Chase (Ultimate Rewards)')) {
          availablePrograms.add('chase');
          console.log('Added chase program');
        } else if (program.includes('Citi (ThankYou Points)')) {
          availablePrograms.add('citi');
          console.log('Added citi program');
        } else if (program.includes('Capital One (Venture Miles)')) {
          availablePrograms.add('capital_one');
          console.log('Added capital_one program');
        } else if (program.includes('Bilt (Rewards)')) {
          availablePrograms.add('bilt');
          console.log('Added bilt program');
        } else if (program.includes('Wells Fargo (Rewards)')) {
          availablePrograms.add('wells_fargo');
          console.log('Added wells_fargo program');
        } else {
          console.log(`Unknown program: ${program}`);
        }
      }
    });
    
    console.log('Available programs:', Array.from(availablePrograms));
    
    // Filter transfer partners that have at least one available credit card program
    filteredTransferPartners = window.allTransferPartners.filter(partner => {
      console.log(`\nChecking partner: ${partner.name}`);
      console.log(`Available programs: ${Array.from(availablePrograms)}`);
      console.log(`Partner ratios - Amex: "${partner.amex}", Chase: "${partner.chase}", Citi: "${partner.citi}", Capital One: "${partner.capital_one}", Bilt: "${partner.bilt}", Wells Fargo: "${partner.wells_fargo}"`);
      
      let hasAvailableTransfer = false;
      
      // Check each available program - STRICT FILTERING: only show if has valid transfer ratio
      if (availablePrograms.has('amex')) {
        const amexValid = partner.amex && 
                         partner.amex !== 'N/A' && 
                         partner.amex !== '' && 
                         partner.amex !== null && 
                         partner.amex !== undefined &&
                         partner.amex.trim() !== '';
        console.log(`  - Amex check: ${amexValid} (value: "${partner.amex}")`);
        if (amexValid) hasAvailableTransfer = true;
      }
      
      if (availablePrograms.has('chase')) {
        const chaseValid = partner.chase && 
                          partner.chase !== 'N/A' && 
                          partner.chase !== '' && 
                          partner.chase !== null && 
                          partner.chase !== undefined &&
                          partner.chase.trim() !== '';
        console.log(`  - Chase check: ${chaseValid} (value: "${partner.chase}")`);
        if (chaseValid) hasAvailableTransfer = true;
      }
      
      if (availablePrograms.has('citi')) {
        const citiValid = partner.citi && 
                       partner.citi !== 'N/A' && 
                       partner.citi !== '' && 
                       partner.citi !== null && 
                       partner.citi !== undefined &&
                       partner.citi.trim() !== '';
        console.log(`  - Citi check: ${citiValid} (value: "${partner.citi}")`);
        if (citiValid) hasAvailableTransfer = true;
      }
      
      if (availablePrograms.has('capital_one')) {
        const capitalOneValid = partner.capital_one && 
                               partner.capital_one !== 'N/A' && 
                               partner.capital_one !== '' && 
                               partner.capital_one !== null && 
                               partner.capital_one !== undefined &&
                               partner.capital_one.trim() !== '';
        console.log(`  - Capital One check: ${capitalOneValid} (value: "${partner.capital_one}")`);
        if (capitalOneValid) hasAvailableTransfer = true;
      }
      
      if (availablePrograms.has('bilt')) {
        const biltValid = partner.bilt && 
                         partner.bilt !== 'N/A' && 
                         partner.bilt !== '' && 
                         partner.bilt !== null && 
                         partner.bilt !== undefined &&
                         partner.bilt.trim() !== '';
        console.log(`  - Bilt check: ${biltValid} (value: "${partner.bilt}")`);
        if (biltValid) hasAvailableTransfer = true;
      }
      
      if (availablePrograms.has('wells_fargo')) {
        const wellsFargoValid = partner.wells_fargo && 
                               partner.wells_fargo !== 'N/A' && 
                               partner.wells_fargo !== '' && 
                               partner.wells_fargo !== null && 
                               partner.wells_fargo !== undefined &&
                               partner.wells_fargo.trim() !== '';
        console.log(`  - Wells Fargo check: ${wellsFargoValid} (value: "${partner.wells_fargo}")`);
        if (wellsFargoValid) hasAvailableTransfer = true;
      }
      
      console.log(`  - Final result: ${hasAvailableTransfer}`);
      
      return hasAvailableTransfer;
    });
  }
  
  console.log(`Filtered to ${filteredTransferPartners.length} available transfer partners`);
  
  // Hide section if no partners found
  if (filteredTransferPartners.length === 0) {
    const partnersSection = document.getElementById('available-transfer-partners');
    if (partnersSection) {
      partnersSection.style.display = 'none';
    }
    return;
  }
  
  renderAvailableTransferPartners();
}

// Render available transfer partners
function renderAvailableTransferPartners() {
  const content = document.getElementById('partners-content');
  const partnersSection = document.getElementById('available-transfer-partners');
  
  if (!content) {
    console.log('Partners content container not found');
    return;
  }
  
  if (!window.allTransferPartners || window.allTransferPartners.length === 0) {
    console.log('No transfer partners data available');
    if (partnersSection) {
      partnersSection.style.display = 'none';
    }
    return;
  }
  
  console.log('Rendering available transfer partners...');
  
  if (filteredTransferPartners.length === 0) {
    // Hide the entire section if no partners match the filters
    if (partnersSection) {
      partnersSection.style.display = 'none';
    }
    return;
  }
  
  // Show the section if there are partners to display
  if (partnersSection) {
    partnersSection.style.display = 'block';
  }
  
  // Group partners by type
  const airlinePartners = filteredTransferPartners.filter(p => p.type === 'Airline');
  const hotelPartners = filteredTransferPartners.filter(p => p.type === 'Hotel');
  
  const html = `
    <div class="partners-sections">
      ${airlinePartners.length > 0 ? `
        <div class="partners-section">
          <h5>✈️ Airlines (${airlinePartners.length})</h5>
          <div class="partners-grid">
            ${airlinePartners.map(partner => renderPartnerCard(partner)).join('')}
          </div>
        </div>
      ` : ''}
      
      ${hotelPartners.length > 0 ? `
        <div class="partners-section">
          <h5>🏨 Hotels (${hotelPartners.length})</h5>
          <div class="partners-grid">
            ${hotelPartners.map(partner => renderPartnerCard(partner)).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
  
  content.innerHTML = html;
}

// Update counts in the UI
function updateCounts() {
  console.log('updateCounts called');
  const selectedCount = document.getElementById('selected-count');
  const partnersCount = document.getElementById('partners-count');
  
  if (selectedCount) {
    const count = window.selectedCards ? window.selectedCards.size : 0;
    selectedCount.textContent = count;
    console.log('Updated selected count:', count);
  }
  
  if (partnersCount) {
    const count = filteredTransferPartners ? filteredTransferPartners.length : 0;
    partnersCount.textContent = count;
    console.log('Updated partners count:', count);
  }
}

// Update total cards count
function updateTotalCardsCount() {
  const totalCount = document.getElementById('total-cards-count');
  if (totalCount) {
    totalCount.textContent = `(${window.allCards.length})`;
  }
}

// Initialize transfer partners search functionality
function initializeTransferPartnersSearch() {
  const searchInput = document.getElementById('partners-search-input');
  const typeFilter = document.getElementById('partners-type-filter');
  const allianceFilter = document.getElementById('partners-alliance-filter');
  
  if (searchInput) {
    searchInput.addEventListener('input', handleTransferPartnersSearch);
  }
  
  if (typeFilter) {
    typeFilter.addEventListener('change', handleTransferPartnersSearch);
  }
  
  if (allianceFilter) {
    allianceFilter.addEventListener('change', handleTransferPartnersSearch);
  }
}

// Handle transfer partners search and filtering
function handleTransferPartnersSearch() {
  const searchInput = document.getElementById('partners-search-input');
  const typeFilter = document.getElementById('partners-type-filter');
  const allianceFilter = document.getElementById('partners-alliance-filter');
  const partnersSection = document.getElementById('available-transfer-partners');
  
  if (!searchInput || !typeFilter || !allianceFilter) return;
  
  const searchTerm = searchInput.value.toLowerCase();
  const selectedType = typeFilter.value;
  const selectedAlliance = allianceFilter.value;
  
  // Check if any filters are active
  const hasActiveFilters = searchTerm || selectedType || selectedAlliance;
  
  // If no cards selected and no active filters, hide the section
  if ((!window.selectedCards || window.selectedCards.size === 0) && !hasActiveFilters) {
    if (partnersSection) {
      partnersSection.style.display = 'none';
    }
    return;
  }
  
  // Filter transfer partners based on search, type, and alliance
  filteredTransferPartners = window.allTransferPartners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm);
    const matchesType = !selectedType || partner.type === selectedType;
    const matchesAlliance = !selectedAlliance || 
      (selectedAlliance === 'None' ? !partner.alliance || partner.alliance === 'None' : partner.alliance === selectedAlliance);
    return matchesSearch && matchesType && matchesAlliance;
  });
  
  console.log(`Filtered transfer partners: ${filteredTransferPartners.length} results`);
  
  // Hide section if no results and no active filters
  if (filteredTransferPartners.length === 0 && !hasActiveFilters) {
    if (partnersSection) {
      partnersSection.style.display = 'none';
    }
    return;
  }
  
  renderAvailableTransferPartners();
  updateCounts();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTransferPartnersTooltip);
  document.addEventListener('DOMContentLoaded', initializeCreditCardMultipliers);
} else {
  initializeTransferPartnersTooltip();
  initializeCreditCardMultipliers();
}

// Handle category filter changes
function handleCategoryFilter(event) {
  const category = event.target.dataset.category;
  const isChecked = event.target.checked;
  
  // Show/hide table columns based on checkbox state
  const columns = document.querySelectorAll(`.${category}-col`);
  columns.forEach(column => {
    column.style.display = isChecked ? 'table-cell' : 'none';
  });
  
  // Update the filter item visual state
  const filterItem = event.target.closest('.filter-item');
  if (isChecked) {
    filterItem.classList.add('active');
  } else {
    filterItem.classList.remove('active');
  }
  
  console.log(`Category ${category} ${isChecked ? 'shown' : 'hidden'}`);
}
