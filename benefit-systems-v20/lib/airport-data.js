// Airport Data Service
// Fetches and manages airport data from OpenFlights database

class AirportDataService {
  constructor() {
    this.airports = [];
    this.isLoaded = false;
    this.loadingPromise = null;
  }

  // Fetch airport data from OpenFlights
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

  async _loadAirportData() {
    try {
      console.log('Fetching airport data from OpenFlights...');
      const response = await fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      console.log('Airport data fetched, parsing CSV...');
      
      this.airports = this._parseCSV(csvText);
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

  // Parse CSV data from OpenFlights format
  _parseCSV(csvText) {
    const lines = csvText.split('\n');
    const airports = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const fields = this._parseCSVLine(line);
        
        if (fields.length >= 14) {
          const airport = {
            id: fields[0],
            name: fields[1],
            city: fields[2],
            country: fields[3],
            iata: fields[4] === '\\N' ? '' : fields[4],
            icao: fields[5] === '\\N' ? '' : fields[5],
            latitude: parseFloat(fields[6]) || 0,
            longitude: parseFloat(fields[7]) || 0,
            altitude: parseInt(fields[8]) || 0,
            timezone: fields[9],
            dst: fields[10],
            tz: fields[11],
            type: fields[12],
            source: fields[13]
          };

          // Only include airports with IATA codes and valid coordinates
          if (airport.iata && airport.iata.length === 3 && 
              airport.latitude !== 0 && airport.longitude !== 0) {
            airports.push(airport);
          }
        }
      } catch (error) {
        // Skip malformed lines
        continue;
      }
    }

    return airports;
  }

  // Parse a single CSV line handling quoted fields
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

  // Search airports by query (IATA, city, name, or country)
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

  // Get airport by IATA code
  async getAirportByIATA(iata) {
    if (!this.isLoaded) {
      await this.fetchAirportData();
    }

    return this.airports.find(airport => 
      airport.iata.toLowerCase() === iata.toLowerCase()
    );
  }

  // Format airport for display
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

  // Get display text for autocomplete
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
