// Currency Converter Component
// Provides currency conversion functionality using Exchange Rate API

class CurrencyConverter {
  constructor() {
    this.isOpen = false;
    this.amount = '1000,00';
    this.fromCurrency = 'USD';
    this.toCurrency = 'EUR';
    this.copied = false;
    this.rates = null;
    this.dataUpdatedAt = null;
    this.refetchInterval = null;
    
    // Load favorites from localStorage
    const saved = localStorage.getItem('favoriteCurrencies');
    this.favorites = saved ? JSON.parse(saved) : ['USD', 'EUR', 'GBP'];
    
    this.modal = null;
    this.init();
  }

  init() {
    // Create modal HTML
    this.createModal();
    // Fetch initial rates
    this.fetchRates();
    // Set up auto-refresh
    this.setupAutoRefresh();
  }

  createModal() {
    // Remove existing modal if any
    const existing = document.getElementById('bs-currency-converter-modal');
    if (existing) existing.remove();

    this.modal = document.createElement('div');
    this.modal.id = 'bs-currency-converter-modal';
    this.modal.className = 'bs-currency-modal';
    this.modal.style.display = 'none';
    
    this.modal.innerHTML = this.getModalHTML();
    document.body.appendChild(this.modal);
    
    // Set up event listeners
    this.setupEventListeners();
  }

  getModalHTML() {
    const sortedCurrencies = this.getSortedCurrencies();
    
    return `
      <div class="bs-currency-modal-overlay"></div>
      <div class="bs-currency-modal-content">
        <!-- Header -->
        <div class="bs-currency-modal-header">
          <div class="bs-currency-modal-header-left">
            <div class="bs-currency-modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" x2="12" y1="2" y2="22"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h2 class="bs-currency-modal-title">Quick Convert</h2>
          </div>
          <button class="bs-currency-modal-close" aria-label="Close converter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="bs-currency-modal-body">
          <!-- Amount Input and From Currency -->
          <div class="bs-currency-input-group">
            <input
              type="text"
              id="bs-currency-amount"
              class="bs-currency-amount-input"
              value="${this.amount}"
              placeholder="0,00"
              aria-label="Amount to convert"
            />
            <div class="bs-currency-select-wrapper">
              <select
                id="bs-currency-from"
                class="bs-currency-select"
                aria-label="From currency"
              >
                ${sortedCurrencies.map(([code, { name }]) => `
                  <option value="${code}" ${code === this.fromCurrency ? 'selected' : ''}>
                    ${this.favorites.includes(code) ? '⭐ ' : ''}${code} - ${name}
                  </option>
                `).join('')}
              </select>
              <button
                class="bs-currency-favorite-btn"
                data-currency="from"
                aria-label="Toggle favorite"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </button>
            </div>
          </div>

          <!-- Divider with Rate and Swap Button -->
          <div class="bs-currency-divider">
            <button
              class="bs-currency-swap-btn"
              aria-label="Swap currencies"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 3 21 3 21 8"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <polyline points="8 21 3 21 3 16"></polyline>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            </button>
            <div class="bs-currency-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </div>
            <div class="bs-currency-rate" id="bs-currency-rate">
              1 ${this.fromCurrency} = ${this.formatNumber(this.getExchangeRate())} ${this.toCurrency}
            </div>
          </div>

          <!-- Result and To Currency -->
          <div class="bs-currency-input-group">
            <div class="bs-currency-result-wrapper">
              <div class="bs-currency-result" id="bs-currency-result">
                ${this.formatNumber(this.calculateConversion())}
              </div>
              <button
                class="bs-currency-copy-btn"
                aria-label="${this.copied ? 'Copied!' : 'Copy value'}"
              >
                ${this.copied ? `
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ` : `
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                `}
              </button>
            </div>
            <div class="bs-currency-select-wrapper">
              <select
                id="bs-currency-to"
                class="bs-currency-select"
                aria-label="To currency"
              >
                ${sortedCurrencies.map(([code, { name }]) => `
                  <option value="${code}" ${code === this.toCurrency ? 'selected' : ''}>
                    ${this.favorites.includes(code) ? '⭐ ' : ''}${code} - ${name}
                  </option>
                `).join('')}
              </select>
              <button
                class="bs-currency-favorite-btn"
                data-currency="to"
                aria-label="Toggle favorite"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bs-currency-modal-footer">
          <div class="bs-currency-updated">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span id="bs-currency-updated-text">
              ${this.getUpdatedText()}
            </span>
          </div>
          <button class="bs-currency-refresh-btn">
            Refresh Rates
          </button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Close button
    const closeBtn = this.modal.querySelector('.bs-currency-modal-close');
    const overlay = this.modal.querySelector('.bs-currency-modal-overlay');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (overlay) overlay.addEventListener('click', () => this.close());

    // Amount input
    const amountInput = this.modal.querySelector('#bs-currency-amount');
    if (amountInput) {
      amountInput.addEventListener('input', (e) => this.handleAmountChange(e));
      amountInput.addEventListener('blur', () => this.handleAmountBlur());
      amountInput.addEventListener('focus', () => this.handleAmountFocus());
    }

    // Currency selects
    const fromSelect = this.modal.querySelector('#bs-currency-from');
    const toSelect = this.modal.querySelector('#bs-currency-to');
    if (fromSelect) {
      this._fromSelectHandler = (e) => {
        this.fromCurrency = e.target.value;
        this.fetchRates();
        this.updateDisplay();
      };
      fromSelect.addEventListener('change', this._fromSelectHandler);
    }
    if (toSelect) {
      this._toSelectHandler = (e) => {
        this.toCurrency = e.target.value;
        this.updateDisplay();
      };
      toSelect.addEventListener('change', this._toSelectHandler);
    }

    // Favorite buttons
    const favoriteBtns = this.modal.querySelectorAll('.bs-currency-favorite-btn');
    favoriteBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const currencyType = e.currentTarget.dataset.currency;
        const currency = currencyType === 'from' ? this.fromCurrency : this.toCurrency;
        this.toggleFavorite(currency);
      });
    });

    // Swap button
    const swapBtn = this.modal.querySelector('.bs-currency-swap-btn');
    if (swapBtn) {
      swapBtn.addEventListener('click', () => this.swapCurrencies());
    }

    // Copy button
    const copyBtn = this.modal.querySelector('.bs-currency-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.handleCopy());
    }

    // Refresh button
    const refreshBtn = this.modal.querySelector('.bs-currency-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.fetchRates());
    }
  }

  getSortedCurrencies() {
    if (!window.CURRENCIES) return [];
    return Object.entries(window.CURRENCIES).sort((a, b) => {
      const aFav = this.favorites.includes(a[0]);
      const bFav = this.favorites.includes(b[0]);
      if (aFav === bFav) return a[1].name.localeCompare(b[1].name);
      return aFav ? -1 : 1;
    });
  }

  formatNumber(num) {
    const [integerPart, decimalPart = '00'] = num.toFixed(2).split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedInteger},${decimalPart}`;
  }

