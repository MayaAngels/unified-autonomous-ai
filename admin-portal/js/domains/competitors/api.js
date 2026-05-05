// Competitors Domain API
import { apiClient } from '../../core/api/client.js';

export const competitorsApi = {
    // Get macro competitors (URIS)
    getMacro: () => apiClient.get('/api/v1/uris/status'),
    
    // Get shop-specific competitors
    getForShop: (shopId) => apiClient.get(`/api/v1/shop/competitors/${shopId}`),
    
    // Add custom competitor
    add: (shopId, competitor) => apiClient.post(`/api/v1/shop/competitors/${shopId}`, competitor),
    
    // Generate uncatchable advantage
    generateAdvantage: () => apiClient.post('/api/v1/uris/generate-advantage')
};

window.competitorsApi = competitorsApi;
