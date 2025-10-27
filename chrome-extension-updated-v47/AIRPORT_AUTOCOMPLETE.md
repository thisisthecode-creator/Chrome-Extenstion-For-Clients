# Airport Autocomplete Feature

This Chrome extension now includes intelligent airport autocomplete functionality for the flight search form.

## Features

- **Smart Airport Search**: Search by IATA code, city name, airport name, or country
- **Real-time Suggestions**: As you type, get instant suggestions from a comprehensive airport database
- **Keyboard Navigation**: Use arrow keys to navigate suggestions, Enter to select, Escape to close
- **Visual Feedback**: Clear display of airport codes, cities, and full airport names
- **Data Source**: Uses the OpenFlights airport database with over 14,000 airports worldwide

## How It Works

1. **Data Loading**: The extension fetches airport data from the OpenFlights database on first use
2. **Search Algorithm**: Prioritizes exact IATA matches, then city names, airport names, and countries
3. **Autocomplete Integration**: Seamlessly integrates with the existing flight search form
4. **Data Persistence**: Selected airports are stored for form submission

## Usage

1. Click on the "From" or "To" input fields
2. Start typing:
   - IATA codes (e.g., "JFK", "LAX")
   - City names (e.g., "New York", "Los Angeles")
   - Airport names (e.g., "Kennedy", "Heathrow")
   - Country names (e.g., "United States", "Germany")
3. Use arrow keys to navigate suggestions
4. Press Enter to select or click on a suggestion
5. The input will be populated with the IATA code for form submission

## Technical Implementation

- **Airport Data Service** (`lib/airport-data.js`): Handles fetching and parsing airport data
- **Autocomplete Component** (`lib/airport-autocomplete.js`): Provides the UI and interaction logic
- **Integration**: Seamlessly works with existing flight search functionality
- **Styling**: Matches the extension's design system with proper hover states and accessibility

## Data Source

The airport data is sourced from the OpenFlights database:
- **URL**: https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat
- **Format**: CSV with comprehensive airport information
- **Update Frequency**: Fetched fresh on each extension load
- **Data Points**: IATA codes, ICAO codes, airport names, cities, countries, coordinates, and more

## Browser Compatibility

- Chrome Extensions Manifest V3
- Modern JavaScript features (ES6+)
- Fetch API for data loading
- CSS Grid and Flexbox for layout
