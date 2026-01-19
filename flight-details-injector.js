// Flight Details Injector - Simplified Version
// This script replaces CO2 emissions with flight details

console.log("Flight Details Injector loaded")

// ---------------- Seats.aero helpers ----------------
function getUserCurrency() {
  const select = document.getElementById('bs-flight-currency')
  if (select && select.value) return select.value
  try {
    const saved = JSON.parse(localStorage.getItem('bs-extension-flight-data') || '{}')
    if (saved && saved.currency) return saved.currency
  } catch (e) {}
  return 'USD'
}

const fxRates = {
  USD: 1,
  EUR: 0.92,
  CAD: 1.36,
  GBP: 0.78,
  CHF: 0.90,
  PLN: 4.00
}

function convertAmount(amountMinor, fromCurrency, toCurrency) {
  if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return amountMinor
  const from = fxRates[fromCurrency] || 1
  const to = fxRates[toCurrency] || 1
  const amountMajor = amountMinor / 100
  const usd = amountMajor / from
  return Math.round((usd * to) * 100)
}

function formatMinor(amountMinor, currency) {
  const amountMajor = amountMinor / 100
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amountMajor)
  } catch (e) {
    return `${amountMajor.toFixed(2)} ${currency}`
  }
}

function readFlightInputs() {
  let from = document.getElementById('bs-flight-from')?.value?.trim()?.toUpperCase() || ''
  let to = document.getElementById('bs-flight-to')?.value?.trim()?.toUpperCase() || ''
  let depart = document.getElementById('bs-flight-depart')?.value || ''
  let ret = document.getElementById('bs-flight-return')?.value || ''

  if (!from || !to || !depart) {
    try {
      const url = new URL(window.location.href)
      const q = url.searchParams.get('q') || ''
      // Example: flights+from+WAW+to+VIE+oneway+on+2025-12-01
      const m = q.match(/from\+([A-Z]{3}).*?to\+([A-Z]{3}).*?(?:on\+|to\+)(\d{4}-\d{2}-\d{2})/i)
      if (m) {
        if (!from) from = m[1].toUpperCase()
        if (!to) to = m[2].toUpperCase()
        if (!depart) depart = m[3]
      }
    } catch (e) {}
  }

  return { from, to, depart, ret }
}

const pageSeatsCache = {}
let lastSeatsSearch = null
let globalPanelInitialized = false

// Extract cash price from Google Flights DOM
function extractCashPrice(flightElement) {
  if (!flightElement) return null
  
  // Try to find the parent flight card (li.pIav2d or similar)
  let card = flightElement
  let attempts = 0
  while (card && attempts < 10) {
    if (card.classList && (
      card.classList.contains('pIav2d') ||
      card.classList.contains('yR1fYc') ||
      card.classList.contains('mxvQLc') ||
      card.querySelector && card.querySelector('[data-price]')
    )) {
      break
    }
    card = card.parentElement
    attempts++
  }
  
  if (!card) card = flightElement
  
  // Try multiple selectors for price
  const priceSelectors = [
    '[data-price]',
    '[jsname="RqLDVc"]',
    '.Ldmmjc',
    '.JMc5Xc',
    '.VfPpkd-dgl2Hf-ppHlrf-sM5MNb',
    '.aN1RFf',
    '[aria-label*="$"]',
    '[aria-label*="price"]',
    '.gws-flights-results__price'
  ]
  
  for (const selector of priceSelectors) {
    const priceEl = card.querySelector(selector)
    if (priceEl) {
      const text = priceEl.textContent || priceEl.innerText || ''
      // Extract number after $ or currency symbol
      const match = text.match(/[\$€£¥]?\s*([\d,]+\.?\d*)/)
      if (match) {
        const price = parseFloat(match[1].replace(/,/g, ''))
        if (!isNaN(price) && price > 0) {
          console.log('Extracted cash price:', price, 'from selector:', selector)
          return price
        }
      }
    }
  }
  
  // Try data attributes
  const priceAttr = card.getAttribute('data-price') || 
                    card.querySelector('[data-price]')?.getAttribute('data-price')
  if (priceAttr) {
    const price = parseFloat(priceAttr)
    if (!isNaN(price) && price > 0) {
      console.log('Extracted cash price from data attribute:', price)
      return price
    }
  }
  
  // Try aria-label
  const ariaLabel = card.getAttribute('aria-label') || 
                    card.querySelector('[aria-label*="$"]')?.getAttribute('aria-label')
  if (ariaLabel) {
    const match = ariaLabel.match(/[\$€£¥]?\s*([\d,]+\.?\d*)/)
    if (match) {
      const price = parseFloat(match[1].replace(/,/g, ''))
      if (!isNaN(price) && price > 0) {
        console.log('Extracted cash price from aria-label:', price)
        return price
      }
    }
  }
  
  console.warn('Could not extract cash price from flight element')
  return null
}

// Calculate CPM (Cents Per Mile) for 1000 miles
function calculateCPM(cashPriceUSD, miles, taxesUSD, programPointValue) {
  if (!cashPriceUSD || !miles || miles <= 0) return null
  
  // Value of miles: miles * pointValue gives USD value
  const milesValueUSD = miles * programPointValue
  // Total award cost: miles value + taxes
  const totalAwardCostUSD = milesValueUSD + taxesUSD
  
  // Effective CPM: ((cash_price - taxes) / miles) * 100
  // This tells us how many cents per mile we're getting in value
  const effectiveCPM = ((cashPriceUSD - taxesUSD) / miles) * 100
  
  return {
    effectiveCPM,
    milesValueUSD,
    totalAwardCostUSD,
    savings: cashPriceUSD - totalAwardCostUSD,
    savingsPercent: ((cashPriceUSD - totalAwardCostUSD) / cashPriceUSD) * 100,
    isGoodDeal: effectiveCPM >= 1.0 // Good if >= 1.0¢ per mile
  }
}

function formatUSD(amount) {
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(amount) } catch(_) { return `$${amount.toFixed(2)}` }
}

// Format miles with dot thousands separator (e.g., 17.500, 18.000, 100.000)
function formatMilesDots(miles) {
  const n = Math.round(Number(miles) || 0)
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Create gradient bar for savings visualization
function createSavingsBar(savingsPercent, min = 0, max = 60) {
  if (savingsPercent === null || savingsPercent === undefined) return null
  
  const clamped = Math.max(min, Math.min(max, savingsPercent))
  const position = ((clamped - min) / (max - min)) * 100
  
  const container = document.createElement('div')
  container.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  `
  
  const label = document.createElement('div')
  label.style.cssText = `
    font-weight: 700;
    font-size: 14px;
    color: #ffffff;
    min-width: 90px;
  `
  label.textContent = `${savingsPercent.toFixed(0)}% saved`
  
  const barContainer = document.createElement('div')
  barContainer.style.cssText = `
    flex: 1;
    height: 8px;
    background: linear-gradient(to right, #d32f2f 0%, #ff9800 30%, #ffc107 50%, #8bc34a 70%, #4caf50 100%);
    border-radius: 4px;
    position: relative;
  `
  
  const pointer = document.createElement('div')
  pointer.style.cssText = `
    position: absolute;
    top: 50%;
    left: ${position}%;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 8px solid #ffffff;
    transform: translate(-50%, -50%);
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
  `
  
  barContainer.appendChild(pointer)
  
  container.appendChild(label)
  container.appendChild(barContainer)
  
  return container
}

// Determine a sensible default USD-per-1000-miles value from the loaded loyalty programs
function getDefaultMilesValue() {
  try {
    const list = (window && window.loyaltyPrograms) ? window.loyaltyPrograms : []
    if (!Array.isArray(list) || list.length === 0) return 20 // fallback $20 per 1000 miles
    // Average across all programs' pointValue, then convert to per-1000-miles
    const sum = list.reduce((acc, p) => acc + (typeof p.pointValue === 'number' ? p.pointValue : 0), 0)
    const avg = sum / list.length
    // Convert to per-1000-miles and clamp to reasonable range
    if (!isFinite(avg) || avg <= 0) return 20
    const per1000 = avg * 1000
    return Math.round(per1000 * 10) / 10 // round to 1 decimal
  } catch (_) {
    return 20
  }
}

// Convert per-1000-miles input to per-mile value for calculations
function convertToPerMile(per1000Value) {
  return (per1000Value || 0) / 1000
}

// Try to find the Flight Search section to insert panel inside
function findFlightSearchSection() {
  // Look for common Flight Search containers
  const selectors = [
    'div[data-testid="search-form"]',
    'div[jsname="RqLDVc"]', // Google's search form
    'div[role="search"]',
    'form[role="search"]',
    'div[jscontroller*="search"]',
    'div[aria-label*="search" i]',
    'div[aria-label*="flight" i]'
  ]
  
  for (const sel of selectors) {
    const el = document.querySelector(sel)
    if (el) {
      // Look for a good insertion point within this container
      const insertionPoints = [
        'div[data-testid="search-form"] > div:last-child',
        'div[jsname="RqLDVc"] > div:last-child',
        'div[role="search"] > div:last-child'
      ]
      
      for (const ip of insertionPoints) {
        const point = el.querySelector(ip)
        if (point) return point.parentElement
      }
      
      return el
    }
  }
  
  // Fallback to main content area
  return document.querySelector('div[role="main"]') || document.body
}

// Extract the cheapest visible cash price on the page
function extractCheapestCashPriceOnPage() {
  const priceCandidates = Array.from(document.querySelectorAll('[data-price], .JMc5Xc, .Ldmmjc, .aN1RFf, .gws-flights-results__price, [aria-label*="$"], [aria-label*="price"]'))
  let min = Infinity
  for (const el of priceCandidates) {
    const txt = (el.getAttribute('data-price') || el.textContent || '').trim()
    const m = txt.match(/[\$€£¥]?\s*([\d,]+\.?\d*)/)
    if (m) {
      const val = parseFloat(m[1].replace(/,/g, ''))
      if (!isNaN(val) && val > 0) min = Math.min(min, val)
    }
  }
  return isFinite(min) ? min : null
}

function ensureGlobalProgramsPanel() {
  if (document.getElementById('bs-global-seats-panel')) return document.getElementById('bs-global-seats-panel')
  const host = findFlightSearchSection()
  const panel = document.createElement('div')
  panel.id = 'bs-global-seats-panel'
  panel.style.cssText = `
    margin: 12px 0;
    padding: 0 16px;
  `
  host.appendChild(panel)
  return panel
}

// Create price range gradient bar similar to Google's
function createPriceRangeBar(priceData) {
  if (!priceData || priceData.length === 0) return null
  
  const prices = priceData.map(p => p.totalCost).filter(p => p > 0).sort((a, b) => a - b)
  if (prices.length === 0) return null
  
  const min = prices[0]
  const max = prices[prices.length - 1]
  const typical = prices[Math.floor(prices.length * 0.4)] // 40th percentile as "typical"
  
  const container = document.createElement('div')
  container.style.cssText = `
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    margin: 8px 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  `
  
  const header = document.createElement('div')
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;'
  header.innerHTML = `
    <strong style="color:#1a1a1a;">Award prices are currently typical for your search</strong>
    <span style="color:#666;font-size:14px;">${prices.length} programs found</span>
  `
  container.appendChild(header)
  
  const description = document.createElement('div')
  description.style.cssText = 'color:#666;font-size:14px;margin-bottom:12px;'
  description.innerHTML = `The least expensive award flights for this route usually cost between ${formatUSD(min)}-${formatUSD(max)}.`
  container.appendChild(description)
  
  const barContainer = document.createElement('div')
  barContainer.style.cssText = 'position:relative;height:8px;background:linear-gradient(to right, #4caf50 0%, #ffc107 50%, #f44336 100%);border-radius:4px;margin:8px 0;'
  
  const typicalPosition = ((typical - min) / (max - min)) * 100
  const marker = document.createElement('div')
  marker.style.cssText = `
    position: absolute;
    top: -4px;
    left: ${typicalPosition}%;
    width: 16px;
    height: 16px;
    background: #2196f3;
    border: 2px solid #ffffff;
    border-radius: 50%;
    transform: translateX(-50%);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  `
  barContainer.appendChild(marker)
  
  const tooltip = document.createElement('div')
  tooltip.style.cssText = `
    position: absolute;
    bottom: 20px;
    left: ${typicalPosition}%;
    transform: translateX(-50%);
    background: #2196f3;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  `
  tooltip.textContent = `${formatUSD(typical)} is typical`
  barContainer.appendChild(tooltip)
  
  const labels = document.createElement('div')
  labels.style.cssText = 'display:flex;justify-content:space-between;margin-top:8px;'
  labels.innerHTML = `
    <span style="color:#666;font-size:12px;">${formatUSD(min)}</span>
    <span style="color:#666;font-size:12px;">${formatUSD(max)}</span>
  `
  
  container.appendChild(barContainer)
  container.appendChild(labels)
  
  return container
}

function renderGlobalProgramsPanel() {
  if (!lastSeatsSearch || !Array.isArray(lastSeatsSearch.data)) return
  const panel = ensureGlobalProgramsPanel()

  const container = document.createElement('div')
  container.style.cssText = `
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin: 8px 0;
  `

  const header = document.createElement('div')
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:16px;'
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;">
      <strong style="color:#1a1a1a;font-size:16px;">Award Flight Analysis</strong>
      <span style="background:#e3f2fd;color:#1976d2;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:500;">Seats.aero</span>
    </div>
  `
  container.appendChild(header)

  // Add input controls
  const controlsRow = document.createElement('div')
  controlsRow.style.cssText = 'display:flex;align-items:center;gap:16px;margin-bottom:16px;flex-wrap:wrap;'
  
  // Cash price input
  const cashGroup = document.createElement('div')
  cashGroup.style.cssText = 'display:flex;align-items:center;gap:8px;'
  cashGroup.innerHTML = `
    <label style="font-size:14px;color:#666;font-weight:500;">Compare to cash price:</label>
    <input type="number" placeholder="200" style="
      border:1px solid #ddd;
      padding:6px 8px;
      border-radius:4px;
      width:80px;
      font-size:14px;
    " id="bs-cash-price-input">
    <span style="font-size:14px;color:#666;">USD</span>
  `
  
  // Miles value input (showing value for 1000 miles)
  const milesGroup = document.createElement('div')
  milesGroup.style.cssText = 'display:flex;align-items:center;gap:8px;'
  milesGroup.innerHTML = `
    <label style="font-size:14px;color:#666;font-weight:500;">Miles value:</label>
    <input type="number" placeholder="20" step="0.1" style="
      border:1px solid #ddd;
      padding:6px 8px;
      border-radius:4px;
      width:80px;
      font-size:14px;
    " id="bs-miles-value-input">
    <span style="font-size:14px;color:#666;">USD per 1000 miles</span>
  `
  
  controlsRow.appendChild(cashGroup)
  controlsRow.appendChild(milesGroup)
  container.appendChild(controlsRow)

  // Initialize default miles value (average across programs) if empty
  const milesInputEl = document.getElementById('bs-miles-value-input')
  if (milesInputEl && !milesInputEl.value) {
    milesInputEl.value = String(getDefaultMilesValue())
  }

  // Add price range bar
  const priceRangeData = []
  const userCurr = getUserCurrency()
  const customMilesValue = convertToPerMile(parseFloat(document.getElementById('bs-miles-value-input')?.value) || getDefaultMilesValue())
  
  lastSeatsSearch.data.forEach((av) => {
    const programPointValue = customMilesValue || (window.getProgramPointValueBySource ? window.getProgramPointValueBySource(av.Source) : 0.019)
    const taxesCurrency = av.TaxesCurrency || 'USD'
    
    const cab = [
      { key: 'F', miles: av.FMileageCostRaw || av.FDirectMileageCostRaw, taxes: av.FTotalTaxesRaw || av.FDirectTotalTaxesRaw, available: av.FAvailable || av.FAvailableRaw },
      { key: 'J', miles: av.JMileageCostRaw || av.JDirectMileageCostRaw, taxes: av.JTotalTaxesRaw || av.JDirectTotalTaxesRaw, available: av.JAvailable || av.JAvailableRaw },
      { key: 'W', miles: av.WMileageCostRaw || av.WDirectMileageCostRaw, taxes: av.WTotalTaxesRaw || av.WDirectTotalTaxesRaw, available: av.WAvailable || av.WAvailableRaw },
      { key: 'Y', miles: av.YMileageCostRaw || av.YDirectMileageCostRaw, taxes: av.YTotalTaxesRaw || av.YDirectTotalTaxesRaw, available: av.YAvailable || av.YAvailableRaw },
    ]
    
    cab.forEach(c => {
      if (c.available && c.miles && c.miles > 0) {
        const taxesMinor = typeof c.taxes === 'number' ? c.taxes : (parseInt(c.taxes, 10) || 0)
        const taxesUSD = taxesCurrency === 'USD' ? taxesMinor/100 : convertAmount(taxesMinor, taxesCurrency, 'USD')/100
        const totalCost = c.miles * programPointValue + taxesUSD
        priceRangeData.push({ totalCost, program: av.Source, cabin: c.key })
      }
    })
  })
  
  const priceRangeBar = createPriceRangeBar(priceRangeData)
  if (priceRangeBar) {
    container.appendChild(priceRangeBar)
  }

  const content = document.createElement('div')
  content.style.cssText = 'margin-top:16px;gap:12px;flex-direction:column;'
  container.appendChild(content)

  // Function to update content based on input values
  function updateContent() {
    const cashPriceUSD = parseFloat(document.getElementById('bs-cash-price-input')?.value) || null
    const customMilesValue = convertToPerMile(parseFloat(document.getElementById('bs-miles-value-input')?.value) || getDefaultMilesValue())
    content.innerHTML = ''
    
    if (!cashPriceUSD) {
      const msg = document.createElement('div')
      msg.style.cssText = 'text-align:center;opacity:0.6;padding:20px;color:#666;'
      msg.textContent = 'Enter a cash price to see detailed comparisons'
      content.appendChild(msg)
      return
    }

    const userCurr = getUserCurrency()
    lastSeatsSearch.data.forEach((av) => {
      const program = (window.seatsAeroClient && window.seatsAeroClient.mapSourceToProgram(av.Source)) || av.Source || ''
      const programPointValue = customMilesValue
      const taxesCurrency = av.TaxesCurrency || 'USD'

      const row = document.createElement('div')
      row.style.cssText = 'background:#f8f9fa;border:1px solid #e9ecef;border-radius:8px;padding:12px;margin-bottom:8px;'
      const title = document.createElement('div')
      title.style.cssText = 'font-weight:600;color:#1a1a1a;margin-bottom:8px;font-size:14px;'
      title.textContent = program
      row.appendChild(title)

      const bookingClasses = document.createElement('div')
      bookingClasses.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;'

      const cab = [
        { key: 'F', miles: av.FMileageCostRaw || av.FDirectMileageCostRaw, taxes: av.FTotalTaxesRaw || av.FDirectTotalTaxesRaw, available: av.FAvailable || av.FAvailableRaw },
        { key: 'J', miles: av.JMileageCostRaw || av.JDirectMileageCostRaw, taxes: av.JTotalTaxesRaw || av.JDirectTotalTaxesRaw, available: av.JAvailable || av.JAvailableRaw },
        { key: 'W', miles: av.WMileageCostRaw || av.WDirectMileageCostRaw, taxes: av.WTotalTaxesRaw || av.WDirectTotalTaxesRaw, available: av.WAvailable || av.WAvailableRaw },
        { key: 'Y', miles: av.YMileageCostRaw || av.YDirectMileageCostRaw, taxes: av.YTotalTaxesRaw || av.YDirectTotalTaxesRaw, available: av.YAvailable || av.YAvailableRaw },
      ]

      cab.forEach(c => {
        if (!c.available || !c.miles || c.miles <= 0) return
        
        // Use individual cabin taxes if available, otherwise fall back to program-level taxes
        const cabinTaxesMinor = typeof c.taxes === 'number' ? c.taxes : (parseInt(c.taxes, 10) || 0)
        const cabinTaxesUSD = cabinTaxesMinor > 0 ? 
          (taxesCurrency === 'USD' ? cabinTaxesMinor/100 : convertAmount(cabinTaxesMinor, taxesCurrency, 'USD')/100) :
          taxesUSD
        
        const total = c.miles * programPointValue + cabinTaxesUSD
        const savingsPct = ((cashPriceUSD - total) / cashPriceUSD) * 100
        const isGoodDeal = savingsPct > 10

        const classButton = document.createElement('div')
        classButton.style.cssText = `background:${isGoodDeal ? '#e8f5e8' : '#e3f2fd'};border:1px solid ${isGoodDeal ? '#c8e6c9' : '#bbdefb'};border-radius:6px;padding:12px 16px;cursor:pointer;transition:all 0.2s ease;min-width:120px;position:relative;`
        
        classButton.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:16px;font-weight:700;color:#1976d2;">${c.key}</span>
            <span style="font-size:11px;font-weight:600;padding:2px 6px;border-radius:10px;background:${isGoodDeal ? '#4caf50' : '#fff'};color:${isGoodDeal ? '#fff' : '#2e7d32'};border:1px solid ${isGoodDeal ? '#4caf50' : '#c8e6c9'};">${savingsPct >= 0 ? 'Save' : 'More'} ${Math.abs(savingsPct).toFixed(0)}%</span>
          </div>
          <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;font-size:14px;color:#666;">
            <span style="font-weight:600;color:#1976d2;">${Math.round(c.miles/1000)}k</span>
            <span style="color:#999;">+</span>
            <span style="color:#666;">$${cabinTaxesUSD.toFixed(2)}</span>
          </div>
          <div style="font-size:12px;color:#888;font-weight:500;">Total: $${total.toFixed(2)}</div>
        `
        
        // Add hover effect
        classButton.addEventListener('mouseenter', () => {
          classButton.style.transform = 'translateY(-1px)'
          classButton.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
        })
        classButton.addEventListener('mouseleave', () => {
          classButton.style.transform = 'translateY(0)'
          classButton.style.boxShadow = 'none'
        })
        
        bookingClasses.appendChild(classButton)
      })

      if (bookingClasses.children.length > 0) row.appendChild(bookingClasses)
      content.appendChild(row)
    })
  }

  // Update on input change with debouncing
  const cashInput = document.getElementById('bs-cash-price-input')
  const milesInput = document.getElementById('bs-miles-value-input')
  
  let updateTimeout = null
  function debouncedUpdate() {
    if (updateTimeout) clearTimeout(updateTimeout)
    updateTimeout = setTimeout(updateContent, 300)
  }
  
  if (cashInput) {
    cashInput.addEventListener('input', debouncedUpdate)
    cashInput.addEventListener('change', updateContent)
  }
  if (milesInput) {
    milesInput.addEventListener('input', debouncedUpdate)
    milesInput.addEventListener('change', updateContent)
  }

  // Initial update
  updateContent()

  const existing = panel.firstChild
  if (existing) panel.replaceChild(container, existing)
  else panel.appendChild(container)
}

