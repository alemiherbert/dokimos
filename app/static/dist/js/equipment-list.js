document.addEventListener('alpine:init', () => {
    Alpine.data('displayEquipment', () => ({
        items: [],
        category: 'all',
        location: 'all',
        search: '',

        async init() {
            await this.fetchData();
        },

        async fetchData(query = "/api/equipments") {
            try {
                const response = await fetch(query);
                const data = await response.json();
                this.items = data.items;
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },

        async updateData(category, location) {
            this.category = category;
            this.location = location;
            query = `/api/equipments/${encodeURIComponent(category)}?location=${encodeURIComponent(location)}`;
            await this.fetchData(query);
        },

        async searchEquipment() {
            await this.fetchData(`/api/equipments?search=${encodeURIComponent(this.search)}`);
        },

        async resetFilters() {
            this.category = 'all';
            this.location = 'all';
            this.search = '';
            await this.fetchData();
        },

        kebabToTitleCase(str) {
            return str.replace(/-/g, ' ').replace(
                /\w\S*/g, (txt) => {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                }
            );
        },
    }));
});