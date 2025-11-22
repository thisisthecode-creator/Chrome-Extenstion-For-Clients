// Centralized Cache Service
// Provides consistent caching across all modules

(function() {
  'use strict';

  window.cacheService = {
    cache: new Map(),
    defaultTTL: window.config?.cache?.defaultTTL || 5 * 60 * 1000,

    /**
     * Set a value in cache
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    set(key, value, ttl = this.defaultTTL) {
      const expires = Date.now() + ttl;
      this.cache.set(key, { value, expires });
      
      const logger = window.createLogger?.('CacheService');
      logger?.debug(`Cache set: ${key} (expires in ${ttl}ms)`);
    },

    /**
     * Get a value from cache
     * @param {string} key - Cache key
     * @returns {*|null} Cached value or null if expired/missing
     */
    get(key) {
      const entry = this.cache.get(key);
      if (!entry) {
        return null;
      }
      
      if (Date.now() > entry.expires) {
        this.cache.delete(key);
        const logger = window.createLogger?.('CacheService');
        logger?.debug(`Cache expired: ${key}`);
        return null;
      }
      
      const logger = window.createLogger?.('CacheService');
      logger?.debug(`Cache hit: ${key}`);
      return entry.value;
    },

    /**
     * Check if a key exists and is valid
     * @param {string} key - Cache key
     * @returns {boolean} True if key exists and is valid
     */
    has(key) {
      return this.get(key) !== null;
    },

    /**
     * Delete a key from cache
     * @param {string} key - Cache key
     */
    delete(key) {
      this.cache.delete(key);
      const logger = window.createLogger?.('CacheService');
      logger?.debug(`Cache deleted: ${key}`);
    },

    /**
     * Clear all cache
     */
    clear() {
      this.cache.clear();
      const logger = window.createLogger?.('CacheService');
      logger?.info('Cache cleared');
    },

    /**
     * Clear expired entries from cache
     */
    clearExpired() {
      const now = Date.now();
      let cleared = 0;
      
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expires) {
          this.cache.delete(key);
          cleared++;
        }
      }
      
      if (cleared > 0) {
        const logger = window.createLogger?.('CacheService');
        logger?.debug(`Cleared ${cleared} expired cache entries`);
      }
    },

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
      const now = Date.now();
      let valid = 0;
      let expired = 0;
      
      for (const entry of this.cache.values()) {
        if (now > entry.expires) {
          expired++;
        } else {
          valid++;
        }
      }
      
      return {
        total: this.cache.size,
        valid,
        expired
      };
    }
  };

  // Auto-cleanup expired entries every 5 minutes
  if (window.config?.features?.enableCache) {
    setInterval(() => {
      window.cacheService.clearExpired();
    }, 5 * 60 * 1000);
  }
})();