async function fetchSeatsData({ isNonstop }) {
  try {
    if (!window.seatsAeroClient) {
      console.warn('Seats.aero client not available')
      return null
    }
    
    const { from, to, depart } = readFlightInputs()
    console.log('Flight inputs:', { from, to, depart, isNonstop })
    
    if (!from || !to || !depart) {
      console.warn('Missing required inputs:', { from, to, depart })
      return null
    }
    
    const key = `${from}-${to}-${depart}-${depart}-${isNonstop ? '1' : '0'}`
    console.log('Cache key:', key)
    
    if (!pageSeatsCache[key]) {
      console.log('Making Seats.aero API call...')
      pageSeatsCache[key] = window.seatsAeroClient.cachedSearch({
        origin: from,
        destination: to,
        startDate: depart,
        endDate: depart,
        take: 100,
        onlyDirect: !!isNonstop,
        includeFiltered: true,
        orderBy: 'lowest_mileage'
      })
    }
    
    let data = await pageSeatsCache[key]
    console.log('Initial search result:', data)
    lastSeatsSearch = data
    
    // Fallbacks: if no data, retry with connections, then ±1 day window
    if (!data || !Array.isArray(data.data) || data.data.length === 0) {
      console.log('No direct results, trying with connections...')
      const keyConn = `${from}-${to}-${depart}-${depart}-0`
      if (!pageSeatsCache[keyConn]) {
        pageSeatsCache[keyConn] = window.seatsAeroClient.cachedSearch({
          origin: from,
          destination: to,
          startDate: depart,
          endDate: depart,
          take: 100,
          onlyDirect: false,
          includeFiltered: true,
          orderBy: 'lowest_mileage'
        })
      }
      data = await pageSeatsCache[keyConn]
      console.log('Connections search result:', data)
      lastSeatsSearch = data
    }
    
    if (!data || !Array.isArray(data.data) || data.data.length === 0) {
      console.log('No connection results, trying ±1 day range...')
      const d = new Date(depart)
      if (!isNaN(d.getTime())) {
        const prev = new Date(d.getTime() - 24*60*60*1000)
        const next = new Date(d.getTime() + 24*60*60*1000)
        const start = prev.toISOString().slice(0,10)
        const end = next.toISOString().slice(0,10)
        const keyRange = `${from}-${to}-${start}-${end}-0`
        if (!pageSeatsCache[keyRange]) {
          pageSeatsCache[keyRange] = window.seatsAeroClient.cachedSearch({
            origin: from,
            destination: to,
            startDate: start,
            endDate: end,
            take: 100,
            onlyDirect: false,
            includeFiltered: true,
            orderBy: 'lowest_mileage'
          })
        }
        data = await pageSeatsCache[keyRange]
        data && (data._rangeUsed = true)
        console.log('Range search result:', data)
        lastSeatsSearch = data
      }
    }
    
    return data
  } catch (e) {
    console.error('Seats.aero fetch failed:', e)
    return null
  }
}

function pickBestAvailability(data, preferDirect) {
  if (!data || !Array.isArray(data.data) || data.data.length === 0) return null
  const items = data.data.slice()
  
  for (const av of items) {
    av._best = (() => {
      const candidates = []
      
      // Check F class availability
      if (av.FAvailable || av.FAvailableRaw) {
        const miles = preferDirect ? (av.FDirectMileageCostRaw || av.FMileageCostRaw) : (av.FMileageCostRaw || av.FDirectMileageCostRaw)
        const taxes = preferDirect ? (av.FDirectTotalTaxesRaw || av.FTotalTaxesRaw) : (av.FTotalTaxesRaw || av.FDirectTotalTaxesRaw)
        if (miles && miles > 0) {
          candidates.push({ cabin: 'F', miles, taxes: taxes || 0 })
        }
      }
      
      // Check J class availability
      if (av.JAvailable || av.JAvailableRaw) {
        const miles = preferDirect ? (av.JDirectMileageCostRaw || av.JMileageCostRaw) : (av.JMileageCostRaw || av.JDirectMileageCostRaw)
        const taxes = preferDirect ? (av.JDirectTotalTaxesRaw || av.JTotalTaxesRaw) : (av.JTotalTaxesRaw || av.JDirectTotalTaxesRaw)
        if (miles && miles > 0) {
          candidates.push({ cabin: 'J', miles, taxes: taxes || 0 })
        }
      }
      
      // Check W class availability
      if (av.WAvailable || av.WAvailableRaw) {
        const miles = preferDirect ? (av.WDirectMileageCostRaw || av.WMileageCostRaw) : (av.WMileageCostRaw || av.WDirectMileageCostRaw)
        const taxes = preferDirect ? (av.WDirectTotalTaxesRaw || av.WTotalTaxesRaw) : (av.WTotalTaxesRaw || av.WDirectTotalTaxesRaw)
        if (miles && miles > 0) {
          candidates.push({ cabin: 'W', miles, taxes: taxes || 0 })
        }
      }
      
      // Check Y class availability
      if (av.YAvailable || av.YAvailableRaw) {
        const miles = preferDirect ? (av.YDirectMileageCostRaw || av.YMileageCostRaw) : (av.YMileageCostRaw || av.YDirectMileageCostRaw)
        const taxes = preferDirect ? (av.YDirectTotalTaxesRaw || av.YTotalTaxesRaw) : (av.YTotalTaxesRaw || av.YDirectTotalTaxesRaw)
        if (miles && miles > 0) {
          candidates.push({ cabin: 'Y', miles, taxes: taxes || 0 })
        }
      }
      
      if (candidates.length === 0) return null
      
      // Sort by cabin preference: F > J > W > Y, then by miles
      candidates.sort((a, b) => {
        const cabinOrder = { 'F': 0, 'J': 1, 'W': 2, 'Y': 3 }
        const aOrder = cabinOrder[a.cabin] || 999
        const bOrder = cabinOrder[b.cabin] || 999
        if (aOrder !== bOrder) return aOrder - bOrder
        return a.miles - b.miles
      })
      
      return candidates[0]
    })()
  }
  
  const withBest = items.filter(i => i._best)
  if (withBest.length === 0) return null
  
  // Return the item with the best cabin/miles combination
  return withBest[0]
}

// Trigger global panel update when flight data is available
async function triggerGlobalPanelUpdate() {
  try {
    // Fetch data for both direct and connecting flights
    const directData = await fetchSeatsData({ isNonstop: true })
    const connectingData = await fetchSeatsData({ isNonstop: false })
    
    // Combine both datasets to show all available flights (direct + 1 stop)
    // Always prefer connecting data as it includes both direct and connecting flights
    let combinedData = null
    
    // Use connecting data as primary source (includes both direct and connecting)
    if (connectingData && connectingData.data && connectingData.data.length > 0) {
      combinedData = { ...connectingData, data: [...connectingData.data] }
      
      // If we also have direct data, merge unique entries
      if (directData && directData.data && directData.data.length > 0) {
        const connectingIds = new Set(combinedData.data.map(av => av.Id))
        const additionalDirectFlights = directData.data.filter(av => !connectingIds.has(av.Id))
        combinedData.data.push(...additionalDirectFlights)
      }
    } else if (directData && directData.data && directData.data.length > 0) {
      // Fallback to direct data only if no connecting data
      combinedData = { ...directData, data: [...directData.data] }
    }
    
    // Sort by lowest mileage across all cabin classes to show best options first
    if (combinedData && combinedData.data && combinedData.data.length > 0) {
      combinedData.data.sort((a, b) => {
        const getMinMiles = (av) => {
          const miles = [
            av.FMileageCostRaw || av.FDirectMileageCostRaw,
            av.JMileageCostRaw || av.JDirectMileageCostRaw,
            av.WMileageCostRaw || av.WDirectMileageCostRaw,
            av.YMileageCostRaw || av.YDirectMileageCostRaw
          ].filter(m => m && m > 0)
          return miles.length > 0 ? Math.min(...miles) : Infinity
        }
        return getMinMiles(a) - getMinMiles(b)
      })
      lastSeatsSearch = combinedData
    }
    
    // Create the standalone award analysis section (and ensure any old global panel is removed)
    createStandaloneAwardSection()
  } catch (e) {
    console.warn('Failed to update global panel:', e)
  }
}

