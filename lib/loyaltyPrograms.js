// Loyalty Programs with point values (USD per point)
// Used for CPM calculations

const loyaltyPrograms = [
  // Credit Card Programs
  { name: 'Amex (Membership Rewards)', pointValue: 0.0195, category: 'credit' },
  { name: 'Bilt (Rewards)', pointValue: 0.0210, category: 'credit' },
  { name: 'Capital One (Venture Miles)', pointValue: 0.0200, category: 'credit' },
  { name: 'Chase (Ultimate Rewards)', pointValue: 0.0193, category: 'credit' },
  { name: 'Citi (ThankYou Points)', pointValue: 0.0215, category: 'credit' },
  { name: 'Wells Fargo (Rewards)', pointValue: 0.0195, category: 'credit' },
  { name: 'Rove (Miles)', pointValue: 0.0150, category: 'credit' },
  
  // Airlines
  { name: 'Aer Lingus (Avios)', pointValue: 0.0373, category: 'airline' },
  { name: 'Air Canada (Aeroplan)', pointValue: 0.0184, category: 'airline' },
  { name: 'Air Europa (SUMA)', pointValue: 0.0130, category: 'airline' },
  { name: 'Air France / KLM (Flying Blue)', pointValue: 0.0217, category: 'airline' },
  { name: 'Alaska Airlines (Mileage Plan)', pointValue: 0.0210, category: 'airline' },
  { name: 'American Airlines (AAdvantage)', pointValue: 0.0177, category: 'airline' },
  { name: 'ANA (Mileage Club)', pointValue: 0.0285, category: 'airline' },
  { name: 'Avianca (LifeMiles)', pointValue: 0.0285, category: 'airline' },
  { name: 'British Airways (Avios)', pointValue: 0.0257, category: 'airline' },
  { name: 'Cathay Pacific (Asia Miles)', pointValue: 0.0284, category: 'airline' },
  { name: 'Copa Airlines (ConnectMiles)', pointValue: 0.0150, category: 'airline' },
  { name: 'Delta (SkyMiles)', pointValue: 0.0134, category: 'airline' },
  { name: 'Emirates (Skywards)', pointValue: 0.0155, category: 'airline' },
  { name: 'Etihad (Guest)', pointValue: 0.0100, category: 'airline' },
  { name: 'EVA Air (Infinity MileageLands)', pointValue: 0.0250, category: 'airline' },
  { name: 'Hawaiian Airlines (Hawaiian Miles)', pointValue: 0.0209, category: 'airline' },
  { name: 'Iberia (Avios)', pointValue: 0.0305, category: 'airline' },
  { name: 'JetBlue (TrueBlue)', pointValue: 0.0124, category: 'airline' },
  { name: 'Lufthansa (Miles & More) US', pointValue: 0.0320, category: 'airline' },
  { name: 'Qatar Airways (Avios)', pointValue: 0.0096, category: 'airline' },
  { name: 'Singapore Airlines (KrisFlyer)', pointValue: 0.0233, category: 'airline' },
  { name: 'Southwest Airlines (Rapid Rewards)', pointValue: 0.0152, category: 'airline' },
  { name: 'TAP Air Portugal (Miles&Go)', pointValue: 0.0180, category: 'airline' },
  { name: 'Turkish Airlines (Miles & Smiles)', pointValue: 0.0110, category: 'airline' },
  { name: 'United Airlines (MileagePlus)', pointValue: 0.0190, category: 'airline' },
  { name: 'Virgin Atlantic (Flying Club)', pointValue: 0.0365, category: 'airline' },
  { name: 'Virgin Australia (Velocity)', pointValue: 0.0210, category: 'airline' },
  
  // Hotels
  { name: 'Accor (Live Limitless)', pointValue: 0.0200, category: 'hotel' },
  { name: 'Choice (Privileges)', pointValue: 0.0060, category: 'hotel' },
  { name: 'Hilton (Honors)', pointValue: 0.0059, category: 'hotel' },
  { name: 'Hyatt (World of Hyatt)', pointValue: 0.0219, category: 'hotel'},
  { name: 'IHG (One Rewards)', pointValue: 0.0068, category: 'hotel' },
  { name: 'Marriott (Bonvoy)', pointValue: 0.0094, category: 'hotel' },
  { name: 'Radisson (Rewards)', pointValue: 0.0120, category: 'hotel' },
  { name: 'Wyndham (Rewards)', pointValue: 0.0120, category: 'hotel' }
];

// Map Seats.aero source names to loyalty program names
const sourceToProgramName = {
  eurobonus: 'SAS EuroBonus',
  virginatlantic: 'Virgin Atlantic (Flying Club)',
  aeromexico: 'Aeromexico Club Premier',
  american: 'American Airlines (AAdvantage)',
  delta: 'Delta (SkyMiles)',
  etihad: 'Etihad (Guest)',
  united: 'United Airlines (MileagePlus)',
  emirates: 'Emirates (Skywards)',
  aeroplan: 'Air Canada (Aeroplan)',
  alaska: 'Alaska Airlines (Mileage Plan)',
  velocity: 'Virgin Australia (Velocity)',
  qantas: 'Qantas Frequent Flyer',
  connectmiles: 'Copa Airlines (ConnectMiles)',
  copa: 'Copa Airlines (ConnectMiles)',
  copaairlines: 'Copa Airlines (ConnectMiles)',
  azul: 'Azul TudoAzul',
  smiles: 'GOL Smiles',
  flyingblue: 'Air France / KLM (Flying Blue)',
  jetblue: 'JetBlue (TrueBlue)',
  qatar: 'Qatar Airways (Avios)',
  turkish: 'Turkish Airlines (Miles & Smiles)',
  singapore: 'Singapore Airlines (KrisFlyer)',
  ethiopian: 'Ethiopian ShebaMiles',
  saudia: 'Saudia AlFursan',
  finnair: 'Finnair Plus',
  lufthansa: 'Lufthansa (Miles & More) US'
};

function getProgramPointValue(programName) {
  const program = loyaltyPrograms.find(p => p.name === programName);
  return program ? program.pointValue : 0.0190; // Default to 1.9¢ if not found
}

function getProgramPointValueBySource(source) {
  const programName = sourceToProgramName[source] || source;
  return getProgramPointValue(programName);
}

// Expose globally
if (typeof window !== 'undefined') {
  window.loyaltyPrograms = loyaltyPrograms;
  window.getProgramPointValue = getProgramPointValue;
  window.getProgramPointValueBySource = getProgramPointValueBySource;
  window.sourceToProgramName = sourceToProgramName;
}

