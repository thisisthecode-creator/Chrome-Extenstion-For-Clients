// Regional baggage cost data
// Structure: { min: number, max: number, defaultRatePct: number }
// defaultRatePct is for mishandling rate (as decimal, e.g., 0.55 = 55%)

const regionCosts = {
  'Asia–Pacific': { min: 6.5, max: 7.5, defaultRatePct: 0.31 },
  'North America': { min: 7.5, max: 8.0, defaultRatePct: 0.55 },
  'Latin America': { min: 7.5, max: 8.0, defaultRatePct: 0.55 },
  'Middle East & Africa': { min: 7.8, max: 8.2, defaultRatePct: 0.602 },
  'Europe': { min: 8.5, max: 9.0, defaultRatePct: 1.23 }
};

// Get expected bag cost for a region (midpoint of min/max)
function getExpectedBagCostPerBag(region) {
  const costs = regionCosts[region];
  if (!costs) return 7.75; // Default fallback
  return (costs.min + costs.max) / 2;
}

// Get default mishandling rate for a region
function getDefaultMishandlingRate(region) {
  const costs = regionCosts[region];
  if (!costs) return 0.55; // Default fallback
  return costs.defaultRatePct;
}

// Expose globally
if (typeof window !== 'undefined') {
  window.regionCosts = regionCosts;
  window.getExpectedBagCostPerBag = getExpectedBagCostPerBag;
  window.getDefaultMishandlingRate = getDefaultMishandlingRate;
}