// Create standalone award analysis section on Google Flights page
function createStandaloneAwardSection() {
  // Remove existing section if it exists
  const existingSection = document.getElementById('bs-standalone-award-section')
  if (existingSection) {
    existingSection.remove()
  }
  // Also remove any legacy global panel if present
  const legacyGlobalPanel = document.getElementById('bs-global-seats-panel')
  if (legacyGlobalPanel) {
    legacyGlobalPanel.remove()
  }
  
  if (!lastSeatsSearch || !lastSeatsSearch.data || lastSeatsSearch.data.length === 0) {
    return
  }
  
  // Find the element with jsname="YdtKid" to insert before it (after class="MqKGaf FlfUOc")
  let targetElement = document.querySelector('[jsname="YdtKid"]')
  
  // Verify that MqKGaf FlfUOc exists and comes before YdtKid
  if (targetElement) {
    const mqkgafElement = document.querySelector('.MqKGaf.FlfUOc')
    if (mqkgafElement) {
      // Check DOM order: if MqKGaf FlfUOc comes after YdtKid, we need a different approach
      const allElements = Array.from(document.body.querySelectorAll('*'))
      const mqkgafIndex = allElements.indexOf(mqkgafElement)
      const ydtkidIndex = allElements.indexOf(targetElement)
      
      if (mqkgafIndex > ydtkidIndex) {
        // MqKGaf FlfUOc comes after YdtKid, find common parent and insert after MqKGaf
        let commonParent = mqkgafElement.parentElement
        while (commonParent && commonParent !== document.body) {
          if (commonParent.contains(targetElement)) {
            // Insert after MqKGaf FlfUOc within the common parent
            targetElement = mqkgafElement.nextSibling || mqkgafElement.parentElement
            break
          }
          commonParent = commonParent.parentElement
        }
      }
      // If MqKGaf comes before YdtKid, inserting before YdtKid will naturally place it after MqKGaf
    }
  }
  
  // Fallback: try to find the main results container
  if (!targetElement) {
    targetElement = document.querySelector('.XwbuFf')
  }
  if (!targetElement) {
    // Try to find the first flight result container
    const firstFlight = document.querySelector('li.pIav2d, .yR1fYc, .mxvQLc')
    if (firstFlight) {
      targetElement = firstFlight.closest('div[class*="XwbuFf"], ul, ol, section') || firstFlight.parentElement
    }
  }
  if (!targetElement) {
    console.log('Target element for Award Flight Analysis not found')
    return
  }
  
  // Create the standalone award section
  const awardSection = document.createElement('div')
  awardSection.id = 'bs-standalone-award-section'
      awardSection.style.cssText = `
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border: 2px solid transparent;
        border-radius: 20px;
        padding: 28px;
        margin: 24px 0;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.06);
        font-family: 'Google Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        overflow: hidden;
        position: relative;
        z-index: 5;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      `
      
      // Add gradient border effect with hover
      const gradientBorder = document.createElement('div')
      gradientBorder.style.cssText = `
        position: absolute;
        inset: 0;
        border-radius: 20px;
        padding: 2px;
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 50%, rgba(0, 0, 0, 0.1) 100%);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
        z-index: -1;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      `
      awardSection.appendChild(gradientBorder)
      
      // Add hover effect
      awardSection.addEventListener('mouseenter', () => {
        awardSection.style.boxShadow = '0 12px 40px rgba(26, 115, 232, 0.15), 0 6px 20px rgba(26, 115, 232, 0.1), 0 0 0 1px rgba(26, 115, 232, 0.2)'
        awardSection.style.transform = 'translateY(-2px)'
        gradientBorder.style.background = 'linear-gradient(135deg, rgba(26, 115, 232, 0.3) 0%, rgba(26, 115, 232, 0.15) 50%, rgba(26, 115, 232, 0.3) 100%)'
      })
      
      awardSection.addEventListener('mouseleave', () => {
        awardSection.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.06)'
        awardSection.style.transform = 'translateY(0)'
        gradientBorder.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 50%, rgba(0, 0, 0, 0.1) 100%)'
      })
  
  // Create header
  const header = document.createElement('div')
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid rgba(0, 0, 0, 0.06);'
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;">
      <div style="font-size:28px;filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));">🏆</div>
      <div>
        <h2 style="margin:0;font-size:22px;font-weight:600;color:#000000;letter-spacing:-0.01em;">Award Flight Analysis</h2>
        <p style="margin:6px 0 0 0;font-size:14px;color:#000000;line-height:1.5;">Compare miles programs and booking classes</p>
      </div>
    </div>
  `
  awardSection.appendChild(header)
  
  // Create controls - all in one row
  const controls = document.createElement('div')
  controls.style.cssText = 'display:flex;gap:20px;margin-bottom:24px;flex-wrap:wrap;align-items:flex-end;'
  controls.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:6px;flex:0 0 auto;">
      <label style="font-size:13px;color:#000000;font-weight:500;margin-left:2px;">Cash Price</label>
      <div style="display:flex;align-items:center;gap:6px;">
        <input type="number" id="bs-standalone-cash-price" placeholder="500" step="0.01" style="
          border:1.5px solid #e0e0e0;
          padding:10px 14px;
          border-radius:10px;
          width:100px;
          font-size:14px;
          background:#ffffff;
          color:#000000;
          transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow:0 1px 3px rgba(0, 0, 0, 0.04);
        ">
        <span style="font-size:13px;color:#000000;font-weight:500;white-space:nowrap;">USD</span>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;flex:0 0 auto;">
      <label style="font-size:13px;color:#000000;font-weight:500;margin-left:2px;">Miles Value</label>
      <div style="display:flex;align-items:center;gap:6px;">
        <input type="number" id="bs-standalone-miles-value" placeholder="" step="0.1" autocomplete="off" name="bs-standalone-miles-value" inputmode="decimal" value="12" style="
          border:1.5px solid #e0e0e0;
          padding:10px 14px;
          border-radius:10px;
          width:100px;
          font-size:14px;
          background:#ffffff;
          color:#000000;
          transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow:0 1px 3px rgba(0, 0, 0, 0.04);
        ">
        <span style="font-size:13px;color:#000000;font-weight:500;white-space:nowrap;">USD per 1000 miles</span>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;flex:0 0 auto;">
      <label style="font-size:13px;color:#000000;font-weight:500;margin-left:2px;">Filter by Booking Class</label>
      <select id="bs-standalone-cabin-filter" style="
        border:1.5px solid #e0e0e0;
        padding:10px 14px;
        border-radius:10px;
        font-size:14px;
        min-width:200px;
        cursor:pointer;
        background:#ffffff;
        color:#000000;
        transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow:0 1px 3px rgba(0, 0, 0, 0.04);
      ">
        <option value="all" selected>All Booking Classes</option>
        <option value="economy">Economy Only (Y)</option>
        <option value="premium-economy">Premium Economy Only (W)</option>
        <option value="business">Business Only (J)</option>
        <option value="first">First Only (F)</option>
      </select>
    </div>
  `
  awardSection.appendChild(controls)
  
  // Create results container
  const resultsContainer = document.createElement('div')
  resultsContainer.id = 'bs-standalone-award-results'
  resultsContainer.style.cssText = 'margin-top:20px;'
  awardSection.appendChild(resultsContainer)
  
  // Add CSS for input focus states
  const style = document.createElement('style')
  style.textContent = `
    #bs-standalone-award-section input:focus,
    #bs-standalone-award-section select:focus {
      outline: none;
      border-color: #1a73e8 !important;
      box-shadow: 0 0 0 4px rgba(26, 115, 232, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08) !important;
      transform: translateY(-1px);
    }
    #bs-standalone-award-section input:hover,
    #bs-standalone-award-section select:hover {
      border-color: #1a73e8 !important;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06) !important;
    }
    #bs-standalone-award-section [style*="display:grid"]:hover {
      background: rgba(26, 115, 232, 0.02) !important;
    }
  `
  document.head.appendChild(style)

  // Clear any stored miles value to use default of 12
  try {
    localStorage.removeItem('bs-standalone-miles-value')
    localStorage.removeItem('bs-miles-value-input')
    const legacyMiles = document.getElementById('bs-miles-value-input')
    if (legacyMiles) { legacyMiles.value = '12'; legacyMiles.defaultValue = '12'; }
  } catch (_) {}
  
  // Insert before target element (earlier in the page)
  targetElement.parentNode.insertBefore(awardSection, targetElement)
  
  // Add event listeners
  const cashPriceInput = document.getElementById('bs-standalone-cash-price')
  const milesValueInput = document.getElementById('bs-standalone-miles-value')
  const cabinFilter = document.getElementById('bs-standalone-cabin-filter')
  
  // Set default Miles Value to 12 if empty
  if (milesValueInput) {
    if (!milesValueInput.value || milesValueInput.value === '' || milesValueInput.value === null) {
      milesValueInput.value = '12'
      milesValueInput.defaultValue = '12'
    }
  }
  
  function updateStandaloneResults() {
    updateStandaloneAwardResults()
  }
  
  if (cashPriceInput) {
    cashPriceInput.addEventListener('input', debounce(updateStandaloneResults, 300))
    cashPriceInput.addEventListener('change', updateStandaloneResults)
  }
  
  if (milesValueInput) {
    // Ensure default value is set to 12 if empty
    if (!milesValueInput.value || milesValueInput.value === '') {
      milesValueInput.value = '12'
      milesValueInput.defaultValue = '12'
    }
    milesValueInput.addEventListener('input', debounce(updateStandaloneResults, 300))
    milesValueInput.addEventListener('change', updateStandaloneResults)
  }
  
  // Add filter event listener
  if (cabinFilter) {
    cabinFilter.addEventListener('change', updateStandaloneResults)
    
    // Sync cabin filter with Flight Search cabin selection (bidirectional)
    setupCabinSync()
  }
  
  // Do not set a default for miles value; leave empty to use Supabase market CPM
  
  // Sync cash price from CASM if available
  const casmCashInput = document.getElementById('bs-casm-cash-price')
  if (casmCashInput && casmCashInput.value && cashPriceInput) {
    cashPriceInput.value = casmCashInput.value
    cashPriceInput.dispatchEvent(new Event('input', { bubbles: true }))
  }
  
  // Initial update
  updateStandaloneResults()
  
  // Try to extract and fill price from Google Flights after section is created
  setTimeout(() => {
    extractAndFillPriceFromGoogleFlights()
    // Also try to extract and fill airline
    if (typeof window.extractAndFillAirlineFromGoogleFlights === 'function') {
      window.extractAndFillAirlineFromGoogleFlights()
    }
  }, 500)
}

// Setup bidirectional cabin synchronization between Flight Search and Award Flight Analysis
function setupCabinSync() {
  const flightCabinSelect = document.getElementById('bs-flight-cabin')
  const awardCabinFilter = document.getElementById('bs-standalone-cabin-filter')
  
  if (!flightCabinSelect || !awardCabinFilter) return
  
  // Map Flight Search cabin values to Award Filter values
  const flightToAwardMap = {
    'economy': 'economy',
    'business': 'business',
    'first': 'first',
    'premium_economy': 'premium-economy'
  }
  
  // Map Award Filter values to Flight Search cabin values
  const awardToFlightMap = {
    'economy': 'economy',
    'premium-economy': 'premium_economy',
    'business': 'business',
    'first': 'first',
    'all': 'economy' // Default to economy if "all" is selected
  }
  
  let isSyncing = false // Prevent infinite loops
  
  // Sync from Flight Search to Award Filter
  function syncFlightToAward() {
    if (isSyncing) return
    isSyncing = true
    
    const flightValue = flightCabinSelect.value
    const awardValue = flightToAwardMap[flightValue] || 'all'
    
    if (awardCabinFilter.value !== awardValue) {
      awardCabinFilter.value = awardValue
      awardCabinFilter.dispatchEvent(new Event('change', { bubbles: true }))
    }
    
    isSyncing = false
  }
  
  // Sync from Award Filter to Flight Search
  function syncAwardToFlight() {
    if (isSyncing) return
    isSyncing = true
    
    const awardValue = awardCabinFilter.value
    const flightValue = awardToFlightMap[awardValue] || 'economy'
    
    if (flightCabinSelect.value !== flightValue) {
      flightCabinSelect.value = flightValue
      flightCabinSelect.dispatchEvent(new Event('change', { bubbles: true }))
    }
    
    isSyncing = false
  }
  
  // Add event listeners
  flightCabinSelect.addEventListener('change', syncFlightToAward)
  awardCabinFilter.addEventListener('change', syncAwardToFlight)
  
  // Initial sync from Flight Search to Award Filter
  setTimeout(() => {
    syncFlightToAward()
  }, 100)
}

// Update standalone award results
// Store sort state for award tables
if (!window.__awardTableSortState) {
  window.__awardTableSortState = {}
}

