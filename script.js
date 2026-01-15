// Constants
const FIXED_AMOUNT = 70;
const TIP_OPTIONS = [0, 7, 10.5, 14];
const COUNTRIES = [
    'Spain', 'France', 'Germany', 'Italy', 'United Kingdom', 'Portugal', 'Netherlands',
    'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland',
    'Ireland', 'Poland', 'Czech Republic', 'Hungary', 'Greece', 'Turkey', 'Russia',
    'Ukraine', 'Romania', 'Bulgaria', 'Croatia', 'Serbia', 'Slovakia', 'Slovenia',
    'Lithuania', 'Latvia', 'Estonia', 'Luxembourg', 'Malta', 'Cyprus', 'Iceland',
    'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Australia',
    'Japan', 'China', 'South Korea', 'India', 'Thailand', 'Vietnam', 'Singapore',
    'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Oman', 'Bahrain'
];

// State Management
const state = {
    tours: JSON.parse(localStorage.getItem('tours')) || [],
    selectedPassengers: 1,
    selectedPaymentMethod: 'cash',
    selectedTip: 0,
    customTip: '',
    cardCustomTip: '',
    countryInput: '',
    activeTab: 'new-tour',
    breakdownSortBy: 'tours' // 'tours' or 'pax'
};

// DOM Elements
const elements = {
    // New Tour Tab
    todayDate: document.getElementById('today-date'),
    todayToursCount: document.getElementById('today-tours-count'),
    passengerButtons: document.querySelectorAll('.passenger-btn'),
    countryInput: document.getElementById('country-input'),
    suggestionsDropdown: document.getElementById('country-suggestions'),
    paymentButtons: document.querySelectorAll('.payment-btn'),
    cashTipSection: document.getElementById('cash-tip-section'),
    cardTipSection: document.getElementById('card-tip-section'),
    customTipInput: document.getElementById('custom-tip-input'),
    cardTipButtons: document.querySelectorAll('.card-tip-btn'),
    cardCustomTipInput: document.getElementById('card-custom-tip-input'),
    saveTourButton: document.getElementById('save-tour-btn'),
    todayToursList: document.getElementById('today-tours-list'),
    todayTotalTours: document.getElementById('today-total-tours'),
    todayTotalRevenue: document.getElementById('today-total-revenue'),
    
    // Summary Tab
    summaryDate: document.getElementById('summary-date'),
    summaryTotalTours: document.getElementById('summary-total-tours'),
    summaryTotalRevenue: document.getElementById('summary-total-revenue'),
    cardToursLabel: document.getElementById('card-tours-label'),
    cardToursAmount: document.getElementById('card-tours-amount'),
    cardTipsAmount: document.getElementById('card-tips-amount'),
    cashToursLabel: document.getElementById('cash-tours-label'),
    cashToursAmount: document.getElementById('cash-tours-amount'),
    cashTipsAmount: document.getElementById('cash-tips-amount'),
    revenueCalculation: document.getElementById('revenue-calculation'),
    
    // Stats Tab
    statsMonthSelect: document.getElementById('stats-month-select'),
    statsTotalTours: document.getElementById('stats-total-tours'),
    statsTotalRevenue: document.getElementById('stats-total-revenue'),
    statsCashTours: document.getElementById('stats-cash-tours'),
    statsCardTours: document.getElementById('stats-card-tours'),
    cashBar: document.getElementById('cash-bar'),
    cardBar: document.getElementById('card-bar'),
    cashPercentage: document.getElementById('cash-percentage'),
    cardPercentage: document.getElementById('card-percentage'),
    topBreakdownList: document.getElementById('top-breakdown-list'),
    sortButtons: document.querySelectorAll('.sort-btn'),
    exportDataButton: document.getElementById('export-data-btn'),
    
    // Templates
    countrySuggestionTemplate: document.getElementById('country-suggestion-template'),
    tourItemTemplate: document.getElementById('tour-item-template'),
    
    // Navigation
    navItems: document.querySelectorAll('.nav-item'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Date displays
    currentDate: document.getElementById('current-date')
};

// Initialize App
function initApp() {
    updateDates();
    setupEventListeners();
    updateNewTourTab();
    updateSummaryTab();
    updateStatsTab();
    generateMonthOptions();
}

// Update Dates
function updateDates() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    // Update all date displays
    elements.currentDate.textContent = now.toLocaleDateString('en-US', options);
    elements.todayDate.textContent = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    elements.summaryDate.textContent = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// Setup Event Listeners
function setupEventListeners() {
    // Passenger buttons
    elements.passengerButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.passengerButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.selectedPassengers = parseInt(btn.dataset.value);
        });
    });

    // Country input with suggestions
    elements.countryInput.addEventListener('input', (e) => {
        state.countryInput = e.target.value;
        showCountrySuggestions(state.countryInput);
    });

    // Payment method buttons
    elements.paymentButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.paymentButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.selectedPaymentMethod = btn.dataset.method;
            
            // Show/hide tip sections
            if (state.selectedPaymentMethod === 'cash') {
                elements.cashTipSection.classList.remove('hidden');
                elements.cardTipSection.classList.add('hidden');
            } else {
                elements.cashTipSection.classList.add('hidden');
                elements.cardTipSection.classList.remove('hidden');
            }
        });
    });

    // Card tip buttons
    elements.cardTipButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            elements.cardTipButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tipValue = btn.dataset.tip;
            if (tipValue === 'custom') {
                elements.cardCustomTipInput.classList.remove('hidden');
                elements.cardCustomTipInput.focus();
                state.selectedTip = 0;
            } else {
                elements.cardCustomTipInput.classList.add('hidden');
                state.selectedTip = parseFloat(tipValue);
                elements.cardCustomTipInput.value = '';
                state.cardCustomTip = '';
            }
        });
    });

    // Custom tip input for cash
    elements.customTipInput.addEventListener('input', (e) => {
        state.customTip = e.target.value;
    });

    // Custom tip input for card
    elements.cardCustomTipInput.addEventListener('input', (e) => {
        state.cardCustomTip = e.target.value;
        state.selectedTip = parseFloat(e.target.value) || 0;
    });

    // Save tour button
    elements.saveTourButton.addEventListener('click', saveTour);

    // Export data button
    elements.exportDataButton.addEventListener('click', exportData);

    // Bottom navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.dataset.tab;
            switchTab(tabId);
        });
    });

    // Month selector for stats
    elements.statsMonthSelect.addEventListener('change', updateStatsTab);

    // Sort buttons for breakdown
    elements.sortButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.sortButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.breakdownSortBy = btn.dataset.sort;
            updateStatsTab();
        });
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper') && !e.target.closest('.suggestions-dropdown')) {
            elements.suggestionsDropdown.style.display = 'none';
        }
    });
}

