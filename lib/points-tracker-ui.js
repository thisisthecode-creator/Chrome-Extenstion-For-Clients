// Points & Miles Tracker UI
// Renders the tracking interface in the Information section

(function() {
  'use strict';

  const logger = window.createLogger?.('PointsTrackerUI') || console;

  class PointsTrackerUI {
    constructor() {
      this.container = null;
      this.editingId = null;
      this.currentSort = { field: null, direction: 'asc' };
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
                <select id="points-program-filter" class="points-filter-select">
                  <option value="">All Programs</option>
                </select>
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
          
          <div class="points-tracker-table-container">
            <table class="points-tracker-table" id="points-tracker-table">
              <thead>
                <tr>
                  <th class="points-sortable" data-sort="program">
                    <button class="points-sort-button">
                      Program
                      <span class="points-sort-indicator"></span>
                    </button>
                  </th>
                  <th class="points-sortable" data-sort="amount">
                    <button class="points-sort-button">
                      Amount
                      <span class="points-sort-indicator"></span>
                    </button>
                  </th>
                  <th class="points-sortable" data-sort="pointValue">
                    <button class="points-sort-button">
                      Point Value
                      <span class="points-sort-indicator"></span>
                    </button>
                  </th>
                  <th class="points-sortable" data-sort="totalValue">
                    <button class="points-sort-button">
                      Total Value
                      <span class="points-sort-indicator"></span>
                    </button>
                  </th>
                  <th class="points-sortable" data-sort="lastUpdated">
                    <button class="points-sort-button">
                      Last Updated
                      <span class="points-sort-indicator"></span>
                    </button>
                  </th>
                  <th class="points-sortable" data-sort="expiration">
                    <button class="points-sort-button">
                      Expiration
                      <span class="points-sort-indicator"></span>
                    </button>
                  </th>
                  <th class="points-sortable" data-sort="daysLeft">
                    <button class="points-sort-button">
                      Days Left
                      <span class="points-sort-indicator"></span>
                    </button>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="points-tracker-tbody">
                <!-- Entries will be rendered here -->
              </tbody>
            </table>
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
                <label for="points-amount">Amount *</label>
                <input type="number" id="points-amount" step="0.01" min="0" required placeholder="0.00">
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
      if (!select || !window.loyaltyPrograms) return;

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
        categories[program.category] = categories[program.category] || [];
        categories[program.category].push(program);
      });

      // Add options grouped by category
      ['credit', 'airline', 'hotel'].forEach(category => {
        if (categories[category] && categories[category].length > 0) {
          const optgroup = document.createElement('optgroup');
          optgroup.label = category === 'credit' ? 'Credit Cards' : category === 'airline' ? 'Airlines' : 'Hotels';
          
          categories[category].forEach(program => {
            const option = document.createElement('option');
            option.value = program.name;
            option.textContent = `${program.name} (${(program.pointValue * 100).toFixed(2)}¢/point)`;
            optgroup.appendChild(option);
          });
          
          select.appendChild(optgroup);
        }
      });
    }

    /**
     * Render the tracker table
     */
    async render() {
      if (!this.container || !window.pointsTracker) return;

      const tbody = document.getElementById('points-tracker-tbody');
      const statsDiv = document.getElementById('points-tracker-stats');

      if (!tbody) return;

      // Show loading state
      tbody.innerHTML = '<tr><td colspan="8" class="points-empty-state">Loading...</td></tr>';

      try {
        logger.info('Starting to render Points Tracker...');
        
        // Check if pointsTracker is available
        if (!window.pointsTracker) {
          logger.error('window.pointsTracker is not available!');
          tbody.innerHTML = `
            <tr>
              <td colspan="8" class="points-empty-state">
                Error: Points Tracker not initialized. Please refresh the page.
              </td>
            </tr>
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
        const totalValue = await window.pointsTracker.getTotalValue();
        const totalAmount = await window.pointsTracker.getTotalAmount();
        logger.info(`Total value: $${totalValue}, Total amount: ${totalAmount}`);

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
              <span class="points-stat-label">Total Value (USD):</span>
              <span class="points-stat-value">${totalValue.toLocaleString('en-US', { 
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

        // Update program filter dropdown
        this.updateProgramFilter(allEntries);

        // Update sort indicators
        this.updateSortIndicators();

        // Clear table
        tbody.innerHTML = '';

        if (sortedEntries.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="8" class="points-empty-state">
                ${allEntries.length === 0 
                  ? 'No entries yet. Click "Add Entry" to get started.'
                  : 'No entries match your filters. Try adjusting your search or filter criteria.'}
              </td>
            </tr>
          `;
          return;
        }

        // Render entries
        sortedEntries.forEach(entry => {
          const row = this.createEntryRow(entry);
          tbody.appendChild(row);
        });
      } catch (error) {
        logger.error('Error rendering points tracker:', error);
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="points-empty-state">
              Error loading entries. Please try again.
            </td>
          </tr>
        `;
      }
    }

    /**
     * Create a table row for an entry
     */
    createEntryRow(entry) {
      const row = document.createElement('tr');
      const daysLeft = window.pointsTracker.getDaysUntilExpiration(entry.expirationDate);
      const totalValue = entry.amount * entry.pointValue;
      const isExpired = daysLeft !== null && daysLeft < 0;
      const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 90;

      row.className = isExpired ? 'points-row-expired' : isExpiringSoon ? 'points-row-warning' : '';
      
      row.innerHTML = `
        <td class="points-program-cell">
          <div class="points-program-name">${entry.programName}</div>
        </td>
        <td class="points-amount-cell">
          <span class="points-amount">${entry.amount.toLocaleString()}</span>
        </td>
        <td class="points-value-cell">
          <span class="points-value">${(entry.pointValue * 100).toFixed(2)}¢</span>
        </td>
        <td class="points-total-cell">
          <span class="points-total">${totalValue.toLocaleString('en-US', { 
            style: 'currency', 
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}</span>
        </td>
        <td class="points-updated-cell">
          <span class="points-updated">${window.pointsTracker.formatDate(entry.lastUpdated)}</span>
        </td>
        <td class="points-expiration-cell">
          <span class="points-expiration ${isExpired ? 'points-expired' : isExpiringSoon ? 'points-expiring-soon' : ''}">
            ${entry.expirationDate ? window.pointsTracker.formatDate(entry.expirationDate) : 'No expiration'}
          </span>
        </td>
        <td class="points-days-cell">
          <span class="points-days ${isExpired ? 'points-expired' : isExpiringSoon ? 'points-expiring-soon' : ''}">
            ${daysLeft !== null ? (daysLeft < 0 ? `Expired ${Math.abs(daysLeft)} days ago` : `${daysLeft} days`) : 'N/A'}
          </span>
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
      `;

      return row;
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

      // Program filter
      const programFilter = document.getElementById('points-program-filter');
      if (programFilter) {
        programFilter.addEventListener('change', (e) => {
          this.filters.program = e.target.value;
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
          this.filters = { search: '', program: '', status: 'all' };
          if (searchInput) searchInput.value = '';
          if (programFilter) programFilter.value = '';
          if (statusFilter) statusFilter.value = 'all';
          this.currentSort = { field: null, direction: 'asc' };
          this.render();
        });
      }

      // Sort buttons
      document.querySelectorAll('.points-sortable').forEach(th => {
        const button = th.querySelector('.points-sort-button');
        if (button) {
          button.addEventListener('click', () => {
            const sortField = th.dataset.sort;
            if (sortField) {
              // Toggle direction if same field, otherwise set to asc
              if (this.currentSort.field === sortField) {
                this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
              } else {
                this.currentSort.direction = 'asc';
              }
              this.currentSort.field = sortField;
              this.updateSortIndicators();
              this.render();
            }
          });
        }
      });

      // Edit/Delete buttons (event delegation)
      const tbody = document.getElementById('points-tracker-tbody');
      if (tbody) {
        tbody.addEventListener('click', (e) => {
          const editBtn = e.target.closest('.points-edit-btn');
          const deleteBtn = e.target.closest('.points-delete-btn');
          
          if (editBtn) {
            const id = editBtn.dataset.id;
            this.editEntry(id);
          }
          
          if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            this.deleteEntry(id);
          }
        });
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
          document.getElementById('points-amount').value = entry.amount;
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
      const amount = document.getElementById('points-amount').value;
      const expiration = document.getElementById('points-expiration').value;
      const notes = document.getElementById('points-notes').value;

      if (!program || !amount) {
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
            amount: amount,
            expirationDate: expiration || null,
            notes: notes
          });
        } else {
          // Add
          await window.pointsTracker.addEntry({
            programName: program,
            amount: amount,
            expirationDate: expiration || null,
            notes: notes
          });
        }

        this.closeModal();
        await this.render();
      } catch (error) {
        logger.error('Error saving entry:', error);
        alert('Failed to save entry. Please try again.');
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

        // Program filter
        if (this.filters.program) {
          if (entry.programName !== this.filters.program) {
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

          case 'amount':
            aValue = a.amount;
            bValue = b.amount;
            return aValue - bValue;

          case 'pointValue':
            aValue = a.pointValue;
            bValue = b.pointValue;
            return aValue - bValue;

          case 'totalValue':
            aValue = a.amount * a.pointValue;
            bValue = b.amount * b.pointValue;
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
     * Update sort indicators
     */
    updateSortIndicators() {
      // Clear all indicators
      document.querySelectorAll('.points-sort-indicator').forEach(indicator => {
        indicator.textContent = '';
        indicator.className = 'points-sort-indicator';
      });

      // Set active indicator
      if (this.currentSort.field) {
        const activeTh = document.querySelector(`[data-sort="${this.currentSort.field}"]`);
        if (activeTh) {
          const indicator = activeTh.querySelector('.points-sort-indicator');
          if (indicator) {
            indicator.textContent = this.currentSort.direction === 'asc' ? ' ↑' : ' ↓';
            indicator.className = 'points-sort-indicator active';
          }
        }
      }
    }

    /**
     * Update program filter dropdown with unique programs from entries
     */
    updateProgramFilter(entries) {
      const filterSelect = document.getElementById('points-program-filter');
      if (!filterSelect) return;

      // Get unique programs
      const programs = [...new Set(entries.map(e => e.programName))].sort();

      // Clear existing options except "All Programs"
      while (filterSelect.children.length > 1) {
        filterSelect.removeChild(filterSelect.lastChild);
      }

      // Add program options
      programs.forEach(program => {
        const option = document.createElement('option');
        option.value = program;
        option.textContent = program;
        filterSelect.appendChild(option);
      });
    }

    /**
     * Edit entry
     */
    editEntry(id) {
      this.openModal(id);
    }

    /**
     * Delete entry
     */
    async deleteEntry(id) {
      if (confirm('Are you sure you want to delete this entry?')) {
        try {
          await window.pointsTracker.deleteEntry(id);
          await this.render();
        } catch (error) {
          logger.error('Error deleting entry:', error);
          alert('Failed to delete entry. Please try again.');
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

