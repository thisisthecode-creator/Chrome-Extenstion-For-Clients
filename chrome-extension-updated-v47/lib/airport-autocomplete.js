// Airport Autocomplete Component
// Provides autocomplete functionality for airport search inputs

class AirportAutocomplete {
  constructor(inputElement, options = {}) {
    this.input = inputElement;
    this.options = {
      maxResults: 10,
      minQueryLength: 1,
      debounceDelay: 300,
      ...options
    };
    
    this.isOpen = false;
    this.selectedIndex = -1;
    this.results = [];
    this.debounceTimer = null;
    
    this.init();
  }

  init() {
    this.createDropdown();
    this.bindEvents();
  }

  createDropdown() {
    // Create dropdown container
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'airport-autocomplete-dropdown';
    this.dropdown.style.display = 'none';
    
    // Insert after the input element
    this.input.parentNode.insertBefore(this.dropdown, this.input.nextSibling);
  }

  bindEvents() {
    // Input events
    this.input.addEventListener('input', this.handleInput.bind(this));
    this.input.addEventListener('keydown', this.handleKeydown.bind(this));
    this.input.addEventListener('blur', this.handleBlur.bind(this));
    this.input.addEventListener('focus', this.handleFocus.bind(this));

    // Click outside to close
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  handleInput(event) {
    const query = event.target.value.trim();
    console.log('Input changed:', query);
    
    // Clear previous debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    if (query.length < this.options.minQueryLength) {
      console.log('Query too short, hiding dropdown');
      this.hideDropdown();
      return;
    }

    // Debounce the search
    this.debounceTimer = setTimeout(() => {
      console.log('Starting search for:', query);
      this.searchAirports(query);
    }, this.options.debounceDelay);
  }

  handleKeydown(event) {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateDown();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateUp();
        break;
      case 'Enter':
        event.preventDefault();
        this.selectResult();
        break;
      case 'Escape':
        this.hideDropdown();
        break;
    }
  }

  handleBlur(event) {
    // Delay hiding to allow for click events on dropdown items
    setTimeout(() => {
      if (!this.dropdown.contains(document.activeElement)) {
        this.hideDropdown();
      }
    }, 150);
  }

  handleFocus(event) {
    const query = event.target.value.trim();
    if (query.length >= this.options.minQueryLength) {
      this.searchAirports(query);
    }
  }

  handleClickOutside(event) {
    if (!this.input.contains(event.target) && !this.dropdown.contains(event.target)) {
      this.hideDropdown();
    }
  }

  async searchAirports(query) {
    try {
      console.log('Searching airports for query:', query);
      
      if (!window.airportDataService) {
        console.error('Airport data service not available');
        return;
      }

      const results = await window.airportDataService.searchAirports(
        query, 
        this.options.maxResults
      );

      console.log('Search results:', results.length, 'airports found');
      this.results = results;
      this.selectedIndex = -1;
      this.showResults();
    } catch (error) {
      console.error('Error searching airports:', error);
      this.hideDropdown();
    }
  }

  showResults() {
    console.log('Showing results:', this.results.length);
    if (this.results.length === 0) {
      console.log('No results, hiding dropdown');
      this.hideDropdown();
      return;
    }

    this.renderResults();
    this.showDropdown();
  }

  renderResults() {
    console.log('Rendering results:', this.results.length);
    this.dropdown.innerHTML = '';

    if (this.results.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'airport-autocomplete-item';
      noResults.textContent = 'No airports found';
      noResults.style.color = '#9aa0a6';
      noResults.style.fontStyle = 'italic';
      this.dropdown.appendChild(noResults);
      return;
    }

    this.results.forEach((airport, index) => {
      const item = document.createElement('div');
      item.className = 'airport-autocomplete-item';
      item.dataset.index = index;

      // Create the display content
      const iataCode = document.createElement('span');
      iataCode.className = 'airport-iata';
      iataCode.textContent = airport.iata;

      const details = document.createElement('span');
      details.className = 'airport-details';
      details.textContent = `${airport.city}, ${airport.country}`;

      item.appendChild(iataCode);
      item.appendChild(details);

      // Add click handler
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Clicked on airport:', airport.iata);
        this.selectAirport(airport);
      });

      // Add hover effects
      item.addEventListener('mouseenter', () => {
        this.selectedIndex = index;
        this.updateSelection();
      });

      this.dropdown.appendChild(item);
    });
  }

  showDropdown() {
    console.log('Showing dropdown');
    this.dropdown.style.display = 'block';
    this.isOpen = true;
    this.updateSelection();
  }

  hideDropdown() {
    this.dropdown.style.display = 'none';
    this.isOpen = false;
    this.selectedIndex = -1;
  }

  navigateDown() {
    if (this.selectedIndex < this.results.length - 1) {
      this.selectedIndex++;
      this.updateSelection();
    }
  }

  navigateUp() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.updateSelection();
    }
  }

  updateSelection() {
    const items = this.dropdown.querySelectorAll('.airport-autocomplete-item');
    
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  selectResult() {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.results.length) {
      const airport = this.results[this.selectedIndex];
      this.selectAirport(airport);
    }
  }

  selectAirport(airport) {
    console.log('Selecting airport:', airport.iata, airport.city);
    
    // Set the input value to the IATA code
    this.input.value = airport.iata;
    
    // Store the full airport data for later use
    this.input.dataset.airportData = JSON.stringify(airport);
    
    // Trigger change event
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
    
    this.hideDropdown();
  }

  // Get the selected airport data
  getSelectedAirport() {
    const data = this.input.dataset.airportData;
    return data ? JSON.parse(data) : null;
  }

  // Clear the selection
  clearSelection() {
    this.input.value = '';
    this.input.dataset.airportData = '';
    this.hideDropdown();
  }
}

// Initialize autocomplete for airport inputs
function initializeAirportAutocomplete() {
  // Wait for airport data service to be available
  const initAutocomplete = () => {
    if (!window.airportDataService) {
      setTimeout(initAutocomplete, 100);
      return;
    }

    // Find airport input fields
    const fromInput = document.getElementById('bs-flight-from');
    const toInput = document.getElementById('bs-flight-to');

    if (fromInput && !fromInput.dataset.autocompleteInitialized) {
      new AirportAutocomplete(fromInput, {
        maxResults: 8,
        minQueryLength: 1
      });
      fromInput.dataset.autocompleteInitialized = 'true';
    }

    if (toInput && !toInput.dataset.autocompleteInitialized) {
      new AirportAutocomplete(toInput, {
        maxResults: 8,
        minQueryLength: 1
      });
      toInput.dataset.autocompleteInitialized = 'true';
    }
  };

  // Start initialization
  initAutocomplete();
}

// Note: Initialization is now handled by the content script
