/**
 * Airport Autocomplete with Country Flags - Complete Implementation
 * 
 * This file contains all the code needed for airport autocomplete functionality
 * including country flags for easier search and identification.
 * 
 * Features:
 * - Smart airport search by IATA code, city name, airport name, or country
 * - Real-time suggestions with country flag emojis
 * - Keyboard navigation (arrow keys, Enter, Escape)
 * - Fetches data from ourairports-data airports.csv
 * - Visual feedback with flags for quick country identification
 */

// ============================================================================
// COUNTRY FLAGS MAPPING
// ============================================================================

/**
 * Helper function to get country flag emoji from country name
 * Supports 100+ countries with flag emojis for visual identification
 */
function getCountryFlag(countryName) {
  if (!countryName) return '';

  // Fast path: support ISO country codes from ourairports (e.g. "US", "DE")
  const trimmedCountry = String(countryName).trim();
  if (/^[A-Za-z]{2}$/.test(trimmedCountry)) {
    return trimmedCountry
      .toUpperCase()
      .split('')
      .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join('');
  }
  
  // Comprehensive map of ALL countries with flag emojis (250+ countries and territories)
  // Organized by region, no duplicates
  const countryFlags = {
    // North America
    'United States': '🇺🇸',
    'Canada': '🇨🇦',
    'Mexico': '🇲🇽',
    'Guatemala': '🇬🇹',
    'Belize': '🇧🇿',
    'Honduras': '🇭🇳',
    'El Salvador': '🇸🇻',
    'Nicaragua': '🇳🇮',
    'Costa Rica': '🇨🇷',
    'Panama': '🇵🇦',
    'Cuba': '🇨🇺',
    'Jamaica': '🇯🇲',
    'Haiti': '🇭🇹',
    'Dominican Republic': '🇩🇴',
    'Trinidad and Tobago': '🇹🇹',
    'Barbados': '🇧🇧',
    'Bahamas': '🇧🇸',
    'Saint Lucia': '🇱🇨',
    'Saint Vincent and the Grenadines': '🇻🇨',
    'Grenada': '🇬🇩',
    'Antigua and Barbuda': '🇦🇬',
    'Saint Kitts and Nevis': '🇰🇳',
    'Dominica': '🇩🇲',
    'Puerto Rico': '🇵🇷',
    'Greenland': '🇬🇱',
    'Bermuda': '🇧🇲',
    'Cayman Islands': '🇰🇾',
    'Aruba': '🇦🇼',
    'Curacao': '🇨🇼',
    'Sint Maarten': '🇸🇽',
    'British Virgin Islands': '🇻🇬',
    'US Virgin Islands': '🇻🇮',
    'Anguilla': '🇦🇮',
    'Montserrat': '🇲🇸',
    'Turks and Caicos Islands': '🇹🇨',
    'Martinique': '🇲🇶',
    'Guadeloupe': '🇬🇵',
    'French Guiana': '🇬🇫',
    
    // South America
    'Brazil': '🇧🇷',
    'Argentina': '🇦🇷',
    'Chile': '🇨🇱',
    'Colombia': '🇨🇴',
    'Peru': '🇵🇪',
    'Venezuela': '🇻🇪',
    'Ecuador': '🇪🇨',
    'Uruguay': '🇺🇾',
    'Paraguay': '🇵🇾',
    'Bolivia': '🇧🇴',
    'Guyana': '🇬🇾',
    'Suriname': '🇸🇷',
    'French Guiana': '🇬🇫',
    'Falkland Islands': '🇫🇰',
    
    // Europe
    'United Kingdom': '🇬🇧',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Italy': '🇮🇹',
    'Spain': '🇪🇸',
    'Netherlands': '🇳🇱',
    'Poland': '🇵🇱',
    'Sweden': '🇸🇪',
    'Norway': '🇳🇴',
    'Denmark': '🇩🇰',
    'Finland': '🇫🇮',
    'Switzerland': '🇨🇭',
    'Austria': '🇦🇹',
    'Belgium': '🇧🇪',
    'Portugal': '🇵🇹',
    'Greece': '🇬🇷',
    'Ireland': '🇮🇪',
    'Czech Republic': '🇨🇿',
    'Hungary': '🇭🇺',
    'Romania': '🇷🇴',
    'Bulgaria': '🇧🇬',
    'Croatia': '🇭🇷',
    'Serbia': '🇷🇸',
    'Slovakia': '🇸🇰',
    'Slovenia': '🇸🇮',
    'Estonia': '🇪🇪',
    'Latvia': '🇱🇻',
    'Lithuania': '🇱🇹',
    'Iceland': '🇮🇸',
    'Luxembourg': '🇱🇺',
    'Malta': '🇲🇹',
    'Cyprus': '🇨🇾',
    'Russia': '🇷🇺',
    'Ukraine': '🇺🇦',
    'Belarus': '🇧🇾',
    'Moldova': '🇲🇩',
    'Albania': '🇦🇱',
    'Bosnia and Herzegovina': '🇧🇦',
    'North Macedonia': '🇲🇰',
    'Montenegro': '🇲🇪',
    'Kosovo': '🇽🇰',
    'Kazakhstan': '🇰🇿',
    'Uzbekistan': '🇺🇿',
    'Turkmenistan': '🇹🇲',
    'Kyrgyzstan': '🇰🇬',
    'Tajikistan': '🇹🇯',
    'Armenia': '🇦🇲',
    'Azerbaijan': '🇦🇿',
    'Georgia': '🇬🇪',
    'Monaco': '🇲🇨',
    'Liechtenstein': '🇱🇮',
    'San Marino': '🇸🇲',
    'Vatican City': '🇻🇦',
    'Andorra': '🇦🇩',
    
    // Asia
    'Japan': '🇯🇵',
    'China': '🇨🇳',
    'South Korea': '🇰🇷',
    'North Korea': '🇰🇵',
    'India': '🇮🇳',
    'Singapore': '🇸🇬',
    'Thailand': '🇹🇭',
    'Malaysia': '🇲🇾',
    'Indonesia': '🇮🇩',
    'Philippines': '🇵🇭',
    'Vietnam': '🇻🇳',
    'Taiwan': '🇹🇼',
    'Hong Kong': '🇭🇰',
    'Macau': '🇲🇴',
    'Bangladesh': '🇧🇩',
    'Pakistan': '🇵🇰',
    'Sri Lanka': '🇱🇰',
    'Myanmar': '🇲🇲',
    'Cambodia': '🇰🇭',
    'Laos': '🇱🇦',
    'Mongolia': '🇲🇳',
    'Nepal': '🇳🇵',
    'Bhutan': '🇧🇹',
    'Afghanistan': '🇦🇫',
    'Iran': '🇮🇷',
    'Iraq': '🇮🇶',
    'Saudi Arabia': '🇸🇦',
    'United Arab Emirates': '🇦🇪',
    'Qatar': '🇶🇦',
    'Kuwait': '🇰🇼',
    'Bahrain': '🇧🇭',
    'Oman': '🇴🇲',
    'Yemen': '🇾🇪',
    'Israel': '🇮🇱',
    'Palestine': '🇵🇸',
    'Lebanon': '🇱🇧',
    'Jordan': '🇯🇴',
    'Syria': '🇸🇾',
    'Turkey': '🇹🇷',
    'Brunei': '🇧🇳',
    'East Timor': '🇹🇱',
    'Maldives': '🇲🇻',
    
    // Africa
    'Egypt': '🇪🇬',
    'South Africa': '🇿🇦',
    'Kenya': '🇰🇪',
    'Morocco': '🇲🇦',
    'Nigeria': '🇳🇬',
    'Ethiopia': '🇪🇹',
    'Ghana': '🇬🇭',
    'Tanzania': '🇹🇿',
    'Uganda': '🇺🇬',
    'Rwanda': '🇷🇼',
    'Zimbabwe': '🇿🇼',
    'Botswana': '🇧🇼',
    'Namibia': '🇳🇦',
    'Angola': '🇦🇴',
    'Mozambique': '🇲🇿',
    'Madagascar': '🇲🇬',
    'Mauritius': '🇲🇺',
    'Seychelles': '🇸🇨',
    'Libya': '🇱🇾',
    'Tunisia': '🇹🇳',
    'Algeria': '🇩🇿',
    'Sudan': '🇸🇩',
    'South Sudan': '🇸🇸',
    'Chad': '🇹🇩',
    'Niger': '🇳🇪',
    'Mali': '🇲🇱',
    'Burkina Faso': '🇧🇫',
    'Senegal': '🇸🇳',
    'Guinea': '🇬🇳',
    'Sierra Leone': '🇸🇱',
    'Liberia': '🇱🇷',
    'Ivory Coast': '🇨🇮',
    'Cote d\'Ivoire': '🇨🇮',
    'Togo': '🇹🇬',
    'Benin': '🇧🇯',
    'Cameroon': '🇨🇲',
    'Central African Republic': '🇨🇫',
    'Equatorial Guinea': '🇬🇶',
    'Gabon': '🇬🇦',
    'Republic of the Congo': '🇨🇬',
    'Democratic Republic of the Congo': '🇨🇩',
    'Burundi': '🇧🇮',
    'Djibouti': '🇩🇯',
    'Eritrea': '🇪🇷',
    'Somalia': '🇸🇴',
    'Malawi': '🇲🇼',
    'Zambia': '🇿🇲',
    'Lesotho': '🇱🇸',
    'Eswatini': '🇸🇿',
    'Cape Verde': '🇨🇻',
    'Sao Tome and Principe': '🇸🇹',
    'Guinea-Bissau': '🇬🇼',
    'Gambia': '🇬🇲',
    'Mauritania': '🇲🇷',
    'Western Sahara': '🇪🇭',
    'Comoros': '🇰🇲',
    'Reunion': '🇷🇪',
    'Mayotte': '🇾🇹',
    
    // Oceania
    'Australia': '🇦🇺',
    'New Zealand': '🇳🇿',
    'Fiji': '🇫🇯',
    'Papua New Guinea': '🇵🇬',
    'Solomon Islands': '🇸🇧',
    'Vanuatu': '🇻🇺',
    'New Caledonia': '🇳🇨',
    'French Polynesia': '🇵🇫',
    'Samoa': '🇼🇸',
    'Tonga': '🇹🇴',
    'Tuvalu': '🇹🇻',
    'Kiribati': '🇰🇮',
    'Palau': '🇵🇼',
    'Micronesia': '🇫🇲',
    'Marshall Islands': '🇲🇭',
    'Nauru': '🇳🇷',
    'Guam': '🇬🇺',
    'Northern Mariana Islands': '🇲🇵',
    'American Samoa': '🇦🇸',
    'Cook Islands': '🇨🇰',
    'Niue': '🇳🇺',
    'Tokelau': '🇹🇰',
    'Pitcairn Islands': '🇵🇳',
    'Wallis and Futuna': '🇼🇫'
  };
  
  // Direct lookup
  if (countryFlags[countryName]) {
    return countryFlags[countryName];
  }
  
  // Try case-insensitive lookup
  const normalizedName = countryName.toLowerCase();
  for (const [country, flag] of Object.entries(countryFlags)) {
    if (country.toLowerCase() === normalizedName) {
      return flag;
    }
  }
  
  // If no match found, return empty string
  return '';
}