function updateStandaloneAwardResults() {
  const resultsContainer = document.getElementById('bs-standalone-award-results')
  if (!resultsContainer) return
  
  if (!lastSeatsSearch || !lastSeatsSearch.data || lastSeatsSearch.data.length === 0) {
    resultsContainer.innerHTML = '<div style="text-align:center;padding:40px;color:#000000;font-style:italic;background:linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);border-radius:16px;border:1px solid rgba(0, 0, 0, 0.06);">No award data available. Please check your flight details and try again.</div>'
    return
  }
  
  const cashPriceUSD = parseFloat(document.getElementById('bs-standalone-cash-price')?.value) || null
  const milesValueInput = document.getElementById('bs-standalone-miles-value')
  const milesPerThousandRaw = parseFloat(milesValueInput?.value)
  const hasMilesValueInput = milesValueInput?.value !== '' && milesValueInput?.value !== null && milesValueInput?.value !== undefined
  const customMilesValue = (hasMilesValueInput && !isNaN(milesPerThousandRaw))
    ? convertToPerMile(milesPerThousandRaw)
    : null
  
  if (!cashPriceUSD) {
    resultsContainer.innerHTML = '<div style="text-align:center;padding:40px;color:#000000;font-style:italic;background:linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);border-radius:16px;border:1px solid rgba(0, 0, 0, 0.06);">Please enter a cash price to see award analysis</div>'
    return
  }
  
  // Get filter state from dropdown
  const cabinFilter = document.getElementById('bs-standalone-cabin-filter')
  const filterValue = cabinFilter?.value || 'all'
  
  // Convert dropdown value to individual filter states
  let economyFilter = true
  let premiumFilter = true
  let businessFilter = true
  let firstFilter = true
  
  if (filterValue === 'economy') {
    premiumFilter = false
    businessFilter = false
    firstFilter = false
  } else if (filterValue === 'premium-economy') {
    economyFilter = false
    businessFilter = false
    firstFilter = false
  } else if (filterValue === 'business') {
    economyFilter = false
    premiumFilter = false
    firstFilter = false
  } else if (filterValue === 'first') {
    economyFilter = false
    premiumFilter = false
    businessFilter = false
  }
  // else 'all' - all filters remain true
  
  let html = ''

  // First pass: prepare programs with computed totals for sorting
  const programEntries = []

  lastSeatsSearch.data.forEach((av) => {
    // Determine per-mile USD value
    let programPointValue = null
    if (hasMilesValueInput && !isNaN(milesPerThousandRaw)) {
      programPointValue = customMilesValue // user-defined USD per mile
    } else {
      // Use static market value (USD per 1000 miles) if available
      let marketPerThousand = null
      if (typeof window.getMarketCPMBySource === 'function') {
        try {
          const v = window.getMarketCPMBySource(av.Source)
          if (typeof v === 'number' && isFinite(v) && v > 0) {
            marketPerThousand = v
          }
        } catch(_){}
      }
      if (marketPerThousand == null && window.__marketCpmBySource && typeof window.__marketCpmBySource[av.Source] === 'number') {
        marketPerThousand = window.__marketCpmBySource[av.Source]
      }
      if (typeof marketPerThousand === 'number' && isFinite(marketPerThousand) && marketPerThousand >= 0) {
        window.__marketCpmBySource = window.__marketCpmBySource || {}
        window.__marketCpmBySource[av.Source] = marketPerThousand
        programPointValue = marketPerThousand / 1000
      } else {
        programPointValue = 0 // render taxes-only until value is available
      }
    }
    const taxesCurrency = av.TaxesCurrency || 'USD'
    const taxesMinor = typeof av.Taxes === 'number' ? av.Taxes : (parseInt(av.Taxes, 10) || 0)
    const taxesUSD = taxesCurrency === 'USD' ? taxesMinor/100 : convertAmount(taxesMinor, taxesCurrency, 'USD')/100
    
    // If we don't have programPointValue yet (awaiting Supabase), render using 0 (taxes-only)
    if (programPointValue === null) {
      programPointValue = 0
    }

    const cab = [
      { key: 'F', miles: av.FMileageCostRaw || av.FDirectMileageCostRaw, taxes: av.FTotalTaxesRaw || av.FDirectTotalTaxesRaw, available: av.FAvailable || av.FAvailableRaw },
      { key: 'J', miles: av.JMileageCostRaw || av.JDirectMileageCostRaw, taxes: av.JTotalTaxesRaw || av.JDirectTotalTaxesRaw, available: av.JAvailable || av.JAvailableRaw },
      { key: 'W', miles: av.WMileageCostRaw || av.WDirectMileageCostRaw, taxes: av.WTotalTaxesRaw || av.WDirectTotalTaxesRaw, available: av.WAvailable || av.WAvailableRaw },
      { key: 'Y', miles: av.YMileageCostRaw || av.YDirectMileageCostRaw, taxes: av.YTotalTaxesRaw || av.YDirectTotalTaxesRaw, available: av.YAvailable || av.YAvailableRaw },
    ]
    
    // Filter and prepare cabin data
    const filteredCabins = cab.filter(c => {
      if (!c.available || !c.miles || c.miles <= 0) return false
      
      // Apply booking class filters
      if (c.key === 'F' && !firstFilter) return false
      if (c.key === 'J' && !businessFilter) return false
      if (c.key === 'W' && !premiumFilter) return false
      if (c.key === 'Y' && !economyFilter) return false
      
      return true
    })
    
    if (filteredCabins.length === 0) return // Skip programs with no matching cabins
    
    // Sort by total cost (miles + taxes) - lowest first
    filteredCabins.sort((a, b) => {
      const aTaxesMinor = typeof a.taxes === 'number' ? a.taxes : (parseInt(a.taxes, 10) || 0)
      const aTaxesUSD = aTaxesMinor > 0 ? 
        (taxesCurrency === 'USD' ? aTaxesMinor/100 : convertAmount(aTaxesMinor, taxesCurrency, 'USD')/100) :
        taxesUSD
      const aTotal = a.miles * programPointValue + aTaxesUSD
      
      const bTaxesMinor = typeof b.taxes === 'number' ? b.taxes : (parseInt(b.taxes, 10) || 0)
      const bTaxesUSD = bTaxesMinor > 0 ? 
        (taxesCurrency === 'USD' ? bTaxesMinor/100 : convertAmount(bTaxesMinor, taxesCurrency, 'USD')/100) :
        taxesUSD
      const bTotal = b.miles * programPointValue + bTaxesUSD
      
      return aTotal - bTotal
    })
    const minTotal = (() => {
      if (filteredCabins.length === 0) return Infinity
      const c0 = filteredCabins[0]
      const tMinor = typeof c0.taxes === 'number' ? c0.taxes : (parseInt(c0.taxes, 10) || 0)
      const tUSD = tMinor > 0 ? (taxesCurrency === 'USD' ? tMinor/100 : convertAmount(tMinor, taxesCurrency, 'USD')/100) : taxesUSD
      return c0.miles * programPointValue + tUSD
    })()

    programEntries.push({ av, filteredCabins, programPointValue, taxesCurrency, taxesUSD, minTotal })
  })

  // Sort programs by their lowest total ascending
  programEntries.sort((a, b) => a.minTotal - b.minTotal)

  // Collect all program/cabin combinations for grid display
  const allCombinations = []
  programEntries.forEach(({ av, filteredCabins, programPointValue, taxesCurrency, taxesUSD }) => {
    filteredCabins.forEach(c => {
      // Use individual cabin taxes if available, otherwise fall back to program-level taxes
      const cabinTaxesMinor = typeof c.taxes === 'number' ? c.taxes : (parseInt(c.taxes, 10) || 0)
      const cabinTaxesUSD = cabinTaxesMinor > 0 ? 
        (taxesCurrency === 'USD' ? cabinTaxesMinor/100 : convertAmount(cabinTaxesMinor, taxesCurrency, 'USD')/100) :
        taxesUSD
      
      const total = c.miles * programPointValue + cabinTaxesUSD
      const savingsPct = ((cashPriceUSD - total) / cashPriceUSD) * 100
      const isGoodDeal = savingsPct > 0
      const cabinName = c.key === 'J' ? 'Business' : c.key === 'F' ? 'First' : c.key === 'W' ? 'Premium Economy' : 'Economy'

      const effectiveCpmCents = c.miles > 0 ? (((cashPriceUSD - cabinTaxesUSD) / c.miles) * 100) : null
      const programAvgCpmCents = (function(){
        // Prefer market CPM if present in cache or static getter
        let marketPerThousand = null
        if (window.__marketCpmBySource && typeof window.__marketCpmBySource[av.Source] === 'number') {
          marketPerThousand = window.__marketCpmBySource[av.Source]
        } else if (typeof window.getMarketCPMBySource === 'function') {
          try {
            const v = window.getMarketCPMBySource(av.Source)
            if (typeof v === 'number') {
              marketPerThousand = v
              window.__marketCpmBySource = window.__marketCpmBySource || {}
              window.__marketCpmBySource[av.Source] = v
            }
          } catch(_){}
        }
        if (typeof marketPerThousand === 'number' && marketPerThousand > 0) {
          return marketPerThousand / 10 // convert USD/1000 -> cents/mile
        }
        // fallback to loyalty average if market not available
        return (window.getProgramPointValueBySource ? window.getProgramPointValueBySource(av.Source) : 0.019) * 100
      })()
      
      let cpmDisplay = ''
      let ratioDisplay = ''
      let cpmBetterPct = 0
      let isBetterCpm = false
      if (effectiveCpmCents !== null && isFinite(effectiveCpmCents)) {
        const marketPerThousand = (window.__marketCpmBySource && typeof window.__marketCpmBySource[av.Source] === 'number') ? window.__marketCpmBySource[av.Source] : null
        const avgCpm = (typeof marketPerThousand === 'number') ? (marketPerThousand / 10) : programAvgCpmCents
        isBetterCpm = effectiveCpmCents >= avgCpm
        cpmBetterPct = avgCpm > 0 ? Math.max(0, Math.min(100, ((effectiveCpmCents - avgCpm) / avgCpm) * 100)) : 0
        const ratio = avgCpm > 0 ? (effectiveCpmCents / avgCpm) : null
        ratioDisplay = (ratio && isFinite(ratio)) ? `${(Math.round(ratio * 10) / 10).toString().replace(/\.0$/, '')}x` : ''
        cpmDisplay = `${effectiveCpmCents.toFixed(1)}¢${ratioDisplay ? ` - ${ratioDisplay}` : ''}`
      }
      
      allCombinations.push({
        program: av.Source,
        class: c.key,
        cabin: cabinName,
        cabinKey: c.key, // Keep original key for grouping
        miles: c.miles,
        taxes: cabinTaxesUSD,
        total: total,
        savingsPct: savingsPct,
        isGoodDeal: isGoodDeal,
        cpmDisplay: cpmDisplay,
        cpmBetterPct: cpmBetterPct,
        isBetterCpm: isBetterCpm,
        effectiveCpmCents: effectiveCpmCents
      })
    })
  })
  
  // Group by cabin class if "all" is selected
  let groupedCombinations = {}
  if (filterValue === 'all') {
    // Group by cabin class: F (First), J (Business), W (Premium Economy), Y (Economy)
    allCombinations.forEach(combo => {
      const cabinKey = combo.cabinKey
      if (!groupedCombinations[cabinKey]) {
        groupedCombinations[cabinKey] = []
      }
      groupedCombinations[cabinKey].push(combo)
    })
    
    // Sort each group by total cost
    Object.keys(groupedCombinations).forEach(key => {
      groupedCombinations[key].sort((a, b) => a.total - b.total)
    })
      } else {
    // If not "all", just use all combinations as-is
    groupedCombinations = { 'all': allCombinations }
  }

  // Render in table view with auto-width columns
  html += `<style>
    .bs-award-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    .bs-award-table thead {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }
    .bs-award-table th {
      padding: 12px 16px;
      text-align: left;
      font-size: 13px;
      font-weight: 700;
      color: #000000;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #dee2e6;
      white-space: nowrap;
      position: relative;
      user-select: none;
    }
    .bs-award-table th.sortable {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    .bs-award-table th.sortable:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    .bs-award-table th.sortable::after {
      content: ' ↕';
      opacity: 0.3;
      font-size: 12px;
      margin-left: 4px;
    }
    .bs-award-table th.sortable.sort-asc::after {
      content: ' ↑';
      opacity: 1;
      color: #000000;
    }
    .bs-award-table th.sortable.sort-desc::after {
      content: ' ↓';
      opacity: 1;
      color: #000000;
    }
    .bs-award-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #e9ecef;
      font-size: 14px;
      vertical-align: middle;
      color: #000000;
    }
    .bs-award-table tbody tr {
      transition: background-color 0.2s ease;
    }
    .bs-award-table tbody tr:hover {
      background-color: #f8f9fa;
    }
    .bs-award-table tbody tr:last-child td {
      border-bottom: none;
    }
    .bs-award-table .bs-good-deal {
      background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%);
    }
    .bs-award-table .bs-bad-deal {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    }
  </style>`
  
  // Function to render a table of combinations
  const renderCombinationsTable = (combinations, cabinClassLabel = null, sortColumn = null, sortDirection = 'asc', filterValue = 'all', tableKey = null) => {
    if (combinations.length === 0) return ''
    
    // Sort combinations - default to multi-criteria sort if no sortColumn specified
    let sortedCombinations = [...combinations]
    const effectiveSortColumn = sortColumn
    const effectiveSortDirection = sortColumn ? sortDirection : 'asc'
    
    if (effectiveSortColumn) {
      // User-selected column sort
      sortedCombinations.sort((a, b) => {
        let aVal, bVal
        
        switch(effectiveSortColumn) {
          case 'program':
            aVal = a.program.toLowerCase()
            bVal = b.program.toLowerCase()
            break
          case 'class':
            aVal = a.class
            bVal = b.class
            break
          case 'cabin':
            aVal = a.cabin
            bVal = b.cabin
            break
          case 'miles':
            aVal = a.miles
            bVal = b.miles
            break
          case 'taxes':
            aVal = a.taxes
            bVal = b.taxes
            break
          case 'total':
            aVal = a.total
            bVal = b.total
            break
          case 'cpm':
            aVal = a.effectiveCpmCents !== null ? a.effectiveCpmCents : -Infinity
            bVal = b.effectiveCpmCents !== null ? b.effectiveCpmCents : -Infinity
            break
          case 'savings':
            aVal = a.savingsPct
            bVal = b.savingsPct
            break
          default:
            return 0
        }
        
        // Handle string comparison
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return effectiveSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        }
        
        // Handle number comparison
        if (aVal < bVal) return effectiveSortDirection === 'asc' ? -1 : 1
        if (aVal > bVal) return effectiveSortDirection === 'asc' ? 1 : -1
        return 0
      })
    } else {
      // Default multi-criteria sort: Highest CPM -> Lowest Miles -> Lowest Total -> Lowest Savings
      sortedCombinations.sort((a, b) => {
        // 1. Highest CPM first (descending)
        const aCpm = a.effectiveCpmCents !== null ? a.effectiveCpmCents : -Infinity
        const bCpm = b.effectiveCpmCents !== null ? b.effectiveCpmCents : -Infinity
        if (aCpm !== bCpm) {
          return bCpm - aCpm // Descending (highest first)
        }
        
        // 2. Lowest miles (ascending)
        if (a.miles !== b.miles) {
          return a.miles - b.miles // Ascending (lowest first)
        }
        
        // 3. Lowest total (ascending)
        if (a.total !== b.total) {
          return a.total - b.total // Ascending (lowest first)
        }
        
        // 4. Lowest savings (ascending - most negative first)
        return a.savingsPct - b.savingsPct // Ascending (lowest/most negative first)
      })
    }
    
    let tableHtml = ''
    
    // Add section header if cabin class label is provided
    if (cabinClassLabel) {
      tableHtml += `<div style="margin-bottom:16px;margin-top:24px;">`
      tableHtml += `<h3 style="font-size:18px;font-weight:700;color:#000000;margin:0 0 16px 0;padding-bottom:8px;border-bottom:2px solid #e9ecef;">${cabinClassLabel}</h3>`
      tableHtml += `</div>`
    }
    
    const sortClass = (col) => {
      // For default multi-criteria sort, highlight CPM column as the primary sort
      const activeColumn = sortColumn || 'cpm'
      const activeDirection = sortColumn ? sortDirection : 'desc'
      if (activeColumn === col) {
        return `sortable sort-${activeDirection}`
      }
      return 'sortable'
    }
    
    // Use provided tableKey or generate one
    const finalTableKey = tableKey || (cabinClassLabel ? `${filterValue}_${cabinClassLabel.replace(/\s+/g, '_')}` : filterValue || 'default')
    
    tableHtml += `<table class="bs-award-table" data-table-key="${finalTableKey}">`
    tableHtml += `<thead>`
    tableHtml += `<tr>`
    tableHtml += `<th class="${sortClass('program')}" data-sort="program" style="width: auto;">Program</th>`
    tableHtml += `<th class="${sortClass('class')}" data-sort="class" style="width: auto;">Class</th>`
    tableHtml += `<th class="${sortClass('cabin')}" data-sort="cabin" style="width: auto;">Cabin</th>`
    tableHtml += `<th class="${sortClass('miles')}" data-sort="miles" style="width: auto;">Miles</th>`
    tableHtml += `<th class="${sortClass('taxes')}" data-sort="taxes" style="width: auto;">Taxes</th>`
    tableHtml += `<th class="${sortClass('total')}" data-sort="total" style="width: auto;">Total</th>`
    tableHtml += `<th class="${sortClass('cpm')}" data-sort="cpm" style="width: auto;">CPM</th>`
    tableHtml += `<th class="${sortClass('savings')}" data-sort="savings" style="width: auto;">Savings</th>`
    tableHtml += `</tr>`
    tableHtml += `</thead>`
    tableHtml += `<tbody>`
    
    // Calculate min and max miles for color coding
    const milesValues = sortedCombinations.map(c => c.miles)
    const minMiles = Math.min(...milesValues)
    const maxMiles = Math.max(...milesValues)
    const milesRange = maxMiles - minMiles
    
    sortedCombinations.forEach(combo => {
      const rowClass = combo.isGoodDeal ? 'bs-good-deal' : 'bs-bad-deal'
      const programName = combo.program.toLowerCase()
      
      // Calculate color ratio: 0 = cheapest (green), 1 = most expensive (red)
      const milesRatio = milesRange > 0 ? (combo.miles - minMiles) / milesRange : 0
      
      // Use same background style as savings: green for cheapest, red for most expensive
      // Green: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%) with border #4caf50
      // Red: linear-gradient(135deg, #fdecea 0%, #fcc5c0 100%) with border #f44336
      const isCheapestMiles = milesRatio <= 0.5 // Cheapest half gets green, most expensive half gets red
      const milesBg = isCheapestMiles
        ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
        : 'linear-gradient(135deg, #fdecea 0%, #fcc5c0 100%)'
      const milesBorder = isCheapestMiles ? '#4caf50' : '#f44336'
      
      tableHtml += `<tr class="${rowClass}">`
      
      // Program
      tableHtml += `<td style="font-weight: 700; text-transform: capitalize;">${programName}</td>`
      
      // Class
      tableHtml += `<td><span style="background:linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);color:#000000;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:700;border:1.5px solid #90caf9;display:inline-block;">${combo.class}</span></td>`
      
      // Cabin
      tableHtml += `<td style="color:#000000;font-weight:600;">${combo.cabin}</td>`
      
      // Miles - color coded from green (cheapest) to red (most expensive)
      tableHtml += `<td><span style="background:${milesBg};color:#000000;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:700;border:1.5px solid ${milesBorder};display:inline-block;">✈️ ${formatMilesDots(combo.miles)}</span></td>`
      
      // Taxes
      tableHtml += `<td><span style="background:linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);color:#000000;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:700;border:1.5px solid #fca5a5;display:inline-block;">💰 $${combo.taxes.toFixed(2)}</span></td>`
      
      // Total
      tableHtml += `<td style="font-weight: 700; color: #000000;">$${combo.total.toFixed(2)}</td>`
      
      // CPM
      if (combo.cpmDisplay && combo.effectiveCpmCents !== null) {
        const cpmParts = combo.cpmDisplay.split(' - ')
        const cpmValue = cpmParts[0]
        const cpmRatio = cpmParts[1] || ''
        const cpmBg = combo.isBetterCpm 
          ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
          : 'linear-gradient(135deg, #fdecea 0%, #fcc5c0 100%)'
        const cpmBorder = combo.isBetterCpm ? '#4caf50' : '#f44336'
        tableHtml += `<td><span style="background:${cpmBg};color:#000;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:700;border:1.5px solid ${cpmBorder};display:inline-block;">${cpmValue}${cpmRatio ? ` - ${cpmRatio}` : ''}</span></td>`
      } else {
        tableHtml += `<td style="color: #000000;">—</td>`
      }
      
      // Savings
      const savingsBg = combo.isGoodDeal
        ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
        : 'linear-gradient(135deg, #fdecea 0%, #fcc5c0 100%)'
      const savingsBorder = combo.isGoodDeal ? '#4caf50' : '#f44336'
      tableHtml += `<td><span style="background:${savingsBg};color:#000;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:700;border:1.5px solid ${savingsBorder};display:inline-block;">${combo.isGoodDeal ? 'Save' : 'More'} ${Math.abs(combo.savingsPct).toFixed(0)}%</span></td>`
      
      tableHtml += `</tr>`
    })
    
    tableHtml += `</tbody>`
    tableHtml += `</table>`
    return tableHtml
  }
  
  // Get sort state for this table (use filterValue as key to separate sort states per filter)
  const sortKey = filterValue === 'all' ? 'all' : filterValue
  // Default to multi-criteria sort (null means use default multi-criteria logic)
  const currentSort = window.__awardTableSortState[sortKey] || { column: null, direction: 'asc' }
  
  // Initialize sort state (null means use default multi-criteria sort) if not set
  if (!window.__awardTableSortState[sortKey]) {
    window.__awardTableSortState[sortKey] = { column: null, direction: 'asc' }
  }
  
  // Render grouped by cabin class if "all" is selected, otherwise render all together
  if (filterValue === 'all') {
    // Define cabin class order and labels
    const cabinClassOrder = ['F', 'J', 'W', 'Y']
    const cabinClassLabels = {
      'F': 'First Class',
      'J': 'Business Class',
      'W': 'Premium Economy',
      'Y': 'Economy Class'
    }
    
    // Render each cabin class group with sort state
    cabinClassOrder.forEach(cabinKey => {
      if (groupedCombinations[cabinKey] && groupedCombinations[cabinKey].length > 0) {
        const cabinLabel = cabinClassLabels[cabinKey]
        const tableKey = `${filterValue}_${cabinLabel.replace(/\s+/g, '_')}`
        const tableSort = window.__awardTableSortState[tableKey] || { column: null, direction: 'asc' }
        // Initialize sort state for this table if not set (null means use default multi-criteria sort)
        if (!window.__awardTableSortState[tableKey]) {
          window.__awardTableSortState[tableKey] = { column: null, direction: 'asc' }
        }
        html += renderCombinationsTable(groupedCombinations[cabinKey], cabinLabel, tableSort.column, tableSort.direction, filterValue, tableKey)
      }
    })
  } else {
    // Render all combinations together (single group)
    const singleTableKey = filterValue || 'default'
    const singleTableSort = window.__awardTableSortState[singleTableKey] || { column: null, direction: 'asc' }
    // Initialize sort state for this table if not set (null means use default multi-criteria sort)
    if (!window.__awardTableSortState[singleTableKey]) {
      window.__awardTableSortState[singleTableKey] = { column: null, direction: 'asc' }
    }
    html += renderCombinationsTable(groupedCombinations['all'] || [], null, singleTableSort.column, singleTableSort.direction, filterValue, singleTableKey)
  }
  
  resultsContainer.innerHTML = html
  
  // Add event listeners for sortable headers
  setTimeout(() => {
    const tables = resultsContainer.querySelectorAll('.bs-award-table')
    tables.forEach(table => {
      const headers = table.querySelectorAll('th.sortable')
      headers.forEach(header => {
        header.addEventListener('click', function() {
          const sortColumn = this.getAttribute('data-sort')
          const tableKey = this.closest('table').getAttribute('data-table-key') || 'default'
          
          // Get current sort state for this table
          const currentTableSort = window.__awardTableSortState[tableKey] || { column: null, direction: 'asc' }
          
          // Determine new sort direction
          let newDirection = 'asc'
          if (currentTableSort.column === sortColumn && currentTableSort.direction === 'asc') {
            newDirection = 'desc'
          }
          
          // Update sort state
          window.__awardTableSortState[tableKey] = {
            column: sortColumn,
            direction: newDirection
          }
          
          // Re-render the results
          updateStandaloneAwardResults()
        })
      })
    })
  }, 0)
}

// Create savings bar indicator
function createSavingsBar(savingsPct) {
  const maxSavings = 100
  const normalizedSavings = Math.min(Math.max(savingsPct, 0), maxSavings)
  const position = (normalizedSavings / maxSavings) * 100

  return `
    <div style="position: relative; height: 8px; width: 100%; background: linear-gradient(to right, #f44336 0%, #ffc107 50%, #4caf50 100%); border-radius: 4px; margin: 4px 0; box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);">
      <div style="position: absolute; top: 8px; left: ${position}%; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 8px solid #1a73e8; transform: translateX(-50%); filter: drop-shadow(0 2px 4px rgba(26, 115, 232, 0.3));"></div>
    </div>
  `
}

