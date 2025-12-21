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
  
  // Find the target element after div class="XwbuFf"
  const targetElement = document.querySelector('.XwbuFf')
  if (!targetElement) {
    console.log('Target element .XwbuFf not found')
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
        <h2 style="margin:0;font-size:22px;font-weight:600;color:#1a1a1a;letter-spacing:-0.01em;">Award Flight Analysis</h2>
        <p style="margin:6px 0 0 0;font-size:14px;color:#666;line-height:1.5;">Compare miles programs and booking classes</p>
      </div>
    </div>
  `
  awardSection.appendChild(header)
  
  // Create controls
  const controls = document.createElement('div')
  controls.style.cssText = 'display:flex;gap:24px;margin-bottom:24px;flex-wrap:wrap;align-items:flex-end;'
  controls.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:8px;">
      <label style="font-size:13px;color:#1a1a1a;font-weight:500;margin-left:2px;">Cash Price</label>
      <div style="display:flex;align-items:center;gap:8px;">
        <input type="number" id="bs-standalone-cash-price" placeholder="500" step="0.01" style="
          border:1.5px solid #e0e0e0;
          padding:12px 16px;
          border-radius:12px;
          width:120px;
          font-size:14px;
          background:#ffffff;
          color:#1a1a1a;
          transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow:0 1px 3px rgba(0, 0, 0, 0.04);
        ">
        <span style="font-size:14px;color:#666;font-weight:500;">USD</span>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;">
      <label style="font-size:13px;color:#1a1a1a;font-weight:500;margin-left:2px;">Miles Value</label>
      <div style="display:flex;align-items:center;gap:8px;">
        <input type="number" id="bs-standalone-miles-value" placeholder="" step="0.1" autocomplete="off" name="bs-standalone-miles-value" inputmode="decimal" value="" style="
          border:1.5px solid #e0e0e0;
          padding:12px 16px;
          border-radius:12px;
          width:120px;
          font-size:14px;
          background:#ffffff;
          color:#1a1a1a;
          transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow:0 1px 3px rgba(0, 0, 0, 0.04);
        ">
        <span style="font-size:14px;color:#666;font-weight:500;">USD per 1000 miles</span>
      </div>
    </div>
  `
  awardSection.appendChild(controls)
  
  // Create booking class filters dropdown
  const filters = document.createElement('div')
  filters.style.cssText = 'background:linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);border:1px solid rgba(0, 0, 0, 0.06);border-radius:16px;padding:20px;margin-bottom:24px;box-shadow:0 2px 6px rgba(0, 0, 0, 0.04);'
  filters.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;">
      <label style="font-size:13px;color:#1a1a1a;font-weight:500;margin-left:2px;">Filter by Booking Class</label>
      <select id="bs-standalone-cabin-filter" style="
        border:1.5px solid #e0e0e0;
        padding:12px 16px;
        border-radius:12px;
        font-size:14px;
        min-width:220px;
        cursor:pointer;
        background:#ffffff;
        color:#1a1a1a;
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
  awardSection.appendChild(filters)
  
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

  // Hard reset any miles value inputs to ensure empty default
  try {
    localStorage.removeItem('bs-standalone-miles-value')
    localStorage.removeItem('bs-miles-value-input')
    const legacyMiles = document.getElementById('bs-miles-value-input')
    if (legacyMiles) { legacyMiles.value = ''; legacyMiles.defaultValue = ''; }
  } catch (_) {}
  
  // Insert after target element
  targetElement.parentNode.insertBefore(awardSection, targetElement.nextSibling)
  
  // Add event listeners
  const cashPriceInput = document.getElementById('bs-standalone-cash-price')
  const milesValueInput = document.getElementById('bs-standalone-miles-value')
  const cabinFilter = document.getElementById('bs-standalone-cabin-filter')
  
  // Ensure the Miles Value input starts empty so defaults come from Supabase
  if (milesValueInput && milesValueInput.value) {
    milesValueInput.value = ''
  }
  
  function updateStandaloneResults() {
    updateStandaloneAwardResults()
  }
  
  if (cashPriceInput) {
    cashPriceInput.addEventListener('input', debounce(updateStandaloneResults, 300))
    cashPriceInput.addEventListener('change', updateStandaloneResults)
  }
  
  if (milesValueInput) {
    // Force-clear any browser autofill/defaults so the field starts empty
    try { milesValueInput.value = ''; milesValueInput.defaultValue = ''; } catch(_) {}
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
function updateStandaloneAwardResults() {
  const resultsContainer = document.getElementById('bs-standalone-award-results')
  if (!resultsContainer) return
  
  if (!lastSeatsSearch || !lastSeatsSearch.data || lastSeatsSearch.data.length === 0) {
    resultsContainer.innerHTML = '<div style="text-align:center;padding:40px;color:#666;font-style:italic;background:linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);border-radius:16px;border:1px solid rgba(0, 0, 0, 0.06);">No award data available. Please check your flight details and try again.</div>'
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
    resultsContainer.innerHTML = '<div style="text-align:center;padding:40px;color:#666;font-style:italic;background:linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);border-radius:16px;border:1px solid rgba(0, 0, 0, 0.06);">Please enter a cash price to see award analysis</div>'
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
  
  let html = '<div style="display:flex;flex-direction:column;gap:20px;">'

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

  // Render in sorted order
  programEntries.forEach(({ av, filteredCabins, programPointValue, taxesCurrency, taxesUSD }) => {
    html += `<div style="background:linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);border:1px solid rgba(0, 0, 0, 0.06);border-radius:16px;overflow:hidden;margin-bottom:16px;box-shadow:0 2px 6px rgba(0, 0, 0, 0.04);transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">`
    html += `<div style="padding:16px 20px;background:linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);border-bottom:1px solid rgba(0, 0, 0, 0.06);">`
    html += `<h3 style="margin:0;font-size:18px;font-weight:600;color:#1a1a1a;letter-spacing:-0.01em;">${av.Source}</h3>`
    html += `</div>`
    html += `<div>`

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

          html += `<div style="display:grid;grid-template-columns:40px 120px 1fr 150px 170px 170px;align-items:center;column-gap:16px;padding:14px 16px;border-top:1px solid rgba(0, 0, 0, 0.06);transition:background 0.2s ease;">`
      // col1 code
      html += `<div style=\"color:#333;font-weight:600;min-width:110px;font-size:13px;\">${c.key}</div>`
      // col2 cabin
      html += `<div style=\"color:#333;font-weight:600;min-width:110px;font-size:13px;\">${cabinName}</div>`
      // middle values
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
      // col3 miles + taxes
      html += `<div style=\"color:#333;font-weight:600;min-width:110px;font-size:13px;white-space:nowrap;\">${formatMilesDots(c.miles)} miles + $${cabinTaxesUSD.toFixed(2)} taxes</div>`
      // col4 Total pill
      html += `<div style=\"min-width:150px;text-align:left;\"><span style=\"font-size:14px;font-weight:600;background:linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);color:#1a1a1a;padding:6px 12px;border-radius:12px;border:1.5px solid rgba(0, 0, 0, 0.08);box-shadow:0 1px 3px rgba(0, 0, 0, 0.04);display:inline-block;\">Total: $${total.toFixed(2)}</span></div>`
      if (effectiveCpmCents !== null && isFinite(effectiveCpmCents)) {
        const marketPerThousand = (window.__marketCpmBySource && typeof window.__marketCpmBySource[av.Source] === 'number') ? window.__marketCpmBySource[av.Source] : null
        const avgCpm = (typeof marketPerThousand === 'number') ? (marketPerThousand / 10) : programAvgCpmCents // convert USD per 1000 to cents per mile
        const avgDisplay = avgCpm.toFixed(1)
        const isBetterCpm = effectiveCpmCents >= avgCpm
        const cpmBetterPct = avgCpm > 0 ? Math.max(0, Math.min(100, ((effectiveCpmCents - avgCpm) / avgCpm) * 100)) : 0
        const ratio = avgCpm > 0 ? (effectiveCpmCents / avgCpm) : null
        const ratioDisplay = (ratio && isFinite(ratio)) ? `${(Math.round(ratio * 10) / 10).toString().replace(/\.0$/, '')}x` : ''
        // col5 CPM pill + indicator
        html += `<div style=\"min-width:170px;display:flex;flex-direction:column;align-items:center;\"><span style=\"font-size:13px;font-weight:700;padding:6px 12px;border-radius:12px;background:${isBetterCpm ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' : 'linear-gradient(135deg, #fdecea 0%, #fcc5c0 100%)'};color:#000;border:1.5px solid ${isBetterCpm ? '#4caf50' : '#f44336'};width:120px;text-align:center;box-sizing:border-box;box-shadow:0 2px 4px rgba(0, 0, 0, 0.06);\">${effectiveCpmCents.toFixed(1)}¢${ratioDisplay ? ` - <span style='font-weight:700;color:#000;opacity:0.6;'>${ratioDisplay}</span>` : ''}</span><div style=\"margin-top:8px;width:120px;\">${createSavingsBar(cpmBetterPct)}</div></div>`
      } else {
        html += `<div></div>`
      }
      // col6 savings pill + indicator + caption
      html += `<div style=\"min-width:140px;display:flex;flex-direction:column;align-items:center;\"><span style=\"font-size:13px;font-weight:700;padding:6px 12px;border-radius:12px;background:${isGoodDeal ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' : 'linear-gradient(135deg, #fdecea 0%, #fcc5c0 100%)'};color:#000;border:1.5px solid ${isGoodDeal ? '#4caf50' : '#f44336'};width:120px;text-align:center;box-sizing:border-box;box-shadow:0 2px 4px rgba(0, 0, 0, 0.06);\">${isGoodDeal ? 'Save' : 'More'} ${Math.abs(savingsPct).toFixed(0)}%</span><div style=\"margin-top:8px;width:120px;\">${createSavingsBar(Math.max(0, savingsPct))}</div></div>`
      
      html += `</div>`
    })
    
    html += `</div>` // Close rows
    html += `</div>` // Close program card
  })
  
  html += '</div>'
  resultsContainer.innerHTML = html
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
    flex-wrap: wrap;
    white-space: nowrap;
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

      // Note: Seats.aero data is now only shown in the global Flight Search section
  }

  // Add the flight details row to the container
  detailsContainer.appendChild(flightDetailsRow)
  
  // Trigger global panel update when flight details are added
  setTimeout(() => {
    triggerGlobalPanelUpdate()
  }, 1000) // Small delay to ensure DOM is ready

  // Add links in a second row
  if (flightInfo.airlineCode && flightInfo.flightNumber) {
    const linksRow = document.createElement("div")
    linksRow.style.cssText = `
      display: flex;
      gap: 8px;
      align-items: center;
      margin-top: 4px;
    `
    
    // Create individual link buttons
    // Order links per request: Seats.Aero, AwardTool, PointsYeah, PY Seats, SA Seats, FareClass, FareViewer, WTC
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

          // Check if it's round-trip or one-way
          const isRoundTrip = returnInput && returnInput.value && returnInput.value.trim() !== ''
          const tripType = isRoundTrip ? '2' : '1' // 2 = round-trip, 1 = one-way
          
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

          // Get airline code from flightInfo, default to empty if not available
          const airlineCode = (flightInfo.airlineCode || '').toUpperCase() || ''
          
          // Get cash price from either input field
          const cashPriceInput = document.getElementById('bs-cash-price-input')
          const standaloneCashPriceInput = document.getElementById('bs-standalone-cash-price')
          const cashPrice = parseFloat(cashPriceInput?.value || standaloneCashPriceInput?.value || '0')
          
          // Build the route parameter: {airline}:Y:{departure}-{arrival}:{airline}:{price}:USD
          // Format: OS:Y:WAW-VIE:OS:100:USD
          const route = `${airlineCode}:Y:${fromCode}-${toCode}:${airlineCode}:${Math.round(cashPrice)}:USD`
          const encodedRoute = encodeURIComponent(route)
          const wtcUrl = `https://wheretocredit.com/de/calculator#route=${encodedRoute}`
          
          window.open(wtcUrl, '_blank')
        }
      }}
    ]
    
    // Create individual link buttons
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
    
    detailsContainer.appendChild(linksRow)
  }

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
  // Check if document is ready
  if (document.readyState === 'loading') {
    return false
  }
  
  // Check if we're on a valid Google Flights page
  if (!window.location.href.includes('google.com/travel/flights')) {
    return false
  }
  
  // Check if flight results container exists
  const hasFlightResults = document.querySelector('li.pIav2d, .yR1fYc, .mxvQLc, .MX5RWe.sSHqwe.y52p7d, .L5Okte.y52p7d')
  if (!hasFlightResults) {
    // Wait a bit more for dynamic content
    return false
  }
  
  return true
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
        console.log("[BS Extension] Page ready, starting injection")
        injectFlightDetails()
      } else {
        // Retry after a delay
        setTimeout(waitForReady, 500)
      }
    }
    
    // Start the injection when ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(waitForReady, 300)
      })
    } else {
      setTimeout(waitForReady, 300)
    }
    
    // Also run when page fully loads
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (!isInjecting) {
          injectFlightDetails()
        }
      }, 1000)
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
