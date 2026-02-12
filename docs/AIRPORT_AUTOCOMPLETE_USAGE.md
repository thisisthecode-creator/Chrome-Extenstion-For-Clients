# Airport Autocomplete Complete - Usage Guide

This document explains how to use the consolidated airport autocomplete code with country flags.

## File Overview

The file `AIRPORT_AUTOCOMPLETE_COMPLETE.js` contains all the code needed for airport autocomplete functionality:

1. **Country Flags Mapping** - 100+ countries with flag emojis
2. **Airport Data Service** - Fetches and manages airport data from OpenFlights
3. **Airport Autocomplete Component** - UI component with keyboard navigation
4. **Initialization Function** - Auto-initializes for flight search inputs
5. **CSS Styles** - Complete styling for the autocomplete dropdown

## Quick Start

### 1. Include the File

Add the script to your HTML or manifest:

```html
<script src="AIRPORT_AUTOCOMPLETE_COMPLETE.js"></script>
```

Or in `manifest.json`:

```json
{
  "content_scripts": [{
    "js": ["AIRPORT_AUTOCOMPLETE_COMPLETE.js"]
  }]
}
```

### 2. Add CSS Styles

The CSS styles are included as a constant `AIRPORT_AUTOCOMPLETE_STYLES`. You can:

**Option A:** Add to your existing `styles.css` file (recommended)

**Option B:** Inject dynamically:

```javascript
const style = document.createElement('style');
style.textContent = AIRPORT_AUTOCOMPLETE_STYLES;
document.head.appendChild(style);
```

### 3. Initialize

The autocomplete automatically initializes when you call:

```javascript
initializeAirportAutocomplete();
```

It will automatically find inputs with IDs:
- `bs-flight-from`
- `bs-flight-to`

## Features

### Country Flags

The autocomplete displays country flag emojis next to airport codes for easy visual identification:

- **United States** 🇺🇸
- **United Kingdom** 🇬🇧
- **Germany** 🇩🇪
- **Japan** 🇯🇵
- And 100+ more countries...

### Search Methods

Users can search by:

1. **IATA Code** (highest priority)
   - Example: "JFK", "LAX", "LHR"
   
2. **City Name**
   - Example: "New York", "Los Angeles", "London"
   
3. **Airport Name**
   - Example: "Kennedy", "Heathrow", "Schiphol"
   
4. **Country Name**
   - Example: "United States", "Germany", "Japan"

### Keyboard Navigation

- **Arrow Down** - Navigate down in results
- **Arrow Up** - Navigate up in results
- **Enter** - Select highlighted result
- **Escape** - Close dropdown

### Display Format

Results are displayed as:
```
City Name - IATA Code 🇺🇸
```

Example:
```
New York - JFK 🇺🇸
London - LHR 🇬🇧
Tokyo - NRT 🇯🇵
```

## API Reference

### AirportDataService

```javascript
// Get global instance
const service = window.airportDataService;

// Search airports
const results = await service.searchAirports('New York', 10);

// Get airport by IATA
const airport = await service.getAirportByIATA('JFK');
```

### AirportAutocomplete

```javascript
// Create autocomplete instance
const input = document.getElementById('my-airport-input');
const autocomplete = new AirportAutocomplete(input, {
  maxResults: 8,
  minQueryLength: 1,
  debounceDelay: 300
});

// Get selected airport
const selected = autocomplete.getSelectedAirport();

// Clear selection
autocomplete.clearSelection();
```

### getCountryFlag()

```javascript
// Get flag emoji for a country
const flag = getCountryFlag('United States'); // Returns: 🇺🇸
const flag2 = getCountryFlag('Germany'); // Returns: 🇩🇪
```

## Customization

### Change Maximum Results

```javascript
new AirportAutocomplete(input, {
  maxResults: 15  // Show up to 15 results
});
```

### Change Debounce Delay

```javascript
new AirportAutocomplete(input, {
  debounceDelay: 500  // Wait 500ms before searching
});
```

### Custom Input IDs

If your input fields have different IDs, modify the initialization:

```javascript
function initializeAirportAutocomplete() {
  const initAutocomplete = () => {
    if (!window.airportDataService) {
      setTimeout(initAutocomplete, 100);
      return;
    }

    // Custom input selectors
    const fromInput = document.getElementById('your-from-input-id');
    const toInput = document.getElementById('your-to-input-id');

    if (fromInput && !fromInput.dataset.autocompleteInitialized) {
      new AirportAutocomplete(fromInput, {
        maxResults: 8,
        minQueryLength: 1
      });
      fromInput.dataset.autocompleteInitialized = 'true';
    }

    if (toInput && !toInput.dataset.autocompleteInitialized) {
      new AirportAutocomplete(toInput, {
        maxResults: 8,
        minQueryLength: 1
      });
      toInput.dataset.autocompleteInitialized = 'true';
    }
  };

  initAutocomplete();
}
```

## Data Source

The airport data is fetched from:
- **URL**: `https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat`
- **Format**: CSV with 14+ fields per airport
- **Size**: 14,000+ airports worldwide
- **Update**: Fetched fresh on first use, then cached

## Airport Object Structure

```javascript
{
  id: "3797",
  name: "John F Kennedy International Airport",
  city: "New York",
  country: "United States",
  iata: "JFK",
  icao: "KJFK",
  latitude: 40.639751,
  longitude: -73.778925,
  altitude: 13,
  timezone: "America/New_York",
  dst: "A",
  tz: "America/New_York",
  type: "airport",
  source: "OurAirports"
}
```

## Integration with Existing Code

The autocomplete stores selected airport data in the input's `dataset`:

```javascript
// After selection, airport data is stored as:
input.dataset.airportData = JSON.stringify(airport);

// Retrieve it:
const airportData = JSON.parse(input.dataset.airportData);
const iataCode = airportData.iata; // "JFK"
const city = airportData.city; // "New York"
const country = airportData.country; // "United States"
```

## Browser Compatibility

- Chrome Extensions Manifest V3
- Modern JavaScript (ES6+)
- Fetch API
- CSS Grid and Flexbox

## Performance

- **Initial Load**: ~1-2 seconds to fetch and parse airport data
- **Search Speed**: Instant (in-memory search)
- **Memory**: ~2-3 MB for full airport database
- **Caching**: Data is cached after first load

## Troubleshooting

### Autocomplete not showing

1. Check that `window.airportDataService` is available
2. Verify CSS styles are loaded
3. Check browser console for errors
4. Ensure input elements exist before initialization

### No results found

1. Check internet connection (needed for initial data fetch)
2. Verify OpenFlights URL is accessible
3. Check browser console for fetch errors

### Flags not displaying

1. Ensure your font supports emoji characters
2. Check that country names match exactly (case-insensitive)
3. Verify `getCountryFlag()` function is available

## Example Usage

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Include AIRPORT_AUTOCOMPLETE_STYLES here */
  </style>
</head>
<body>
  <input type="text" id="bs-flight-from" placeholder="From airport">
  <input type="text" id="bs-flight-to" placeholder="To airport">
  
  <script src="AIRPORT_AUTOCOMPLETE_COMPLETE.js"></script>
  <script>
    // Initialize when page loads
    document.addEventListener('DOMContentLoaded', () => {
      initializeAirportAutocomplete();
    });
  </script>
</body>
</html>
```

## License

This code uses data from OpenFlights (https://openflights.org/), which is licensed under the Open Database License.
