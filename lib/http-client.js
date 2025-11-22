// Centralized HTTP Client
// Provides consistent API calls with caching and error handling

(function() {
  'use strict';

  window.httpClient = {
    /**
     * Make an HTTP request
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @param {boolean} options.useBackground - Use background service worker
     * @param {boolean} options.cache - Enable caching
     * @param {number} options.cacheTTL - Cache TTL in milliseconds
     * @param {Object} options.headers - Request headers
     * @param {string} options.method - HTTP method
     * @param {*} options.body - Request body
     * @returns {Promise<*>} Response data
     */
    async request(url, options = {}) {
      const logger = window.createLogger?.('HTTP');
      const {
        useBackground = false,
        cache = true,
        cacheTTL = window.config?.cache?.defaultTTL,
        ...fetchOptions
      } = options;

      // Check cache first
      if (cache && window.cacheService) {
        const cached = window.cacheService.get(url);
        if (cached !== null) {
          logger?.debug('Cache hit:', url);
          return cached;
        }
      }

      logger?.debug('Request:', url, options);

      try {
        let response;
        
        if (useBackground && chrome?.runtime) {
          // Use background service worker
          response = await this.backgroundFetch(url, fetchOptions);
        } else {
          // Direct fetch
          response = await this.directFetch(url, fetchOptions);
        }

        // Cache response
        if (cache && window.cacheService) {
          window.cacheService.set(url, response, cacheTTL);
        }

        logger?.debug('Response received:', url);
        return response;
      } catch (error) {
        logger?.error('Request failed:', url, error);
        if (window.errorHandler) {
          window.errorHandler.handle(error, { url, options });
        }
        throw error;
      }
    },

    /**
     * Direct fetch (may hit CORS)
     * @param {string} url - Request URL
     * @param {Object} options - Fetch options
     * @returns {Promise<*>} Response data
     */
    async directFetch(url, options = {}) {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Try to parse as JSON, fallback to text
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    },

    /**
     * Fetch via background service worker
     * @param {string} url - Request URL
     * @param {Object} options - Fetch options
     * @returns {Promise<*>} Response data
     */
    async backgroundFetch(url, options = {}) {
      return new Promise((resolve, reject) => {
        // Determine message type based on URL
        const messageType = url.includes('supabase.co') ? 'supabaseFetch' : 'seatsAeroFetch';
        
        const message = {
          type: messageType,
          url,
          headers: options.headers || {}
        };

        if (messageType === 'supabaseFetch') {
          message.payload = {
            url,
            init: options
          };
        }

        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (!response || !response.ok) {
            reject(new Error(response?.error || 'Background fetch failed'));
            return;
          }

          // Handle different response formats
          if (response.body !== undefined) {
            resolve(response.body);
          } else if (response.data !== undefined) {
            resolve(response.data);
          } else {
            resolve(response);
          }
        });
      });
    },

    /**
     * GET request
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise<*>} Response data
     */
    async get(url, options = {}) {
      return this.request(url, { ...options, method: 'GET' });
    },

    /**
     * POST request
     * @param {string} url - Request URL
     * @param {*} body - Request body
     * @param {Object} options - Request options
     * @returns {Promise<*>} Response data
     */
    async post(url, body, options = {}) {
      return this.request(url, {
        ...options,
        method: 'POST',
        body: typeof body === 'string' ? body : JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
    }
  };
})();

