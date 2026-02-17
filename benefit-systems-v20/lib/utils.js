// Centralized Utility Functions
// Common helper functions used across the extension

(function() {
  'use strict';

  window.utils = {
    /**
     * Debounce function - delays execution until after wait time
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * Throttle function - limits execution frequency
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    /**
     * Wait for an element to appear in the DOM
     * @param {string} selector - CSS selector
     * @param {number} timeout - Timeout in milliseconds
     * @param {Element} parent - Parent element to search in
     * @returns {Promise<Element>} Found element
     */
    waitForElement(selector, timeout = 5000, parent = document) {
      return new Promise((resolve, reject) => {
        const element = parent.querySelector(selector);
        if (element) return resolve(element);

        const observer = new MutationObserver(() => {
          const element = parent.querySelector(selector);
          if (element) {
            observer.disconnect();
            resolve(element);
          }
        });

        observer.observe(parent, {
          childList: true,
          subtree: true
        });

        setTimeout(() => {
          observer.disconnect();
          reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
      });
    },

    /**
     * Safe querySelector with error handling
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element
     * @returns {Element|null} Found element or null
     */
    safeQuerySelector(selector, parent = document) {
      try {
        return parent.querySelector(selector);
      } catch (error) {
        if (window.errorHandler) {
          window.errorHandler.handle(error, { selector, parent });
        }
        return null;
      }
    },

    /**
     * Safe querySelectorAll with error handling
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element
     * @returns {NodeList|Array} Found elements or empty array
     */
    safeQuerySelectorAll(selector, parent = document) {
      try {
        return parent.querySelectorAll(selector);
      } catch (error) {
        if (window.errorHandler) {
          window.errorHandler.handle(error, { selector, parent });
        }
        return [];
      }
    },

    /**
     * Deep clone an object
     * @param {*} obj - Object to clone
     * @returns {*} Cloned object
     */
    deepClone(obj) {
      return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Format number with specified decimals
     * @param {number} num - Number to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted number string
     */
    formatNumber(num, decimals = 2) {
      return Number(num).toFixed(decimals);
    },

    /**
     * Check if value is empty (null, undefined, empty string, empty array)
     * @param {*} value - Value to check
     * @returns {boolean} True if empty
     */
    isEmpty(value) {
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') return value.trim() === '';
      if (Array.isArray(value)) return value.length === 0;
      if (typeof value === 'object') return Object.keys(value).length === 0;
      return false;
    },

    /**
     * Sleep/delay function
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise} Promise that resolves after delay
     */
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Retry a function with exponential backoff
     * @param {Function} fn - Function to retry
     * @param {number} retries - Number of retries
     * @param {number} delay - Initial delay in ms
     * @returns {Promise} Result of function
     */
    async retry(fn, retries = 3, delay = 200) {
      try {
        return await fn();
      } catch (error) {
        if (retries <= 0) throw error;
        await this.sleep(delay);
        return this.retry(fn, retries - 1, delay * 2);
      }
    },

    /**
     * Sanitize string for safe HTML insertion
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeString(str) {
      const div = document.createElement('div');
      div.textContent = String(str);
      return div.innerHTML;
    },

    /**
     * Get URL parameters
     * @param {string} name - Parameter name
     * @param {string} url - URL to parse (defaults to current URL)
     * @returns {string|null} Parameter value
     */
    getUrlParam(name, url = window.location.href) {
      const params = new URLSearchParams(new URL(url).search);
      return params.get(name);
    },

    /**
     * Check if we're on a Google Flights page
     * @returns {boolean} True if on Google Flights
     */
    isGoogleFlightsPage() {
      return window.location.hostname.includes('google.com') &&
             window.location.pathname.includes('/travel/flights');
    }
  };
})();