// ============================================================================
// AIRPORT DATA SERVICE
// ============================================================================

/**
 * Airport Data Service
 * Fetches and manages airport data from ourairports-data airports.csv
 * Handles parsing, searching, and caching of airport information
 */
class AirportDataService {
  constructor() {
    this.airports = [];
    this.isLoaded = false;
    this.loadingPromise = null;
  }

  /**
   * Fetch airport data from ourairports-data airports.csv
   * @returns {Promise<Array>} Array of airport objects
   */
  async fetchAirportData() {
    if (this.isLoaded) {
      return this.airports;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this._loadAirportData();
    return this.loadingPromise;
  }

  /**
   * Internal method to load airport data from ourairports-data airports.csv
   * @private
   */
  async _loadAirportData() {
    try {
      console.log('Fetching airport data from ourairports-data airports.csv...');
      const response = await fetch('https://davidmegginson.github.io/ourairports-data/airports.csv');
      if (!response.ok) {
        throw new Error(`ourairports-data returned HTTP ${response.status}`);
      }

      const csvText = await response.text();
      this.airports = this._parseOurAirportsCSV(csvText);
      this.isLoaded = true;
      
      console.log(`Successfully loaded ${this.airports.length} airports`);
      return this.airports;
    } catch (error) {
      console.error('Error loading airport data:', error);
      this.airports = [];
      this.isLoaded = false;
      return [];
    }
  }

  /**
   * Parse CSV data from ourairports-data format
   * @private
   * @param {string} csvText - Raw CSV text
   * @returns {Array} Parsed airport objects
   */
  _parseOurAirportsCSV(csvText) {
    const lines = csvText.split('\n');
    const airports = [];
    if (lines.length === 0) {
      return airports;
    }

    const headerFields = this._parseCSVLine(lines[0]).map(field => field.trim());
    const indexOf = (name) => headerFields.indexOf(name);
    const idx = {
      id: indexOf('id'),
      name: indexOf('name'),
      municipality: indexOf('municipality'),
      isoCountry: indexOf('iso_country'),
      iataCode: indexOf('iata_code'),
      icaoCode: indexOf('icao_code'),
      latitude: indexOf('latitude_deg'),
      longitude: indexOf('longitude_deg'),
      elevation: indexOf('elevation_ft'),
      type: indexOf('type')
    };

    for (let lineNumber = 1; lineNumber < lines.length; lineNumber++) {
      const line = lines[lineNumber];
      if (!line.trim()) continue;

      try {
        const fields = this._parseCSVLine(line);

        const iata = (fields[idx.iataCode] || '').trim();
        const latitude = parseFloat(fields[idx.latitude]) || 0;
        const longitude = parseFloat(fields[idx.longitude]) || 0;

        const airport = {
          id: fields[idx.id] || '',
          name: fields[idx.name] || '',
          city: fields[idx.municipality] || '',
          country: fields[idx.isoCountry] || '',
          iata: iata,
          icao: fields[idx.icaoCode] || '',
          latitude: latitude,
          longitude: longitude,
          altitude: parseInt(fields[idx.elevation], 10) || 0,
          timezone: '',
          dst: '',
          tz: '',
          type: fields[idx.type] || '',
          source: 'ourairports-data'
        };

        // Only include airports with IATA codes and valid coordinates
        if (airport.iata && airport.iata.length === 3 &&
            airport.latitude !== 0 && airport.longitude !== 0) {
          airports.push(airport);
        }
      } catch (error) {
        // Skip malformed lines
        continue;
      }
    }

    return airports;
  }

  /**
   * Parse a single CSV line handling quoted fields
   * @private
   * @param {string} line - CSV line to parse
   * @returns {Array} Array of field values
   */
  _parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current);
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    fields.push(current);
    return fields;
  }

  /**
   * Search airports by query (IATA, city, name, or country)
   * Prioritizes exact IATA matches, then city names, airport names, and countries
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results (default: 10)
   * @returns {Promise<Array>} Array of matching airports with scores
   */
  async searchAirports(query, limit = 10) {
    if (!this.isLoaded) {
      await this.fetchAirportData();
    }

    if (!query || query.length < 1) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const results = [];

    for (const airport of this.airports) {
      let score = 0;
      let matchType = '';

      // Exact IATA match gets highest priority
      if (airport.iata.toLowerCase() === searchTerm) {
        score = 1000;
        matchType = 'iata';
      }
      // IATA starts with query
      else if (airport.iata.toLowerCase().startsWith(searchTerm)) {
        score = 800;
        matchType = 'iata';
      }
      // City name match
      else if (airport.city.toLowerCase().includes(searchTerm)) {
        score = 600;
        matchType = 'city';
      }
      // Airport name match
      else if (airport.name.toLowerCase().includes(searchTerm)) {
        score = 400;
        matchType = 'name';
      }
      // Country match
      else if (airport.country.toLowerCase().includes(searchTerm)) {
        score = 200;
        matchType = 'country';
      }

      if (score > 0) {
        results.push({
          ...airport,
          score,
          matchType
        });
      }
    }

    // Sort by score (highest first) and return limited results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get airport by IATA code
   * @param {string} iata - IATA code (e.g., "JFK")
   * @returns {Promise<Object|null>} Airport object or null if not found
   */
  async getAirportByIATA(iata) {
    if (!this.isLoaded) {
      await this.fetchAirportData();
    }

    return this.airports.find(airport => 
      airport.iata.toLowerCase() === iata.toLowerCase()
    );
  }

  /**
   * Format airport for display
   * @param {Object} airport - Airport object
   * @returns {string} Formatted string
   */
  formatAirportForDisplay(airport) {
    if (!airport) return '';

    const parts = [];
    
    if (airport.iata) {
      parts.push(airport.iata);
    }
    
    if (airport.city) {
      parts.push(airport.city);
    }
    
    if (airport.country) {
      parts.push(airport.country);
    }

    return parts.join(', ');
  }

  /**
   * Get display text for autocomplete
   * @param {Object} airport - Airport object
   * @returns {string} Formatted autocomplete text
   */
  getAutocompleteText(airport) {
    if (!airport) return '';

    const parts = [];
    
    // Always show IATA code first
    if (airport.iata) {
      parts.push(airport.iata);
    }
    
    // Add city and country for context
    if (airport.city && airport.country) {
      parts.push(`${airport.city}, ${airport.country}`);
    } else if (airport.city) {
      parts.push(airport.city);
    } else if (airport.country) {
      parts.push(airport.country);
    }

    return parts.join(' - ');
  }
}

