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

  // Fetch transfer partners from Supabase
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
      
      // Transform the data to match our expected format
      this.partners = data.map(partner => ({
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
        rove: partner.rove || 'N/A'
      }));
      
      this.logger.debug('Transformed partners:', this.partners.slice(0, 3));
      
      // Debug: Check type distribution
      const typeCounts = this.partners.reduce((acc, partner) => {
        if (partner.type) {
          acc[partner.type] = (acc[partner.type] || 0) + 1;
        }
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
