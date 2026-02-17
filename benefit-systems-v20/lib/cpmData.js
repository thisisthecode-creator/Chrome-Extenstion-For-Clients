// Static CPM dataset: avg_6_entries (USD per 1000 miles) by program name
const AVG6_PER_1000_BY_PROGRAM = {
  'Finnair (Avios)': 13.08,
  'Iberia (Avios)': 14.85,
  'Air Europa (SUMA)': 20.095,
  'Hawaiian Airlines (Hawaiian Miles)': 15.69,
  'American Airlines (AAdvantage)': 21.96,
  'British Airways (Avios)': 14.9,
  'Aer Lingus (Avios)': 15.516666666666667,
  'Hyatt (World of Hyatt)': 19.8,
  'Etihad (Guest)': 14.8,
  'Emirates (Skywards)': 22.833333333333332,
  'Air Canada (Aeroplan)': 15.341666666666667,
  'EVA Air (Infinity MileageLands)': 29.633333333333333,
  'Lufthansa (Miles & More) US)': 14.638333333333334,
  'Lufthansa (Miles & More) US': 14.638333333333334,
  'Air France / KLM (Flying Blue)': 16.983333333333334,
  'Marriott (Bonvoy)': 8.7,
  'Avianca (LifeMiles)': 12.25,
  'Qatar Airways (Avios)': 14.883333333333333,
  'Accor (Live Limitless)': 15.59,
  'Cathay Pacific (Asia Miles)': 30.0,
  'Delta (SkyMiles)': 35.0,
  'Turkish Airlines (Miles & Smiles)': 15.0,
  'Hilton (Honors)': 5.1,
  'Alaska Airlines (Mileage Plan)': 18.7,
  'Virgin Australia (Velocity)': 9.9,
  'Southwest Airlines (Rapid Rewards)': 15.25,
  'United Airlines (MileagePlus)': 20.851666666666667,
  'Virgin Atlantic (Flying Club)': 14.95,
  'IHG (One Rewards)': 5.2,
  'Wyndham (Rewards)': 7.886666666666667,
  'Radisson (Rewards)': 4.023333333333333,
  'Copa Airlines (ConnectMiles)': 17.85,
  'TAP Air Portugal (Miles&Go)': 23.016666666666666,
  'JetBlue (TrueBlue)': 13.568333333333333
}

function getMarketCPMByProgram(programName) {
  return AVG6_PER_1000_BY_PROGRAM[programName] || null
}

function getMarketCPMBySource(source) {
  const programName = (window && window.sourceToProgramName && window.sourceToProgramName[source]) || source
  return getMarketCPMByProgram(programName)
}

if (typeof window !== 'undefined') {
  window.getMarketCPMBySource = getMarketCPMBySource
  window.getMarketCPMByProgram = getMarketCPMByProgram
}