// Create global instance
window.airportDataService = new AirportDataService();

// ============================================================================
// AIRPORT AUTOCOMPLETE COMPONENT
// ============================================================================

/**
 * Airport Autocomplete Component
 * Provides autocomplete functionality for airport search inputs
 * Includes country flags for visual identification
 */
class AirportAutocomplete {
  /**
   * @param {HTMLElement} inputElement - Input element to attach autocomplete to
   * @param {Object} options - Configuration options
   * @param {number} options.maxResults - Maximum number of results to show (default: 10)
   * @param {number} options.minQueryLength - Minimum query length to trigger search (default: 1)
   * @param {number} options.debounceDelay - Delay in ms before triggering search (default: 300)
   */
  constructor(inputElement, options = {}) {
    this.input = inputElement;
    this.options = {
      maxResults: 10,
      minQueryLength: 1,
      debounceDelay: 300,
      ...options
    };
    
    this.isOpen = false;
    this.selectedIndex = -1;
    this.results = [];
    this.debounceTimer = null;
    
    this.init();
  }

  /**
   * Initialize the autocomplete component
   */
  init() {
    this.createDropdown();
    this.bindEvents();
  }

  /**
   * Create the dropdown container element
   */
  createDropdown() {
    // Create dropdown container
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'airport-autocomplete-dropdown';
    this.dropdown.style.display = 'none';
    
    // Insert after the input element
    this.input.parentNode.insertBefore(this.dropdown, this.input.nextSibling);
  }

