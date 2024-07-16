document.addEventListener('alpine:init', () => {
    Alpine.data('displaySingleEquipment', (equipmentId) => ({
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
        async makeBooking() {
            try {
                const response = await fetch('/api/book', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
                    },
                    body: JSON.stringify({
                        equipment_id: equipmentId,
                        days: this._days,
                        location: this.userLocation
                    })
                });

                const result = await response.json();
                if (response.ok) {
                    alert('Booking successful');
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while booking');
            }
        },
        init() {
            this.calculateCosts();  // Initial calculation
        }
    }));
});
