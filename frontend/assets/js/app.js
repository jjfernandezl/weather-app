// Weather App JavaScript
class WeatherApp {
    constructor() {
        this.apiUrl = 'http://localhost:5001'; // Backend API URL
        this.initializeElements();
        this.bindEvents();
        this.loadInitialState();
    }

    // Initialize DOM elements
    initializeElements() {
        this.form = document.getElementById('weatherForm');
        this.locationInput = document.getElementById('locationInput');
        this.searchButton = document.getElementById('searchButton');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.buttonText = this.searchButton.querySelector('.button-text');
        
        // Results section
        this.resultsSection = document.getElementById('resultsSection');
        this.loadingState = document.getElementById('loadingState');
        this.errorState = document.getElementById('errorState');
        this.weatherCard = document.getElementById('weatherCard');
        
        // Error elements
        this.errorMessage = document.getElementById('errorMessage');
        this.retryButton = document.getElementById('retryButton');
        
        // Weather data elements
        this.locationName = document.getElementById('locationName');
        this.countryName = document.getElementById('countryName');
        this.temperature = document.getElementById('temperature');
        this.weatherDescription = document.getElementById('weatherDescription');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        this.lastUpdated = document.getElementById('lastUpdated');
    }

    // Bind event listeners
    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.retryButton.addEventListener('click', () => this.handleRetry());
        this.locationInput.addEventListener('input', () => this.handleInputChange());
        
        // Handle Enter key in input
        this.locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.form.dispatchEvent(new Event('submit'));
            }
        });
    }

    // Load initial state
    loadInitialState() {
        this.hideAllStates();
        this.locationInput.focus();
        
        // Load last searched location from localStorage
        const lastLocation = localStorage.getItem('lastWeatherLocation');
        if (lastLocation) {
            this.locationInput.value = lastLocation;
            this.locationInput.placeholder = `Last searched: ${lastLocation}`;
        }
    }

    // Handle form submission
    async handleSubmit(e) {
        e.preventDefault();
        
        const location = this.locationInput.value.trim();
        if (!location) {
            this.showError('Please enter a city name');
            return;
        }

        await this.fetchWeather(location);
    }

    // Handle retry button click
    handleRetry() {
        const location = this.locationInput.value.trim();
        if (location) {
            this.fetchWeather(location);
        } else {
            this.hideAllStates();
            this.locationInput.focus();
        }
    }

    // Handle input change
    handleInputChange() {
        // Clear error state when user starts typing
        if (this.errorState.classList.contains('show')) {
            this.hideAllStates();
        }
    }

    // Fetch weather data from backend
    async fetchWeather(location) {
        try {
            this.setLoadingState(true);
            this.showLoading();

            // Save location to localStorage
            localStorage.setItem('lastWeatherLocation', location);

            const response = await fetch(`${this.apiUrl}/weather`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ location })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            this.displayWeather(data);
            
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.showError(this.getErrorMessage(error));
        } finally {
            this.setLoadingState(false);
        }
    }

    // Display weather data
    displayWeather(data) {
        this.locationName.textContent = data.location;
        this.countryName.textContent = data.country;
        this.temperature.textContent = data.temperature;
        this.weatherDescription.textContent = data.description;
        this.humidity.textContent = data.humidity;
        this.windSpeed.textContent = data.wind_speed;
        
        // Format last updated time
        const now = new Date();
        this.lastUpdated.textContent = `Last updated: ${now.toLocaleString()}`;
        
        this.showWeatherCard();
    }

    // Show loading state
    showLoading() {
        this.hideAllStates();
        this.loadingState.classList.add('show');
    }

    // Show error state
    showError(message) {
        this.hideAllStates();
        this.errorMessage.textContent = message;
        this.errorState.classList.add('show');
    }

    // Show weather card
    showWeatherCard() {
        this.hideAllStates();
        this.weatherCard.classList.add('show');
    }

    // Hide all states
    hideAllStates() {
        this.loadingState.classList.remove('show');
        this.errorState.classList.remove('show');
        this.weatherCard.classList.remove('show');
    }

    // Set loading state for button
    setLoadingState(isLoading) {
        if (isLoading) {
            this.searchButton.disabled = true;
            this.buttonText.textContent = 'Loading...';
            this.loadingSpinner.style.display = 'block';
        } else {
            this.searchButton.disabled = false;
            this.buttonText.textContent = 'Get Weather';
            this.loadingSpinner.style.display = 'none';
        }
    }

    // Get user-friendly error message
    getErrorMessage(error) {
        if (error.message.includes('fetch')) {
            return 'Unable to connect to weather service. Please check your internet connection and try again.';
        }
        
        if (error.message.includes('404')) {
            return 'City not found. Please check the spelling and try again.';
        }
        
        if (error.message.includes('401')) {
            return 'Weather service authentication error. Please try again later.';
        }
        
        if (error.message.includes('500')) {
            return 'Weather service is temporarily unavailable. Please try again later.';
        }
        
        return error.message || 'An unexpected error occurred. Please try again.';
    }
}

// Utility functions
const utils = {
    // Debounce function for input events
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show toast notification
    showToast: (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌤️ Weather App initialized');
    new WeatherApp();
});

// Handle offline/online events
window.addEventListener('online', () => {
    utils.showToast('Connection restored!', 'success');
});

window.addEventListener('offline', () => {
    utils.showToast('No internet connection', 'error');
});