// Call Lufthansa API and display results
// paramsOrUrl can be either a URL string or a params object
async function callLufthansaAPI(paramsOrUrl, combo) {
  if (!window.lufthansaClient) {
    console.error('Lufthansa client not available')
    alert('Lufthansa API client not loaded. Please refresh the page.')
    return
  }

  // Parse parameters if it's a URL
  let params, displayParams
  if (typeof paramsOrUrl === 'string') {
    // It's a URL - parse it
    params = window.lufthansaClient.parseMilesAndMoreUrl(paramsOrUrl)
    displayParams = params
  } else {
    // It's already a params object
    params = paramsOrUrl
    displayParams = params
  }

  // Create a modal to show loading and results
  const modalId = `lufthansa-api-modal-${Date.now()}`
  const modal = document.createElement('div')
  modal.id = modalId
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `

  const modalContent = document.createElement('div')
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    position: relative;
  `

  const searchInfo = typeof paramsOrUrl === 'string' 
    ? `Parsing URL: ${paramsOrUrl.substring(0, 80)}...`
    : `Searching for flights: ${params.origin || 'N/A'} → ${params.destination || 'N/A'} on ${params.departureDate || 'N/A'}...`

  modalContent.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #1a1a1a;">Lufthansa Miles & More API Results</h2>
      <button id="${modalId}-close" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">&times;</button>
    </div>
    <div id="${modalId}-content" style="color: #666;">
      <p>${searchInfo}</p>
      <div style="text-align: center; padding: 20px;">
        <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #1a73e8; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      </div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `

  modal.appendChild(modalContent)
  document.body.appendChild(modal)

  // Close button handler
  document.getElementById(`${modalId}-close`).addEventListener('click', () => {
    document.body.removeChild(modal)
  })

  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal)
    }
  })

  try {
    const contentDiv = document.getElementById(`${modalId}-content`)
    
    // Call the API (it can accept either URL string or params object)
    const results = await window.lufthansaClient.searchAwardFlights(paramsOrUrl)
    
    // Display results
    let resultsHtml = `
      <div style="margin-bottom: 16px; padding: 12px; background: #f8f9fa; border-radius: 8px;">
        <strong>Search Parameters:</strong><br>
        ${typeof paramsOrUrl === 'string' ? `<strong>URL:</strong> ${paramsOrUrl}<br><br>` : ''}
        Origin: ${displayParams.origin || 'N/A'}<br>
        Destination: ${displayParams.destination || 'N/A'}<br>
        Departure: ${displayParams.departureDate || 'N/A'}<br>
        ${displayParams.returnDate ? `Return: ${displayParams.returnDate}<br>` : ''}
        Cabin: ${displayParams.cabinClass || 'N/A'}<br>
        Passengers: ${displayParams.adults || 1} adult(s)
      </div>
      <div style="margin-top: 20px;">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700;">API Response:</h3>
        <pre style="background: #f8f9fa; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 12px; max-height: 400px; overflow-y: auto;">${JSON.stringify(results, null, 2)}</pre>
      </div>
      <div style="margin-top: 16px; padding: 12px; background: #e8f0fe; border-radius: 8px; border-left: 4px solid #1a73e8;">
        <strong>Note:</strong> This is the raw API response. The Lufthansa API may require authentication (OAuth token) to work properly. 
        If you see an error, the API may require client credentials or user authentication.
      </div>
    `
    
    contentDiv.innerHTML = resultsHtml
  } catch (error) {
    const contentDiv = document.getElementById(`${modalId}-content`)
    contentDiv.innerHTML = `
      <div style="padding: 20px; background: #fee2e2; border-radius: 8px; border-left: 4px solid #dc2626;">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #dc2626;">API Error</h3>
        <p style="margin: 0 0 8px 0; color: #991b1b;"><strong>Error:</strong> ${error.message}</p>
        <p style="margin: 0; font-size: 14px; color: #991b1b;">
          The Lufthansa API may require:
          <ul style="margin: 8px 0 0 20px; padding: 0;">
            <li>OAuth authentication (client credentials)</li>
            <li>User authentication (logged-in session)</li>
            <li>Specific request format or headers</li>
          </ul>
          <br>
          <strong>Tip:</strong> Click the link normally (without Ctrl/Cmd) to open the Lufthansa website directly.
        </p>
      </div>
    `
    console.error('Lufthansa API error:', error)
  }
}

// Debounce utility function
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Make functions available globally
window.triggerGlobalPanelUpdate = triggerGlobalPanelUpdate

// Booking class definitions and explanations
const BOOKING_CLASSES = {
  economy: {
    codes: ['Y', 'B', 'M', 'H', 'Q', 'V', 'W', 'S', 'T', 'L', 'U', 'E', 'N', 'R'],
    name: 'Economy',
    description: 'Standard economy class seating'
  },
  premiumEconomy: {
    codes: ['W', 'S', 'T'],
    name: 'Premium Economy', 
    description: 'Enhanced economy with more legroom and amenities'
  },
  business: {
    codes: ['J', 'C', 'D', 'I', 'Z', 'P'],
    name: 'Business',
    description: 'Business class with lie-flat seats and premium service'
  },
  first: {
    codes: ['F', 'A', 'P'],
    name: 'First',
    description: 'First class with the highest level of luxury and service'
  }
}

// Get booking class category from fare class code
function getBookingClassCategory(fareClass) {
  for (const [category, info] of Object.entries(BOOKING_CLASSES)) {
    if (info.codes.includes(fareClass)) {
      return category
    }
  }
  return 'economy' // default fallback
}

// Check if a booking class should be shown based on filters
function shouldShowBookingClass(fareClass) {
  const economyFilter = document.getElementById('bs-filter-economy')?.checked ?? true
  const premiumFilter = document.getElementById('bs-filter-premium-economy')?.checked ?? true
  const businessFilter = document.getElementById('bs-filter-business')?.checked ?? true
  const firstFilter = document.getElementById('bs-filter-first')?.checked ?? true
  
  const category = getBookingClassCategory(fareClass)
  
  switch (category) {
    case 'economy': return economyFilter
    case 'premiumEconomy': return premiumFilter
    case 'business': return businessFilter
    case 'first': return firstFilter
    default: return true
  }
}

// Get booking class from cabin key
function getBookingClassFromCabinKey(cabinKey) {
  const key = cabinKey.toLowerCase()
  if (key.includes('first') || key.includes('f')) {
    return 'F'
  } else if (key.includes('business') || key.includes('j') || key.includes('c')) {
    return 'J'
  } else if (key.includes('premium') || key.includes('w') || key.includes('s')) {
    return 'W'
  } else {
    return 'Y'
  }
}

// Get booking class explanation for a cabin key
function getBookingClassExplanation(cabinKey) {
  // This is a simplified mapping - in reality, you'd need the actual fare class codes
  const key = cabinKey.toLowerCase()
  if (key.includes('first') || key.includes('f')) {
    return 'First Class (F, A, P)'
  } else if (key.includes('business') || key.includes('j') || key.includes('c')) {
    return 'Business Class (J, C, D, I, Z, P)'
  } else if (key.includes('premium') || key.includes('w') || key.includes('s')) {
    return 'Premium Economy (W, S, T)'
  } else {
    return 'Economy Class (Y, B, M, H, Q, V, W, S, T, L, U, E, N, R)'
  }
}

function openProgramsPanel({ isNonstop, flightElement }) {
  const search = lastSeatsSearch
  if (!search || !Array.isArray(search.data)) return

  // Extract cash price once
  const cashPriceUSD = extractCashPrice(flightElement)
  
  // Remove existing panel
  const existing = document.getElementById('bs-seats-panel')
  if (existing) existing.remove()

  const panel = document.createElement('div')
  panel.id = 'bs-seats-panel'
  panel.style.cssText = `
    position: fixed;
    right: 16px;
    bottom: 16px;
    width: 420px;
    max-height: 60vh;
    overflow: auto;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    border-radius: 8px;
    z-index: 999999;
    font-size: 12px;
  `

  const header = document.createElement('div')
  header.style.cssText = `
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 10px; border-bottom: 1px solid #eee; font-weight: 700;
  `
  header.textContent = cashPriceUSD ? `Seats.aero Programs (Cash: $${cashPriceUSD})` : 'Seats.aero Programs'
  const closeBtn = document.createElement('button')
  closeBtn.textContent = '×'
  closeBtn.style.cssText = 'border:none;background:transparent;font-size:18px;cursor:pointer;'
  closeBtn.onclick = () => panel.remove()
  header.appendChild(closeBtn)

  const body = document.createElement('div')
  body.style.cssText = 'padding:8px 10px; display: grid; gap: 8px;'

  const userCurr = getUserCurrency()

  // Build rows per availability (program)
  search.data.forEach((av) => {
    const row = document.createElement('div')
    row.style.cssText = 'border:1px solid #f0f0f0;border-radius:6px;padding:8px;'
    const program = (window.seatsAeroClient && window.seatsAeroClient.mapSourceToProgram(av.Source)) || av.Source || ''
    const programPointValue = window.getProgramPointValueBySource ? window.getProgramPointValueBySource(av.Source) : 0.0190
    
    const title = document.createElement('div')
    title.style.cssText = 'font-weight:600;margin-bottom:6px;'
    title.textContent = program
    row.appendChild(title)

    const list = document.createElement('div')
    list.style.cssText = 'display:flex;flex-direction:column;gap:6px;'

    const taxesCurrency = av.TaxesCurrency || 'USD'
    const toMinor = (v) => typeof v === 'number' ? v : (parseInt(v, 10) || 0)
    const convertTaxes = (minor) => taxesCurrency === userCurr ? minor : convertAmount(minor, taxesCurrency, userCurr)

    const cabins = [
      { key: 'F', available: av.FAvailable || av.FAvailableRaw, miles: isNonstop ? (av.FDirectMileageCostRaw || av.FMileageCostRaw) : (av.FMileageCostRaw || av.FDirectMileageCostRaw), taxes: isNonstop ? (av.FDirectTotalTaxesRaw || av.FTotalTaxesRaw) : (av.FTotalTaxesRaw || av.FDirectTotalTaxesRaw) },
      { key: 'J', available: av.JAvailable || av.JAvailableRaw, miles: isNonstop ? (av.JDirectMileageCostRaw || av.JMileageCostRaw) : (av.JMileageCostRaw || av.JDirectMileageCostRaw), taxes: isNonstop ? (av.JDirectTotalTaxesRaw || av.JTotalTaxesRaw) : (av.JTotalTaxesRaw || av.JDirectTotalTaxesRaw) },
      { key: 'W', available: av.WAvailable || av.WAvailableRaw, miles: isNonstop ? (av.WDirectMileageCostRaw || av.WMileageCostRaw) : (av.WMileageCostRaw || av.WDirectMileageCostRaw), taxes: isNonstop ? (av.WDirectTotalTaxesRaw || av.WTotalTaxesRaw) : (av.WTotalTaxesRaw || av.WDirectTotalTaxesRaw) },
      { key: 'Y', available: av.YAvailable || av.YAvailableRaw, miles: isNonstop ? (av.YDirectMileageCostRaw || av.YMileageCostRaw) : (av.YMileageCostRaw || av.YDirectMileageCostRaw), taxes: isNonstop ? (av.YDirectTotalTaxesRaw || av.YTotalTaxesRaw) : (av.YTotalTaxesRaw || av.YDirectTotalTaxesRaw) },
    ]

    cabins.forEach(c => {
      if (!c.available || !c.miles || c.miles <= 0) return
      
      const chipRow = document.createElement('div')
      chipRow.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;'
      
      const milesK = Math.round(c.miles / 1000) + 'k'
      const taxesMinor = toMinor(c.taxes || 0)
      const taxesFmt = formatMinor(convertTaxes(taxesMinor), userCurr)
      const taxesUSD = taxesCurrency === 'USD' ? taxesMinor / 100 : convertAmount(taxesMinor, taxesCurrency, 'USD') / 100
      
      const chip = document.createElement('span')
      chip.style.cssText = 'background:#f7f9ff;border:1px solid #d9e3ff;color:#274690;padding:2px 6px;border-radius:4px;white-space:nowrap;display:inline-flex;gap:4px;align-items:center;'
      chip.textContent = `${c.key} • ${milesK} + ${taxesFmt}`
      chip.title = `Original taxes: ${formatMinor(taxesMinor, taxesCurrency)}`
      
      // Calculate and display user-friendly savings if cash price available
      if (cashPriceUSD) {
        const cpmData = calculateCPM(cashPriceUSD, c.miles, taxesUSD, programPointValue)
        if (cpmData) {
          const dealText = document.createElement('span')
          dealText.style.cssText = `
            font-size: 11px;
            color: ${cpmData.isGoodDeal ? '#4caf50' : '#ff9800'};
            font-weight: 600;
          `
          dealText.textContent = `Total ${formatUSD(cpmData.totalAwardCostUSD)} • Save ${Math.max(0, cpmData.savingsPercent).toFixed(0)}%`
          dealText.title = `Cash ${formatUSD(cashPriceUSD)} vs Miles total ${formatUSD(cpmData.totalAwardCostUSD)}`
          chipRow.appendChild(chip)
          chipRow.appendChild(dealText)
        } else {
          chipRow.appendChild(chip)
        }
      } else {
        chipRow.appendChild(chip)
      }

      // Lazy fetch fare class for this availability
      chip.addEventListener('mouseenter', async () => {
        if (!chip.getAttribute('data-fetched') && window.seatsAeroClient) {
          chip.setAttribute('data-fetched', '1')
          try {
            const trips = await window.seatsAeroClient.getTripsForAvailability(av.ID)
            const segments = Array.isArray(trips?.data) ? trips.data : (trips || [])
            // Collect unique fare classes
            const classes = new Set()
            segments.forEach(s => { if (s?.FareClass) classes.add(s.FareClass) })
            if (classes.size > 0) {
              chip.textContent = `${c.key}/${Array.from(classes).slice(0,3).join(',')} • ${milesK} + ${taxesFmt}`
            }
          } catch (e) {}
        }
      })

      list.appendChild(chipRow)
    })

    if (list.children.length === 0) {
      const none = document.createElement('div')
      none.style.cssText = 'color:#777;'
      none.textContent = 'No award cabins found'
      row.appendChild(none)
    } else {
      row.appendChild(list)
    }

    body.appendChild(row)
  })

  panel.appendChild(header)
  panel.appendChild(body)
  document.body.appendChild(panel)
}

// Function to convert inches to centimeters
function inchesToCm(inches) {
  return Math.round(inches * 2.54)
}

// Function to format legroom with cm
function formatLegroomWithCm(legroom) {
  const match = legroom.match(/(\d+(?:\.\d+)?)\s*in/)
  if (match) {
    const inches = parseFloat(match[1])
    const cm = inchesToCm(inches)
    return `${cm}cm`
  }
  return legroom
}

// Function to get legroom color
function getLegroomColor(cm) {
  if (cm > 76) return '#e8f5e8' // Green for > 76cm (30 in)
  if (cm === 76) return '#fff3cd' // Yellow for exactly 76cm (30 in)
  return '#f8d7da' // Red for < 76cm (< 30 in)
}

// Function to get legroom text color
function getLegroomTextColor(cm) {
  if (cm > 76) return '#155724' // Dark green
  if (cm === 76) return '#856404' // Dark yellow
  return '#721c24' // Dark red
}

// Function to get legroom info based on aircraft type
function getLegroomInfo(aircraftType, airlineCode) {
  // Legroom database in inches
  const legroomData = {
    'Airbus A320': 30,
    'Airbus A321': 30,
    'Airbus A330': 31,
    'Airbus A350': 32,
    'Airbus A380': 32,
    'Boeing 737': 30,
    'Boeing 747': 31,
    'Boeing 757': 30,
    'Boeing 767': 31,
    'Boeing 777': 32,
    'Boeing 787': 32,
    'Embraer 170': 29,
    'Embraer 175': 29,
    'Embraer 190': 29,
    'Embraer 195': 29,
    'CRJ 700': 29,
    'CRJ 900': 29,
    'Dash 8': 30,
    'ATR 72': 29
  }
  
  // Airline-specific overrides
  const airlineOverrides = {
    'LH': { 'Airbus A320': 31, 'Airbus A350': 31 },
    'BA': { 'Airbus A320': 29, 'Boeing 777': 31 },
    'AA': { 'Boeing 737': 30 },
    'DL': { 'Airbus A320': 31, 'Boeing 737': 31 },
    'UA': { 'Boeing 737': 30 },
    'OS': { 'Embraer 195': 29 }
  }
  
  // Get legroom for specific aircraft and airline
  let legroomInches = 30 // Default fallback
  
  if (aircraftType) {
    // Check airline-specific override first
    if (airlineCode && airlineOverrides[airlineCode] && airlineOverrides[airlineCode][aircraftType]) {
      legroomInches = airlineOverrides[airlineCode][aircraftType]
    } else if (legroomData[aircraftType]) {
      legroomInches = legroomData[aircraftType]
    }
  }
  
  return `${legroomInches} in`
}

  // Function to extract flight information
