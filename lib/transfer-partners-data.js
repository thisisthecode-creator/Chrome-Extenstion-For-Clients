// Transfer Partners Data Service
// Fetches transfer partner data from Supabase

class TransferPartnersService {
  constructor() {
    this.supabaseUrl = 'https://saegzrncsjcsvgcjkniv.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZWd6cm5jc2pjc3ZnY2prbml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3ODgxNDYsImV4cCI6MjA0NzM2NDE0Nn0.w1eHVcuvDUoqhcMCYenKKA9URAtG4YbW3j5GcDgvu3Y';
    this.partners = [];
    this.isLoaded = false;
    this.loadingPromise = null;
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
    try {
      console.log('Fetching transfer partners from Supabase...');
      
      const response = await fetch(`${this.supabaseUrl}/rest/v1/transfer_partners?select=*`, {
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Transfer partners fetched, processing data...', data.length, 'partners');
      console.log('Sample partner:', data[0]);
      
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
        wells_fargo: partner.wells_fargo || 'N/A'
        rove: partner.rove || 'N/A'
      }));
      
      console.log('Transformed partners:', this.partners.slice(0, 3));
      
      // Debug: Check type distribution
      const typeCounts = this.partners.reduce((acc, partner) => {
        if (partner.type) {
          acc[partner.type] = (acc[partner.type] || 0) + 1;
        }
        return acc;
      }, {});
      console.log('Partner type distribution:', typeCounts);

      this.isLoaded = true;
      console.log(`Successfully loaded ${this.partners.length} transfer partners from Supabase`);
      return this.partners;
    } catch (error) {
      console.error('Error loading transfer partners from Supabase:', error);
      // Fallback to empty array if Supabase fails
      this.partners = [];
      this.isLoaded = false;
      return [];
    }
  }

  // Get all transfer partners
  async getTransferPartnersData() {
    console.log('getTransferPartnersData called, isLoaded:', this.isLoaded);
    if (!this.isLoaded) {
      console.log('Data not loaded, fetching...');
      await this.fetchTransferPartners();
    }
    console.log('Returning partners:', this.partners.length);
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