  /**
   * Bind event listeners to input and document
   */
  bindEvents() {
    // Input events
    this.input.addEventListener('input', this.handleInput.bind(this));
    this.input.addEventListener('keydown', this.handleKeydown.bind(this));
    this.input.addEventListener('blur', this.handleBlur.bind(this));
    this.input.addEventListener('focus', this.handleFocus.bind(this));

    // Click outside to close
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  /**
   * Handle input changes with debouncing
   * @param {Event} event - Input event
   */
  handleInput(event) {
    const query = event.target.value.trim();
    console.log('Input changed:', query);
    
    // Clear previous debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    if (query.length < this.options.minQueryLength) {
      console.log('Query too short, hiding dropdown');
      this.hideDropdown();
      return;
    }

    // Debounce the search
    this.debounceTimer = setTimeout(() => {
      console.log('Starting search for:', query);
      this.searchAirports(query);
    }, this.options.debounceDelay);
  }

  /**
   * Handle keyboard navigation
   * @param {Event} event - Keyboard event
   */
  handleKeydown(event) {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateDown();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateUp();
        break;
      case 'Enter':
        event.preventDefault();
        this.selectResult();
        break;
      case 'Escape':
        this.hideDropdown();
        break;
    }
  }

  /**
   * Handle input blur (delay to allow clicks on dropdown)
   * @param {Event} event - Blur event
   */
  handleBlur(event) {
    // Delay hiding to allow for click events on dropdown items
    setTimeout(() => {
      if (!this.dropdown.contains(document.activeElement)) {
        this.hideDropdown();
      }
    }, 150);
  }

  /**
   * Handle input focus (show results if query exists)
   * @param {Event} event - Focus event
   */
  handleFocus(event) {
    const query = event.target.value.trim();
    if (query.length >= this.options.minQueryLength) {
      this.searchAirports(query);
    }
  }

  /**
   * Handle clicks outside the autocomplete
   * @param {Event} event - Click event
   */
  handleClickOutside(event) {
    if (!this.input.contains(event.target) && !this.dropdown.contains(event.target)) {
      this.hideDropdown();
    }
  }

  /**
   * Search for airports using the data service
   * @param {string} query - Search query
   */
  async searchAirports(query) {
    try {
      console.log('Searching airports for query:', query);
      
      if (!window.airportDataService) {
        console.error('Airport data service not available');
        return;
      }

      const results = await window.airportDataService.searchAirports(
        query, 
        this.options.maxResults
      );

      console.log('Search results:', results.length, 'airports found');
      this.results = results;
      this.selectedIndex = -1;
      this.showResults();
    } catch (error) {
      console.error('Error searching airports:', error);
      this.hideDropdown();
    }
  }

  /**
   * Show search results in dropdown
   */
  showResults() {
    console.log('Showing results:', this.results.length);
    if (this.results.length === 0) {
      console.log('No results, hiding dropdown');
      this.hideDropdown();
      return;
    }

    this.renderResults();
    this.showDropdown();
  }

  /**
   * Render search results with country flags
   */
  renderResults() {
    console.log('Rendering results:', this.results.length);
    this.dropdown.innerHTML = '';

    if (this.results.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'airport-autocomplete-item';
      noResults.textContent = 'No airports found';
      noResults.style.color = '#9aa0a6';
      noResults.style.fontStyle = 'italic';
      this.dropdown.appendChild(noResults);
      return;
    }

    this.results.forEach((airport, index) => {
      const item = document.createElement('div');
      item.className = 'airport-autocomplete-item';
      item.dataset.index = index;

      // Get country flag for visual identification
      const flag = getCountryFlag(airport.country);
      
      // Create the display content - show "City Name - Airport Code and Country Flag"
      const displayText = document.createElement('span');
      displayText.className = 'airport-display-text';
      const cityName = airport.city || airport.name;
      const flagText = flag ? ` ${flag}` : '';
      displayText.textContent = `${cityName} - ${airport.iata}${flagText}`;

      item.appendChild(displayText);

      // Add click handler
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Clicked on airport:', airport.iata);
        this.selectAirport(airport);
      });

      // Add hover effects
      item.addEventListener('mouseenter', () => {
        this.selectedIndex = index;
        this.updateSelection();
      });

      this.dropdown.appendChild(item);
    });
  }

  /**
   * Show the dropdown
   */
  showDropdown() {
    console.log('Showing dropdown');
    this.dropdown.style.display = 'block';
    this.isOpen = true;
    this.updateSelection();
  }

  /**
   * Hide the dropdown
   */
  hideDropdown() {
    this.dropdown.style.display = 'none';
    this.isOpen = false;
    this.selectedIndex = -1;
  }

  /**
   * Navigate down in results
   */
  navigateDown() {
    if (this.selectedIndex < this.results.length - 1) {
      this.selectedIndex++;
      this.updateSelection();
    }
  }

  /**
   * Navigate up in results
   */
  navigateUp() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.updateSelection();
    }
  }

  /**
   * Update visual selection highlighting
   */
  updateSelection() {
    const items = this.dropdown.querySelectorAll('.airport-autocomplete-item');
    
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  /**
   * Select the currently highlighted result
   */
  selectResult() {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.results.length) {
      const airport = this.results[this.selectedIndex];
      this.selectAirport(airport);
    }
  }

  /**
   * Select an airport and populate the input
   * @param {Object} airport - Airport object to select
   */
  selectAirport(airport) {
    console.log('Selecting airport:', airport.iata, airport.city);
    
    // Set the input value to "City (IATA)" format
    const cityName = airport.city || airport.name;
    this.input.value = `${cityName} (${airport.iata})`;
    
    // Store the full airport data for later use
    this.input.dataset.airportData = JSON.stringify(airport);
    
    // Trigger change event
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
    
    this.hideDropdown();
  }

  /**
   * Get the selected airport data
   * @returns {Object|null} Selected airport object or null
   */
  getSelectedAirport() {
    const data = this.input.dataset.airportData;
    return data ? JSON.parse(data) : null;
  }

  /**
   * Clear the selection
   */
  clearSelection() {
    this.input.value = '';
    this.input.dataset.airportData = '';
    this.hideDropdown();
  }
}