function extractFlightInfo(flightElement) {
  const flightInfo = {
    airline: "",
    airlineCode: "",
    flightNumber: "",
    aircraft: "",
    legroom: "",
    cabin: "",
    amenities: [],
    stops: "",
    stopsInfo: "",
    travelTime: ""
  }

  const allText = flightElement.textContent
  console.log("All text content:", allText)
  
  // Clean up "Operated by" text from the content
  const cleanedText = allText.replace(/Operated by\s+/gi, '')
  console.log("Cleaned text content:", cleanedText)
  
  // Look for flight numbers in data-gs attributes first
  const dataGsElements = flightElement.querySelectorAll('[data-gs]')
  for (const element of dataGsElements) {
    const dataGs = element.getAttribute('data-gs')
    console.log("Found data-gs:", dataGs)
    if (dataGs) {
      try {
        const decoded = atob(dataGs)
        console.log("Decoded data-gs:", decoded)
        
        // Try multiple patterns to find flight numbers
        const patterns = [
          /(LH|LO|AA|DL|UA|BA|AF|KL|LX|OS|SK|AY|IB|VY|FR|W6|U2|EW|DE|AB|4U|X3|EK)\s*(\d{1,4})/g,
          /(LH|LO|AA|DL|UA|BA|AF|KL|LX|OS|SK|AY|IB|VY|FR|W6|U2|EW|DE|AB|4U|X3|EK)\s*(\d{1,4})/,
          /([A-Z]{2})\s*(\d{1,4})/g,
          /([A-Z]{2})\s*(\d{1,4})/
        ]
        
        for (const pattern of patterns) {
          const matches = decoded.match(pattern)
          if (matches && matches.length > 0) {
            const firstMatch = matches[0]
            const codeMatch = firstMatch.match(/([A-Z]{2})\s*(\d{1,4})/)
            if (codeMatch) {
              flightInfo.airlineCode = codeMatch[1]
              flightInfo.flightNumber = codeMatch[2]
              console.log("Extracted from data-gs:", flightInfo.airlineCode, flightInfo.flightNumber)
              break
            }
          }
        }
      } catch (e) {
        console.log("Could not decode data-gs:", e)
      }
    }
  }
  
  // Look for airline names in specific structure first (sSHqwe tPgKwe ogfYpf)
  const airlineContainer = flightElement.querySelector('.sSHqwe.tPgKwe.ogfYpf')
  if (airlineContainer) {
    const airlineSpans = airlineContainer.querySelectorAll('span')
    for (const span of airlineSpans) {
      const spanText = span.textContent.trim()
      if (spanText && spanText.length > 0 && !spanText.match(/^\s*$/)) {
        // Check if it's a known airline name
        const airlineNames = ['LOT', 'Lufthansa', 'American Airlines', 'Delta', 'United', 'British Airways', 'Air France', 'KLM', 'Swiss', 'Austrian', 'SAS', 'Finnair', 'Iberia', 'Vueling', 'Ryanair', 'Wizz Air', 'EasyJet', 'Eurowings', 'Air Berlin', 'Germanwings']
        for (const airlineName of airlineNames) {
          if (spanText.includes(airlineName) || airlineName.includes(spanText)) {
            flightInfo.airline = airlineName
            console.log("Extracted airline name from structure:", flightInfo.airline)
            break
          }
        }
        // If no match found but text exists, use it as airline name
        if (!flightInfo.airline && spanText.length > 1 && spanText.length < 50) {
          flightInfo.airline = spanText
          console.log("Using span text as airline name:", flightInfo.airline)
        }
        if (flightInfo.airline) break
      }
    }
  }
  
  // Fallback: Look for airline names in text content
  if (!flightInfo.airline) {
    const airlineNames = ['LOT', 'Lufthansa', 'American Airlines', 'Delta', 'United', 'British Airways', 'Air France', 'KLM', 'Swiss', 'Austrian', 'SAS', 'Finnair', 'Iberia', 'Vueling', 'Ryanair', 'Wizz Air', 'EasyJet', 'Eurowings', 'Air Berlin', 'Germanwings']
    
    for (const airlineName of airlineNames) {
      if (cleanedText.includes(airlineName)) {
        flightInfo.airline = airlineName
        console.log("Extracted airline name from text:", flightInfo.airline)
        break
      }
    }
  }

  // Set default aircraft based on airline
  if (!flightInfo.aircraft) {
    if (flightInfo.airlineCode === 'LO' || flightInfo.airlineCode === 'LH') {
      flightInfo.aircraft = 'Airbus A320'
    } else if (flightInfo.airlineCode === 'AA' || flightInfo.airlineCode === 'DL' || flightInfo.airlineCode === 'UA') {
      flightInfo.aircraft = 'Boeing 737'
    } else {
      flightInfo.aircraft = 'Aircraft'
    }
    console.log("Using default aircraft:", flightInfo.aircraft)
  }

  // Look for stops information
  const stopsPatterns = [
    /(Nonstop|Direct)/i,
    /(\d+)\s*stop/i,
    /(\d+)\s*stops/i
  ]
  
  for (const pattern of stopsPatterns) {
    const match = cleanedText.match(pattern)
    if (match) {
      if (match[1].toLowerCase().includes('nonstop') || match[1].toLowerCase().includes('direct')) {
        flightInfo.stops = "Nonstop"
        flightInfo.stopsInfo = "Direct flight"
  } else {
        const stopCount = parseInt(match[1])
        flightInfo.stops = `${stopCount} stop${stopCount > 1 ? 's' : ''}`
        flightInfo.stopsInfo = `${stopCount} stop${stopCount > 1 ? 's' : ''}`
      }
      break
    }
  }
  
  // Extract travel time directly from the page
  const timeElement = flightElement.querySelector('.gvkrdb.AdWm1c.tPgKwe.ogfYpf[aria-label*="Total duration"]')
  if (timeElement) {
    flightInfo.travelTime = timeElement.textContent.trim()
    console.log("Extracted travel time:", flightInfo.travelTime)
  } else {
    // Fallback: look for time patterns in the text
    const timeMatch = cleanedText.match(/(\d+\s*(?:hr|hour|h)\s*\d+\s*(?:min|minutes|m)|(\d+\s*(?:hr|hour|h))|(\d+\s*(?:min|minutes|m)))/i)
    if (timeMatch) {
      flightInfo.travelTime = timeMatch[0].trim()
      console.log("Extracted travel time from text:", flightInfo.travelTime)
    }
  }

  // Set legroom based on aircraft and airline
  flightInfo.legroom = getLegroomInfo(flightInfo.aircraft, flightInfo.airlineCode)

  return flightInfo
}

// Function to create flight details element
function createFlightDetailsElement(flightInfo, flightElement) {
  if (!flightInfo) return null

  const detailsContainer = document.createElement("div")
  detailsContainer.className = "injected-flight-details"
  // Store flightElement reference for cash price extraction
  if (flightElement) {
    detailsContainer.dataset.flightElement = 'true'
    detailsContainer._flightElement = flightElement
  }

  // Calculate legroom for color coding
  let legroomCm = 0
  if (flightInfo.legroom) {
    const match = flightInfo.legroom.match(/(\d+(?:\.\d+)?)\s*in/)
    if (match) {
      const inches = parseFloat(match[1])
      legroomCm = inchesToCm(inches)
    }
  }
  
  // Check if flight is nonstop (for marking parent .yR1fYc element)
  const isNonstop = flightInfo.stops === 'Nonstop'
  
  detailsContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 2px 4px;
    font-size: 12px;
    font-weight: 500;
    color: rgb(0, 0, 0);
    background: transparent;
    border-radius: 0px;
    margin: -13px 1px 0px -44px;
    border: 1px solid transparent;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 0px;
    max-width: 50%;
    position: relative;
    z-index: 0;
    min-height: 32px;
    align-self: flex-start;
    text-align: left;
  `
  
  // Helper function to mark .yR1fYc element with a class
  function markYr1fYcElement(className) {
    if (flightElement) {
      // Check if flightElement itself is .yR1fYc
      if (flightElement.classList && flightElement.classList.contains('yR1fYc')) {
        flightElement.classList.add(className)
      } else {
        // Find parent .yR1fYc element
        let parent = flightElement.parentElement
        let attempts = 0
        while (parent && attempts < 10) {
          if (parent.classList && parent.classList.contains('yR1fYc')) {
            parent.classList.add(className)
            break
          }
          parent = parent.parentElement
          attempts++
        }
      }
    }
  }
  
  // Add class for nonstop flights for additional styling
  if (isNonstop) {
    detailsContainer.classList.add('nonstop-flight')
    // Mark .yR1fYc element for green background
    markYr1fYcElement('bs-nonstop-flight')
  } else if (flightInfo.stops && flightInfo.stops !== 'Nonstop') {
    // Check number of stops
    const stopsMatch = flightInfo.stops.match(/(\d+)\s*stop/i)
    if (stopsMatch) {
      const stopCount = parseInt(stopsMatch[1])
      if (stopCount >= 2) {
        // Mark .yR1fYc element for red background (2+ stops)
        markYr1fYcElement('bs-multiple-stops-flight')
      } else if (stopCount === 1) {
        // Mark .yR1fYc element for yellow background (1 stop)
        markYr1fYcElement('bs-stops-flight')
      }
    }
  }

  // Create first row for flight details
  const flightDetailsRow = document.createElement("div")
  flightDetailsRow.style.cssText = `
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: nowrap;
    white-space: nowrap;
    overflow-x: auto;
  `

  // Aircraft info
  if (flightInfo.aircraft) {
    const aircraftElement = document.createElement("span")
    aircraftElement.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 2px 6px;
      background: rgb(255, 255, 255);
      border-radius: 4px;
      font-weight: 600;
      color: rgb(0, 0, 0);
      font-size: 11px;
      white-space: nowrap;
      border: 1px solid rgba(255, 193, 7, 0.25);
      box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px;
      transition: 0.2s;
    `
    aircraftElement.innerHTML = `✈️ ${flightInfo.aircraft}`
    flightDetailsRow.appendChild(aircraftElement)
  }

  // Airline and Flight Number
  if (flightInfo.airlineCode && flightInfo.flightNumber) {
    const airlineElement = document.createElement("span")
    airlineElement.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 2px 6px;
      background: rgb(255, 255, 255);
      border-radius: 4px;
      font-weight: 600;
      color: rgb(0, 0, 0);
      font-size: 11px;
      white-space: nowrap;
      border: 1px solid rgba(255, 193, 7, 0.25);
      box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px;
      transition: 0.2s;
    `
    airlineElement.innerHTML = `🏢 ${flightInfo.airlineCode} ${flightInfo.flightNumber}`
    flightDetailsRow.appendChild(airlineElement)
  }

  // Travel Time
  if (flightInfo.travelTime) {
    const timeElement = document.createElement("span")
    timeElement.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 2px 6px;
      background: rgb(255, 255, 255);
      border-radius: 4px;
      font-weight: 600;
      color: rgb(0, 0, 0);
      font-size: 11px;
      white-space: nowrap;
      border: 1px solid rgba(255, 193, 7, 0.25);
      box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px;
      transition: 0.2s;
    `
    timeElement.innerHTML = `⏱️ ${flightInfo.travelTime}`
    flightDetailsRow.appendChild(timeElement)
  }

  // Legroom with proper color coding
  if (flightInfo.legroom) {
    const legroomCmFormatted = formatLegroomWithCm(flightInfo.legroom)
    if (legroomCmFormatted) {
      const legroomElement = document.createElement("span")
      
      legroomElement.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 2px 6px;
        background: rgb(255, 255, 255);
        border-radius: 4px;
        font-weight: 600;
        color: rgb(0, 0, 0);
        font-size: 11px;
        white-space: nowrap;
        border: 1px solid rgba(255, 193, 7, 0.25);
        box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px;
        transition: 0.2s;
      `
      legroomElement.innerHTML = `🪑 ${legroomCmFormatted}`
      flightDetailsRow.appendChild(legroomElement)
    }
  }

  // Add stops and travel time information
  if (flightInfo.stops) {
    const stopsElement = document.createElement("span")
    stopsElement.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 2px 6px;
      background: rgb(255, 255, 255);
      border-radius: 4px;
      font-weight: 600;
      color: rgb(0, 0, 0);
      font-size: 11px;
      white-space: nowrap;
      border: 1px solid rgba(255, 193, 7, 0.25);
      box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px;
      transition: 0.2s;
    `
    stopsElement.innerHTML = `✈️ ${flightInfo.stops}`
    flightDetailsRow.appendChild(stopsElement)
  }

  // Add the flight details row to the container
  detailsContainer.appendChild(flightDetailsRow)
  
  // Create second row for links under "Aircraft"
  if (flightInfo.airlineCode && flightInfo.flightNumber) {
    const linksRow = document.createElement("div")
    linksRow.style.cssText = `
      display: flex;
      gap: 8px;
      align-items: center;
      margin-top: 4px;
      flex-wrap: nowrap;
      overflow-x: auto;
    `
    
    // Order links per request: Seats.Aero, AwardTool, PointsYeah, PY Seats, SA Seats, FareClass, FareViewer, Where?
    const links = [
      { text: "Seats.Aero", action: () => {
        const fromInput = document.getElementById('bs-flight-from')
        const toInput = document.getElementById('bs-flight-to')
        const departInput = document.getElementById('bs-flight-depart')
        if (fromInput && toInput && departInput) {
          let fromCode = ''
          let toCode = ''
          if (fromInput.dataset.airportData) {
            try { const airport = JSON.parse(fromInput.dataset.airportData); fromCode = airport.iata || fromInput.value?.trim()?.toUpperCase() || '' } catch (e) { fromCode = fromInput.value?.trim()?.toUpperCase() || '' }
          } else { fromCode = fromInput.value?.trim()?.toUpperCase() || '' }
          if (toInput.dataset.airportData) {
            try { const airport = JSON.parse(toInput.dataset.airportData); toCode = airport.iata || toInput.value?.trim()?.toUpperCase() || '' } catch (e) { toCode = toInput.value?.trim()?.toUpperCase() || '' }
          } else { toCode = toInput.value?.trim()?.toUpperCase() || '' }
          const cabinSel = document.getElementById('bs-flight-cabin')
          const cabinVal = (cabinSel && cabinSel.value) ? cabinSel.value.toLowerCase() : 'economy'
          const applicableCabin = cabinVal === 'business' ? 'business' : cabinVal === 'first' ? 'first' : cabinVal === 'premium_economy' ? 'premium_economy' : 'economy'
          const opCarrier = (flightInfo.airlineCode || '').slice(0, 2)
          const url = `https://seats.aero/search?min_seats=1${opCarrier ? `&op_carriers=${encodeURIComponent(opCarrier)}` : ''}&applicable_cabin=${encodeURIComponent(applicableCabin)}&additional_days_num=7&direct_only=true&max_fees=40000&disable_live_filtering=false&date=${encodeURIComponent(departInput.value)}&origins=${encodeURIComponent(fromCode)}&destinations=${encodeURIComponent(toCode)}&show_individual=false&stops=0`
          window.open(url, '_blank')
        }
      }},
      { text: "AwardTool", action: () => {
        const fromInput = document.getElementById('bs-flight-from')
        const toInput = document.getElementById('bs-flight-to')
        const departInput = document.getElementById('bs-flight-depart')
        const returnInput = document.getElementById('bs-flight-return')
        if (fromInput && toInput && departInput) {
          const isRoundTrip = returnInput && returnInput.value && returnInput.value.trim() !== ''
          const flightWay = isRoundTrip ? 'roundtrip' : 'oneway'
          const departTimestamp = Math.floor(new Date(departInput.value).getTime() / 1000)
          let awardToolUrl
          if (isRoundTrip) {
            const returnTimestamp = Math.floor(new Date(returnInput.value).getTime() / 1000)
            awardToolUrl = `https://www.awardtool.com/flight?flightWay=${flightWay}&pax=1&children=0&cabins=economy&range=false&rangeV2=false&from=${fromInput.value}&to=${toInput.value}&programs=&targetId=&roundTripDepartureDate=${departTimestamp}&roundTripReturnDate=${returnTimestamp}`
          } else {
            awardToolUrl = `https://www.awardtool.com/flight?flightWay=${flightWay}&pax=1&children=0&cabins=economy&range=true&rangeV2=false&from=${fromInput.value}&to=${toInput.value}&programs=&targetId=&oneWayRangeStartDate=${departTimestamp}&oneWayRangeEndDate=${departTimestamp}`
          }
          window.open(awardToolUrl, '_blank')
        }
      }},
      { text: "PointsYeah", action: () => {
        const fromInput = document.getElementById('bs-flight-from')
        const toInput = document.getElementById('bs-flight-to')
        const departInput = document.getElementById('bs-flight-depart')
        const returnInput = document.getElementById('bs-flight-return')
        
        if (fromInput && toInput && departInput) {
          let fromCode = ''
          let toCode = ''
          
          if (fromInput.dataset.airportData) {
            try {
              const airport = JSON.parse(fromInput.dataset.airportData)
              fromCode = airport.iata || fromInput.value?.trim()?.toUpperCase() || ''
            } catch (e) {
              fromCode = fromInput.value?.trim()?.toUpperCase() || ''
            }
          } else {
            fromCode = fromInput.value?.trim()?.toUpperCase() || ''
          }
          
          if (toInput.dataset.airportData) {
            try {
              const airport = JSON.parse(toInput.dataset.airportData)
              toCode = airport.iata || toInput.value?.trim()?.toUpperCase() || ''
            } catch (e) {
              toCode = toInput.value?.trim()?.toUpperCase() || ''
            }
          } else {
            toCode = toInput.value?.trim()?.toUpperCase() || ''
          }

          const isRoundTrip = returnInput && returnInput.value && returnInput.value.trim() !== ''
            const tripType = isRoundTrip ? '2' : '1'
          
          let pointsYeahUrl = `https://www.pointsyeah.com/search?cabins=Economy&cabin=Economy&banks=Amex%2CCapital+One%2CChase&airlineProgram=AM%2CAC%2CKL%2CAS%2CAV%2CDL%2CEK%2CEY%2CAY%2CB6%2CQF%2CSQ%2CTK%2CUA%2CVS%2CVA&tripType=${tripType}&adults=1&children=0&departure=${fromCode}&arrival=${toCode}&departDate=${departInput.value}&departDateSec=${departInput.value}&stops=0`
          
          if (isRoundTrip) {
            pointsYeahUrl += `&returnDate=${returnInput.value}&returnDateSec=${returnInput.value}&multiday=false`
          }
          
          window.open(pointsYeahUrl, '_blank')
        }
      }},
      { text: "PY Seats", action: () => {
        const fromInput = document.getElementById('bs-flight-from')
        const toInput = document.getElementById('bs-flight-to')
        const departInput = document.getElementById('bs-flight-depart')
        if (fromInput && toInput && departInput) {
          let fromCode = fromInput.value.split(' ')[0] || 'MUC'
          let toCode = toInput.value.split(' ')[0] || 'WAW'
          const pySeatsUrl = `https://www.pointsyeah.com/seatmap/detail?airline=${encodeURIComponent(flightInfo.airlineCode)}&departure=${fromCode}&arrival=${toCode}&date=${departInput.value}&flightNumber=${encodeURIComponent(flightInfo.flightNumber)}&cabins=Economy%2CPremium%20Economy%2CBusiness%2CFirst`
          window.open(pySeatsUrl, '_blank')
        }
      }},
      { text: "SA Seats", action: () => {
        const fromInput = document.getElementById('bs-flight-from')
        const toInput = document.getElementById('bs-flight-to')
        const departInput = document.getElementById('bs-flight-depart')
        if (fromInput && toInput && departInput) {
          let fromCode = fromInput.value.split(' ')[0] || 'MUC'
          let toCode = toInput.value.split(' ')[0] || 'WAW'
          const saSeatsUrl = `https://seats.aero/seatmap?airline=${encodeURIComponent(flightInfo.airlineCode)}&from=${fromCode}&to=${toCode}&date=${departInput.value}&flight=${encodeURIComponent(flightInfo.flightNumber)}&stops=0`
          window.open(saSeatsUrl, '_blank')
        }
      }},
      { text: "FareClass", action: () => {
        const fromInput = document.getElementById('bs-flight-from')
        const toInput = document.getElementById('bs-flight-to')
        const departInput = document.getElementById('bs-flight-depart')
        
        if (fromInput && toInput && departInput) {
          let fromCode = ''
          let toCode = ''
          
          if (fromInput.dataset.airportData) {
            try {
              const airport = JSON.parse(fromInput.dataset.airportData)
              fromCode = airport.iata || fromInput.value?.trim()?.toUpperCase() || ''
            } catch (e) {
              fromCode = fromInput.value?.trim()?.toUpperCase() || ''
            }
          } else {
            fromCode = fromInput.value?.trim()?.toUpperCase() || ''
          }
          
          if (toInput.dataset.airportData) {
            try {
              const airport = JSON.parse(toInput.dataset.airportData)
              toCode = airport.iata || toInput.value?.trim()?.toUpperCase() || ''
            } catch (e) {
              toCode = toInput.value?.trim()?.toUpperCase() || ''
            }
          } else {
            toCode = toInput.value?.trim()?.toUpperCase() || ''
          }

          const fareClassUrl = `https://seats.aero/fareclass?from=${fromCode}&to=${toCode}&date=${departInput.value}&connections=false&codeshares=false&stops=0`
          window.open(fareClassUrl, '_blank')
        }
      }},
      { text: "FareViewer", action: () => {
        const fromInput = document.getElementById('bs-flight-from')
        const toInput = document.getElementById('bs-flight-to')
        const departInput = document.getElementById('bs-flight-depart')
        
        if (fromInput && toInput && departInput) {
          let fromCode = ''
          let toCode = ''
          
          if (fromInput.dataset.airportData) {
            try {
              const airport = JSON.parse(fromInput.dataset.airportData)
              fromCode = airport.iata || fromInput.value?.trim()?.toUpperCase() || ''
            } catch (e) {
              fromCode = fromInput.value?.trim()?.toUpperCase() || ''
            }
          } else {
            fromCode = fromInput.value?.trim()?.toUpperCase() || ''
          }
          
          if (toInput.dataset.airportData) {
            try {
              const airport = JSON.parse(toInput.dataset.airportData)
              toCode = airport.iata || toInput.value?.trim()?.toUpperCase() || ''
            } catch (e) {
              toCode = toInput.value?.trim()?.toUpperCase() || ''
            }
          } else {
            toCode = toInput.value?.trim()?.toUpperCase() || ''
          }

          const fareViewerUrl = `https://seats.aero/fares?from=${fromCode}&to=${toCode}&date=${departInput.value}&carriers=${flightInfo.airlineCode}&currency=USD&stops=0`
          window.open(fareViewerUrl, '_blank')
        }
      }},
      { text: "Where?", action: () => {
        const fromInput = document.getElementById('bs-flight-from')
        const toInput = document.getElementById('bs-flight-to')
        
        if (fromInput && toInput) {
          let fromCode = ''
          let toCode = ''
          
          if (fromInput.dataset.airportData) {
            try {
              const airport = JSON.parse(fromInput.dataset.airportData)
              fromCode = airport.iata || fromInput.value?.trim()?.toUpperCase() || ''
            } catch (e) {
              fromCode = fromInput.value?.trim()?.toUpperCase() || ''
            }
          } else {
            fromCode = fromInput.value?.trim()?.toUpperCase() || ''
          }
          
          if (toInput.dataset.airportData) {
            try {
              const airport = JSON.parse(toInput.dataset.airportData)
              toCode = airport.iata || toInput.value?.trim()?.toUpperCase() || ''
            } catch (e) {
              toCode = toInput.value?.trim()?.toUpperCase() || ''
            }
          } else {
            toCode = toInput.value?.trim()?.toUpperCase() || ''
          }

          const airlineCode = (flightInfo.airlineCode || '').toUpperCase() || ''
          
          const cashPriceInput = document.getElementById('bs-cash-price-input')
          const standaloneCashPriceInput = document.getElementById('bs-standalone-cash-price')
          const cashPrice = parseFloat(cashPriceInput?.value || standaloneCashPriceInput?.value || '0')
          
          const route = `${airlineCode}:Y:${fromCode}-${toCode}:${airlineCode}:${Math.round(cashPrice)}:USD`
          const encodedRoute = encodeURIComponent(route)
          const wtcUrl = `https://wheretocredit.com/de/calculator#route=${encodedRoute}`
          
          window.open(wtcUrl, '_blank')
        }
      }}
    ]
    
      // Create individual link buttons and add to the same row
    links.forEach(link => {
      const linkButton = document.createElement("button")
      linkButton.textContent = link.text
      linkButton.style.cssText = `
        background: transparent;
        color: #1a73e8;
        padding: 1px 3px;
        border-radius: 3px;
        border: none;
        font-size: 10px;
        font-weight: 500;
        text-decoration: underline;
        letter-spacing: 0.3px;
        transition: all 0.2s ease;
        white-space: nowrap;
        cursor: pointer;
      `
      
      linkButton.addEventListener('click', (e) => {
        e.stopPropagation()
        link.action()
      })
      
      linkButton.addEventListener('mouseenter', () => {
        linkButton.style.color = '#1557b0'
        linkButton.style.textDecoration = 'none'
      })
      
      linkButton.addEventListener('mouseleave', () => {
        linkButton.style.color = '#1a73e8'
        linkButton.style.textDecoration = 'underline'
      })
      
      linksRow.appendChild(linkButton)
    })
    
    // Add the links row to the container (second row, under Aircraft)
    detailsContainer.appendChild(linksRow)
  }

  // Note: Seats.aero data is now only shown in the global Flight Search section
  
  // Trigger global panel update when flight details are added
  setTimeout(() => {
    triggerGlobalPanelUpdate()
  }, 1000) // Small delay to ensure DOM is ready

  return detailsContainer
}

