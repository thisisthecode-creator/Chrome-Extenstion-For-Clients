// Centralized Logging System
// Provides consistent logging across all modules

(function() {
  'use strict';

  const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
  const PREFIX = '[BS Extension]';
  
  // Detect if we're in development mode
  const isDev = (() => {
    try {
      const manifest = chrome?.runtime?.getManifest?.();
      return manifest?.version?.includes('dev') || 
             window.location?.hostname === 'localhost' ||
             window.location?.hostname === '127.0.0.1';
    } catch {
      return false;
    }
  })();

  class Logger {
    constructor(module = '') {
      this.module = module;
      this.level = isDev ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;
    }

    _formatMessage(level, ...args) {
      const moduleTag = this.module ? `[${this.module}]` : '';
      return [`${PREFIX} ${moduleTag}`, ...args];
    }

    debug(...args) {
      if (this.level <= LOG_LEVELS.DEBUG) {
        console.log(...this._formatMessage('DEBUG', ...args));
      }
    }

    info(...args) {
      if (this.level <= LOG_LEVELS.INFO) {
        console.log(...this._formatMessage('INFO', ...args));
      }
    }

    warn(...args) {
      if (this.level <= LOG_LEVELS.WARN) {
        console.warn(...this._formatMessage('WARN', ...args));
      }
    }

    error(...args) {
      if (this.level <= LOG_LEVELS.ERROR) {
        console.error(...this._formatMessage('ERROR', ...args));
      }
    }

    // Group related logs together
    group(label) {
      console.group(`${PREFIX} [${this.module}] ${label}`);
    }

    groupEnd() {
      console.groupEnd();
    }
  }

  // Factory function to create logger instances
  window.createLogger = function(module) {
    return new Logger(module);
  };

  // Default logger for general use
  window.logger = new Logger();
})();