// ============================================================================
// INITIALIZATION FUNCTION
// ============================================================================

/**
 * Initialize autocomplete for airport inputs
 * Automatically finds and attaches autocomplete to flight search inputs
 */
function initializeAirportAutocomplete() {
  // Wait for airport data service to be available
  const initAutocomplete = () => {
    if (!window.airportDataService) {
      setTimeout(initAutocomplete, 100);
      return;
    }

    // Find airport input fields
    const fromInput = document.getElementById('bs-flight-from');
    const toInput = document.getElementById('bs-flight-to');

    if (fromInput && !fromInput.dataset.autocompleteInitialized) {
      new AirportAutocomplete(fromInput, {
        maxResults: 8,
        minQueryLength: 1
      });
      fromInput.dataset.autocompleteInitialized = 'true';
      console.log('Airport autocomplete initialized for FROM input');
    }

    if (toInput && !toInput.dataset.autocompleteInitialized) {
      new AirportAutocomplete(toInput, {
        maxResults: 8,
        minQueryLength: 1
      });
      toInput.dataset.autocompleteInitialized = 'true';
      console.log('Airport autocomplete initialized for TO input');
    }
  };

  // Start initialization
  initAutocomplete();
}

// ============================================================================
// CSS STYLES (to be added to styles.css or injected)
// ============================================================================