// Switch Tab
function switchTab(tabId) {
    state.activeTab = tabId;
    
    // Update bottom navigation
    elements.navItems.forEach(item => {
        if (item.dataset.tab === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update tab contents
    elements.tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    // Update data for the selected tab
    switch(tabId) {
        case 'new-tour':
            updateNewTourTab();
            break;
        case 'summary':
            updateSummaryTab();
            break;
        case 'stats':
            updateStatsTab();
            break;
    }
}

// Country Suggestions
function showCountrySuggestions(query) {
    elements.suggestionsDropdown.innerHTML = '';
    
    if (!query || query.length < 2) {
        elements.suggestionsDropdown.style.display = 'none';
        return;
    }

    const filtered = COUNTRIES.filter(country => 
        country.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    if (filtered.length === 0) {
        elements.suggestionsDropdown.style.display = 'none';
        return;
    }

    filtered.forEach(country => {
        const suggestion = elements.countrySuggestionTemplate.content.cloneNode(true);
        const suggestionItem = suggestion.querySelector('.suggestion-item');
        const suggestionText = suggestion.querySelector('.suggestion-text');
        
        suggestionText.textContent = country;
        suggestionItem.addEventListener('click', () => {
            elements.countryInput.value = country;
            state.countryInput = country;
            elements.suggestionsDropdown.style.display = 'none';
        });
        
        elements.suggestionsDropdown.appendChild(suggestion);
    });

    elements.suggestionsDropdown.style.display = 'block';
}

// Save Tour
function saveTour() {
    // Validate inputs
    if (!state.countryInput || state.countryInput.trim() === '') {
        showNotification('Please select a country', 'error');
        return;
    }

    if (state.selectedPassengers < 1 || state.selectedPassengers > 5) {
        showNotification('Please select 1-5 passengers', 'error');
        return;
    }

    // Calculate tip
    let tipAmount = 0;
    if (state.selectedPaymentMethod === 'cash') {
        tipAmount = state.customTip ? parseFloat(state.customTip) || 0 : 0;
    } else {
        tipAmount = state.selectedTip;
    }

    // Create tour object
    const tour = {
        id: Date.now(),
        country: state.countryInput.trim(),
        passengers: state.selectedPassengers,
        paymentMethod: state.selectedPaymentMethod,
        tip: tipAmount,
        amount: FIXED_AMOUNT,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-US')
    };

    // Add to state and save
    state.tours.push(tour);
    saveToLocalStorage();
    
    // Update UI
    updateNewTourTab();
    updateSummaryTab();
    updateStatsTab();
    
    // Reset form
    resetForm();
    
    // Show success notification
    showNotification('Tour saved successfully!', 'success');
}

// Reset Form
function resetForm() {
    // Reset passenger selection to 1
    elements.passengerButtons.forEach((btn, index) => {
        if (index === 0) {
            btn.classList.add('active');
            state.selectedPassengers = 1;
        } else {
            btn.classList.remove('active');
        }
    });

    // Reset country input
    elements.countryInput.value = '';
    state.countryInput = '';
    elements.suggestionsDropdown.style.display = 'none';

    // Reset payment method to cash
    elements.paymentButtons.forEach(btn => {
        if (btn.dataset.method === 'cash') {
            btn.classList.add('active');
            state.selectedPaymentMethod = 'cash';
        } else {
            btn.classList.remove('active');
        }
    });

    // Reset tip sections - show cash, hide card
    elements.cashTipSection.classList.remove('hidden');
    elements.cardTipSection.classList.add('hidden');
    
    // Reset cash tip input
    elements.customTipInput.value = '0';
    state.customTip = '';
    
    // Reset card tip selection to €0
    elements.cardTipButtons.forEach((btn, index) => {
        if (index === 1) { // €0 button (index 0 is Custom, 1 is €0)
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Reset card custom tip
    elements.cardCustomTipInput.value = '0';
    elements.cardCustomTipInput.classList.add('hidden');
    state.cardCustomTip = '';
    state.selectedTip = 0;
}

// Update New Tour Tab
function updateNewTourTab() {
    const today = new Date().toLocaleDateString('en-US');
    const todayTours = state.tours.filter(tour => tour.date === today);
    
    // Update today's count
    elements.todayToursCount.textContent = `${todayTours.length} Tours Completed`;
    
    // Update today's total tours and revenue
    const totalRevenue = todayTours.reduce((sum, tour) => sum + tour.amount + tour.tip, 0);
    elements.todayTotalTours.textContent = `${todayTours.length} tours`;
    elements.todayTotalRevenue.textContent = `€${totalRevenue.toFixed(2)}`;
    
    // Update tours list
    elements.todayToursList.innerHTML = '';
    
    if (todayTours.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-road"></i>
            <p>No tours recorded today</p>
            <span>Start by saving your first tour</span>
        `;
        elements.todayToursList.appendChild(emptyState);
        return;
    }
    
    // Sort tours by timestamp (newest first)
    todayTours.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Add each tour to the list
    todayTours.forEach(tour => {
        const tourElement = createTourElement(tour);
        elements.todayToursList.appendChild(tourElement);
    });
}

// Create Tour Element
function createTourElement(tour) {
    const template = elements.tourItemTemplate.content.cloneNode(true);
    const tourItem = template.querySelector('.tour-item');
    
    // Set country and passengers
    const countryElement = tourItem.querySelector('.tour-country');
    countryElement.textContent = `${tour.country} - ${tour.passengers} pax`;
    
    // Set time
    const timeElement = tourItem.querySelector('.tour-time');
    const tourTime = new Date(tour.timestamp);
    timeElement.textContent = tourTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).toLowerCase();
    
    // Set payment method
    const paymentElement = tourItem.querySelector('.tour-payment');
    paymentElement.textContent = tour.paymentMethod === 'cash' ? 'Cash' : 'Card';
    
    // Set amounts
    const basePriceElement = tourItem.querySelector('.tour-base-price');
    const tipElement = tourItem.querySelector('.tour-tip');
    const totalElement = tourItem.querySelector('.total-amount');
    
    basePriceElement.textContent = `€${tour.amount.toFixed(2)}`;
    
    if (tour.tip > 0) {
        tipElement.textContent = `+ €${tour.tip.toFixed(2)} tip`;
        tipElement.style.display = 'block';
    } else {
        tipElement.style.display = 'none';
    }
    
    const total = tour.amount + tour.tip;
    totalElement.textContent = `€${total.toFixed(2)}`;
    
    return tourItem;
}

// Update Summary Tab
function updateSummaryTab() {
    const today = new Date().toLocaleDateString('en-US');
    const todayTours = state.tours.filter(tour => tour.date === today);
    
    // Calculate totals
    const totalTours = todayTours.length;
    const totalRevenue = todayTours.reduce((sum, tour) => sum + tour.amount + tour.tip, 0);
    
    // Card income
    const cardTours = todayTours.filter(tour => tour.paymentMethod === 'card');
    const cardToursCount = cardTours.length;
    const cardToursAmount = cardTours.reduce((sum, tour) => sum + tour.amount, 0);
    const cardTipsAmount = cardTours.reduce((sum, tour) => sum + tour.tip, 0);
    
    // Cash income
    const cashTours = todayTours.filter(tour => tour.paymentMethod === 'cash');
    const cashToursCount = cashTours.length;
    const cashToursAmount = cashTours.reduce((sum, tour) => sum + tour.amount, 0);
    const cashTipsAmount = cashTours.reduce((sum, tour) => sum + tour.tip, 0);
    
    // Revenue calculation
    const revenueToDeliver = cashToursAmount - cardTipsAmount;
    
    // Update UI
    elements.summaryTotalTours.textContent = totalTours;
    elements.summaryTotalRevenue.textContent = `€${totalRevenue.toFixed(2)}`;
    
    elements.cardToursLabel.textContent = `Total Tours (70€ x ${cardToursCount} trips)`;
    elements.cardToursAmount.textContent = `€${cardToursAmount.toFixed(2)}`;
    elements.cardTipsAmount.textContent = `€${cardTipsAmount.toFixed(2)}`;
    
    elements.cashToursLabel.textContent = `Total Tours (70€ x ${cashToursCount} trips)`;
    elements.cashToursAmount.textContent = `€${cashToursAmount.toFixed(2)}`;
    elements.cashTipsAmount.textContent = `€${cashTipsAmount.toFixed(2)}`;
    
    elements.revenueCalculation.innerHTML = `${cashToursAmount.toFixed(2)}€ - ${cardTipsAmount.toFixed(2)}€ = <strong>${revenueToDeliver.toFixed(2)}€</strong>`;
}

// Update Stats Tab
function updateStatsTab() {
    const selectedMonth = elements.statsMonthSelect.value;
    let monthlyTours = [];
    
    if (selectedMonth === 'all') {
        monthlyTours = [...state.tours];
    } else if (selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        monthlyTours = state.tours.filter(tour => {
            const tourDate = new Date(tour.timestamp);
            return tourDate.getFullYear() === parseInt(year) && 
                   tourDate.getMonth() === parseInt(month);
        });
    } else {
        // Default to current month
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        monthlyTours = state.tours.filter(tour => {
            const tourDate = new Date(tour.timestamp);
            return tourDate.getFullYear() === currentYear && 
                   tourDate.getMonth() === currentMonth;
        });
    }
    
    // Calculate statistics
    const totalTours = monthlyTours.length;
    const totalRevenue = monthlyTours.reduce((sum, tour) => sum + tour.amount + tour.tip, 0);
    
    const cashTours = monthlyTours.filter(tour => tour.paymentMethod === 'cash').length;
    const cardTours = monthlyTours.filter(tour => tour.paymentMethod === 'card').length;
    
    // Payment distribution percentages
    const cashPercentage = totalTours > 0 ? Math.round((cashTours / totalTours) * 100) : 0;
    const cardPercentage = totalTours > 0 ? Math.round((cardTours / totalTours) * 100) : 0;
    
    // Country statistics for breakdown
    const countryStats = {};
    monthlyTours.forEach(tour => {
        if (!countryStats[tour.country]) {
            countryStats[tour.country] = {
                tours: 0,
                pax: 0
            };
        }
        countryStats[tour.country].tours++;
        countryStats[tour.country].pax += tour.passengers;
    });
    
    // Convert to array and sort based on selected criteria
    let breakdownData = Object.entries(countryStats).map(([country, stats]) => ({
        country,
        ...stats
    }));
    
    if (state.breakdownSortBy === 'tours') {
        breakdownData.sort((a, b) => b.tours - a.tours);
    } else {
        breakdownData.sort((a, b) => b.pax - a.pax);
    }
    
    // Take top 5
    breakdownData = breakdownData.slice(0, 5);
    
    // Update UI
    elements.statsTotalTours.textContent = totalTours;
    elements.statsTotalRevenue.textContent = `€${totalRevenue.toFixed(2)}`;
    elements.statsCashTours.textContent = cashTours;
    elements.statsCardTours.textContent = cardTours;
    
    // Update distribution bars
    elements.cashBar.style.width = `${cashPercentage}%`;
    elements.cardBar.style.width = `${cardPercentage}%`;
    elements.cashPercentage.textContent = `${cashPercentage}%`;
    elements.cardPercentage.textContent = `${cardPercentage}%`;
    
    // Update breakdown list
    elements.topBreakdownList.innerHTML = '';
    
    if (breakdownData.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-globe-europe"></i>
            <p>No breakdown data available</p>
        `;
        elements.topBreakdownList.appendChild(emptyState);
    } else {
        breakdownData.forEach(item => {
            const breakdownItem = document.createElement('div');
            breakdownItem.className = 'breakdown-item';
            breakdownItem.innerHTML = `
                <div class="breakdown-country">${item.country}</div>
                <div class="breakdown-stats">
                    <span class="breakdown-tours">${item.tours} tours</span>
                    <span class="breakdown-separator">|</span>
                    <span class="breakdown-pax">${item.pax} pax</span>
                </div>
            `;
            elements.topBreakdownList.appendChild(breakdownItem);
        });
    }
}

// Generate Month Options for Stats
function generateMonthOptions() {
    const monthSelect = elements.statsMonthSelect;
    monthSelect.innerHTML = '';
    
    // Add "All Time" option
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Time';
    monthSelect.appendChild(allOption);
    
    // Get unique months from tours
    const monthsSet = new Set();
    state.tours.forEach(tour => {
        const date = new Date(tour.timestamp);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        monthsSet.add({ value: monthYear, text: monthName });
    });
    
    // Add month options
    Array.from(monthsSet).forEach(({ value, text }) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        monthSelect.appendChild(option);
    });
    
    // Select current month by default
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${now.getMonth()}`;
    monthSelect.value = currentMonthYear;
}

// Export Data
function exportData() {
    if (state.tours.length === 0) {
        showNotification('No data to export', 'error');
        return;
    }
    
    // Create CSV content
    let csv = 'Date,Time,Country,Passengers,Payment Method,Amount,Tip,Total\n';
    
    state.tours.forEach(tour => {
        const date = new Date(tour.timestamp);
        const dateStr = date.toLocaleDateString('en-US');
        const timeStr = date.toLocaleTimeString('en-US');
        const total = tour.amount + tour.tip;
        
        csv += `"${dateStr}","${timeStr}","${tour.country}",${tour.passengers},"${tour.paymentMethod}",${tour.amount},${tour.tip},${total}\n`;
    });
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `tours_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Data exported successfully', 'success');
}

// Show Notification
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#4CAF50' : '#F44336'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        font-size: 14px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Add animations to CSS if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Save to Local Storage
function saveToLocalStorage() {
    localStorage.setItem('tours', JSON.stringify(state.tours));
    generateMonthOptions(); // Update month options in stats
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