// Function to remove unwanted span elements
function removeUnwantedSpans() {
  // Remove "Operated by" spans and their content
  let operatedByCount = 0
  const allSpans = document.querySelectorAll('span')
  allSpans.forEach(span => {
    if (span.textContent && span.textContent.includes('Operated by')) {
      // Find the parent element that contains the entire "Operated by" text
      let parent = span.parentElement
      while (parent && parent.textContent && parent.textContent.includes('Operated by')) {
        // Check if this parent contains only "Operated by" and airline name
        const text = parent.textContent.trim()
        if (text.startsWith('Operated by') || text.includes('Operated by')) {
          parent.remove()
          operatedByCount++
          break
        }
        parent = parent.parentElement
      }
    }
  })
  
  console.log(`Removed ${operatedByCount} "Operated by" spans`)
}


// Function to replace CO2 emissions display with flight details
function replaceEmissionsWithFlightDetails() {
  try {
    console.log("[BS Extension] === REPLACING EMISSIONS WITH FLIGHT DETAILS ===")
    
    // Remove unwanted spans first
    removeUnwantedSpans()
    
    // Find all flight elements first
    const flightElements = document.querySelectorAll('li.pIav2d, .yR1fYc, .mxvQLc')
    console.log(`[BS Extension] Found ${flightElements.length} flight elements to process`)
    
    if (flightElements.length === 0) {
      console.log("[BS Extension] No flight elements found, waiting for page to load...")
      return
    }
    
    flightElements.forEach((flightElement, index) => {
      try {
        // Check if this flight element has already been processed
        if (flightElement.dataset.bsInjected === 'true') {
          // Check if injection is still valid (not replaced by Google)
          const existingInjection = flightElement.querySelector('.injected-flight-details')
          if (existingInjection) {
            console.log(`[BS Extension] Flight ${index + 1} already injected, skipping`)
            return
          } else {
            // Injection was removed, allow re-injection
            delete flightElement.dataset.bsInjected
          }
        }
        
        console.log(`[BS Extension] Processing flight element ${index + 1}`)
        
        // Find emissions container in this flight
        const emissionsContainer = flightElement.querySelector('.y0NSEe.V1iAHe.tPgKwe.ogfYpf, .y0NSEe.axwZ3c.y52p7d.ogfYpf')
        
        if (emissionsContainer) {
          // Check if this emissions container was already replaced
          if (emissionsContainer.classList.contains('injected-flight-details') || 
              emissionsContainer.dataset.bsReplaced === 'true') {
            console.log(`[BS Extension] Emissions container ${index + 1} already replaced, skipping`)
            return
          }
          
          console.log(`[BS Extension] Found emissions container in flight ${index + 1}`)
          
          // Extract flight info from this flight element with retry logic
          let flightInfo = null
          try {
            flightInfo = extractFlightInfo(flightElement)
            // If extraction failed, try once more after a short delay
            if (!flightInfo || (!flightInfo.aircraft && !flightInfo.airlineCode)) {
              setTimeout(() => {
                try {
                  const retryInfo = extractFlightInfo(flightElement)
                  if (retryInfo && (retryInfo.aircraft || retryInfo.airlineCode)) {
                    // Re-process this element with the new info
                    const retryDetails = createFlightDetailsElement(retryInfo, flightElement)
                    if (retryDetails) {
                      const existingInjection = flightElement.querySelector('.injected-flight-details')
                      if (existingInjection) {
                        existingInjection.parentNode.replaceChild(retryDetails, existingInjection)
                      } else if (emissionsContainer && emissionsContainer.parentNode) {
                        emissionsContainer.parentNode.replaceChild(retryDetails, emissionsContainer)
                        flightElement.dataset.bsInjected = 'true'
                      }
                    }
                  }
                } catch (retryError) {
                  console.error(`[BS Extension] Retry extraction failed:`, retryError)
                }
              }, 200)
            }
          } catch (error) {
            console.error(`[BS Extension] Error extracting flight info:`, error)
          }
          
          console.log(`[BS Extension] Flight ${index + 1} info:`, flightInfo)
          
          if (flightInfo && (flightInfo.aircraft || flightInfo.airlineCode)) {
            // Create flight details element
            const detailsElement = createFlightDetailsElement(flightInfo, flightElement)
            if (detailsElement) {
              console.log(`[BS Extension] Replacing emissions with flight details for flight ${index + 1}`)
              // Mark emissions container as replaced before replacement
              emissionsContainer.dataset.bsReplaced = 'true'
              // Replace the emissions container with our flight details
              emissionsContainer.parentNode.replaceChild(detailsElement, emissionsContainer)
              // Mark flight element as injected
              flightElement.dataset.bsInjected = 'true'
              console.log(`[BS Extension] Successfully replaced emissions for flight ${index + 1}`)
            } else {
              console.warn(`[BS Extension] Failed to create details element for flight ${index + 1}`)
              // Just hide the emissions if we can't create details
              emissionsContainer.style.display = 'none'
              emissionsContainer.dataset.bsReplaced = 'true'
            }
          } else {
            console.log(`[BS Extension] Insufficient flight info for flight ${index + 1}, just hiding emissions`)
            // Just hide the emissions if we don't have enough info
            emissionsContainer.style.display = 'none'
            emissionsContainer.dataset.bsReplaced = 'true'
          }
        } else {
          // Check if there's already an injected element (emissions might have been removed)
          const existingInjection = flightElement.querySelector('.injected-flight-details')
          if (!existingInjection) {
            console.log(`[BS Extension] No emissions container found in flight ${index + 1}, but no injection either`)
          }
        }
      } catch (error) {
        console.error(`[BS Extension] Error processing flight element ${index + 1}:`, error)
      }
    })
    
    // Also hide any remaining emissions elements
    const emissionsSelectors = [
      '[data-co2currentflight]',
      '[data-relativeemissions]',
      '.AdWm1c.lc3qH.ogfYpf.PtgtFe',
      '.N6PNV.Dd7uHc.ogfYpf.juCwOd.BYjnCf',
      '.N6PNV.URDlle.ogfYpf.juCwOd.BYjnCf',
      '[aria-label*="Carbon emissions"]',
      '[jsname="Prr8lb"]'
    ];

    emissionsSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element.textContent.includes('CO2') || 
            element.textContent.includes('emissions') ||
            element.getAttribute('data-co2currentflight') ||
            element.getAttribute('data-relativeemissions') ||
            element.getAttribute('aria-label')?.includes('Carbon emissions')) {
          element.style.display = 'none';
        }
      });
    });
    
  } catch (error) {
    console.error("Error replacing emissions display:", error);
  }
}

// Debounce function for injection
let injectionTimeout = null
let isInjecting = false

function debouncedInjection(delay = 300) {
  if (injectionTimeout) {
    clearTimeout(injectionTimeout)
  }
  injectionTimeout = setTimeout(() => {
    if (!isInjecting) {
      injectFlightDetails()
    }
  }, delay)
}

// Function to check if page is ready for injection
function isPageReady() {
  // Check if document is fully loaded (complete state)
  if (document.readyState !== 'complete') {
    return false
  }
  
  // Check if we're on a valid Google Flights page
  if (!window.location.href.includes('google.com/travel/flights')) {
    return false
  }
  
  // Check if body exists
  if (!document.body) {
    return false
  }
  
  // Check if flight results container exists
  const hasFlightResults = document.querySelector('li.pIav2d, .yR1fYc, .mxvQLc, .MX5RWe.sSHqwe.y52p7d, .L5Okte.y52p7d')
  if (!hasFlightResults) {
    // Wait a bit more for dynamic content
    return false
  }
  
  // Additional check: ensure main container is present
  const mainContainer = document.querySelector('.XwbuFf, .gws-flights-results__result-list, main, [role="main"]')
  if (!mainContainer) {
    return false
  }
  
  return true
}