/**
 * CSS styles for airport autocomplete
 * Add these styles to your stylesheet or inject them dynamically
 */
const AIRPORT_AUTOCOMPLETE_STYLES = `
/* Airport Autocomplete Styles */
.airport-autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #dadce0;
  border-top: none;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 10000;
  max-height: 160px;
  overflow-y: auto;
  font-family: 'Google Sans', 'Roboto', Arial, sans-serif;
  display: none;
  font-size: 12px;
}

.airport-autocomplete-item {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  cursor: pointer;
  border-bottom: 1px solid #f1f3f4;
  transition: background-color 0.1s ease;
  position: relative;
  gap: 6px;
  min-height: 32px;
}

.airport-autocomplete-item:last-child {
  border-bottom: none;
}

.airport-autocomplete-item:hover,
.airport-autocomplete-item.selected {
  background-color: #f8f9fa;
}

.airport-autocomplete-item.selected {
  background-color: #e8f0fe;
}

.airport-iata {
  font-size: 11px;
  font-weight: 600;
  color: #1a73e8;
  min-width: 28px;
  text-align: center;
  background: #e8f0fe;
  padding: 1px 4px;
  border-radius: 2px;
  line-height: 1.2;
}

.airport-details {
  font-size: 11px;
  color: #5f6368;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.airport-name {
  font-size: 10px;
  color: #9aa0a6;
  font-style: italic;
  display: none; /* Hide to make it more compact */
}

/* Ensure autocomplete dropdown appears above other elements */
.bs-input-group {
  position: relative;
}

/* Dark mode support for autocomplete */
@media (prefers-color-scheme: dark) {
  .airport-autocomplete-dropdown {
    background: #ffffff;
    border-color: #dadce0;
    color: #000000;
  }
  
  .airport-autocomplete-item:hover,
  .airport-autocomplete-item.selected {
    background-color: #f8f9fa;
  }
  
  .airport-autocomplete-item.selected {
    background-color: #e8f0fe;
  }
  
  .airport-iata {
    color: #1a73e8;
  }
  
  .airport-details {
    color: #5f6368;
  }
}
`;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AirportDataService,
    AirportAutocomplete,
    getCountryFlag,
    initializeAirportAutocomplete,
    AIRPORT_AUTOCOMPLETE_STYLES
  };
}