  parseFormattedNumber(value) {
    if (!value) return 0;
    const cleanValue = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
  }

  calculateConversion() {
    if (!this.rates || !this.amount) return 0;
    const numericAmount = this.parseFormattedNumber(this.amount);
    const rate = this.rates[this.toCurrency];
    return numericAmount * (rate || 0);
  }

  getExchangeRate() {
    if (!this.rates) return 0;
    return this.rates[this.toCurrency] || 0;
  }

  handleAmountChange(e) {
    const value = e.target.value.replace(/[^\d,]/g, '');
    this.amount = value;
    this.updateDisplay();
  }

  handleAmountBlur() {
    const numericValue = this.parseFormattedNumber(this.amount);
    this.amount = this.formatNumber(numericValue);
    const amountInput = this.modal.querySelector('#bs-currency-amount');
    if (amountInput) amountInput.value = this.amount;
    this.updateDisplay();
  }

  handleAmountFocus() {
    this.amount = '';
    const amountInput = this.modal.querySelector('#bs-currency-amount');
    if (amountInput) amountInput.value = '';
  }

  async handleCopy() {
    const value = this.formatNumber(this.calculateConversion());
    try {
      await navigator.clipboard.writeText(value);
      this.copied = true;
      this.updateCopyButton();
      setTimeout(() => {
        this.copied = false;
        this.updateCopyButton();
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  swapCurrencies() {
    const temp = this.fromCurrency;
    this.fromCurrency = this.toCurrency;
    this.toCurrency = temp;
    this.fetchRates();
    this.updateDisplay();
    this.updateSelects();
  }

  toggleFavorite(currencyCode) {
    if (this.favorites.includes(currencyCode)) {
      this.favorites = this.favorites.filter(code => code !== currencyCode);
    } else {
      this.favorites.push(currencyCode);
    }
    localStorage.setItem('favoriteCurrencies', JSON.stringify(this.favorites));
    this.updateSelects();
    this.updateFavoriteButtons();
  }

  updateSelects() {
    const fromSelect = this.modal.querySelector('#bs-currency-from');
    const toSelect = this.modal.querySelector('#bs-currency-to');
    const sortedCurrencies = this.getSortedCurrencies();
    
    if (fromSelect) {
      const currentValue = fromSelect.value;
      fromSelect.innerHTML = sortedCurrencies.map(([code, { name }]) => `
        <option value="${code}" ${code === this.fromCurrency ? 'selected' : ''}>
          ${this.favorites.includes(code) ? '⭐ ' : ''}${code} - ${name}
        </option>
      `).join('');
      fromSelect.value = this.fromCurrency;
      // Re-attach event listener
      fromSelect.removeEventListener('change', this._fromSelectHandler);
      this._fromSelectHandler = (e) => {
        this.fromCurrency = e.target.value;
        this.fetchRates();
        this.updateDisplay();
      };
      fromSelect.addEventListener('change', this._fromSelectHandler);
    }
    
    if (toSelect) {
      const currentValue = toSelect.value;
      toSelect.innerHTML = sortedCurrencies.map(([code, { name }]) => `
        <option value="${code}" ${code === this.toCurrency ? 'selected' : ''}>
          ${this.favorites.includes(code) ? '⭐ ' : ''}${code} - ${name}
        </option>
      `).join('');
      toSelect.value = this.toCurrency;
      // Re-attach event listener
      toSelect.removeEventListener('change', this._toSelectHandler);
      this._toSelectHandler = (e) => {
        this.toCurrency = e.target.value;
        this.updateDisplay();
      };
      toSelect.addEventListener('change', this._toSelectHandler);
    }
  }

  updateFavoriteButtons() {
    const favoriteBtns = this.modal.querySelectorAll('.bs-currency-favorite-btn');
    favoriteBtns.forEach(btn => {
      const currencyType = btn.dataset.currency;
      const currency = currencyType === 'from' ? this.fromCurrency : this.toCurrency;
      const isFavorite = this.favorites.includes(currency);
      btn.classList.toggle('bs-favorite-active', isFavorite);
    });
  }

  updateCopyButton() {
    const copyBtn = this.modal.querySelector('.bs-currency-copy-btn');
    if (!copyBtn) return;
    
    if (this.copied) {
      copyBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
      copyBtn.style.color = '#10b981';
    } else {
      copyBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `;
      copyBtn.style.color = '';
    }
  }

  updateDisplay() {
    const resultEl = this.modal.querySelector('#bs-currency-result');
    const rateEl = this.modal.querySelector('#bs-currency-rate');
    
    if (resultEl) {
      resultEl.textContent = this.formatNumber(this.calculateConversion());
    }
    
    if (rateEl) {
      rateEl.textContent = `1 ${this.fromCurrency} = ${this.formatNumber(this.getExchangeRate())} ${this.toCurrency}`;
    }
  }

  getUpdatedText() {
    if (!this.dataUpdatedAt) return 'never';
    const seconds = Math.floor((Date.now() - this.dataUpdatedAt) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  updateUpdatedText() {
    const updatedText = this.modal.querySelector('#bs-currency-updated-text');
    if (updatedText) {
      updatedText.textContent = this.getUpdatedText();
    }
  }

  async fetchRates() {
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${this.fromCurrency}`
      );
      const data = await response.json();
      this.rates = data.rates;
      this.dataUpdatedAt = Date.now();
      this.updateDisplay();
      this.updateUpdatedText();
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  }

  setupAutoRefresh() {
    // Clear existing interval
    if (this.refetchInterval) {
      clearInterval(this.refetchInterval);
    }
    
    // Refresh every 5 minutes (300000ms)
    this.refetchInterval = setInterval(() => {
      if (this.isOpen) {
        this.fetchRates();
      }
    }, 300000);
  }

  open() {
    this.isOpen = true;
    if (this.modal) {
      this.modal.style.display = 'flex';
      // Focus amount input
      const amountInput = this.modal.querySelector('#bs-currency-amount');
      if (amountInput) {
        setTimeout(() => amountInput.focus(), 100);
      }
    }
    // Fetch rates if not available
    if (!this.rates) {
      this.fetchRates();
    }
  }

  close() {
    this.isOpen = false;
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}

// Create global instance
let currencyConverterInstance = null;

// Initialize currency converter when DOM is ready
function initializeCurrencyConverter() {
  if (!currencyConverterInstance) {
    currencyConverterInstance = new CurrencyConverter();
    window.currencyConverter = currencyConverterInstance;
  }
}

// Auto-initialize when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCurrencyConverter);
} else {
  initializeCurrencyConverter();
}

// Make available globally
window.CurrencyConverter = CurrencyConverter;
window.initializeCurrencyConverter = initializeCurrencyConverter;
