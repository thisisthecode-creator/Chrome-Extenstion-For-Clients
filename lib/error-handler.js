// Centralized Error Handling
// Provides consistent error handling across all modules

(function() {
  'use strict';

  window.errorHandler = {
    /**
     * Handle an error with logging and optional reporting
     * @param {Error} error - Error object
     * @param {Object} context - Additional context information
     */
    handle(error, context = {}) {
      const logger = window.createLogger?.('ErrorHandler') || console;
      
      const errorInfo = {
        message: error?.message || String(error),
        stack: error?.stack,
        context: {
          url: window.location?.href,
          userAgent: navigator?.userAgent,
          timestamp: new Date().toISOString(),
          ...context
        }
      };

      logger.error('Error occurred:', errorInfo);

      // Optional: Send to error tracking service
      if (window.config?.features?.enableErrorReporting) {
        this.reportToService(errorInfo);
      }
    },

    /**
     * Report error to external service (placeholder)
     * @param {Object} errorInfo - Error information
     */
    reportToService(errorInfo) {
      // TODO: Implement error reporting service integration
      // Example: Sentry, LogRocket, etc.
      console.log('[ErrorHandler] Would report to service:', errorInfo);
    },

    /**
     * Safely execute an async function with error handling
     * @param {Function} fn - Async function to execute
     * @param {*} fallback - Fallback value if function fails
     * @param {Object} context - Context for error logging
     * @returns {Promise<*>} Result or fallback value
     */
    async safeAsync(fn, fallback = null, context = {}) {
      try {
        return await fn();
      } catch (error) {
        this.handle(error, context);
        return fallback;
      }
    },

    /**
     * Safely execute a sync function with error handling
     * @param {Function} fn - Function to execute
     * @param {*} fallback - Fallback value if function fails
     * @param {Object} context - Context for error logging
     * @returns {*} Result or fallback value
     */
    safeSync(fn, fallback = null, context = {}) {
      try {
        return fn();
      } catch (error) {
        this.handle(error, context);
        return fallback;
      }
    },

    /**
     * Wrap a function with error handling
     * @param {Function} fn - Function to wrap
     * @param {Object} context - Context for error logging
     * @returns {Function} Wrapped function
     */
    wrap(fn, context = {}) {
      return (...args) => {
        try {
          const result = fn(...args);
          if (result instanceof Promise) {
            return result.catch(error => {
              this.handle(error, { ...context, args });
              throw error;
            });
          }
          return result;
        } catch (error) {
          this.handle(error, { ...context, args });
          throw error;
        }
      };
    }
  };
})();

