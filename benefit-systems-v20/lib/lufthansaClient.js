// Lufthansa Miles & More API Client
// API Base: https://api-shop.miles-and-more.com/v1

(function() {
  'use strict';

  const API_BASE = 'https://api-shop.miles-and-more.com/v1';
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  const cache = new Map();
  let oauthToken = null;
  let tokenExpiry = 0;

  function cacheKey(url, body) {
    return body ? `${url}:${JSON.stringify(body)}` : url;
  }

  function setCache(key, value) {
    cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
  }

  function getCache(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      cache.delete(key);
      return null;
    }
    return entry.value;
  }

  /**
   * Get OAuth token for API authentication
   * Note: This may require client credentials or user authentication
   */
  async function getOAuthToken() {
    // Check if we have a valid cached token
    if (oauthToken && Date.now() < tokenExpiry) {
      return oauthToken;
    }

    try {
      const tokenUrl = `${API_BASE}/oauth2/token`;
      
      // Try to get token via background fetch
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        const resp = await new Promise((resolve) => {
          try {
            chrome.runtime.sendMessage({
              type: 'lufthansaFetch',
              url: tokenUrl,
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
              },
              body: 'grant_type=client_credentials' // May need actual client_id/secret
            }, resolve);
          } catch (e) {
            resolve({ ok: false, status: 0, error: String(e) });
          }
        });

        if (resp && resp.ok && resp.body && resp.body.access_token) {
          oauthToken = resp.body.access_token;
          // Set expiry (usually 3600 seconds)
          tokenExpiry = Date.now() + ((resp.body.expires_in || 3600) * 1000) - 60000; // 1 min buffer
          return oauthToken;
        }
      }
    } catch (error) {
      console.error('Lufthansa OAuth token error:', error);
    }

    return null;
  }

  /**
   * Make HTTP request to Lufthansa API
   */
  async function httpRequest(url, options = {}) {
    const { method = 'GET', body, headers = {} } = options;
    const key = cacheKey(url, body);
    const cached = getCache(key);
    if (cached && method === 'GET') return cached;

    console.log('Lufthansa API call:', method, url);

    // Get OAuth token if needed
    const token = await getOAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    headers['Accept'] = 'application/json';
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';

    // Use background fetch to avoid CORS
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      const resp = await new Promise((resolve) => {
        try {
          chrome.runtime.sendMessage({
            type: 'lufthansaFetch',
            url,
            method,
            headers,
            body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
          }, resolve);
        } catch (e) {
          resolve({ ok: false, status: 0, error: String(e) });
        }
      });

      if (!resp || !resp.ok) {
        console.error('Lufthansa API error:', resp);
        throw new Error(`Lufthansa API HTTP ${resp?.status || 0}: ${resp?.error || 'Unknown error'}`);
      }

      console.log('Lufthansa API response status:', resp.status);
      const data = resp.body || resp.data;
      console.log('Lufthansa API response data:', data);
      
      if (method === 'GET') {
        setCache(key, data);
      }
      return data;
    }

    // Fallback to direct fetch (may hit CORS)
    const fetchOptions = {
      method,
      headers
    };

    if (body) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const res = await fetch(url, fetchOptions);
    console.log('Lufthansa API response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Lufthansa API error:', res.status, errorText);
      throw new Error(`Lufthansa API HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log('Lufthansa API response data:', data);
    
    if (method === 'GET') {
      setCache(key, data);
    }
    return data;
  }

  /**
   * Parse URL parameters from Miles & More URL format
   * @param {string} url - Miles & More URL with parameters
   * @returns {Object} Parsed parameters in API format
   */
  function parseMilesAndMoreUrl(url) {
    try {
      const urlObj = new URL(url);
      const params = {};
      
      // Extract parameters from URL
      const origincode = urlObj.searchParams.get('origincode');
      const destinationcode = urlObj.searchParams.get('destinationcode');
      const outbounddate = urlObj.searchParams.get('outbounddate');
      const returndate = urlObj.searchParams.get('returndate');
      const bookingclass = urlObj.searchParams.get('bookingclass');
      const triptype = urlObj.searchParams.get('triptype');
      const adults = urlObj.searchParams.get('adults');
      const children = urlObj.searchParams.get('children');
      const infants = urlObj.searchParams.get('infants');
      
      // Convert date from MM/dd/yyyy to YYYY-MM-DD
      function convertDate(dateStr) {
        if (!dateStr) return null;
        try {
          // Parse MM/dd/yyyy format
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const month = parts[0].padStart(2, '0');
            const day = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${year}-${month}-${day}`;
          }
        } catch (e) {
          console.error('Date conversion error:', e);
        }
        return null;
      }
      
      // Map booking class: Y=Economy, B=Business, F=First
      function mapBookingClass(bookingClass) {
        if (!bookingClass) return 'J'; // Default to Business
        const upper = bookingClass.toUpperCase();
        if (upper === 'Y') return 'Y'; // Economy
        if (upper === 'B') return 'J'; // Business
        if (upper === 'F') return 'F'; // First
        if (upper === 'W') return 'W'; // Premium Economy
        return 'J'; // Default
      }
      
      if (origincode) params.origin = origincode.toUpperCase();
      if (destinationcode) params.destination = destinationcode.toUpperCase();
      if (outbounddate) {
        const converted = convertDate(outbounddate);
        if (converted) params.departureDate = converted;
      }
      if (returndate) {
        const converted = convertDate(returndate);
        if (converted) params.returnDate = converted;
      }
      if (bookingclass) params.cabinClass = mapBookingClass(bookingclass);
      if (adults) params.adults = parseInt(adults, 10) || 1;
      if (children) params.children = parseInt(children, 10) || 0;
      if (infants) params.infants = parseInt(infants, 10) || 0;
      
      return params;
    } catch (error) {
      console.error('Error parsing Miles & More URL:', error);
      return {};
    }
  }

  /**
   * Search for award flight availability
   * @param {Object|string} paramsOrUrl - Search parameters object OR Miles & More URL string
   * @param {string} params.origin - Origin airport code (e.g., 'WAW')
   * @param {string} params.destination - Destination airport code (e.g., 'VIE')
   * @param {string} params.departureDate - Departure date (YYYY-MM-DD)
   * @param {string} params.returnDate - Return date (YYYY-MM-DD, optional)
   * @param {string} params.cabinClass - Cabin class (Y, J, F, W)
   * @param {number} params.adults - Number of adults (default: 1)
   * @param {number} params.children - Number of children (default: 0)
   * @param {number} params.infants - Number of infants (default: 0)
   */
  async function searchAwardFlights(paramsOrUrl) {
    // If it's a URL string, parse it first
    let params;
    if (typeof paramsOrUrl === 'string') {
      params = parseMilesAndMoreUrl(paramsOrUrl);
    } else {
      params = paramsOrUrl;
    }
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      cabinClass = 'J',
      adults = 1,
      children = 0,
      infants = 0
    } = params;

    if (!origin || !destination || !departureDate) {
      throw new Error('Missing required parameters: origin, destination, departureDate');
    }

    // Build search request body
    const searchBody = {
      origin,
      destination,
      departureDate,
      cabinClass,
      adults,
      children,
      infants
    };

    if (returnDate) {
      searchBody.returnDate = returnDate;
      searchBody.tripType = 'RT';
    } else {
      searchBody.tripType = 'OW';
    }

    try {
      // Search for air bounds
      const boundsUrl = `${API_BASE}/one-booking/search/air-bounds`;
      const boundsData = await httpRequest(boundsUrl, {
        method: 'POST',
        body: searchBody
      });

      return boundsData;
    } catch (error) {
      console.error('Lufthansa search error:', error);
      throw error;
    }
  }

  /**
   * Get calendar availability
   * @param {Object} params - Search parameters
   */
  async function getCalendarAvailability(params) {
    const {
      origin,
      destination,
      cabinClass = 'J',
      showDirectFlightsAvailable = false
    } = params;

    if (!origin || !destination) {
      throw new Error('Missing required parameters: origin, destination');
    }

    const queryParams = new URLSearchParams({
      origin,
      destination,
      cabinClass,
      showDirectFlightsAvailable: showDirectFlightsAvailable.toString()
    });

    const calendarUrl = `${API_BASE}/one-booking/search/air-calendars?${queryParams.toString()}`;
    
    try {
      const calendarData = await httpRequest(calendarUrl, {
        method: 'GET'
      });

      return calendarData;
    } catch (error) {
      console.error('Lufthansa calendar error:', error);
      throw error;
    }
  }

  // Export API
  window.lufthansaClient = {
    searchAwardFlights,
    getCalendarAvailability,
    getOAuthToken,
    httpRequest,
    parseMilesAndMoreUrl
  };

  console.log('Lufthansa API client initialized');
})();

