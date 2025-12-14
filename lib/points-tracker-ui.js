// Points & Miles Tracker UI
// Renders the tracking interface in the Information section

(function() {
  'use strict';

  const logger = window.createLogger?.('PointsTrackerUI') || console;

  class PointsTrackerUI {
    constructor() {
      this.container = null;
      this.editingId = null;
      this.currentSort = { field: 'points', direction: 'desc' }; // Default: sort by points descending
      this.filters = {
        search: '',
        program: '',
        status: '' // 'all', 'expired', 'expiring', 'active'
      };
      this.allEntries = []; // Store all entries for filtering
    }

    /**
     * Initialize the UI
     */
    init() {
      // Check if already initialized
      if (this.container && document.getElementById('bs-points-tracker-panel')) {
        logger.debug('Points Tracker UI already initialized, re-rendering...');
        this.render(); // Re-render to refresh data
        return;
      }

      // Wait for Information section to be available
      let attempts = 0;
      const maxAttempts = 50; // Try for 5 seconds
      
      const checkSection = () => {
        attempts++;
        const infoSection = document.getElementById('bs-information-section');
        if (infoSection) {
          logger.info('Information section found, creating Points Tracker UI...');
          this.createUI();
          this.render();
          this.bindEvents();
          
          // Ensure visibility matches toggle state
          const toggle = document.getElementById('bs-info-points-toggle');
          if (toggle) {
            const panel = document.getElementById('bs-points-tracker-panel');
            if (panel) {
              if (toggle.checked) {
                panel.style.display = '';
                panel.style.visibility = 'visible';
              } else {
                panel.style.display = 'none';
                panel.style.visibility = 'hidden';
              }
              logger.info('Points Tracker panel visibility set to:', toggle.checked ? 'visible' : 'hidden');
              // Force a reflow
              panel.offsetHeight;
            }
          }
        } else if (attempts < maxAttempts) {
          setTimeout(checkSection, 100);
        } else {
          logger.warn('Information section not found after', maxAttempts, 'attempts');
        }
      };
      checkSection();
    }

    /**
     * Create the UI structure
     */
    createUI() {
      const infoSection = document.getElementById('bs-information-section');
      if (!infoSection) {
        logger.warn('Information section not found, cannot create Points Tracker UI');
        return;
      }

      // Check if panel already exists
      const existingPanel = document.getElementById('bs-points-tracker-panel');
      if (existingPanel) {
        logger.info('Points Tracker panel already exists, reusing it');
        this.container = existingPanel;
        // Ensure it's visible if toggle is checked
        const toggle = document.getElementById('bs-info-points-toggle');
        if (toggle && toggle.checked) {
          existingPanel.style.display = '';
          existingPanel.style.visibility = 'visible';
        }
        return;
      }
      
      logger.info('Creating new Points Tracker panel...');

      // Find the results-display div or create it
      let resultsDisplay = document.querySelector('#bs-information-section .results-display');
      if (!resultsDisplay) {
        resultsDisplay = document.createElement('div');
        resultsDisplay.className = 'results-display';
        infoSection.appendChild(resultsDisplay);
      }

      // Create points tracker panel
      const panel = document.createElement('div');
      panel.id = 'bs-points-tracker-panel';
      panel.className = 'points-tracker-panel';
      panel.innerHTML = `
        <div class="points-tracker-header">
          <h4>
            <svg class="points-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Points & Miles Tracker
          </h4>
          <div class="points-tracker-actions">
            <button class="bs-btn bs-btn-primary" id="points-add-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Entry
            </button>
          </div>
        </div>
        
        <div class="points-tracker-content">
          <div class="points-tracker-stats" id="points-tracker-stats">
            <!-- Stats will be rendered here -->
          </div>
          
          <!-- Filter and Search Controls -->
          <div class="points-tracker-filters">
            <div class="points-filter-row">
              <div class="points-search-container">
                <input type="text" id="points-search-input" class="points-search-input" placeholder="Search by program name...">
              </div>
              <div class="points-filter-group">
                <select id="points-status-filter" class="points-filter-select">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expiring">Expiring Soon (≤90 days)</option>
                  <option value="expired">Expired</option>
                </select>
                <button id="points-reset-filters" class="bs-btn bs-btn-secondary">Reset Filters</button>
              </div>
            </div>
          </div>
          
          <div class="points-tracker-cards-container" id="points-tracker-cards-container">
            <!-- Table will be rendered here -->
          </div>
        </div>
        
        <!-- Add/Edit Modal -->
        <div class="points-modal" id="points-modal" style="display: none;">
          <div class="points-modal-content">
            <div class="points-modal-header">
              <h3 id="points-modal-title">Add Points Entry</h3>
              <button class="points-modal-close" id="points-modal-close">×</button>
            </div>
            <form id="points-form">
              <div class="points-form-group">
                <label for="points-program">Program *</label>
                <select id="points-program" required>
                  <option value="">Select Program</option>
                </select>
              </div>
              <div class="points-form-group">
                <label for="points-points">Points *</label>
                <input type="number" id="points-points" step="0.01" min="0" required placeholder="0.00">
              </div>
              <div class="points-form-group">
                <label for="points-pending">Pending Points</label>
                <input type="number" id="points-pending" step="0.01" min="0" placeholder="0.00">
              </div>
              <div class="points-form-group">
                <label for="points-expiration">Expiration Date</label>
                <input type="date" id="points-expiration">
              </div>
              <div class="points-form-group">
                <label for="points-notes">Notes</label>
                <textarea id="points-notes" rows="3" placeholder="Optional notes..."></textarea>
              </div>
              <div class="points-form-actions">
                <button type="button" class="bs-btn bs-btn-secondary" id="points-form-cancel">Cancel</button>
                <button type="submit" class="bs-btn bs-btn-primary" id="points-form-submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      `;

      // Insert at the beginning of results-display (before transfer partners)
      const transferPartners = document.getElementById('available-transfer-partners');
      if (transferPartners && transferPartners.parentNode) {
        transferPartners.parentNode.insertBefore(panel, transferPartners);
      } else if (resultsDisplay) {
        // Insert at the beginning
        if (resultsDisplay.firstChild) {
          resultsDisplay.insertBefore(panel, resultsDisplay.firstChild);
        } else {
          resultsDisplay.appendChild(panel);
        }
      } else {
        // Fallback: append to info section
        infoSection.appendChild(panel);
      }

      this.container = panel;
      
      // Always make panel visible initially - let toggle handler control visibility
      // This ensures the panel is created and can be shown/hidden by the toggle
      panel.style.display = '';
      panel.style.visibility = 'visible';
      
      // Then check toggle state and adjust
      const toggle = document.getElementById('bs-info-points-toggle');
      if (toggle) {
        if (toggle.checked) {
          panel.style.display = '';
          panel.style.visibility = 'visible';
          logger.info('Points Tracker panel created and set to VISIBLE (toggle is checked)');
        } else {
          panel.style.display = 'none';
          panel.style.visibility = 'hidden';
          logger.info('Points Tracker panel created and set to HIDDEN (toggle is unchecked)');
        }
      } else {
        // Default to visible if toggle not found
        panel.style.display = '';
        panel.style.visibility = 'visible';
        logger.warn('Points Tracker panel created, toggle not found, defaulting to visible');
      }
      
      // Force a reflow to ensure visibility is applied
      void panel.offsetHeight;
      
      logger.info('Points Tracker panel successfully created and inserted into DOM');
    }

    /**
     * Populate program select dropdown
     */
    populateProgramSelect() {
      const select = document.getElementById('points-program');
      if (!select) return;

      // Wait for loyaltyPrograms to be available (with retry)
      const populate = () => {
        if (!window.loyaltyPrograms || !Array.isArray(window.loyaltyPrograms) || window.loyaltyPrograms.length === 0) {
          // Retry after a short delay if not available yet
          setTimeout(populate, 100);
          return;
        }

        // Clear existing options except the first one
        while (select.children.length > 1) {
          select.removeChild(select.lastChild);
        }

        // Group by category
        const categories = {
          credit: [],
          airline: [],
          hotel: []
        };

        window.loyaltyPrograms.forEach(program => {
          if (program && program.category) {
            categories[program.category] = categories[program.category] || [];
            categories[program.category].push(program);
          }
        });

        // Add options grouped by category
        ['credit', 'airline', 'hotel'].forEach(category => {
          if (categories[category] && categories[category].length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = category === 'credit' ? 'Credit Cards' : category === 'airline' ? 'Airlines' : 'Hotels';
            
            categories[category].forEach(program => {
              const option = document.createElement('option');
              option.value = program.name;
              const baseName = this.getBaseProgramName(program.name);
              option.textContent = `${baseName} (${(program.pointValue * 100).toFixed(2)}¢/point)`;
              optgroup.appendChild(option);
            });
            
            select.appendChild(optgroup);
          }
        });
      };

      populate();
    }

    /**
     * Render the tracker cards
     */
    async render() {
      if (!this.container || !window.pointsTracker) return;

      const cardsContainer = document.getElementById('points-tracker-cards-container');
      const statsDiv = document.getElementById('points-tracker-stats');

      if (!cardsContainer) return;

      // Show loading state
      cardsContainer.innerHTML = '<div class="points-empty-state">Loading...</div>';

      try {
        logger.info('Starting to render Points Tracker...');
        
        // Check if pointsTracker is available
        if (!window.pointsTracker) {
          logger.error('window.pointsTracker is not available!');
          cardsContainer.innerHTML = `
            <div class="points-empty-state">
              Error: Points Tracker not initialized. Please refresh the page.
            </div>
          `;
          return;
        }
        
        logger.info('Loading entries from Supabase...');
        // Load entries from Supabase
        const allEntries = await window.pointsTracker.getAllEntries();
        logger.info(`Received ${allEntries.length} entries from getAllEntries()`);
        logger.info('Entries:', allEntries);
        
        this.allEntries = allEntries;
        
        // Apply filters
        let filteredEntries = this.applyFilters(allEntries);
        logger.info(`After filtering: ${filteredEntries.length} entries`);
        
        // Apply sorting
        const sortedEntries = this.applySorting(filteredEntries);
        logger.info(`After sorting: ${sortedEntries.length} entries`);

        // Calculate total value and amount (from all entries, not filtered)
        const totalAmount = await window.pointsTracker.getTotalAmount();
        
        // Calculate total My Value from all entries
        const totalMyValue = allEntries.reduce((total, entry) => {
          const points = parseFloat(entry.points) || 0;
          const pointsPending = parseFloat(entry.pointsPending) || 0;
          const totalAmount = points + pointsPending;
          const myValue = entry.myValue !== null && entry.myValue !== undefined 
            ? parseFloat(entry.myValue) * totalAmount
            : totalAmount * (parseFloat(entry.pointValue) || 0);
          return total + myValue;
        }, 0);
        
        logger.info(`Total My Value: $${totalMyValue}, Total amount: ${totalAmount}`);

        // Render stats (from all entries)
        if (statsDiv) {
          const expiringSoon = await window.pointsTracker.getExpiringSoon(90);
          const expired = await window.pointsTracker.getExpired();
          
          const amountFormatted = totalAmount.toLocaleString('en-US', {
            maximumFractionDigits: 0
          });
          
          statsDiv.innerHTML = `
            <div class="points-stat-item">
              <span class="points-stat-label">Total Points/Miles:</span>
              <span class="points-stat-value">${amountFormatted}</span>
            </div>
            <div class="points-stat-item">
              <span class="points-stat-label">My Value:</span>
              <span class="points-stat-value">${totalMyValue.toLocaleString('en-US', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}</span>
            </div>
            <div class="points-stat-item">
              <span class="points-stat-label">Total Entries:</span>
              <span class="points-stat-value">${allEntries.length}</span>
            </div>
            <div class="points-stat-item">
              <span class="points-stat-label">Showing:</span>
              <span class="points-stat-value">${sortedEntries.length}</span>
            </div>
            <div class="points-stat-item">
              <span class="points-stat-label">Expiring Soon (90 days):</span>
              <span class="points-stat-value ${expiringSoon.length > 0 ? 'points-warning' : ''}">${expiringSoon.length}</span>
            </div>
            <div class="points-stat-item">
              <span class="points-stat-label">Expired:</span>
              <span class="points-stat-value ${expired.length > 0 ? 'points-error' : ''}">${expired.length}</span>
            </div>
          `;
        }


        // Render list view
        this.renderListView(sortedEntries, allEntries);
      } catch (error) {
        logger.error('Error rendering points tracker:', error);
        logger.error('Error stack:', error.stack);
        cardsContainer.innerHTML = `
          <div class="points-empty-state">
            Error loading entries. Please try again.<br>
            <small style="color: #999; margin-top: 8px; display: block;">${error.message || 'Unknown error'}</small>
          </div>
        `;
      }
    }

    /**
     * Render list view - simple clean table
     */
    renderListView(sortedEntries, allEntries) {
      const cardsContainer = document.getElementById('points-tracker-cards-container');
      
      if (!cardsContainer) return;
      
      // Clear cards container
      cardsContainer.innerHTML = '';

      if (sortedEntries.length === 0) {
        cardsContainer.innerHTML = `
          <div class="points-empty-state">
            ${allEntries.length === 0 
              ? 'No entries yet. Click "Add Entry" to get started.'
              : 'No entries match your filters. Try adjusting your search or filter criteria.'}
          </div>
        `;
        return;
      }

      // Create simple table with sortable headers
      const table = document.createElement('table');
      table.className = 'points-tracker-table';
      
      // Determine current sort state
      const sortField = this.currentSort.field || 'points';
      const sortDirection = this.currentSort.direction || 'desc';
      const sortIndicator = sortDirection === 'asc' ? ' ↑' : ' ↓';
      
      table.innerHTML = `
        <thead>
          <tr>
            <th class="points-sortable" data-sort="program">
              <button class="points-sort-button">
                Program
                <span class="points-sort-indicator ${sortField === 'program' ? 'active' : ''}">${sortField === 'program' ? sortIndicator : ''}</span>
              </button>
            </th>
            <th class="points-sortable" data-sort="points">
              <button class="points-sort-button">
                Points
                <span class="points-sort-indicator ${sortField === 'points' ? 'active' : ''}">${sortField === 'points' ? sortIndicator : ''}</span>
              </button>
            </th>
            <th class="points-sortable" data-sort="pending">
              <button class="points-sort-button">
                Pending
                <span class="points-sort-indicator ${sortField === 'pending' ? 'active' : ''}">${sortField === 'pending' ? sortIndicator : ''}</span>
              </button>
            </th>
            <th class="points-sortable" data-sort="totalAmount">
              <button class="points-sort-button">
                Total Amount
                <span class="points-sort-indicator ${sortField === 'totalAmount' ? 'active' : ''}">${sortField === 'totalAmount' ? sortIndicator : ''}</span>
              </button>
            </th>
            <th class="points-sortable" data-sort="myValue">
              <button class="points-sort-button">
                My Value
                <span class="points-sort-indicator ${sortField === 'myValue' ? 'active' : ''}">${sortField === 'myValue' ? sortIndicator : ''}</span>
              </button>
            </th>
            <th class="points-sortable" data-sort="totalValue">
              <button class="points-sort-button">
                Total Value
                <span class="points-sort-indicator ${sortField === 'totalValue' ? 'active' : ''}">${sortField === 'totalValue' ? sortIndicator : ''}</span>
              </button>
            </th>
            <th class="points-sortable" data-sort="expiration">
              <button class="points-sort-button">
                Expiration
                <span class="points-sort-indicator ${sortField === 'expiration' ? 'active' : ''}">${sortField === 'expiration' ? sortIndicator : ''}</span>
              </button>
            </th>
            <th class="points-sortable" data-sort="daysLeft">
              <button class="points-sort-button">
                Days Left
                <span class="points-sort-indicator ${sortField === 'daysLeft' ? 'active' : ''}">${sortField === 'daysLeft' ? sortIndicator : ''}</span>
              </button>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${sortedEntries.map(entry => this.createSimpleTableRow(entry)).join('')}
        </tbody>
      `;
      
      cardsContainer.appendChild(table);
      
      // Add sort event listeners
      const sortButtons = table.querySelectorAll('.points-sortable .points-sort-button');
      sortButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const th = button.closest('th');
          const sortField = th.dataset.sort;
          if (sortField) {
            // Toggle direction if same field, otherwise set to asc
            if (this.currentSort.field === sortField) {
              this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
              this.currentSort.direction = 'asc';
            }
            this.currentSort.field = sortField;
            this.render();
          }
        });
      });
    }
    
    /**
     * Get base program name (remove parenthetical information)
     */
    getBaseProgramName(programName) {
      if (!programName) return 'N/A';
      // Extract everything before the opening parenthesis
      const match = programName.match(/^([^(]+)/);
      return match ? match[1].trim() : programName;
    }

    /**
     * Create a simple table row for an entry
     */
    createSimpleTableRow(entry) {
      try {
        const points = parseFloat(entry.points) || 0;
        const pointsPending = parseFloat(entry.pointsPending) || 0;
        const totalAmount = points + pointsPending;
        // Use point_value from Supabase for Total Value
        const pointValue = parseFloat(entry.pointValue) || 0;
        const totalValue = totalAmount * pointValue;
        // Use my_value from Supabase multiplied by total amount of points for My Value
        const myValue = entry.myValue !== null && entry.myValue !== undefined 
          ? parseFloat(entry.myValue) * totalAmount
          : totalAmount * pointValue;
        const daysLeft = entry.expirationDate ? window.pointsTracker.getDaysUntilExpiration(entry.expirationDate) : null;
        const isExpired = daysLeft !== null && daysLeft < 0;
        const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 90;
        
        const rowClass = isExpired ? 'points-row-expired' : isExpiringSoon ? 'points-row-warning' : '';
        
        return `
          <tr class="${rowClass}">
            <td class="points-program-name">${this.getBaseProgramName(entry.programName)}</td>
            <td class="points-points">${points.toLocaleString()}</td>
            <td class="points-pending">${pointsPending > 0 ? pointsPending.toLocaleString() : '-'}</td>
            <td class="points-total-amount">${totalAmount.toLocaleString()}</td>
            <td class="points-my-value">${myValue.toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}</td>
            <td class="points-total-value">${totalValue.toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}</td>
            <td class="points-expiration ${isExpired ? 'points-expired' : isExpiringSoon ? 'points-expiring-soon' : ''}">
              ${entry.expirationDate ? window.pointsTracker.formatDate(entry.expirationDate) : '-'}
            </td>
            <td class="points-days ${isExpired ? 'points-expired' : isExpiringSoon ? 'points-expiring-soon' : ''}">
              ${daysLeft !== null ? (daysLeft < 0 ? `Expired ${Math.abs(daysLeft)} days ago` : `${daysLeft} days`) : '-'}
            </td>
            <td class="points-actions-cell">
              <button class="points-action-btn points-edit-btn" data-id="${entry.id}" title="Edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="points-action-btn points-delete-btn" data-id="${entry.id}" title="Delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </td>
          </tr>
        `;
      } catch (error) {
        logger.error('Error creating table row:', entry, error);
        return '';
      }
    }

    /**
     * Create donut chart SVG - full circle with labels
     */
    createDonutChart(programData, totalValue) {
      if (programData.length === 0) return '<div class="points-empty-state">No data to display</div>';
      
      const colors = [
        '#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#ff6d00',
        '#9c27b0', '#00bcd4', '#4caf50', '#ff9800', '#e91e63',
        '#3f51b5', '#009688', '#795548', '#607d8b'
      ];
      
      const radius = 100;
      const centerX = 200;
      const centerY = 200;
      const strokeWidth = 40;
      const innerRadius = radius - strokeWidth;
      const circumference = 2 * Math.PI * radius;
      
      let currentAngle = -90; // Start at top
      const segments = programData.map((p, i) => {
        const percentage = (p.totalValue / totalValue) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        const midAngle = startAngle + angle / 2;
        currentAngle = endAngle;
        
        // Calculate label position
        const labelRadius = radius - strokeWidth / 2 + 25;
        const labelX = centerX + labelRadius * Math.cos((midAngle * Math.PI) / 180);
        const labelY = centerY + labelRadius * Math.sin((midAngle * Math.PI) / 180);
        
        const strokeDasharray = (percentage / 100) * circumference;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;
        const color = colors[i % colors.length];
        
        // Calculate arc path for segment
        const startAngleRad = (startAngle * Math.PI) / 180;
        const endAngleRad = (endAngle * Math.PI) / 180;
        const largeArcFlag = angle > 180 ? 1 : 0;
        
        const x1 = centerX + radius * Math.cos(startAngleRad);
        const y1 = centerY + radius * Math.sin(startAngleRad);
        const x2 = centerX + radius * Math.cos(endAngleRad);
        const y2 = centerY + radius * Math.sin(endAngleRad);
        
        const innerX1 = centerX + innerRadius * Math.cos(startAngleRad);
        const innerY1 = centerY + innerRadius * Math.sin(startAngleRad);
        const innerX2 = centerX + innerRadius * Math.cos(endAngleRad);
        const innerY2 = centerY + innerRadius * Math.sin(endAngleRad);
        
        // Create path for donut segment
        const pathData = [
          `M ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          `L ${innerX2} ${innerY2}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`,
          'Z'
        ].join(' ');
        
        return {
          percentage,
          pathData,
          color,
          programName: p.programName,
          totalValue: p.totalValue,
          labelX,
          labelY,
          midAngle
        };
      });
      
      const paths = segments.map(seg => `
        <path
          d="${seg.pathData}"
          fill="${seg.color}"
          stroke="#ffffff"
          stroke-width="2"
          class="points-chart-segment"
          data-program="${seg.programName}"
        />
      `).join('');
      
      const labels = segments.filter(seg => seg.percentage > 3).map(seg => {
        const textAnchor = seg.midAngle > 90 && seg.midAngle < 270 ? 'end' : 'start';
        return `
          <g class="points-chart-label-group">
            <text 
              x="${seg.labelX}" 
              y="${seg.labelY}" 
              text-anchor="${textAnchor}"
              class="points-chart-label"
              fill="#202124"
              font-weight="600"
              font-size="12"
            >
              ${this.getBaseProgramName(seg.programName)}
            </text>
            <text 
              x="${seg.labelX}" 
              y="${seg.labelY + 14}" 
              text-anchor="${textAnchor}"
              class="points-chart-label-value"
              fill="#5f6368"
              font-size="11"
            >
              ${seg.percentage.toFixed(1)}%
            </text>
          </g>
        `;
      }).join('');
      
      return `
        <div class="points-donut-chart">
          <svg viewBox="0 0 400 400" class="points-donut-svg">
            ${paths}
            <circle
              cx="${centerX}"
              cy="${centerY}"
              r="${innerRadius}"
              fill="#ffffff"
            />
            <text x="${centerX}" y="${centerY - 8}" text-anchor="middle" class="points-donut-center-text-large">
              ${totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
            </text>
            <text x="${centerX}" y="${centerY + 12}" text-anchor="middle" class="points-donut-center-text-small">
              Total Value
            </text>
            ${labels}
          </svg>
        </div>
      `;
    }
    
    /**
     * Create bar chart
     */
    createBarChart(programData, totalValue) {
      if (programData.length === 0) return '<div class="points-empty-state">No data to display</div>';
      
      const maxValue = Math.max(...programData.map(p => p.totalValue));
      const colors = [
        '#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#ff6d00',
        '#9c27b0', '#00bcd4', '#4caf50', '#ff9800', '#e91e63'
      ];
      
      const bars = programData.map((p, i) => {
        const height = (p.totalValue / maxValue) * 100;
        const color = colors[i % colors.length];
        const hasWarning = p.expiringCount > 0 || p.expiredCount > 0;
        
        return `
          <div class="points-bar-chart-item">
            <div class="points-bar-chart-bar-container">
              <div class="points-bar-chart-bar ${hasWarning ? 'points-bar-warning' : ''}" 
                   style="height: ${height}%; background: ${color};"
                   title="${this.getBaseProgramName(p.programName)}: ${p.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}">
                <span class="points-bar-value">${p.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</span>
              </div>
            </div>
            <div class="points-bar-chart-label">
              <span class="points-bar-program-name">${this.getBaseProgramName(p.programName)}</span>
              ${p.expiringCount > 0 || p.expiredCount > 0 ? `
                <span class="points-bar-warning-indicator">
                  ${p.expiredCount > 0 ? '⚠️' : '⏰'}
                </span>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
      
      return `<div class="points-bar-chart">${bars}</div>`;
    }
    
    /**
     * Create program diagram card
     */
    createProgramDiagramCard(programData, totalValue) {
      const percentage = (programData.totalValue / totalValue) * 100;
      const hasWarning = programData.expiringCount > 0 || programData.expiredCount > 0;
      
      return `
        <div class="points-program-diagram-card ${hasWarning ? 'points-card-has-warning' : ''}">
          <div class="points-program-diagram-header">
            <h6 class="points-program-diagram-name">${this.getBaseProgramName(programData.programName)}</h6>
            ${hasWarning ? `
              <div class="points-program-diagram-warning">
                ${programData.expiredCount > 0 ? `<span class="points-warning-badge-small">⚠️ ${programData.expiredCount} expired</span>` : ''}
                ${programData.expiringCount > 0 ? `<span class="points-warning-badge-small">⏰ ${programData.expiringCount} expiring</span>` : ''}
              </div>
            ` : ''}
          </div>
          <div class="points-program-diagram-stats">
            <div class="points-program-diagram-stat">
              <span class="points-diagram-stat-label">Total Points:</span>
              <span class="points-diagram-stat-value">${programData.totalAmount.toLocaleString()}</span>
            </div>
            <div class="points-program-diagram-stat">
              <span class="points-diagram-stat-label">Total Value:</span>
              <span class="points-diagram-stat-value points-highlight">${programData.totalValue.toLocaleString('en-US', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}</span>
            </div>
            <div class="points-program-diagram-stat">
              <span class="points-diagram-stat-label">Percentage:</span>
              <span class="points-diagram-stat-value">${percentage.toFixed(1)}%</span>
            </div>
            <div class="points-program-diagram-stat">
              <span class="points-diagram-stat-label">Entries:</span>
              <span class="points-diagram-stat-value">${programData.entries.length}</span>
            </div>
          </div>
          <div class="points-program-diagram-progress">
            <div class="points-progress-bar" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    }

    /**
     * Group entries by program name
     */
    groupEntriesByProgram(entries) {
      const grouped = {};
      entries.forEach(entry => {
        if (!grouped[entry.programName]) {
          grouped[entry.programName] = [];
        }
        grouped[entry.programName].push(entry);
      });
      return grouped;
    }

    /**
     * Create a program group with collapsible cards
     */
    createProgramGroup(programName, entries) {
      if (!entries || entries.length === 0) {
        logger.warn('No entries provided for program:', programName);
        return document.createElement('div');
      }

      const groupDiv = document.createElement('div');
      groupDiv.className = 'points-program-group';

      // Calculate totals for this program
      const totalAmount = entries.reduce((sum, e) => sum + (parseFloat(e.points) || 0), 0);
      const totalValue = entries.reduce((sum, e) => sum + ((parseFloat(e.points) || 0) * (parseFloat(e.pointValue) || 0)), 0);
      const pointValue = parseFloat(entries[0].pointValue) || 0;
      
      // Count expiring/expired
      let expiringCount = 0;
      let expiredCount = 0;
      entries.forEach(entry => {
        const daysLeft = window.pointsTracker.getDaysUntilExpiration(entry.expirationDate);
        if (daysLeft !== null) {
          if (daysLeft < 0) expiredCount++;
          else if (daysLeft <= 90) expiringCount++;
        }
      });

      // Create a safe group ID by sanitizing the program name
      const safeProgramName = programName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
      const groupId = `points-group-${safeProgramName}`;
      const isCollapsed = localStorage.getItem(`points-group-collapsed-${programName}`) === 'true';

      groupDiv.innerHTML = `
        <div class="points-program-group-header" data-group-id="${groupId}">
          <div class="points-program-group-title">
            <button class="points-group-toggle" aria-expanded="${!isCollapsed}">
              <svg class="points-group-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <span class="points-program-name-large">${this.getBaseProgramName(programName)}</span>
            <span class="points-program-badge">${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}</span>
          </div>
          <div class="points-program-group-summary">
            <div class="points-summary-item">
              <span class="points-summary-label">Total Points:</span>
              <span class="points-summary-value">${totalAmount.toLocaleString()}</span>
            </div>
            <div class="points-summary-item">
              <span class="points-summary-label">Total Value:</span>
              <span class="points-summary-value points-highlight">${totalValue.toLocaleString('en-US', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}</span>
            </div>
            ${expiringCount > 0 ? `<div class="points-summary-item points-warning-badge">
              <span class="points-summary-label">Expiring:</span>
              <span class="points-summary-value">${expiringCount}</span>
            </div>` : ''}
            ${expiredCount > 0 ? `<div class="points-summary-item points-error-badge">
              <span class="points-summary-label">Expired:</span>
              <span class="points-summary-value">${expiredCount}</span>
            </div>` : ''}
          </div>
        </div>
        <div class="points-program-group-content" id="${groupId}" style="display: ${isCollapsed ? 'none' : 'block'}">
          <div class="points-cards-grid">
            ${entries.map(entry => {
              try {
                return this.createEntryCard(entry);
              } catch (error) {
                logger.error('Error creating card for entry:', entry, error);
                return '';
              }
            }).filter(card => card !== '').join('')}
          </div>
        </div>
      `;

      // Add toggle functionality
      const header = groupDiv.querySelector('.points-program-group-header');
      const content = groupDiv.querySelector(`#${groupId}`);
      const toggle = groupDiv.querySelector('.points-group-toggle');
      
      if (header && content && toggle) {
        header.addEventListener('click', () => {
          const isCurrentlyCollapsed = content.style.display === 'none';
          content.style.display = isCurrentlyCollapsed ? 'block' : 'none';
          toggle.setAttribute('aria-expanded', isCurrentlyCollapsed ? 'true' : 'false');
          localStorage.setItem(`points-group-collapsed-${programName}`, isCurrentlyCollapsed ? 'false' : 'true');
        });
      } else {
        logger.warn('Could not find header, content, or toggle for program group:', programName);
      }

      return groupDiv;
    }

    /**
     * Create a card for an entry
     */
    createEntryCard(entry) {
      try {
        // Ensure we have valid data
        if (!entry || !entry.id) {
          logger.warn('Invalid entry data:', entry);
          return '';
        }

        const points = parseFloat(entry.points) || 0;
        const pointValue = parseFloat(entry.pointValue) || 0;
        const daysLeft = entry.expirationDate ? window.pointsTracker.getDaysUntilExpiration(entry.expirationDate) : null;
        const totalValue = points * pointValue;
        const isExpired = daysLeft !== null && daysLeft < 0;
        const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 90;

        const statusClass = isExpired ? 'points-card-expired' : isExpiringSoon ? 'points-card-warning' : '';
        const statusIcon = isExpired ? '⚠️' : isExpiringSoon ? '⏰' : '✓';

        return `
          <div class="points-entry-card ${statusClass}" data-entry-id="${entry.id}">
            <div class="points-card-header">
              <div class="points-card-amount">
                <span class="points-card-amount-value">${points.toLocaleString()}</span>
                <span class="points-card-amount-label">points</span>
              </div>
              <div class="points-card-status">${statusIcon}</div>
            </div>
            <div class="points-card-body">
              <div class="points-card-value">
                <span class="points-card-value-label">Value:</span>
                <span class="points-card-value-amount">${totalValue.toLocaleString('en-US', { 
                  style: 'currency', 
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}</span>
              </div>
              <div class="points-card-details">
                <div class="points-card-detail-item">
                  <span class="points-card-detail-label">Point Value:</span>
                  <span class="points-card-detail-value">${(pointValue * 100).toFixed(2)}¢</span>
                </div>
                ${entry.expirationDate ? `
                  <div class="points-card-detail-item">
                    <span class="points-card-detail-label">Expires:</span>
                    <span class="points-card-detail-value ${isExpired ? 'points-expired' : isExpiringSoon ? 'points-expiring-soon' : ''}">
                      ${window.pointsTracker.formatDate(entry.expirationDate)}
                    </span>
                  </div>
                  <div class="points-card-detail-item">
                    <span class="points-card-detail-label">Days Left:</span>
                    <span class="points-card-detail-value ${isExpired ? 'points-expired' : isExpiringSoon ? 'points-expiring-soon' : ''}">
                      ${daysLeft < 0 ? `Expired ${Math.abs(daysLeft)} days ago` : `${daysLeft} days`}
                    </span>
                  </div>
                ` : `
                  <div class="points-card-detail-item">
                    <span class="points-card-detail-label">Expiration:</span>
                    <span class="points-card-detail-value">No expiration</span>
                  </div>
                `}
                <div class="points-card-detail-item">
                  <span class="points-card-detail-label">Updated:</span>
                  <span class="points-card-detail-value">${entry.lastUpdated ? window.pointsTracker.formatDate(entry.lastUpdated) : 'N/A'}</span>
                </div>
              </div>
              ${entry.notes ? `
                <div class="points-card-notes">
                  <span class="points-card-notes-label">Notes:</span>
                  <span class="points-card-notes-text">${entry.notes}</span>
                </div>
              ` : ''}
            </div>
            <div class="points-card-actions">
              <button class="points-card-action-btn points-edit-btn" data-id="${entry.id}" title="Edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="points-card-action-btn points-delete-btn" data-id="${entry.id}" title="Delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        `;
      } catch (error) {
        logger.error('Error creating entry card:', entry, error);
        return `<div class="points-entry-card" style="border-color: #ea4335;">
          <div class="points-empty-state">Error loading entry: ${error.message}</div>
        </div>`;
      }
    }


    /**
     * Bind event listeners
     */
    bindEvents() {
      // Add button
      const addBtn = document.getElementById('points-add-btn');
      if (addBtn) {
        addBtn.addEventListener('click', () => this.openModal());
      }

      // Modal close
      const modal = document.getElementById('points-modal');
      const modalClose = document.getElementById('points-modal-close');
      const formCancel = document.getElementById('points-form-cancel');
      
      [modalClose, formCancel].forEach(btn => {
        if (btn) {
          btn.addEventListener('click', () => this.closeModal());
        }
      });

      // Close modal on outside click
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.closeModal();
          }
        });
      }

      // Form submit
      const form = document.getElementById('points-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.saveEntry();
        });
      }

      // Search input
      const searchInput = document.getElementById('points-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.filters.search = e.target.value.toLowerCase();
          this.render();
        });
      }

      // Status filter
      const statusFilter = document.getElementById('points-status-filter');
      if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
          this.filters.status = e.target.value;
          this.render();
        });
      }

      // Reset filters button
      const resetBtn = document.getElementById('points-reset-filters');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.filters = { search: '', status: 'all' };
          if (searchInput) searchInput.value = '';
          if (statusFilter) statusFilter.value = 'all';
          this.currentSort = { field: 'points', direction: 'desc' };
          this.render();
        });
      }


      // Edit/Delete buttons (event delegation)
      // Use document-level event delegation for reliability
      // Only set up once using a flag
      if (!window.pointsTrackerEditHandlerSet) {
        document.addEventListener('click', (e) => {
          // Only handle clicks within the points tracker container
          const cardsContainer = document.getElementById('points-tracker-cards-container');
          if (!cardsContainer || !cardsContainer.contains(e.target)) {
            return;
          }
          
          // Check if click is on edit button or inside it (including SVG)
          let editBtn = e.target.closest('.points-edit-btn');
          let deleteBtn = e.target.closest('.points-delete-btn');
          
          // If closest didn't find it, check if we're inside an SVG that's inside a button
          if (!editBtn && !deleteBtn) {
            const svgElement = e.target.closest('svg');
            if (svgElement && svgElement.parentElement) {
              const parent = svgElement.parentElement;
              if (parent.classList.contains('points-edit-btn')) {
                editBtn = parent;
              } else if (parent.classList.contains('points-delete-btn')) {
                deleteBtn = parent;
              }
            }
          }
          
          // Also check if clicking directly on a path element inside SVG
          if (!editBtn && !deleteBtn && (e.target.tagName === 'path' || e.target.tagName === 'svg')) {
            const svg = e.target.closest('svg');
            if (svg && svg.parentElement) {
              const parent = svg.parentElement;
              if (parent.classList.contains('points-edit-btn')) {
                editBtn = parent;
              } else if (parent.classList.contains('points-delete-btn')) {
                deleteBtn = parent;
              }
            }
          }
          
          if (editBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = editBtn.dataset.id || editBtn.getAttribute('data-id');
            console.log('Edit button clicked, ID:', id, 'Button:', editBtn);
            if (id && window.pointsTrackerUI) {
              window.pointsTrackerUI.editEntry(id);
            } else {
              console.error('Edit button clicked but no ID found or UI not available:', id, editBtn);
            }
            return false;
          }
          
          if (deleteBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = deleteBtn.dataset.id || deleteBtn.getAttribute('data-id');
            console.log('Delete button clicked, ID:', id);
            if (id && window.pointsTrackerUI) {
              window.pointsTrackerUI.deleteEntry(id);
            } else {
              console.error('Delete button clicked but no ID found or UI not available:', id, deleteBtn);
            }
            return false;
          }
        });
        window.pointsTrackerEditHandlerSet = true;
      }
    }

    /**
     * Open modal for adding/editing
     */
    async openModal(entryId = null) {
      this.editingId = entryId;
      const modal = document.getElementById('points-modal');
      const title = document.getElementById('points-modal-title');
      const form = document.getElementById('points-form');

      if (!modal || !title || !form) return;

      // Populate program select
      this.populateProgramSelect();

      if (entryId) {
        // Edit mode
        title.textContent = 'Edit Points Entry';
        const entries = await window.pointsTracker.getAllEntries();
        const entry = entries.find(e => e.id === entryId);
        if (entry) {
          document.getElementById('points-program').value = entry.programName;
          document.getElementById('points-points').value = entry.points;
          document.getElementById('points-pending').value = entry.pointsPending || '';
          document.getElementById('points-expiration').value = entry.expirationDate ? entry.expirationDate.split('T')[0] : '';
          document.getElementById('points-notes').value = entry.notes || '';
        }
      } else {
        // Add mode
        title.textContent = 'Add Points Entry';
        form.reset();
      }

      modal.style.display = 'flex';
    }

    /**
     * Close modal
     */
    closeModal() {
      const modal = document.getElementById('points-modal');
      if (modal) {
        modal.style.display = 'none';
        this.editingId = null;
        const form = document.getElementById('points-form');
        if (form) form.reset();
      }
    }

    /**
     * Save entry (add or update)
     */
    async saveEntry() {
      const program = document.getElementById('points-program').value;
      const points = document.getElementById('points-points').value;
      const pending = document.getElementById('points-pending').value;
      const expiration = document.getElementById('points-expiration').value;
      const notes = document.getElementById('points-notes').value;

      if (!program || !points) {
        alert('Please fill in all required fields.');
        return;
      }

      // Disable submit button during save
      const submitBtn = document.getElementById('points-form-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
      }

      try {
        if (this.editingId) {
          // Update
          await window.pointsTracker.updateEntry(this.editingId, {
            programName: program,
            points: points,
            pointsPending: pending && pending.trim() !== '' ? pending.trim() : null,
            expirationDate: expiration && expiration.trim() !== '' ? expiration.trim() : null,
            notes: notes
          });
        } else {
          // Add
          await window.pointsTracker.addEntry({
            programName: program,
            points: points,
            pointsPending: pending && pending.trim() !== '' ? pending.trim() : null,
            expirationDate: expiration && expiration.trim() !== '' ? expiration.trim() : null,
            notes: notes
          });
        }

        // Clear editing ID before closing modal
        const wasEditing = !!this.editingId;
        this.editingId = null;
        this.closeModal();
        
        // Re-render to show updated data
        await this.render();
        
        if (wasEditing) {
          logger.info('Entry updated successfully');
        } else {
          logger.info('Entry added successfully');
        }
      } catch (error) {
        logger.error('Error saving entry:', error);
        console.error('Full error details:', error);
        const errorMessage = error?.message || error?.toString() || 'Unknown error';
        alert(`Failed to save entry: ${errorMessage}. Please check the console for details.`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Save';
        }
      }
    }

    /**
     * Apply filters to entries
     */
    applyFilters(entries) {
      return entries.filter(entry => {
        // Search filter
        if (this.filters.search) {
          const searchLower = this.filters.search.toLowerCase();
          if (!entry.programName.toLowerCase().includes(searchLower)) {
            return false;
          }
        }

        // Status filter
        if (this.filters.status && this.filters.status !== 'all') {
          const daysLeft = window.pointsTracker.getDaysUntilExpiration(entry.expirationDate);
          if (this.filters.status === 'expired') {
            if (daysLeft === null || daysLeft >= 0) return false;
          } else if (this.filters.status === 'expiring') {
            if (daysLeft === null || daysLeft < 0 || daysLeft > 90) return false;
          } else if (this.filters.status === 'active') {
            if (daysLeft !== null && daysLeft <= 90) return false;
          }
        }

        return true;
      });
    }

    /**
     * Apply sorting to entries
     */
    applySorting(entries) {
      if (!this.currentSort.field) {
        // Default sort: expiration date (soonest first)
        return [...entries].sort((a, b) => {
          if (!a.expirationDate && !b.expirationDate) return 0;
          if (!a.expirationDate) return 1;
          if (!b.expirationDate) return -1;
          return new Date(a.expirationDate) - new Date(b.expirationDate);
        });
      }

      const sorted = [...entries].sort((a, b) => {
        let aValue, bValue;

        switch (this.currentSort.field) {
          case 'program':
            aValue = a.programName.toLowerCase();
            bValue = b.programName.toLowerCase();
            return aValue.localeCompare(bValue);

          case 'points':
            aValue = a.points;
            bValue = b.points;
            return aValue - bValue;

          case 'pointValue':
            aValue = a.pointValue;
            bValue = b.pointValue;
            return aValue - bValue;

          case 'pending':
            aValue = parseFloat(a.pointsPending) || 0;
            bValue = parseFloat(b.pointsPending) || 0;
            return aValue - bValue;

          case 'totalAmount':
            aValue = (parseFloat(a.points) || 0) + (parseFloat(a.pointsPending) || 0);
            bValue = (parseFloat(b.points) || 0) + (parseFloat(b.pointsPending) || 0);
            return aValue - bValue;

          case 'myValue':
            // Use my_value from Supabase multiplied by total amount if available, otherwise calculate it
            if (a.myValue !== null && a.myValue !== undefined && b.myValue !== null && b.myValue !== undefined) {
              const aTotalAmount = (parseFloat(a.points) || 0) + (parseFloat(a.pointsPending) || 0);
              const bTotalAmount = (parseFloat(b.points) || 0) + (parseFloat(b.pointsPending) || 0);
              aValue = parseFloat(a.myValue) * aTotalAmount;
              bValue = parseFloat(b.myValue) * bTotalAmount;
            } else {
              const aTotalAmount = (parseFloat(a.points) || 0) + (parseFloat(a.pointsPending) || 0);
              const bTotalAmount = (parseFloat(b.points) || 0) + (parseFloat(b.pointsPending) || 0);
              aValue = aTotalAmount * a.pointValue;
              bValue = bTotalAmount * b.pointValue;
            }
            return aValue - bValue;

          case 'totalValue':
            const aTotal = (parseFloat(a.points) || 0) + (parseFloat(a.pointsPending) || 0);
            const bTotal = (parseFloat(b.points) || 0) + (parseFloat(b.pointsPending) || 0);
            aValue = aTotal * a.pointValue;
            bValue = bTotal * b.pointValue;
            return aValue - bValue;

          case 'lastUpdated':
            aValue = new Date(a.lastUpdated).getTime();
            bValue = new Date(b.lastUpdated).getTime();
            return aValue - bValue;

          case 'expiration':
            if (!a.expirationDate && !b.expirationDate) return 0;
            if (!a.expirationDate) return 1;
            if (!b.expirationDate) return -1;
            aValue = new Date(a.expirationDate).getTime();
            bValue = new Date(b.expirationDate).getTime();
            return aValue - bValue;

          case 'daysLeft':
            aValue = window.pointsTracker.getDaysUntilExpiration(a.expirationDate);
            bValue = window.pointsTracker.getDaysUntilExpiration(b.expirationDate);
            if (aValue === null && bValue === null) return 0;
            if (aValue === null) return 1;
            if (bValue === null) return -1;
            return aValue - bValue;

          default:
            return 0;
        }
      });

      return this.currentSort.direction === 'desc' ? sorted.reverse() : sorted;
    }


    /**
     * Update view toggle buttons
     */
    updateViewButtons() {
      const diagramBtn = document.getElementById('points-view-diagram');
      const listBtn = document.getElementById('points-view-list');
      
      if (diagramBtn && listBtn) {
        if (this.currentView === 'diagram') {
          diagramBtn.classList.add('active');
          listBtn.classList.remove('active');
        } else {
          listBtn.classList.add('active');
          diagramBtn.classList.remove('active');
        }
      }
    }


    /**
     * Edit entry
     */
    editEntry(id) {
      console.log('editEntry called with ID:', id);
      if (!id) {
        console.error('editEntry called without ID');
        return;
      }
      this.openModal(id);
    }

    /**
     * Delete entry
     */
    async deleteEntry(id) {
      if (!id) {
        console.error('deleteEntry called without ID');
        return;
      }
      
      if (confirm('Are you sure you want to delete this entry?')) {
        try {
          console.log('Deleting entry with ID:', id);
          const result = await window.pointsTracker.deleteEntry(id);
          console.log('Delete result:', result);
          
          if (result) {
            // Re-render to show updated data
            await this.render();
            logger.info('Entry deleted successfully');
          } else {
            alert('Failed to delete entry. Entry may not exist.');
          }
        } catch (error) {
          logger.error('Error deleting entry:', error);
          console.error('Full error details:', error);
          const errorMessage = error?.message || error?.toString() || 'Unknown error';
          alert(`Failed to delete entry: ${errorMessage}. Please check the console for details.`);
        }
      }
    }
  }

  // Initialize Points Tracker UI
  function initializePointsTrackerUI() {
    // Wait a bit to ensure content.js has created the Information section
    const initUI = () => {
      if (!window.pointsTrackerUI) {
        const ui = new PointsTrackerUI();
        window.pointsTrackerUI = ui;
        logger.info('Points Tracker UI instance created');
      }
      
      // Always try to initialize
      if (window.pointsTrackerUI) {
        window.pointsTrackerUI.init();
        
        // After initialization, ensure visibility matches toggle
        setTimeout(() => {
          const toggle = document.getElementById('bs-info-points-toggle');
          const panel = document.getElementById('bs-points-tracker-panel');
          if (toggle && panel) {
            if (toggle.checked) {
              panel.style.display = '';
              panel.style.visibility = 'visible';
            } else {
              panel.style.display = 'none';
              panel.style.visibility = 'hidden';
            }
          }
        }, 100);
      }
    };

    // Try multiple times to ensure Information section is available
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initUI, 500);
      });
    } else {
      // If DOM is already ready, wait a bit for content.js to inject the panel
      setTimeout(initUI, 1000);
    }

    // Also try after longer delays as fallback
    setTimeout(initUI, 2000);
    setTimeout(initUI, 3000);
  }

  // Initialize immediately
  initializePointsTrackerUI();
  
  // Also try to initialize when window loads
  if (window.addEventListener) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (window.pointsTrackerUI) {
          window.pointsTrackerUI.init();
        }
      }, 1000);
    });
  }
  
  // Also listen for when Information section becomes visible
  const observer = new MutationObserver(() => {
    const infoSection = document.getElementById('bs-information-section');
    const pointsPanel = document.getElementById('bs-points-tracker-panel');
    const toggle = document.getElementById('bs-info-points-toggle');
    
    if (infoSection && !pointsPanel && window.pointsTrackerUI) {
      logger.info('Information section found via MutationObserver, initializing Points Tracker...');
      window.pointsTrackerUI.init();
    }
    
    // Ensure visibility matches toggle state when panel exists
    if (pointsPanel && toggle) {
      if (toggle.checked && (pointsPanel.style.display === 'none' || pointsPanel.style.visibility === 'hidden')) {
        pointsPanel.style.display = '';
        pointsPanel.style.visibility = 'visible';
        logger.info('Points Tracker panel made visible via MutationObserver');
      }
    }
  });
  
  // Observe document body for changes
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Expose a manual initialization function for debugging
  window.initializePointsTracker = function() {
    logger.info('Manual Points Tracker initialization called');
    if (!window.pointsTrackerUI) {
      window.pointsTrackerUI = new PointsTrackerUI();
    }
    window.pointsTrackerUI.init();
  };
})();

