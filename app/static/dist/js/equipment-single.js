document.addEventListener('alpine:init', () => {
    Alpine.data('displaySingleEquipment', () => ({
        _days: 1,
        userLocation: '',
        totalPrice: 0,
        pricePerDay: 500000,  // Assuming a fixed price per day
        locationMultiplier: {
            'kampala': 1.0,
            'mbarara': 1.1,
            'jinja': 1.2,
            'entebbe': 1.0,
        },
        calculateCosts() {
            let basePrice = this._days * this.pricePerDay;
            let multiplier = this.locationMultiplier[this.userLocation.toLowerCase()] || 1.0;
            this.totalPrice = Math.floor(basePrice * multiplier);
        },
        makeInquiry() {
            // Logic for making an inquiry
            alert(`Inquiry made for ${this._days} days in ${this.userLocation} with total price ${this.totalPrice}`);
        },
        init() {
            this.calculateCosts();  // Initial calculation
        }

    }));
});