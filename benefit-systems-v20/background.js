// Background service worker to proxy cross-origin fetches to Seats.aero
// This avoids CORS blocks from the page origin (google.com)

'use strict';

// Log service worker initialization
console.log('[BS Extension] Background service worker initializing...');

self.addEventListener('install', (event) => {
  console.log('[BS Extension] Service worker installing...');
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[BS Extension] Service worker activating...');
  event.waitUntil(
    self.clients.claim().catch(err => {
      console.error('[BS Extension] Error claiming clients:', err);
    })
  );
});

// Handle extension startup errors
self.addEventListener('error', (event) => {
  console.error('[BS Extension] Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[BS Extension] Unhandled promise rejection:', event.reason);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (!message || !message.type) {
      console.warn('[BS Extension] Invalid message received:', message);
      return false;
    }

    // Validate sender origin for security
    if (sender && sender.origin && !sender.origin.includes('google.com')) {
      console.warn('[BS Extension] Message from unauthorized origin:', sender.origin);
      return false;
    }

    if (message.type === 'saveSeatsAeroSettings') {
      const { baseUrl, key } = message;
      const url = (baseUrl && typeof baseUrl === 'string') ? baseUrl.trim().replace(/\/+$/, '') : '';
      const apiKey = (key !== undefined && key !== null && typeof key === 'string') ? key.trim() : '';
      chrome.storage.local.set({ seatsAeroBaseUrl: url, seatsAeroKey: apiKey }, () => {
        sendResponse({ ok: true });
      });
      return true; // Keep channel open for async response
    }

    if (message.type === 'seatsAeroFetch') {
      const { url, headers } = message;
      
      // Validate URL
      if (!url || typeof url !== 'string') {
        sendResponse({ ok: false, status: 0, error: 'Invalid URL' });
        return false;
      }

      (async () => {
        // Allow seats.aero and user-configured Seats.aero API base URL (from Settings)
        const allowedDomains = ['seats.aero', 'raw.githubusercontent.com', 'saegzrncsjcsvgcjkniv.supabase.co', 'api-shop.miles-and-more.com'];
        let customBase = '';
        try {
          const stored = await chrome.storage.local.get('seatsAeroBaseUrl');
          customBase = (stored && stored.seatsAeroBaseUrl && typeof stored.seatsAeroBaseUrl === 'string') ? stored.seatsAeroBaseUrl.trim() : '';
        } catch (_) {}
        if (customBase) {
          try {
            const customHost = new URL(customBase).hostname;
            if (customHost && !allowedDomains.includes(customHost)) allowedDomains.push(customHost);
          } catch (_) {}
        }
        const urlObj = new URL(url);
        if (!allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
          console.warn('[BS Extension] Blocked request to unauthorized domain:', urlObj.hostname);
          sendResponse({ ok: false, status: 0, error: 'Unauthorized domain' });
          return;
        }
        try {
          const res = await fetch(url, { headers: headers || {} });
          const status = res.status;
          const ok = res.ok;
          const text = await res.text();
          let body;
          try {
            body = JSON.parse(text);
          } catch (_) {
            body = text;
          }
          sendResponse({ ok, status, body });
        } catch (err) {
          console.error('[BS Extension] Fetch error:', err);
          sendResponse({ ok: false, status: 0, error: String(err) });
        }
      })();
      return true; // Keep channel open for async response
    }

    if (message.type === 'lufthansaFetch') {
      const { url, method = 'GET', headers = {}, body } = message;
      
      if (!url || typeof url !== 'string') {
        sendResponse({ ok: false, status: 0, error: 'Invalid URL' });
        return false;
      }

      // Validate Lufthansa API URL
      const urlObj = new URL(url);
      if (!urlObj.hostname.includes('api-shop.miles-and-more.com')) {
        console.warn('[BS Extension] Blocked Lufthansa request to unauthorized domain:', urlObj.hostname);
        sendResponse({ ok: false, status: 0, error: 'Unauthorized domain' });
        return false;
      }

      (async () => {
        try {
          const fetchOptions = {
            method,
            headers: {
              'Accept': 'application/json',
              ...headers
            }
          };

          if (body) {
            if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
              fetchOptions.body = body;
            } else {
              fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
            }
          }

          const res = await fetch(url, fetchOptions);
          const ok = res.ok;
          const status = res.status;
          const text = await res.text();
          let responseBody;
          try {
            responseBody = JSON.parse(text);
          } catch (_) {
            responseBody = text;
          }
          sendResponse({ ok, status, body: responseBody });
        } catch (err) {
          console.error('[BS Extension] Lufthansa fetch error:', err);
          sendResponse({ ok: false, status: 0, error: String(err) });
        }
      })();
      return true; // Keep channel open for async response
    }

    if (message.type === 'supabaseFetch') {
      const { url, init } = message.payload || {};
      
      if (!url || typeof url !== 'string') {
        sendResponse({ ok: false, status: 0, error: 'Invalid URL' });
        return false;
      }

      // Validate Supabase URL
      const urlObj = new URL(url);
      if (!urlObj.hostname.includes('supabase.co')) {
        console.warn('[BS Extension] Blocked Supabase request to unauthorized domain:', urlObj.hostname);
        sendResponse({ ok: false, status: 0, error: 'Unauthorized domain' });
        return false;
      }

      (async () => {
        try {
          const res = await fetch(url, init);
          const ok = res.ok;
          const status = res.status;
          const data = await res.json().catch(() => ({}));
          sendResponse({ ok, status, data });
        } catch (err) {
          console.error('[BS Extension] Supabase fetch error:', err);
          sendResponse({ ok: false, status: 0, error: String(err) });
        }
      })();
      return true; // Keep channel open for async response
    }

    // Unknown message type
    console.warn('[BS Extension] Unknown message type:', message.type);
    return false;
  } catch (error) {
    console.error('[BS Extension] Error handling message:', error);
    sendResponse({ ok: false, status: 0, error: String(error) });
    return false;
  }
});

console.log('[BS Extension] Background service worker ready');


