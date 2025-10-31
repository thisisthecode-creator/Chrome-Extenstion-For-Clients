// Seats.aero API Client with OAuth2 and basic caching
// Docs: https://developers.seats.aero/reference/getting-started-p
// Cached Search: https://developers.seats.aero/reference/cached-search

(function() {
  const API_BASE = 'https://seats.aero/partnerapi';
  const API_KEY = 'pro_34k47VFYI2uc9NnCK6smZLz8U66';
  const DEFAULT_TAKE = 20;
  const CACHE_TTL_MS = 5 * 60 * 1000;

  const sourceToProgram = {
    eurobonus: 'SAS EuroBonus',
    virginatlantic: 'Virgin Atlantic Flying Club',
    aeromexico: 'Aeromexico Club Premier',
    american: 'American Airlines AAdvantage',
    delta: 'Delta SkyMiles',
    etihad: 'Etihad Guest',
    united: 'United MileagePlus',
    emirates: 'Emirates Skywards',
    aeroplan: 'Air Canada Aeroplan',
    alaska: 'Alaska Mileage Plan',
    velocity: 'Virgin Australia Velocity',
    qantas: 'Qantas Frequent Flyer',
    connectmiles: 'Copa ConnectMiles',
    azul: 'Azul TudoAzul',
    smiles: 'GOL Smiles',
    flyingblue: 'Flying Blue (AF/KL)',
    jetblue: 'JetBlue TrueBlue',
    qatar: 'Qatar Privilege Club',
    turkish: 'Turkish Miles&Smiles',
    singapore: 'Singapore KrisFlyer',
    ethiopian: 'Ethiopian ShebaMiles',
    saudia: 'Saudia AlFursan',
    finnair: 'Finnair Plus',
    lufthansa: 'Lufthansa Miles & More'
  };

  const cache = new Map();

  function cacheKey(url) {
    return url;
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

  async function httpGet(pathWithQuery) {
    const url = `${API_BASE}${pathWithQuery}`;
    const key = cacheKey(url);
    const cached = getCache(key);
    if (cached) return cached;

    console.log('Seats.aero API call:', url);

    // Prefer background fetch via service worker to avoid CORS
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      const resp = await new Promise((resolve) => {
        try {
          chrome.runtime.sendMessage({
            type: 'seatsAeroFetch',
            url,
            headers: {
              'Partner-Authorization': API_KEY,
              'accept': 'application/json'
            }
          }, resolve)
        } catch (e) {
          resolve({ ok: false, status: 0, error: String(e) })
        }
      })

      if (!resp || !resp.ok) {
        console.error('Seats.aero BG fetch error:', resp)
        throw new Error(`Seats.aero HTTP ${resp?.status || 0}: ${resp?.error || 'Unknown error'}`)
      }

      console.log('Seats.aero API response status:', resp.status)
      const data = resp.body
      console.log('Seats.aero API response data:', data)
      setCache(key, data)
      return data
    }

    // Fallback to window fetch (may hit CORS in page context)
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Partner-Authorization': API_KEY,
        'accept': 'application/json'
      }
    });

    console.log('Seats.aero API response status:', res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Seats.aero API error:', res.status, errorText);
      throw new Error(`Seats.aero HTTP ${res.status}: ${errorText}`);
    }
    const data = await res.json();
    console.log('Seats.aero API response data:', data);
    setCache(key, data);
    return data;
  }

  function appendParams(base, params) {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      usp.set(k, String(v));
    });
    return `${base}?${usp.toString()}`;
  }

  // Search cached availability
  async function cachedSearch({ origin, destination, startDate, endDate, take = DEFAULT_TAKE, onlyDirect = false, includeFiltered = false, orderBy = 'lowest_mileage' }) {
    const path = appendParams('/search', {
      origin_airport: origin,
      destination_airport: destination,
      start_date: startDate,
      end_date: endDate || startDate,
      take,
      order_by: orderBy,
      include_trips: false,
      only_direct_flights: !!onlyDirect,
      include_filtered: !!includeFiltered
    });
    return await httpGet(path);
  }

  // Get trips for availability to read FareClass
  async function getTripsForAvailability(availabilityId) {
    // Some docs name differs, but Get Trips endpoint is /availability/{id}/trips
    const path = `/availability/${encodeURIComponent(availabilityId)}/trips`;
    return await httpGet(path);
  }

  function mapSourceToProgram(src) {
    if (!src) return '';
    return sourceToProgram[src] || src;
  }

  // Expose globally
  window.seatsAeroClient = {
    cachedSearch,
    getTripsForAvailability,
    mapSourceToProgram
  };
})();


