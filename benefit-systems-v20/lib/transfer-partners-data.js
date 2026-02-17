// Transfer Partners Data Service
// Fetches transfer partner data from Supabase

class TransferPartnersService {
  constructor() {
    // Use centralized config
    this.supabaseUrl = window.config?.api?.supabase?.url || 'https://saegzrncsjcsvgcjkniv.supabase.co';
    this.supabaseKey = window.config?.api?.supabase?.key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZWd6cm5jc2pjc3ZnY2prbml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3ODgxNDYsImV4cCI6MjA0NzM2NDE0Nn0.w1eHVcuvDUoqhcMCYenKKA9URAtG4YbW3j5GcDgvu3Y';
    this.partners = [];
    this.isLoaded = false;
    this.loadingPromise = null;
    
    // Initialize logger
    this.logger = window.createLogger?.('TransferPartners') || console;
  }

  // Normalize ratio for modal: 'N/A', '', null -> null; else keep (e.g. '1:1')
  _ratioForModal(v) {
    if (v == null || v === '' || String(v).toUpperCase() === 'N/A') return null;
    return String(v).trim() || null;
  }

  // Fetch transfer partners from Supabase (cached)
  async fetchTransferPartners() {
    if (this.isLoaded) {
      return this.partners;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this._loadTransferPartners();
    return this.loadingPromise;
  }

  // Fetch transfer partners live (no cache / fresh for modals)
  async fetchTransferPartnersLive() {
    return await window.errorHandler?.safeAsync(async () => {
      this.logger.info('Fetching transfer partners from Supabase (live)...');
      const url = `${this.supabaseUrl}/rest/v1/transfer_partners?select=*`;
      const data = await window.httpClient?.request(url, {
        useBackground: true,
        cache: false,
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }) || [];
      return data.map(p => this._rawToLegacy(p));
    }, [], { module: 'TransferPartnersService', action: 'fetchTransferPartnersLive' }) || [];
  }

  _rawToLegacy(partner) {
    return {
      name: partner.name ? partner.name.replace(/\s*(STAR ALLIANCE|ONE WORLD|SKYTEAM|MARRIOTT BONVOY|WORLD OF HYATT|WYNDHAM REWARDS).*$/i, '').trim() : partner.name,
      type: partner.type === 'Airlines' ? 'Airline' : partner.type === 'Hotels' ? 'Hotel' : partner.type,
      program: partner.program,
      amex: partner.amex || 'N/A',
      chase: partner.chase || 'N/A',
      citi: partner.citi || 'N/A',
      capital_one: partner.capital_one || 'N/A',
      bilt: partner.bilt || 'N/A',
      alliance: partner.alliance,
      wells_fargo: partner.wells_fargo || 'N/A',
      rove: partner.rove || 'N/A',
      rate_label: partner.rate_label || null,
      via_label: partner.via_label || null
    };
  }

  async _loadTransferPartners() {
    // Use error handler for safe async execution
    return await window.errorHandler?.safeAsync(async () => {
      this.logger.info('Fetching transfer partners from Supabase...');
      
      const url = `${this.supabaseUrl}/rest/v1/transfer_partners?select=*`;
      
      // Use HTTP client with caching
      const data = await window.httpClient?.request(url, {
        useBackground: true,
        cache: true,
        cacheTTL: window.config?.cache?.supabaseTTL,
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }) || [];

      this.logger.debug('Transfer partners fetched, processing data...', data.length, 'partners');
      this.logger.debug('Sample partner:', data[0]);
      
      this.partners = data.map(p => this._rawToLegacy(p));
      
      this.logger.debug('Transformed partners:', this.partners.slice(0, 3));
      
      const typeCounts = this.partners.reduce((acc, partner) => {
        if (partner.type) acc[partner.type] = (acc[partner.type] || 0) + 1;
        return acc;
      }, {});
      this.logger.debug('Partner type distribution:', typeCounts);

      this.isLoaded = true;
      this.logger.info(`Successfully loaded ${this.partners.length} transfer partners from Supabase`);
      return this.partners;
    }, [], {
      module: 'TransferPartnersService',
      action: '_loadTransferPartners'
    }) || [];
  }

  // Infer hotel rate label when not provided (Fixed Points Value | Fixed Points Rates | Dynamic Points Rates)
  _inferHotelRateLabel(partner, program, rateLabel) {
    if (rateLabel && String(rateLabel).trim()) return rateLabel.trim();
    const name = ((partner || '') + ' ' + (program || '')).toLowerCase();
    if (/accor/i.test(name)) return 'Fixed Points Value';
    if (/choice|hyatt|wyndham|iprefer|preferred\s*hotels/i.test(name)) return 'Fixed Points Rates';
    return 'Dynamic Points Rates';
  }

  // Return rows in modal format for Hotels table (live fetch)
  async getHotelTransferRowsLive() {
    const raw = await this.fetchTransferPartnersLive();
    const hotelOrder = ['Fixed Points Value', 'Fixed Points Rates', 'Dynamic Points Rates'];
    const rows = raw
      .filter(p => p.type === 'Hotel')
      .map(p => {
        const partner = p.name || '';
        const program = p.program || '';
        const rateLabel = this._inferHotelRateLabel(partner, program, p.rate_label);
        const isPreferredHotels = /Preferred Hotels/i.test(partner);
        return {
          partner,
          program,
          rateLabel,
          viaLabel: isPreferredHotels ? 'Choice' : (p.via_label || null),
          amex: this._ratioForModal(p.amex),
          chase: this._ratioForModal(p.chase),
          citi: this._ratioForModal(p.citi),
          capOne: this._ratioForModal(p.capital_one),
          bilt: this._ratioForModal(p.bilt),
          wellsFargo: this._ratioForModal(p.wells_fargo),
          rove: this._ratioForModal(p.rove)
        };
      });
    rows.sort((a, b) => {
      const ai = hotelOrder.indexOf(a.rateLabel || '');
      const bi = hotelOrder.indexOf(b.rateLabel || '');
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      return (a.partner || '').localeCompare(b.partner || '');
    });
    return rows;
  }

  // Return rows in modal format for Airlines table (live fetch)
  async getAirlineTransferRowsLive() {
    const raw = await this.fetchTransferPartnersLive();
    return raw
      .filter(p => p.type === 'Airline')
      .map(p => ({
        partner: p.name || '',
        program: p.program || '',
        alliance: p.alliance || null,
        amex: this._ratioForModal(p.amex),
        chase: this._ratioForModal(p.chase),
        citi: this._ratioForModal(p.citi),
        capOne: this._ratioForModal(p.capital_one),
        bilt: this._ratioForModal(p.bilt),
        wellsFargo: this._ratioForModal(p.wells_fargo),
        rove: this._ratioForModal(p.rove)
      }));
  }

  // Get all transfer partners
  async getTransferPartnersData() {
    this.logger.debug('getTransferPartnersData called, isLoaded:', this.isLoaded);
    if (!this.isLoaded) {
      this.logger.debug('Data not loaded, fetching...');
      await this.fetchTransferPartners();
    }
    this.logger.debug('Returning partners:', this.partners.length);
    return this.partners;
  }

  // Get partners by type
  async getPartnersByType(type) {
    if (!this.isLoaded) {
      await this.fetchTransferPartners();
    }
    return this.partners.filter(partner => partner.type === type);
  }

  // Get partners by alliance
  async getPartnersByAlliance(alliance) {
    if (!this.isLoaded) {
      await this.fetchTransferPartners();
    }
    return this.partners.filter(partner => partner.alliance === alliance);
  }

  // Search partners
  async searchPartners(query) {
    if (!this.isLoaded) {
      await this.fetchTransferPartners();
    }
    
    const searchTerm = query.toLowerCase();
    return this.partners.filter(partner => 
      partner.name.toLowerCase().includes(searchTerm) ||
      partner.program.toLowerCase().includes(searchTerm) ||
      partner.alliance.toLowerCase().includes(searchTerm)
    );
  }
}

// Create global instance
const transferPartnersService = new TransferPartnersService();

// Legacy functions for backward compatibility
async function getTransferPartnersData() {
  return await transferPartnersService.getTransferPartnersData();
}

async function getPartnersByType(type) {
  return await transferPartnersService.getPartnersByType(type);
}

async function getPartnersByAlliance(alliance) {
  return await transferPartnersService.getPartnersByAlliance(alliance);
}

async function searchPartners(query) {
  return await transferPartnersService.searchPartners(query);
}

// Make functions available globally
window.getTransferPartnersData = getTransferPartnersData;
window.getPartnersByType = getPartnersByType;
window.getPartnersByAlliance = getPartnersByAlliance;
window.searchPartners = searchPartners;
window.transferPartnersService = transferPartnersService;
