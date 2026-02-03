// Centralized Configuration Management
// All API keys, URLs, and settings in one place

(function() {
  'use strict';

  window.config = {
    api: {
      seatsAero: {
        baseUrl: 'https://seats.aero/partnerapi',
        key: ''
      },
      supabase: {
        url: 'https://saegzrncsjcsvgcjkniv.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZWd6cm5jc2pjc3ZnY2prbml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3ODgxNDYsImV4cCI6MjA0NzM2NDE0Nn0.w1eHVcuvDUoqhcMCYenKKA9URAtG4YbW3j5GcDgvu3Y'
      },
      exchangeRate: {
        url: 'https://api.exchangerate-api.com'
      },
      github: {
        url: 'https://raw.githubusercontent.com'
      }
    },
    
    cache: {
      defaultTTL: 5 * 60 * 1000,      // 5 minutes
      seatsAeroTTL: 10 * 60 * 1000,   // 10 minutes
      supabaseTTL: 15 * 60 * 1000      // 15 minutes
    },

    ui: {
      debounceDelay: 500,              // ms
      retryDelay: 200,                 // ms
      maxRetries: 3,
      mutationObserverDelay: 500       // ms
    },

    features: {
      enableLogging: true,
      enableCache: true,
      enableErrorReporting: false,
      enableAnalytics: false
    },

    // Allowed domains for background fetch
    allowedDomains: [
      'seats.aero',
      'raw.githubusercontent.com',
      'saegzrncsjcsvgcjkniv.supabase.co',
      'api.exchangerate-api.com'
    ]
  };
})();

