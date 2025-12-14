// Points & Miles Tracker
// Tracks amount of miles/points with program name, point value, last updated date, and expiration date
// Connected to Supabase database

(function() {
  'use strict';

  const logger = window.createLogger?.('PointsTracker') || console;

  class PointsTracker {
    constructor() {
      // Use centralized config
      this.supabaseUrl = window.config?.api?.supabase?.url || 'https://saegzrncsjcsvgcjkniv.supabase.co';
      this.supabaseKey = window.config?.api?.supabase?.key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZWd6cm5jc2pjc3ZnY2prbml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3ODgxNDYsImV4cCI6MjA0NzM2NDE0Nn0.w1eHVcuvDUoqhcMCYenKKA9URAtG4YbW3j5GcDgvu3Y';
      this.entries = [];
      this.isLoaded = false;
      this.loadingPromise = null;
      this.userId = this.getUserId(); // Optional: for multi-user support
      
      // Auto-load entries on initialization
      this.loadEntries();
    }

    /**
     * Get or create user ID (optional, for multi-user support)
     * @returns {string} User ID
     */
    getUserId() {
      try {
        let userId = localStorage.getItem('bs-points-tracker-user-id');
        if (!userId) {
          userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('bs-points-tracker-user-id', userId);
        }
        return userId;
      } catch (error) {
        return null; // Continue without user ID
      }
    }

    /**
     * Load entries from Supabase
     * @returns {Promise<Array>} Array of tracked entries
     */
    async loadEntries() {
      if (this.isLoaded) {
        return this.entries;
      }

      if (this.loadingPromise) {
        return this.loadingPromise;
      }

      this.loadingPromise = this._loadEntries();
      return this.loadingPromise;
    }

    async _loadEntries() {
      return await window.errorHandler?.safeAsync(async () => {
        logger.info('Loading points tracker entries from Supabase...');
        logger.info('Supabase URL:', this.supabaseUrl);
        logger.info('User ID:', this.userId);
        
        // Build query URL - try without user_id filter first to get all entries
        let url = `${this.supabaseUrl}/rest/v1/points_tracker?select=*&order=expiration_date.asc.nullsfirst,last_updated.desc`;
        
        // Optional: Filter by user_id if set (commented out to get all entries for now)
        // if (this.userId) {
        //   url += `&user_id=eq.${encodeURIComponent(this.userId)}`;
        // }
        
        logger.info('Fetching from URL:', url);
        
        try {
          // Use HTTP client with caching
          const data = await window.httpClient?.request(url, {
            useBackground: true,
            cache: false, // Disable cache to always get fresh data
            cacheTTL: window.config?.cache?.supabaseTTL,
            headers: {
              'apikey': this.supabaseKey,
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            }
          });

          logger.info('Raw Supabase response:', data);
          logger.info('Response type:', Array.isArray(data) ? 'array' : typeof data);
          logger.info('Response length:', Array.isArray(data) ? data.length : 'not an array');

          // Ensure data is an array
          const entriesArray = Array.isArray(data) ? data : (data ? [data] : []);

          // Transform Supabase data to our format
          this.entries = entriesArray.map(row => ({
            id: row.id,
            programName: row.program_name,
            amount: parseFloat(row.amount) || 0,
            pending: parseFloat(row.pending) || 0,
            pointValue: parseFloat(row.point_value) || 0.0190,
            customPointValue: row.custom_point_value ? parseFloat(row.custom_point_value) : null,
            lastUpdated: row.last_updated || row.created_at,
            expirationDate: row.expiration_date || null,
            notes: row.notes || '',
            userId: row.user_id
          }));

          this.isLoaded = true;
          logger.info(`Successfully loaded ${this.entries.length} entries from Supabase`);
          
          if (this.entries.length === 0) {
            logger.warn('No entries found in Supabase. This might be normal if no data has been added yet.');
          }
          
          return this.entries;
        } catch (error) {
          logger.error('Error loading entries from Supabase:', error);
          logger.error('Error details:', {
            message: error.message,
            stack: error.stack,
            url: url
          });
          
          // Return empty array on error instead of throwing
          this.entries = [];
          this.isLoaded = true;
          return [];
        }
      }, [], {
        module: 'PointsTracker',
        action: '_loadEntries'
      }) || [];
    }

    /**
     * Add a new entry to Supabase
     * @param {Object} entry - Entry data
     * @param {string} entry.programName - Program name
     * @param {number} entry.amount - Amount of points/miles
     * @param {string} entry.expirationDate - Expiration date (YYYY-MM-DD)
     * @returns {Promise<string>} Entry ID
     */
    async addEntry(entry) {
      return await window.errorHandler?.safeAsync(async () => {
        const program = window.loyaltyPrograms?.find(p => p.name === entry.programName);
        const pointValue = program?.pointValue || 0.0190;
        
        // Prepare data for Supabase
        const supabaseData = {
          program_name: entry.programName,
          amount: parseFloat(entry.amount) || 0,
          pending: entry.pending ? parseFloat(entry.pending) : null,
          point_value: pointValue,
          custom_point_value: entry.customPointValue ? parseFloat(entry.customPointValue) : null,
          expiration_date: entry.expirationDate || null,
          notes: entry.notes || '',
          user_id: this.userId
        };

        const url = `${this.supabaseUrl}/rest/v1/points_tracker`;
        
        // Insert into Supabase
        if (!window.httpClient) {
          throw new Error('HTTP client is not available');
        }
        
        logger.info('Adding entry to Supabase:', supabaseData);
        logger.info('URL:', url);
        
        let response;
        try {
          response = await window.httpClient.request(url, {
          useBackground: true,
          cache: false,
          method: 'POST',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(supabaseData)
          });
        } catch (error) {
          logger.error('Error adding to Supabase:', error);
          throw error;
        }

        logger.info('Supabase add response:', response);
        logger.info('Response type:', Array.isArray(response) ? 'array' : typeof response);

        if (response && (Array.isArray(response) ? response[0] : response)) {
          const responseData = Array.isArray(response) ? response[0] : response;
          const newEntry = {
            id: responseData.id,
            programName: responseData.program_name,
            amount: parseFloat(responseData.amount) || 0,
            pending: responseData.pending ? parseFloat(responseData.pending) : 0,
            pointValue: parseFloat(responseData.point_value) || 0.0190,
            customPointValue: responseData.custom_point_value ? parseFloat(responseData.custom_point_value) : null,
            lastUpdated: responseData.last_updated || responseData.created_at,
            expirationDate: responseData.expiration_date || null,
            notes: responseData.notes || '',
            userId: responseData.user_id
          };

          // Add to local cache
          this.entries.push(newEntry);
          logger.info('Added entry to Supabase:', newEntry.id);
          return newEntry.id;
        }

        throw new Error('Failed to add entry to Supabase');
      }, null, {
        module: 'PointsTracker',
        action: 'addEntry',
        entry
      });
    }

    /**
     * Update an existing entry in Supabase
     * @param {string} id - Entry ID (UUID)
     * @param {Object} updates - Fields to update
     * @returns {Promise<boolean>} Success status
     */
    async updateEntry(id, updates) {
      return await window.errorHandler?.safeAsync(async () => {
        const entry = this.entries.find(e => e.id === id);
        if (!entry) {
          logger.warn('Entry not found:', id);
          return false;
        }

        // Prepare update data for Supabase - always include all fields to ensure complete update
        const supabaseData = {};
        
        // Always update amount if provided
        if (updates.amount !== undefined) {
          supabaseData.amount = parseFloat(updates.amount) || 0;
        } else {
          supabaseData.amount = parseFloat(entry.amount) || 0;
        }
        
        // Always update pending if provided
        if (updates.pending !== undefined) {
          supabaseData.pending = updates.pending ? parseFloat(updates.pending) : null;
        } else {
          supabaseData.pending = entry.pending ? parseFloat(entry.pending) : null;
        }
        
        // Always update program name if provided
        if (updates.programName !== undefined) {
          supabaseData.program_name = updates.programName;
          const program = window.loyaltyPrograms?.find(p => p.name === updates.programName);
          supabaseData.point_value = program?.pointValue || 0.0190;
        } else {
          supabaseData.program_name = entry.programName;
          supabaseData.point_value = parseFloat(entry.pointValue) || 0.0190;
        }
        
        // Always update custom point value if provided
        if (updates.customPointValue !== undefined) {
          supabaseData.custom_point_value = updates.customPointValue ? parseFloat(updates.customPointValue) : null;
        } else {
          supabaseData.custom_point_value = entry.customPointValue ? parseFloat(entry.customPointValue) : null;
        }
        
        // Always update expiration date if provided
        if (updates.expirationDate !== undefined) {
          supabaseData.expiration_date = updates.expirationDate || null;
        } else {
          supabaseData.expiration_date = entry.expirationDate || null;
        }
        
        // Always update notes if provided
        if (updates.notes !== undefined) {
          supabaseData.notes = updates.notes || '';
        } else {
          supabaseData.notes = entry.notes || '';
        }

        const url = `${this.supabaseUrl}/rest/v1/points_tracker?id=eq.${id}`;
        
        if (!window.httpClient) {
          throw new Error('HTTP client is not available');
        }
        
        logger.info('Updating entry in Supabase:', { id, supabaseData, url });
        
        // Update in Supabase
        let updateResponse;
        try {
          updateResponse = await window.httpClient.request(url, {
          useBackground: true,
          cache: false,
          method: 'PATCH',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(supabaseData)
          });
        } catch (error) {
          logger.error('Error updating in Supabase:', error);
          throw error;
        }
        
        logger.info('Supabase update response:', updateResponse);

        // Update local cache
        if (updates.amount !== undefined) entry.amount = parseFloat(updates.amount) || 0;
        if (updates.pending !== undefined) entry.pending = updates.pending ? parseFloat(updates.pending) : 0;
        if (updates.programName !== undefined) {
          entry.programName = updates.programName;
          const program = window.loyaltyPrograms?.find(p => p.name === updates.programName);
          entry.pointValue = program?.pointValue || 0.0190;
        }
        if (updates.customPointValue !== undefined) {
          entry.customPointValue = updates.customPointValue && updates.customPointValue !== '' 
            ? parseFloat(updates.customPointValue) 
            : null;
        }
        if (updates.expirationDate !== undefined) entry.expirationDate = updates.expirationDate;
        if (updates.notes !== undefined) entry.notes = updates.notes;
        entry.lastUpdated = new Date().toISOString();
        
        // Reload entry from Supabase to ensure we have the latest data
        if (!window.httpClient) {
          logger.warn('HTTP client not available, skipping reload');
        } else {
          try {
            const response = await window.httpClient.request(`${this.supabaseUrl}/rest/v1/points_tracker?id=eq.${id}`, {
          useBackground: true,
          cache: false,
          method: 'GET',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
            }
            });
            
            if (response && response[0]) {
              // Update entry with fresh data from Supabase
              entry.amount = parseFloat(response[0].amount) || 0;
              entry.pending = response[0].pending ? parseFloat(response[0].pending) : 0;
              entry.programName = response[0].program_name;
              entry.pointValue = parseFloat(response[0].point_value) || 0.0190;
              entry.customPointValue = response[0].custom_point_value ? parseFloat(response[0].custom_point_value) : null;
              entry.expirationDate = response[0].expiration_date || null;
              entry.notes = response[0].notes || '';
              entry.lastUpdated = response[0].last_updated || response[0].created_at;
            }
          } catch (error) {
            logger.warn('Error reloading entry from Supabase:', error);
            // Continue with local cache update
          }
        }

        logger.info('Updated entry in Supabase:', id);
        return true;
      }, false, {
        module: 'PointsTracker',
        action: 'updateEntry',
        id,
        updates
      });
    }

    /**
     * Delete an entry from Supabase
     * @param {string} id - Entry ID (UUID)
     * @returns {Promise<boolean>} Success status
     */
    async deleteEntry(id) {
      return await window.errorHandler?.safeAsync(async () => {
        if (!window.httpClient) {
          throw new Error('HTTP client is not available');
        }
        
        const index = this.entries.findIndex(e => e.id === id);
        if (index === -1) {
          logger.warn('Entry not found:', id);
          return false;
        }

        const url = `${this.supabaseUrl}/rest/v1/points_tracker?id=eq.${id}`;
        
        logger.info('Deleting entry from Supabase:', { id, url });
        
        // Delete from Supabase
        try {
          await window.httpClient.request(url, {
            useBackground: true,
            cache: false,
            method: 'DELETE',
            headers: {
              'apikey': this.supabaseKey,
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          logger.error('Error deleting from Supabase:', error);
          throw error;
        }

        // Remove from local cache
        this.entries.splice(index, 1);
        logger.info('Deleted entry from Supabase:', id);
        return true;
      }, false, {
        module: 'PointsTracker',
        action: 'deleteEntry',
        id
      });
    }

    /**
     * Get all entries (ensure loaded first)
     * @returns {Promise<Array>} All entries
     */
    async getAllEntries() {
      await this.loadEntries();
      return this.entries;
    }

    /**
     * Get entries by program name
     * @param {string} programName - Program name
     * @returns {Promise<Array>} Matching entries
     */
    async getEntriesByProgram(programName) {
      await this.loadEntries();
      return this.entries.filter(e => e.programName === programName);
    }

    /**
     * Get total value of all points in USD
     * @returns {Promise<number>} Total value in USD
     */
    async getTotalValue() {
      await this.loadEntries();
      return this.entries.reduce((total, entry) => {
        return total + (entry.amount * entry.pointValue);
      }, 0);
    }

    /**
     * Get total amount of all points/miles
     * @returns {Promise<number>} Total amount of points/miles
     */
    async getTotalAmount() {
      await this.loadEntries();
      return this.entries.reduce((total, entry) => {
        return total + entry.amount;
      }, 0);
    }

    /**
     * Get entries expiring soon (within specified days)
     * @param {number} days - Number of days to check
     * @returns {Promise<Array>} Entries expiring soon
     */
    async getExpiringSoon(days = 90) {
      await this.loadEntries();
      const now = new Date();
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      return this.entries.filter(entry => {
        if (!entry.expirationDate) return false;
        const expDate = new Date(entry.expirationDate);
        return expDate <= futureDate && expDate >= now;
      }).sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
    }

    /**
     * Get expired entries
     * @returns {Promise<Array>} Expired entries
     */
    async getExpired() {
      await this.loadEntries();
      const now = new Date();
      return this.entries.filter(entry => {
        if (!entry.expirationDate) return false;
        return new Date(entry.expirationDate) < now;
      }).sort((a, b) => new Date(b.expirationDate) - new Date(a.expirationDate));
    }

    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString, format = 'DD/MM/YY') {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
      } catch (e) {
        return dateString;
      }
    }

    /**
     * Get days until expiration
     * @param {string} expirationDate - Expiration date
     * @returns {number|null} Days until expiration or null
     */
    getDaysUntilExpiration(expirationDate) {
      if (!expirationDate) return null;
      const now = new Date();
      const exp = new Date(expirationDate);
      const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      return diff;
    }
  }

  // Create global instance
  window.pointsTracker = new PointsTracker();

  // Expose utility functions
  window.formatPointsDate = (dateString) => window.pointsTracker.formatDate(dateString);
  window.getDaysUntilExpiration = (dateString) => window.pointsTracker.getDaysUntilExpiration(dateString);
})();

