// CASM (Cost per Available Seat Mile) data for airlines
// Values in cents per mile

const casmData = {
  // US Airlines
  'American Airlines': 14.5,
  'Delta Air Lines': 15.2,
  'United Airlines': 14.8,
  'Southwest Airlines': 11.2,
  'JetBlue': 12.3,
  'Alaska Airlines': 12.8,
  'Spirit Airlines': 8.5,
  'Frontier Airlines': 8.9,
  'Allegiant Air': 9.2,
  'Hawaiian Airlines': 13.7,
  
  // North American Airlines
  'Air Canada': 15.5,
  'WestJet': 13.2,
  'Aeromexico': 12.8,
  'Air Transat': 11.5,
  
  // European Airlines
  'Lufthansa': 16.2,
  'British Airways': 16.8,
  'Air France': 16.5,
  'KLM': 16.3,
  'Ryanair': 6.2,
  'easyJet': 7.5,
  'Wizz Air': 6.8,
  'Iberia': 15.4,
  'SAS': 15.9,
  'Swiss': 16.7,
  'Austrian Airlines': 15.8,
  'Brussels Airlines': 15.6,
  'Aer Lingus': 14.2,
  'TAP Air Portugal': 14.8,
  'Finnair': 15.3,
  'Norwegian': 9.8,
  'Vueling': 8.3,
  
  // Middle Eastern Airlines
  'Emirates': 17.3,
  'Qatar Airways': 17.8,
  'Etihad Airways': 17.1,
  'Turkish Airlines': 15.8,
  'Gulf Air': 16.2,
  'Saudia': 15.9,
  
  // Asian Airlines
  'Singapore Airlines': 18.1,
  'Cathay Pacific': 17.5,
  'ANA': 16.9,
  'Japan Airlines': 17.2,
  'Korean Air': 16.5,
  'EVA Air': 16.3,
  'China Airlines': 15.8,
  'China Eastern': 14.9,
  'China Southern': 14.7,
  'Air China': 15.1,
  'Thai Airways': 15.6,
  'Malaysia Airlines': 15.3,
  'Garuda Indonesia': 15.7,
  'Vietnam Airlines': 14.8,
  'Philippine Airlines': 14.2,
  
  // Oceania Airlines
  'Qantas': 17.4,
  'Air New Zealand': 16.8,
  'Virgin Australia': 14.9,
  'Jetstar': 9.8,
  
  // African Airlines
  'Ethiopian Airlines': 14.3,
  'South African Airways': 15.1,
  'Kenya Airways': 14.7,
  'EgyptAir': 14.9,
  'Royal Air Maroc': 14.5,
  
  // Latin American Airlines
  'LATAM Airlines': 13.8,
  'Avianca': 13.5,
  'Copa Airlines': 12.9,
  'Azul Brazilian Airlines': 12.7,
  'GOL Airlines': 11.9
};

// Get sorted list of airlines for dropdown
function getAirlinesList() {
  return Object.keys(casmData).sort((a, b) => a.localeCompare(b));
}

// Get CASM value for an airline
function getAirlineCASM(airlineName) {
  return casmData[airlineName] || null;
}

// Expose globally
if (typeof window !== 'undefined') {
  window.casmData = casmData;
  window.getAirlinesList = getAirlinesList;
  window.getAirlineCASM = getAirlineCASM;
}

