// Credit Cards Data Service
// Fetches credit card data from Supabase card_multipliers table

class CreditCardsService {
  constructor() {
    this.supabaseUrl = 'https://saegzrncsjcsvgcjkniv.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZWd6cm5jc2pjc3ZnY2prbml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3ODgxNDYsImV4cCI6MjA0NzM2NDE0Nn0.w1eHVcuvDUoqhcMCYenKKA9URAtG4YbW3j5GcDgvu3Y';
    this.cards = [];
    this.isLoaded = false;
    this.loadingPromise = null;
  }

  async _loadCreditCards() {
    try {
      console.log('Fetching credit cards from Supabase...');
      
      const response = await fetch(`${this.supabaseUrl}/rest/v1/card_multipliers?select=*`, {
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
      console.log('Credit cards fetched, processing data...', data.length, 'cards');
      console.log('Sample card:', data[0]);
      
      // Transform the data to match our expected format
      this.cards = data.map(card => ({
        id: card.id,
        card_id: card.card_id,
        name: card.card_name,
        program: card.program,
        category: card.category,
        annual_fee: card.annual_fee,
        point_value: card.point_value,
        airfare_multiplier: card.airfare_multiplier,
        hotels_multiplier: card.hotels_multiplier,
        travel_multiplier: card.travel_multiplier,
        rental_multiplier: card.rental_multiplier,
        restaurants_multiplier: card.restaurants_multiplier,
        ads_multiplier: card.ads_multiplier,
        other_multiplier: card.other_multiplier,
        portal_airfare_multiplier: card.portal_airfare_multiplier,
        portal_hotels_multiplier: card.portal_hotels_multiplier,
        portal_rental_multiplier: card.portal_rental_multiplier,
        card_type: card.card_type,
        is_favorite: card.is_favorite,
        is_next_card: card.is_next_card,
        renewal_date: card.renewal_date,
        fx: card.fx,
        created_at: card.created_at,
        updated_at: card.updated_at
      }));
      
      console.log('Transformed cards:', this.cards.slice(0, 3));
      
      // Debug: Check category distribution
      const categoryCounts = this.cards.reduce((acc, card) => {
        acc[card.category] = (acc[card.category] || 0) + 1;
        return acc;
      }, {});
      console.log('Card category distribution:', categoryCounts);

      this.isLoaded = true;
      console.log(`Successfully loaded ${this.cards.length} credit cards from Supabase`);
      return this.cards;
    } catch (error) {
      console.error('Error loading credit cards from Supabase:', error);
      this.cards = [];
      this.isLoaded = false;
      return [];
    }
  }

  async getCreditCardsData() {
    if (this.isLoaded) {
      return this.cards;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this._loadCreditCards();
    return this.loadingPromise;
  }

  getAllCreditCards() {
    return this.cards;
  }

  getCreditCardsByProgram(program) {
    return this.cards.filter(card => card.program === program);
  }

  getCreditCardsByCategory(category) {
    return this.cards.filter(card => card.category === category);
  }

  searchCreditCards(query) {
    const lowercaseQuery = query.toLowerCase();
    return this.cards.filter(card => 
      card.name.toLowerCase().includes(lowercaseQuery) ||
      card.program.toLowerCase().includes(lowercaseQuery) ||
      card.category.toLowerCase().includes(lowercaseQuery)
    );
  }
}

const creditCardsService = new CreditCardsService();
window.getCreditCardsData = async () => await creditCardsService.getCreditCardsData();
window.creditCardsService = creditCardsService;
