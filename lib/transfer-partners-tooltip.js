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
    
    if (currentSort.field === 'card-name' || currentSort.field === 'partner-name') {
      // For card names or partner names, sort alphabetically
      const aCell = a.querySelector('.card-name-cell .card-name, .partner-name-cell .partner-name');
      const bCell = b.querySelector('.card-name-cell .card-name, .partner-name-cell .partner-name');
      const aText = aCell?.textContent || '';
      const bText = bCell?.textContent || '';
      aValue = aText.toLowerCase();
      bValue = bText.toLowerCase();
      console.log(`Name sorting: ${aText} vs ${bText}`);
      
      // String comparison for alphabetical sorting
      const comparison = aValue.localeCompare(bValue);
      const result = currentSort.direction === 'asc' ? comparison : -comparison;
      console.log(`Sort result: ${result}`);
      return result;
    } else {
      // For multiplier fields, look in the specific column
      const aCell = a.querySelector(`.${currentSort.field}-col .multiplier-value`);
      const bCell = b.querySelector(`.${currentSort.field}-col .multiplier-value`);
      const aText = aCell?.textContent || '1x';
      const bText = bCell?.textContent || '1x';
      aValue = parseFloat(aText.replace('x', ''));
      bValue = parseFloat(bText.replace('x', ''));
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
      
      // Group by type and sort Airlines first, then Hotels
      const airlines = partners.filter(p => p.type === 'Airline').sort((a, b) => a.name.localeCompare(b.name));
      const hotels = partners.filter(p => p.type === 'Hotel').sort((a, b) => a.name.localeCompare(b.name));
      console.log('Airlines:', airlines.length, 'Hotels:', hotels.length);

    this.tooltip.innerHTML = `
      <div class="tooltip-header">
        <h3>Transfer Partners & Ratios</h3>
        <div class="tooltip-subtitle">Credit Card → Airline/Hotel Programs</div>
      </div>
      
      <div class="tooltip-content">
        <div class="partners-section">
          <h4>Airlines (${airlines.length})</h4>
          <div class="transfer-partners-comparison">
            <div class="comparison-table-container">
              <table class="comparison-table">
                <thead>
                  <tr>
                    <th class="partner-name-header">Transfer Partner</th>
                    <th class="program-header">Program</th>
                    <th class="alliance-header">Alliance</th>
                    <th class="amex-col">Amex</th>
                    <th class="chase-col">Chase</th>
                    <th class="citi-col">Citi</th>
                    <th class="capital-one-col">Cap1</th>
                    <th class="bilt-col">Bilt</th>
                    <th class="wells-fargo-col">Wells Fargo</th>
                  </tr>
                </thead>
                <tbody>
                  ${airlines.slice(0, 15).map(partner => this.renderPartnerRow(partner)).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div class="partners-section">
          <h4>Hotels (${hotels.length})</h4>
          <div class="transfer-partners-comparison">
            <div class="comparison-table-container">
              <table class="comparison-table">
                <thead>
                  <tr>
                    <th class="partner-name-header">Transfer Partner</th>
                    <th class="program-header">Program</th>
                    <th class="alliance-header">Alliance</th>
                    <th class="amex-col">Amex</th>
                    <th class="chase-col">Chase</th>
                    <th class="citi-col">Citi</th>
                    <th class="capital-one-col">Cap1</th>
                    <th class="bilt-col">Bilt</th>
                    <th class="wells-fargo-col">Wells Fargo</th>
                  </tr>
                </thead>
                <tbody>
                  ${hotels.slice(0, 10).map(partner => this.renderPartnerRow(partner)).join('')}
                </tbody>
              </table>
            </div>
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
            <span class="legend-item">
              <span class="legend-color wells-fargo"></span>
              <span>Wells Fargo</span>
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

  renderPartnerRow(partner) {
    const getRatioDisplay = (value) => {
      if (!value || value === 'N/A' || value === '') return '<span class="no-value">✗</span>';
      return value;
    };
    
    const getRatioClass = (value) => {
      if (!value || value === 'N/A' || value === '') return 'no-value';
      
      // Extract numeric ratio from string (e.g., "1:1" -> 1, "1:1.2" -> 0.83, "1:0.75" -> 1.33)
      const ratioMatch = value.match(/(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)/);
      if (!ratioMatch) return 'default';
      
      const from = parseFloat(ratioMatch[1]);
      const to = parseFloat(ratioMatch[2]);
      const ratio = to / from;
      
      if (ratio >= 1) return 'excellent'; // 1:1 or better (1:1, 1:1.2, etc.)
      if (ratio >= 0.75) return 'good';    // 1:0.75 to 1:0.99
      return 'poor';                       // Below 1:0.75
    };

    return `
      <tr>
        <td class="partner-name-cell">
          <div class="partner-info">
            <div class="partner-name">${partner.name}</div>
          </div>
        </td>
        <td class="program-cell">
          <div class="partner-program">${partner.program || 'N/A'}</div>
        </td>
        <td class="alliance-cell">
          <div class="partner-alliance">${partner.alliance || 'N/A'}</div>
        </td>
        <td class="amex-cell">
          <span class="ratio-value amex ${getRatioClass(partner.amex)}">${getRatioDisplay(partner.amex)}</span>
        </td>
        <td class="chase-cell">
          <span class="ratio-value chase ${getRatioClass(partner.chase)}">${getRatioDisplay(partner.chase)}</span>
        </td>
        <td class="citi-cell">
          <span class="ratio-value citi ${getRatioClass(partner.citi)}">${getRatioDisplay(partner.citi)}</span>
        </td>
        <td class="capital-one-cell">
          <span class="ratio-value capital-one ${getRatioClass(partner.capital_one)}">${getRatioDisplay(partner.capital_one)}</span>
        </td>
        <td class="bilt-cell">
          <span class="ratio-value bilt ${getRatioClass(partner.bilt)}">${getRatioDisplay(partner.bilt)}</span>
        </td>
        <td class="wells-fargo-cell">
          <span class="ratio-value wells-fargo ${getRatioClass(partner.wells_fargo)}">${getRatioDisplay(partner.wells_fargo)}</span>
        </td>
      </tr>
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
  
  // Group partners by type and sort by name
  const airlinePartners = partners.filter(p => p.type === 'Airline').sort((a, b) => a.name.localeCompare(b.name));
  const hotelPartners = partners.filter(p => p.type === 'Hotel').sort((a, b) => a.name.localeCompare(b.name));
  
  console.log(`Found ${airlinePartners.length} airline partners and ${hotelPartners.length} hotel partners`);
  
  // Create the content
  let html = `
    <div class="transfer-partners-info-content">
      <div class="partners-section">
        <h4>✈️ Airlines (${airlinePartners.length})</h4>
        <div class="transfer-partners-comparison">
          <div class="comparison-table-container">
            <table class="comparison-table">
              <thead>
                <tr>
                  <th class="partner-name-header">Transfer Partner</th>
                  <th class="program-header">Program</th>
                  <th class="alliance-header">Alliance</th>
                  <th class="amex-col">Amex</th>
                  <th class="chase-col">Chase</th>
                  <th class="citi-col">Citi</th>
                  <th class="capital-one-col">Cap1</th>
                  <th class="bilt-col">Bilt</th>
                  <th class="wells-fargo-col">Wells Fargo</th>
                </tr>
              </thead>
              <tbody>
                ${airlinePartners.map(partner => renderPartnerRowForInformation(partner)).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="partners-section">
        <h4>🏨 Hotels (${hotelPartners.length})</h4>
        <div class="transfer-partners-comparison">
          <div class="comparison-table-container">
            <table class="comparison-table">
              <thead>
                <tr>
                  <th class="partner-name-header">Transfer Partner</th>
                  <th class="program-header">Program</th>
                  <th class="alliance-header">Alliance</th>
                  <th class="amex-col">Amex</th>
                  <th class="chase-col">Chase</th>
                  <th class="citi-col">Citi</th>
                  <th class="capital-one-col">Cap1</th>
                  <th class="bilt-col">Bilt</th>
                  <th class="wells-fargo-col">Wells Fargo</th>
                </tr>
              </thead>
              <tbody>
                ${hotelPartners.map(partner => renderPartnerRowForInformation(partner)).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  console.log('Transfer partners rendered in Information section');
}

// Render individual partner row for Information section
function renderPartnerRowForInformation(partner) {
  const getRatioDisplay = (value) => {
    if (!value || value === 'N/A' || value === '') return '<span class="no-value">✗</span>';
    return value;
  };
  
  const getRatioClass = (value) => {
    if (!value || value === 'N/A' || value === '') return 'no-value';
    
    // Extract numeric ratio from string (e.g., "1:1" -> 1, "1:1.2" -> 0.83, "1:0.75" -> 1.33)
    const ratioMatch = value.match(/(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)/);
    if (!ratioMatch) return 'default';
    
    const from = parseFloat(ratioMatch[1]);
    const to = parseFloat(ratioMatch[2]);
    const ratio = to / from;
    
    if (ratio >= 1) return 'excellent'; // 1:1 or better (1:1, 1:1.2, etc.)
    if (ratio >= 0.75) return 'good';    // 1:0.75 to 1:0.99
    return 'poor';                       // Below 1:0.75
  };

  return `
    <tr>
      <td class="partner-name-cell">
        <div class="partner-info">
          <div class="partner-name">${partner.name}</div>
        </div>
      </td>
      <td class="program-cell">
        <div class="partner-program">${partner.program || partner.name || 'N/A'}</div>
      </td>
      <td class="amex-cell">
        <span class="ratio-value amex ${getRatioClass(partner.amex)}">${getRatioDisplay(partner.amex)}</span>
      </td>
      <td class="chase-cell">
        <span class="ratio-value chase ${getRatioClass(partner.chase)}">${getRatioDisplay(partner.chase)}</span>
      </td>
      <td class="citi-cell">
        <span class="ratio-value citi ${getRatioClass(partner.citi)}">${getRatioDisplay(partner.citi)}</span>
      </td>
      <td class="capital-one-cell">
        <span class="ratio-value capital-one ${getRatioClass(partner.capital_one)}">${getRatioDisplay(partner.capital_one)}</span>
      </td>
      <td class="bilt-cell">
        <span class="ratio-value bilt ${getRatioClass(partner.bilt)}">${getRatioDisplay(partner.bilt)}</span>
      </td>
      <td class="wells-fargo-cell">
        <span class="ratio-value wells-fargo ${getRatioClass(partner.wells_fargo)}">${getRatioDisplay(partner.wells_fargo)}</span>
      </td>
    </tr>
  `;
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
window.allCards = [];
let filteredCards = [];
window.allTransferPartners = [];
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
    
    window.allCards = await window.getCreditCardsData();
    console.log('Loaded credit cards:', window.allCards.length);
    
    // Load transfer partners
    if (!window.getTransferPartnersData) {
      console.error('getTransferPartnersData function not available');
      return;
    }
    
    window.allTransferPartners = await window.getTransferPartnersData();
    console.log('Loaded transfer partners:', window.allTransferPartners.length);
    
    filteredCards = [...window.allCards];
    filteredTransferPartners = [...window.allTransferPartners];
    
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
  
  if (!window.allCards || window.allCards.length === 0) {
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
  
  // Add click handlers to card items for easier selection
  grid.querySelectorAll('.card-selection-item').forEach(item => {
    item.addEventListener('click', function(e) {
      // Don't trigger if clicking on checkbox directly
      if (e.target.type === 'checkbox') return;
      
      const cardId = this.dataset.cardId;
      const checkbox = this.querySelector('.card-checkbox');
      
      // Toggle the checkbox
      checkbox.checked = !checkbox.checked;
      
      console.log('Card item clicked:', cardId);
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
    
    // Keep My Credit Cards section expanded when cards are selected for better UX
    const creditCardsSection = document.querySelector('#bs-information-section .card-selection-panel');
    if (creditCardsSection && window.selectedCards && window.selectedCards.size > 0) {
      console.log('Cards selected, keeping My Credit Cards section expanded');
      creditCardsSection.classList.add('expanded');
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
  
  if (!window.allCards || window.allCards.length === 0) {
    console.log('No cards data available');
    return;
  }
  
  const selectedCardsData = window.allCards.filter(card => window.selectedCards && window.selectedCards.has(card.id.toString()));
  console.log('Selected cards data:', selectedCardsData.length, 'cards');
  console.log('All cards available:', window.allCards.length);
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
        <div class="display-toggle">
          <button class="toggle-btn active" data-display="points">Points</button>
          <button class="toggle-btn" data-display="cashback">Cashback %</button>
        </div>
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
        const getMultiplierDisplay = (value, category, displayType = 'points', pointValue = card.point_value) => {
          // Handle missing point_value
          if (!pointValue) {
            return { text: 'N/A', color: 'gray', rank: '' };
          }
          
          if (!value || value === 0) {
            const defaultText = displayType === 'cashback' ? `${(pointValue * 100).toFixed(2)}%` : `1x • ${(pointValue * 100).toFixed(2)}%`;
            return { text: defaultText, color: 'orange', rank: '' };
          }
          
          // Calculate percentage using actual point value
          const percentage = (value * pointValue * 100).toFixed(2) + '%';
          
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
          
          let text;
          if (displayType === 'cashback') {
            text = percentage;
          } else {
            text = `${value}x • ${percentage}`;
          }
          
          return { text, color, rank };
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
          <tr class="card-row" data-point-value="${card.point_value}">
            <td class="card-name-cell">
              <div class="card-info">
                <div class="card-logo">${getCardLogo(card.card_type)}</div>
                <div class="card-details">
                  <div class="card-name">${card.name}</div>
                  <div class="card-program">${card.program || 'Credit Card'}</div>
                </div>
              </div>
            </td>
            <td class="airfare-col">
              <div class="multiplier-value ${getBackgroundColor(card.airfare_multiplier, 'multiplier')}">${card.airfare_multiplier}x</div>
            </td>
            <td class="hotels-col">
              <div class="multiplier-value ${getBackgroundColor(card.hotels_multiplier, 'multiplier')}">${card.hotels_multiplier}x</div>
            </td>
            <td class="travel-col">
              <div class="multiplier-value ${getBackgroundColor(card.travel_multiplier, 'multiplier')}">${card.travel_multiplier}x</div>
            </td>
            <td class="rental-col">
              <div class="multiplier-value ${getBackgroundColor(card.rental_multiplier, 'multiplier')}">${card.rental_multiplier}x</div>
            </td>
            <td class="restaurants-col">
              <div class="multiplier-value ${getBackgroundColor(card.restaurants_multiplier, 'multiplier')}">${card.restaurants_multiplier}x</div>
            </td>
            <td class="ads-col">
              <div class="multiplier-value ${getBackgroundColor(card.ads_multiplier, 'multiplier')}">${card.ads_multiplier}x</div>
            </td>
            <td class="other-col">
              <div class="multiplier-value ${getBackgroundColor(card.other_multiplier, 'multiplier')}">${card.other_multiplier}x</div>
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
  
  // Add event listeners for display toggle
  const toggleButtons = document.querySelectorAll('.selected-cards-comparison .toggle-btn');
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const displayType = this.getAttribute('data-display');
      
      // Update active button
      toggleButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Update all multiplier values in the table
      const multiplierCells = document.querySelectorAll('.selected-cards-comparison .multiplier-value');
      multiplierCells.forEach(cell => {
        const originalValue = cell.getAttribute('data-original-value') || cell.textContent;
        if (!cell.getAttribute('data-original-value')) {
          cell.setAttribute('data-original-value', originalValue);
        }
        
        // Extract multiplier value (e.g., "3x" -> 3)
        const multiplierMatch = originalValue.match(/(\d+(?:\.\d+)?)x/);
        if (multiplierMatch) {
          const multiplier = parseFloat(multiplierMatch[1]);
          // Get the card's point value from the data attribute
          const cardElement = cell.closest('tr');
          const pointValue = parseFloat(cardElement?.getAttribute('data-point-value'));
          
          // Handle missing point_value
          if (!pointValue) {
            cell.textContent = 'N/A';
            return;
          }
          
          const percentage = (multiplier * pointValue * 100).toFixed(2) + '%';
          
          if (displayType === 'cashback') {
            cell.textContent = percentage;
          } else {
            cell.textContent = originalValue;
          }
        }
      });
    });
  });
  
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
    // Enhanced search to include program names and common variations
    filteredCards = window.allCards.filter(card => {
      const nameMatch = card.name.toLowerCase().includes(query);
      const programMatch = card.program.toLowerCase().includes(query);
      const categoryMatch = card.category.toLowerCase().includes(query);
      
      // Also search for common program variations
      const programVariations = {
        'amex': ['american express', 'amex'],
        'chase': ['chase'],
        'citi': ['citi', 'citibank'],
        'capital one': ['capital one', 'cap1', 'capitalone'],
        'bilt': ['bilt'],
        'wells fargo': ['wells fargo', 'wells', 'wf']
      };
      
      let variationMatch = false;
      for (const [program, variations] of Object.entries(programVariations)) {
        if (variations.some(variation => query.includes(variation))) {
          variationMatch = card.program.toLowerCase().includes(program);
          break;
        }
      }
      
      return nameMatch || programMatch || categoryMatch || variationMatch;
    });
  }
  
  // Don't close the view, just update the filtered results
  renderCardSelection();
  
  // Keep the transfer partners view open if it's currently open
  const transferPartnersSection = document.querySelector('.transfer-partners-section');
  if (transferPartnersSection && transferPartnersSection.style.display !== 'none') {
    // Transfer partners view is open, keep it open
    console.log('Keeping transfer partners view open during search');
  }
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
    const selectedCardsData = window.allCards.filter(card => window.selectedCards.has(card.id.toString()));
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
        } else if (program.includes('Rove (Miles)')) {
          availablePrograms.add('rove');
          console.log('Added rove program');
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
      console.log(`Partner ratios - Amex: "${partner.amex}", Chase: "${partner.chase}", Citi: "${partner.citi}", Capital One: "${partner.capital_one}", Bilt: "${partner.bilt}", Wells Fargo: "${partner.wells_fargo}", Rove: "${partner.rove}"`);
      
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
      
      if (availablePrograms.has('rove')) {
        const roveValid = partner.rove && 
                         partner.rove !== 'N/A' && 
                         partner.rove !== '' && 
                         partner.rove !== null && 
                         partner.rove !== undefined &&
                         partner.rove.trim() !== '';
        console.log(`  - Rove check: ${roveValid} (value: "${partner.rove}")`);
        if (roveValid) hasAvailableTransfer = true;
      }
      
      console.log(`  - Final result: ${hasAvailableTransfer}`);
      
      return hasAvailableTransfer;
    });
  }
  
  // Sort partners by name alphabetically
  filteredTransferPartners.sort((a, b) => a.name.localeCompare(b.name));
  
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
function renderAvailableTransferPartners(displayType = 'ratio') {
  try {
    console.log('Starting renderAvailableTransferPartners...');
    
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
    
    if (!filteredTransferPartners || filteredTransferPartners.length === 0) {
      console.log('No filtered partners to display');
      // Show empty state in the content area only
      const partnersContent = document.getElementById('partners-content');
      if (partnersContent) {
        partnersContent.innerHTML = `
          <div class="no-results">
            <p>No transfer partners found matching your search criteria.</p>
            <p>Try searching for airline names, hotel brands, or loyalty program names.</p>
          </div>
        `;
      }
      // Keep the section visible
      if (partnersSection) {
        partnersSection.style.display = 'block';
      }
      return;
    }
  
    console.log('Showing section with', filteredTransferPartners.length, 'partners');
    
    // Show the section if there are partners to display
    if (partnersSection) {
      partnersSection.style.display = 'block';
    }
  
  // Create comparison table similar to selected cards
  const html = `
    <div class="transfer-partners-comparison">
      <div class="comparison-header">
        <div class="buttons-row">
          <div class="credit-card-filters">
            <button class="filter-btn active" data-program="amex">Amex</button>
            <button class="filter-btn active" data-program="chase">Chase</button>
            <button class="filter-btn active" data-program="citi">Citi</button>
            <button class="filter-btn active" data-program="capital-one">Cap1</button>
            <button class="filter-btn active" data-program="bilt">Bilt</button>
            <button class="filter-btn active" data-program="wells-fargo">Wells Fargo</button>
            <button class="filter-btn active" data-program="rove">Rove</button>
          </div>
          <div class="display-toggle">
            <button class="toggle-btn active" data-display="percentage">%</button>
            <button class="toggle-btn" data-display="ratio">Ratio</button>
          </div>
        </div>
      </div>
      
      <div class="comparison-table-container">
        <table class="comparison-table">
          <thead>
            <tr>
              <th class="partner-name-header sortable" data-sort="partner-name">
                <button class="sort-button" title="Transfer Partner Name - Sort alphabetically">
                  Transfer Partner
                  <span class="sort-indicator"></span>
                </button>
              </th>
              <th class="amex-col sortable" data-sort="amex">
                <button class="sort-button" title="American Express">
                  Amex
                  <span class="sort-indicator"></span>
                </button>
              </th>
              <th class="chase-col sortable" data-sort="chase">
                <button class="sort-button" title="Chase">
                  Chase
                  <span class="sort-indicator"></span>
                </button>
              </th>
              <th class="citi-col sortable" data-sort="citi">
                <button class="sort-button" title="Citi">
                  Citi
                  <span class="sort-indicator"></span>
                </button>
              </th>
              <th class="capital-one-col sortable" data-sort="capital-one">
                <button class="sort-button" title="Capital One">
                  Cap1
                  <span class="sort-indicator"></span>
                </button>
              </th>
              <th class="bilt-col sortable" data-sort="bilt">
                <button class="sort-button" title="Bilt">
                  Bilt
                  <span class="sort-indicator"></span>
                </button>
              </th>
              <th class="wells-fargo-col sortable" data-sort="wells-fargo">
                <button class="sort-button" title="Wells Fargo">
                  Wells Fargo
                  <span class="sort-indicator"></span>
                </button>
              </th>
              <th class="rove-col sortable" data-sort="rove">
                <button class="sort-button" title="Rove">
                  Rove
                  <span class="sort-indicator"></span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            ${filteredTransferPartners.map(partner => {
              const getRatioDisplay = (value, displayType = 'ratio') => {
                if (!value || value === 'N/A' || value === '') return '<span class="no-value">✗</span>';
                
                if (displayType === 'percentage') {
                  // Extract numeric ratio from string and convert to percentage
                  const ratioMatch = value.match(/(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)/);
                  if (!ratioMatch) return value;
                  
                  const from = parseFloat(ratioMatch[1]);
                  const to = parseFloat(ratioMatch[2]);
                  const percentage = Math.round((to / from) * 100);
                  return `${percentage}%`;
                }
                
                return value;
              };
              
              const getRatioClass = (value) => {
                if (!value || value === 'N/A' || value === '') return 'no-value';
                
                // Extract numeric ratio from string (e.g., "1:1" -> 1, "1:1.2" -> 0.83, "1:0.75" -> 1.33)
                const ratioMatch = value.match(/(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)/);
                if (!ratioMatch) return 'default';
                
                const from = parseFloat(ratioMatch[1]);
                const to = parseFloat(ratioMatch[2]);
                const ratio = to / from;
                
                if (ratio >= 1) return 'excellent'; // 1:1 or better (1:1, 1:1.2, etc.)
                if (ratio >= 0.75) return 'good';    // 1:0.75 to 1:0.99
                return 'poor';                       // Below 1:0.75
              };
              
              return `
                <tr>
                  <td class="partner-name-cell">
                    <div class="partner-info">
                      <div class="partner-name">${partner.name}</div>
                      <div class="partner-program">${partner.program}</div>
                    </div>
                  </td>
                  <td class="amex-cell">
                    <span class="ratio-value amex ${getRatioClass(partner.amex)}">${getRatioDisplay(partner.amex, displayType)}</span>
                  </td>
                  <td class="chase-cell">
                    <span class="ratio-value chase ${getRatioClass(partner.chase)}">${getRatioDisplay(partner.chase, displayType)}</span>
                  </td>
                  <td class="citi-cell">
                    <span class="ratio-value citi ${getRatioClass(partner.citi)}">${getRatioDisplay(partner.citi, displayType)}</span>
                  </td>
                  <td class="capital-one-cell">
                    <span class="ratio-value capital-one ${getRatioClass(partner.capital_one)}">${getRatioDisplay(partner.capital_one, displayType)}</span>
                  </td>
                  <td class="bilt-cell">
                    <span class="ratio-value bilt ${getRatioClass(partner.bilt)}">${getRatioDisplay(partner.bilt, displayType)}</span>
                  </td>
                  <td class="wells-fargo-cell">
                    <span class="ratio-value wells-fargo ${getRatioClass(partner.wells_fargo)}">${getRatioDisplay(partner.wells_fargo, displayType)}</span>
                  </td>
                  <td class="rove-cell">
                    <span class="ratio-value rove ${getRatioClass(partner.rove)}">${getRatioDisplay(partner.rove, displayType)}</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  // Find the partners-content div and set its innerHTML
  const partnersContent = document.getElementById('partners-content');
  if (partnersContent) {
    partnersContent.innerHTML = html;
  } else {
    // Fallback to setting content directly
    content.innerHTML = html;
  }
  
  // Set up search and filter event listeners
  setupTransferPartnersSearchListeners();
  
  // Search functionality removed - no search bar in Available Transfer Partners
  
  // Selected cards filter button removed
  
  // Add event listeners for credit card filters
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      const program = this.getAttribute('data-program');
      
      // Toggle active state
      this.classList.toggle('active');
      
      // Show/hide corresponding column
      const columnClass = `.${program}-col, .${program}-cell`;
      const columns = document.querySelectorAll(columnClass);
      const isActive = this.classList.contains('active');
      
      columns.forEach(column => {
        column.style.display = isActive ? 'table-cell' : 'none';
      });
      
      console.log(`${program} column ${isActive ? 'shown' : 'hidden'}`);
    });
  });
  
  // Add event listeners for display toggle
  const toggleButtons = document.querySelectorAll('.transfer-partners-comparison .toggle-btn');
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const displayType = this.getAttribute('data-display');
      
      // Update active button
      toggleButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Re-render the table with the new display type
      console.log('Toggle clicked, re-rendering with display type:', displayType);
      renderAvailableTransferPartners(displayType);
    });
  });
  } catch (error) {
    console.error('Error rendering transfer partners:', error);
  }
}

// Selected cards filter functionality moved inline to event listener

// Search functionality removed - no search bar in Available Transfer Partners

// Update counts in the UI
function updateCounts() {
  try {
    console.log('updateCounts called');
    const partnersCount = document.getElementById('partners-count');
    
    if (partnersCount) {
      const count = filteredTransferPartners ? filteredTransferPartners.length : 0;
      partnersCount.textContent = count;
      console.log('Updated partners count:', count);
    } else {
      console.warn('Partners count element not found');
    }
    
    // Update Selected Cards count in the header (it's displayed inline)
    const selectedCardsHeader = document.querySelector('.selected-cards-comparison .comparison-header h4');
    if (selectedCardsHeader && window.selectedCards) {
      const count = window.selectedCards.size;
      selectedCardsHeader.textContent = `Selected Cards (${count})`;
      console.log('Updated selected cards header count:', count);
    }
  } catch (error) {
    console.error('Error in updateCounts:', error);
    console.error('Error stack:', error.stack);
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
  console.log('Initializing transfer partners search...');
  
  const searchInput = document.getElementById('partners-search-input');
  const typeFilter = document.getElementById('partners-type-filter');
  const allianceFilter = document.getElementById('partners-alliance-filter');
  
  if (searchInput) {
    console.log('Adding input event listener to search input');
    searchInput.addEventListener('input', function(event) {
      console.log('Search input event triggered:', event.target.value);
      // Add a small delay to prevent rapid firing
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        handleTransferPartnersSearch();
      }, 100);
    });
  } else {
    console.warn('Search input not found');
  }
  
  if (typeFilter) {
    console.log('Adding change event listener to type filter');
    typeFilter.addEventListener('change', handleTransferPartnersSearch);
  } else {
    console.warn('Type filter not found');
  }
  
  if (allianceFilter) {
    console.log('Adding change event listener to alliance filter');
    allianceFilter.addEventListener('change', handleTransferPartnersSearch);
  } else {
    console.warn('Alliance filter not found');
  }
  
  console.log('Transfer partners search initialization complete');
}

// Set up search and filter event listeners for transfer partners
function setupTransferPartnersSearchListeners() {
  try {
    console.log('Setting up transfer partners search listeners...');
    
    const searchInput = document.getElementById('partners-search-input');
    const typeFilter = document.getElementById('partners-type-filter');
    const allianceFilter = document.getElementById('partners-alliance-filter');
    
    if (searchInput) {
      console.log('Adding input event listener to search input');
      let searchTimeout;
      searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          try {
            handleTransferPartnersSearch();
          } catch (error) {
            console.error('Error in search input handler:', error);
          }
        }, 100);
      });
    } else {
      console.warn('Search input not found');
    }
    
    if (typeFilter) {
      console.log('Adding change event listener to type filter');
      typeFilter.addEventListener('change', function() {
        try {
          handleTransferPartnersSearch();
        } catch (error) {
          console.error('Error in type filter handler:', error);
        }
      });
    } else {
      console.warn('Type filter not found');
    }
    
    if (allianceFilter) {
      console.log('Adding change event listener to alliance filter');
      allianceFilter.addEventListener('change', function() {
        try {
          handleTransferPartnersSearch();
        } catch (error) {
          console.error('Error in alliance filter handler:', error);
        }
      });
    } else {
      console.warn('Alliance filter not found');
    }
    
    console.log('Transfer partners search listeners set up successfully');
  } catch (error) {
    console.error('Error setting up transfer partners search listeners:', error);
  }
}

// Handle transfer partners search and filtering
function handleTransferPartnersSearch() {
  try {
    console.log('Starting transfer partners search...');
    
    const searchInput = document.getElementById('partners-search-input');
    const typeFilter = document.getElementById('partners-type-filter');
    const allianceFilter = document.getElementById('partners-alliance-filter');
    const partnersSection = document.getElementById('available-transfer-partners');
    
    if (!searchInput || !typeFilter || !allianceFilter) {
      console.warn('Search elements not found:', { searchInput: !!searchInput, typeFilter: !!typeFilter, allianceFilter: !!allianceFilter });
      return;
    }
    
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;
    const selectedAlliance = allianceFilter.value;
    
    console.log('Search parameters:', { searchTerm, selectedType, selectedAlliance });
    console.log('Total partners available:', window.allTransferPartners.length);
    
    // Debug: Show first few partner names and programs
    if (window.allTransferPartners && window.allTransferPartners.length > 0) {
      console.log('Sample partners:', window.allTransferPartners.slice(0, 3).map(p => ({
        name: p.name,
        program: p.program
      })));
    }
    
    // Check if any filters are active
    const hasActiveFilters = searchTerm || selectedType || selectedAlliance;
    
    // Always show the section, don't hide it based on selected cards
    if (partnersSection) {
      partnersSection.style.display = 'block';
    }
    
    // Check if transfer partners data is available
    if (!window.allTransferPartners || !Array.isArray(window.allTransferPartners)) {
      console.warn('Transfer partners data not available:', { 
        exists: !!window.allTransferPartners, 
        isArray: Array.isArray(window.allTransferPartners),
        length: window.allTransferPartners?.length 
      });
      return;
    }
  
    console.log('Filtering transfer partners...', window.allTransferPartners.length, 'total partners');
    
    // Filter transfer partners based on search, type, and alliance
    filteredTransferPartners = window.allTransferPartners.filter(partner => {
      try {
        // Handle null/undefined partner or name
        if (!partner || !partner.name) {
          console.warn('Invalid partner data:', partner);
          return false;
        }
        
        const matchesSearch = searchTerm ? (
          partner.name.toLowerCase().includes(searchTerm) ||
          (partner.program && partner.program.toLowerCase().includes(searchTerm))
        ) : true;
        
        // Debug logging for search matches
        if (searchTerm && matchesSearch) {
          console.log(`Search match found:`, {
            name: partner.name,
            program: partner.program,
            searchTerm: searchTerm,
            nameMatch: partner.name.toLowerCase().includes(searchTerm),
            programMatch: partner.program && partner.program.toLowerCase().includes(searchTerm)
          });
        }
        const matchesType = !selectedType || partner.type === selectedType;
        const matchesAlliance = !selectedAlliance || 
          (selectedAlliance === 'None' ? !partner.alliance || partner.alliance === 'None' : partner.alliance === selectedAlliance);
        return matchesSearch && matchesType && matchesAlliance;
      } catch (error) {
        console.error('Error filtering partner:', partner, error);
        return false;
      }
    });
    
    console.log('Filtered partners:', filteredTransferPartners.length);
    
    // Sort partners by name alphabetically
    filteredTransferPartners.sort((a, b) => {
      try {
        if (!a || !a.name || !b || !b.name) {
          return 0;
        }
        return a.name.localeCompare(b.name);
      } catch (error) {
        console.error('Error sorting partners:', error);
        return 0;
      }
    });
    
    console.log(`Filtered transfer partners: ${filteredTransferPartners.length} results`);
    
    // Always show the section, even if no results
    if (partnersSection) {
      partnersSection.style.display = 'block';
    }
    
    console.log('Calling renderAvailableTransferPartners...');
    try {
      renderAvailableTransferPartners();
    } catch (renderError) {
      console.error('Error in renderAvailableTransferPartners:', renderError);
      // Show error message to user
      const partnersContent = document.getElementById('partners-content');
      if (partnersContent) {
        partnersContent.innerHTML = `
          <div class="no-results">
            <p>Error loading transfer partners. Please try again.</p>
          </div>
        `;
      }
    }
    
    console.log('Calling updateCounts...');
    try {
      updateCounts();
    } catch (updateError) {
      console.error('Error in updateCounts:', updateError);
    }
    
    console.log('Search completed successfully');
  } catch (error) {
    console.error('Error in transfer partners search:', error);
    console.error('Error stack:', error.stack);
  }
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