// Extract price from YMlIz FpEdX jLMuyc element and auto-fill cash price fields
function extractAndFillPriceFromGoogleFlights() {
  try {
    console.log('[BS Extension] Attempting to extract price from Google Flights...')
    
    // First, try to find the first price from top flights with class="U3gSDe ETvUZc"
    let priceElement = null
    
    // Look for the first flight card with class U3gSDe ETvUZc
    const topFlightCards = document.querySelectorAll('.U3gSDe.ETvUZc, [class*="U3gSDe"][class*="ETvUZc"]')
    if (topFlightCards.length > 0) {
      const firstTopFlight = topFlightCards[0]
      console.log('[BS Extension] Found top flight card with class U3gSDe ETvUZc')
      
      // Look for price elements within this first top flight card
      const priceSelectors = [
        'span[aria-label*="dollars"]',
        'span[aria-label*="US dollars"]',
        '.YMlIz.FpEdX.jLMuyc span[aria-label*="dollars"]',
        'div.YMlIz.FpEdX.jLMuyc span[aria-label*="dollars"]',
        '.YMlIz.FpEdX.jLMuyc',
        'div.YMlIz.FpEdX.jLMuyc'
      ]
      
      for (const selector of priceSelectors) {
        const priceEl = firstTopFlight.querySelector(selector)
        if (priceEl) {
          // If it's a div, check for span inside
          if (priceEl.tagName === 'DIV' || priceEl.classList.contains('YMlIz')) {
            const spanInside = priceEl.querySelector('span[aria-label*="dollars"]')
            if (spanInside) {
              priceElement = spanInside
              console.log('[BS Extension] Found price span inside div in first top flight')
              break
            }
            if (priceEl.getAttribute('aria-label')) {
              priceElement = priceEl
              console.log('[BS Extension] Found price div with aria-label in first top flight')
              break
            }
          } else {
            priceElement = priceEl
            console.log('[BS Extension] Found price element in first top flight:', selector)
            break
          }
        }
      }
    }
    
    // Fallback: Try multiple selectors to find the price element (original logic)
    if (!priceElement) {
      const selectors = [
        // First try to find span inside div (most specific pattern)
        '.YMlIz.FpEdX.jLMuyc span[aria-label*="dollars"]',
        'div.YMlIz.FpEdX.jLMuyc span[aria-label*="dollars"]',
        '.YMlIz.FpEdX.jLMuyc span[aria-label*="US dollars"]',
        'div.YMlIz.FpEdX.jLMuyc span[aria-label*="US dollars"]',
        // Specific pattern with data-gs and aria-label
        'span[data-gs][aria-label*="dollars"]',
        'span[data-gs][aria-label*="US dollars"]',
        // Original selectors (div containers)
        '.YMlIz.FpEdX.jLMuyc',
        'div.YMlIz.FpEdX.jLMuyc',
        '.YMlIz.FpEdX',
        '.FpEdX.jLMuyc',
        '[class*="YMlIz"][class*="FpEdX"][class*="jLMuyc"]',
        '[aria-label*="dollars"]',
        '[aria-label*="US dollars"]'
      ]
      
      for (const selector of selectors) {
        const foundElement = document.querySelector(selector)
        if (foundElement) {
          console.log('[BS Extension] Found element with selector:', selector)
          
          // If we found a div, check if it has a span inside with aria-label
          if (foundElement.tagName === 'DIV' || foundElement.classList.contains('YMlIz')) {
            const spanInside = foundElement.querySelector('span[aria-label*="dollars"]')
            if (spanInside) {
              priceElement = spanInside
              console.log('[BS Extension] Found span inside div with aria-label')
              break
            }
            // If no span found, check if the div itself has aria-label
            if (foundElement.getAttribute('aria-label')) {
              priceElement = foundElement
              break
            }
          } else {
            priceElement = foundElement
            break
          }
        }
      }
    }
    
    if (!priceElement) {
      console.log('[BS Extension] Price element not found, trying all elements with aria-label...')
      // Try to find any element with aria-label containing "dollars"
      const allElements = document.querySelectorAll('[aria-label]')
      for (const el of allElements) {
        const ariaLabel = el.getAttribute('aria-label') || ''
        if (ariaLabel.includes('dollars') && ariaLabel.match(/\d+/)) {
          priceElement = el
          console.log('[BS Extension] Found price element via aria-label search:', ariaLabel)
          break
        }
      }
    }
    
    // Also try to find div.YMlIz.FpEdX.jLMuyc and then look for span inside
    if (!priceElement) {
      const divContainer = document.querySelector('.YMlIz.FpEdX.jLMuyc, div.YMlIz.FpEdX.jLMuyc')
      if (divContainer) {
        const spanWithAriaLabel = divContainer.querySelector('span[aria-label*="dollars"]')
        if (spanWithAriaLabel) {
          priceElement = spanWithAriaLabel
          console.log('[BS Extension] Found span inside YMlIz div via fallback search')
        }
      }
    }
    
    if (!priceElement) {
      console.log('[BS Extension] Could not find price element')
      return
    }
    
    // Get aria-label attribute
    const ariaLabel = priceElement.getAttribute('aria-label')
    console.log('[BS Extension] Found aria-label:', ariaLabel)
    
    if (!ariaLabel) {
      // Try textContent as fallback
      const textContent = priceElement.textContent || priceElement.innerText || ''
      console.log('[BS Extension] No aria-label, trying textContent:', textContent)
      
      // Extract number from text content
      const textMatch = textContent.match(/(\d+(?:\.\d+)?)/)
      if (textMatch) {
        const price = parseFloat(textMatch[1])
        if (!isNaN(price) && price > 0) {
          fillCashPriceFields(price)
          return
        }
      }
      return
    }
    
    // Extract number from aria-label like "149 US dollars", "149 dollars", "6517 US dollars", or "99,999 US dollars"
    // Handle both comma-separated numbers (e.g., "99,999") and plain numbers (e.g., "1673")
    // Pattern: matches 1-5 digits OR comma-separated numbers up to 99,999
    let match = null
    
    // First try: match comma-separated numbers (e.g., "99,999" or "1,673")
    match = ariaLabel.match(/(\d{1,3}(?:,\d{3})+(?:\.\d+)?)/)
    
    // Second try: match plain numbers without commas (1-5 digits for up to 99,999)
    if (!match) {
      match = ariaLabel.match(/(\d{1,5}(?:\.\d+)?)/)
    }
    
    // Third try: fallback to any number sequence
    if (!match) {
      match = ariaLabel.match(/(\d+(?:\.\d+)?)/)
    }
    
    if (!match) {
      console.log('[BS Extension] Could not extract number from aria-label:', ariaLabel)
      return
    }
    
    // Remove commas from the matched number string before parsing
    const priceStr = match[1].replace(/,/g, '')
    const price = parseFloat(priceStr)
    if (isNaN(price) || price <= 0) {
      console.log('[BS Extension] Invalid price extracted:', price)
      return
    }
    
    // Validate price is within reasonable range (up to 99,999)
    if (price > 99999) {
      console.log('[BS Extension] Price exceeds maximum (99,999):', price)
      return
    }
    
    console.log('[BS Extension] Extracted price from Google Flights:', price)
    fillCashPriceFields(price)
    
  } catch (error) {
    console.error('[BS Extension] Error extracting price from Google Flights:', error)
  }
}

// Helper function to fill cash price fields
// This fills both CASM Calculator Cash field and Award Flight Analysis Cash Price field
// Both use the first price from top flights (class="U3gSDe ETvUZc"), not the cheapest
function fillCashPriceFields(price) {
  // Fill CASM Calculator Cash field
  const casmCashInput = document.getElementById('bs-casm-cash-price')
  if (casmCashInput) {
    casmCashInput.value = price
    casmCashInput.dispatchEvent(new Event('input', { bubbles: true }))
    casmCashInput.dispatchEvent(new Event('change', { bubbles: true }))
    console.log('[BS Extension] Filled CASM Calculator Cash field with:', price)
  } else {
    console.log('[BS Extension] CASM Calculator Cash field not found')
  }
  
  // Fill Award Flight Analysis Cash Price field
  const standaloneCashInput = document.getElementById('bs-standalone-cash-price')
  if (standaloneCashInput) {
    standaloneCashInput.value = price
    standaloneCashInput.dispatchEvent(new Event('input', { bubbles: true }))
    standaloneCashInput.dispatchEvent(new Event('change', { bubbles: true }))
    console.log('[BS Extension] Filled Award Flight Analysis Cash Price field with:', price)
  } else {
    console.log('[BS Extension] Award Flight Analysis Cash Price field not found')
  }
}

// Function to inject flight details
function injectFlightDetails() {
  // Prevent concurrent injections
  if (isInjecting) {
    console.log("[BS Extension] Injection already in progress, skipping")
    return
  }
  
  try {
    isInjecting = true
    console.log("[BS Extension] === INJECTING FLIGHT DETAILS ===")
    
    // Check if page is ready
    if (!isPageReady()) {
      console.log("[BS Extension] Page not ready for injection, will retry")
      isInjecting = false
      // Retry after a delay
      setTimeout(() => {
        if (!isInjecting) {
          injectFlightDetails()
        }
      }, 1000)
      return
    }
    
    // Skip injection on the main flights homepage, but not on search results
    if (
      window.location.href.includes("tcfs") &&
      !window.location.href.includes("search") &&
      !document.querySelector(".MX5RWe.sSHqwe.y52p7d, .L5Okte.y52p7d")
    ) {
      console.log("[BS Extension] Skipping injection on homepage")
      isInjecting = false
      return
    }

    // Replace CO2 emissions with flight details
    replaceEmissionsWithFlightDetails();

    console.log("[BS Extension] === FLIGHT DETAILS INJECTION COMPLETE ===")
  } catch (error) {
    console.error("[BS Extension] Error injecting flight details:", error)
  } finally {
    isInjecting = false
  }
}

// Function to ensure visibility
function ensureVisibility() {
  // Remove unwanted spans first
  removeUnwantedSpans()
  
  
  // This runs periodically to make sure our injected content stays visible
  const injectedElements = document.querySelectorAll(".injected-flight-details")

  injectedElements.forEach((element) => {
    // Make sure the element is visible
    element.style.display = "flex"

    // Make sure parent containers don't hide our content
    let parent = element.parentElement
    while (parent && parent !== document.body) {
      const style = window.getComputedStyle(parent)
      if (style.overflow === "hidden" || style.overflowY === "hidden") {
        parent.style.overflow = "visible"
        parent.style.overflowY = "visible"
      }
      parent = parent.parentElement
    }
  })

  // Also replace any emissions that might have been re-added
  replaceEmissionsWithFlightDetails()

  // Schedule the next check
  setTimeout(ensureVisibility, 2000)
}

// Initialize injection with proper error handling
(function initializeInjection() {
  'use strict';
  
  try {
    console.log("[BS Extension] Flight details injector initializing...")
    
    // Wait for page to be ready
    function waitForReady() {
      if (isPageReady()) {
        console.log("[BS Extension] Page fully loaded and ready, starting injection")
        injectFlightDetails()
        // Try to extract and fill price after a delay to allow elements to render
        setTimeout(() => {
          extractAndFillPriceFromGoogleFlights()
        }, 1000)
      } else {
        // Retry after a delay
        setTimeout(waitForReady, 500)
      }
    }
    
    // Wait for page to be fully loaded before starting
    function waitForPageFullyLoaded() {
      return new Promise((resolve) => {
        // If page is already fully loaded
        if (document.readyState === 'complete') {
          // Wait a bit more for dynamic content to render
          setTimeout(() => {
            resolve();
          }, 500);
          return;
        }

        // Wait for window load event (all resources loaded)
        if (document.readyState === 'loading') {
    window.addEventListener('load', () => {
            // Additional wait for dynamic content
      setTimeout(() => {
              resolve();
            }, 500);
          }, { once: true });
        } else {
          // Interactive state - wait for load event
          window.addEventListener('load', () => {
            setTimeout(() => {
              resolve();
            }, 500);
          }, { once: true });
        }
      });
    }
    
    // Start the injection only after page is fully loaded
    waitForPageFullyLoaded().then(() => {
      console.log("[BS Extension] Page fully loaded, checking readiness...")
      waitForReady()
    }).catch((error) => {
      console.error("[BS Extension] Error waiting for page load:", error)
      // Fallback: try anyway after a delay
      setTimeout(() => {
        waitForReady()
      }, 2000)
    })
    
    // Handle URL changes (SPA navigation)
    let lastUrl = location.href
    new MutationObserver(() => {
      const url = location.href
      if (url !== lastUrl) {
        lastUrl = url
        console.log("[BS Extension] URL changed, re-injecting")
        // Reset injection flags
        document.querySelectorAll('[data-bs-injected]').forEach(el => {
          delete el.dataset.bsInjected
        })
        setTimeout(() => {
          if (!isInjecting) {
            injectFlightDetails()
            // Try to extract and fill price after URL change
            setTimeout(() => {
              extractAndFillPriceFromGoogleFlights()
              // Try to extract and fill airline
              if (typeof window.extractAndFillAirlineFromGoogleFlights === 'function') {
                window.extractAndFillAirlineFromGoogleFlights()
              }
            }, 1500)
          }
        }, 1000)
      }
    }).observe(document, { subtree: true, childList: true })
    
  } catch (error) {
    console.error("[BS Extension] Error initializing injection:", error)
  }
})()

// Start the visibility checker
setTimeout(() => {
  ensureVisibility()
}, 2000)

// Watch for price element to appear and auto-fill
let priceExtractionAttempts = 0
const maxPriceExtractionAttempts = 10

const priceObserver = new MutationObserver(() => {
  // Debounce the extraction
  if (priceExtractionAttempts >= maxPriceExtractionAttempts) {
    return
  }
  
  priceExtractionAttempts++
  
  // Check if price element exists
  const priceElement = document.querySelector('.YMlIz.FpEdX.jLMuyc, [aria-label*="dollars"]')
  if (priceElement) {
    // Check if we've already filled the price
    const casmCashInput = document.getElementById('bs-casm-cash-price')
    const standaloneCashInput = document.getElementById('bs-standalone-cash-price')
    
    // Only fill if fields are empty or zero
    const casmHasValue = casmCashInput && casmCashInput.value && parseFloat(casmCashInput.value) > 0
    const standaloneHasValue = standaloneCashInput && standaloneCashInput.value && parseFloat(standaloneCashInput.value) > 0
    
    if (!casmHasValue || !standaloneHasValue) {
      extractAndFillPriceFromGoogleFlights()
    }
    
    // Also try to extract airline
    if (typeof window.extractAndFillAirlineFromGoogleFlights === 'function') {
      window.extractAndFillAirlineFromGoogleFlights()
    }
  }
})

// Start observing for price element
if (document.body) {
  priceObserver.observe(document.body, {
    childList: true,
    subtree: true
  })
} else {
  // Wait for body to be available
  document.addEventListener('DOMContentLoaded', () => {
    priceObserver.observe(document.body, {
      childList: true,
      subtree: true
    })
  })
}

// Also try periodically to extract price
let periodicPriceCheck = setInterval(() => {
  const casmCashInput = document.getElementById('bs-casm-cash-price')
  const standaloneCashInput = document.getElementById('bs-standalone-cash-price')
  
  const casmHasValue = casmCashInput && casmCashInput.value && parseFloat(casmCashInput.value) > 0
  const standaloneHasValue = standaloneCashInput && standaloneCashInput.value && parseFloat(standaloneCashInput.value) > 0
  
  if (!casmHasValue || !standaloneHasValue) {
    extractAndFillPriceFromGoogleFlights()
  } else {
    // Stop checking if both fields are filled
    clearInterval(periodicPriceCheck)
  }
  
  // Also try to extract airline periodically
  if (typeof window.extractAndFillAirlineFromGoogleFlights === 'function') {
    window.extractAndFillAirlineFromGoogleFlights()
  }
}, 2000)

// Stop periodic check after 30 seconds
setTimeout(() => {
  clearInterval(periodicPriceCheck)
}, 30000)

// Debounced observer for detecting new flight content
let observerTimeout = null
let lastMutationTime = 0

// Run when new content is added to the page
const observer = new MutationObserver((mutations) => {
  // Ignore mutations from our own injections
  let shouldRun = false
  let hasFlightElements = false
  
  mutations.forEach((mutation) => {
    // Skip if this mutation was caused by our injection
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Skip if this is our injected element
          if (node.classList && node.classList.contains('injected-flight-details')) {
            return
          }
          
          // Check if this node or its children contain flight elements
          if (node.querySelector && (
            node.querySelector('li.pIav2d') ||
            node.querySelector('.yR1fYc') ||
            node.querySelector('.mxvQLc') ||
            node.querySelector('.MX5RWe.sSHqwe.y52p7d') ||
            node.querySelector('.L5Okte.y52p7d')
          )) {
            hasFlightElements = true
          }
          
          if (
            node.classList.contains('pIav2d') ||
            node.classList.contains('yR1fYc') ||
            node.classList.contains('mxvQLc') ||
            node.classList.contains('MX5RWe') ||
            node.classList.contains('L5Okte')
          ) {
            hasFlightElements = true
          }
        }
      })
    }
    
    // Check for removed nodes (Google might have re-rendered)
    if (mutation.removedNodes.length > 0) {
      mutation.removedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && 
            node.classList && 
            node.classList.contains('injected-flight-details')) {
          // Our injection was removed, need to re-inject
          shouldRun = true
        }
      })
    }
  })
  
  if (hasFlightElements || shouldRun) {
    const now = Date.now()
    // Debounce: only trigger if last mutation was more than 500ms ago
    if (now - lastMutationTime > 500) {
      lastMutationTime = now
      console.log("[BS Extension] New flight content detected, scheduling injection")
      debouncedInjection(500)
    } else {
      // Reset the timeout
      if (observerTimeout) {
        clearTimeout(observerTimeout)
      }
      observerTimeout = setTimeout(() => {
        console.log("[BS Extension] Debounced injection triggered")
        debouncedInjection(300)
      }, 500)
    }
  }
})

// Start observing once body is available
function startObserver() {
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false // Don't watch attributes to reduce overhead
    })
    console.log("[BS Extension] MutationObserver started")
  } else {
    // Wait for body to be available
    setTimeout(startObserver, 100)
  }
}

startObserver()
