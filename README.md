# Google Flights Chrome Extension

A powerful Chrome extension that enhances Google Flights with additional search tools, hotel integration, and flight analysis features.

## Features

### Flight Search
- **Multiple Search Engines**: Access PointsYeah, AwardTool, Seats.aero, Point.me, Kayak, Skyscanner, and more
- **Airport Autocomplete**: Intelligent airport search with country flags
- **Quick Date Buttons**: Fast date selection with +1, +3, +7 day buttons
- **Auto-sync**: Automatically sync flight dates to hotel search
- **CASM Calculator**: Calculate cost per available seat mile

### Hotel Search
- **Multiple Hotel Platforms**: Google Hotels, Rooms.aero, PointsYeah, RoveMiles, and major hotel chains
- **Auto-sync from Flights**: Check-in and check-out dates automatically sync from flight dates
- **City Auto-fill**: Hotel city automatically fills from flight destination

### Additional Features
- **Drag & Drop Button Reordering**: Customize button order within each section
- **Persistent Settings**: All preferences saved to localStorage
- **Modern UI**: Clean, intuitive interface with emoji icons

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the extension directory

## File Structure

```
├── manifest.json              # Extension manifest
├── content.js                 # Main content script
├── background.js              # Background service worker
├── flight-details-injector.js # Flight details injection
├── flight-details-styles.css  # Flight details styles
├── styles.css                 # Main extension styles
├── icons/                     # Extension icons
├── lib/                       # Library files (incl. AIRPORT_AUTOCOMPLETE_COMPLETE.js)
├── data/                      # Static data (e.g. points_history_cpm_rows.json)
├── docs/                      # Documentation
├── scripts/                   # Build/utility scripts (e.g. create-extension-zip.sh)
└── sql/                       # SQL schemas and seeds
```

## Usage

### Flight Search
1. Fill in flight details (From, To, Depart, Return, etc.)
2. Toggle "Search Links" to see available search engines
3. Click any button to search on that platform
4. Use "Open All" to open all search engines in new tabs

### Hotel Search
1. Fill in hotel details (City, Check-in, Check-out, etc.)
2. Dates automatically sync from flight search if available
3. Toggle "Search Links" to see available hotel platforms
4. Click any button to search on that platform

### Button Customization
- Drag and drop buttons within their sections to reorder
- Your preferred order is saved automatically

## Development

### Creating a New Build
Run the build script to create a new zip file:
```bash
./create-extension-zip.sh
```

This will:
- Increment the version number in `manifest.json`
- Create a new zip file with all necessary files

## Version History

- **v218**: Removed Search and Information sections
- **v217**: Removed Hotel Benefits section
- **v215**: Added emoji icons for Flight and Hotel sections
- **v213**: Automatic hotel date sync from flight dates
- **v212**: Added drag & drop button reordering
- **v210**: Improved hotel date synchronization logic
- **v209**: Added Google Flights favicon (later removed)
- **v208**: Quick date buttons (+1, +3, +7 days)
- **v207**: Depart date preset to today
- **v206**: Airport autocomplete consolidation
- **v205**: Fixed missing input sections
- **v204**: Hotel date and city sync from flight search
- **v203**: Base version with core functionality

## License

This project is private and proprietary.

## Author

Created for Florian - Google Flights Extension
