// Settings Domain API
import { apiClient } from '../../core/api/client.js';

export const settingsApi = {
    // Get system settings
    get: () => apiClient.get('/api/v1/settings'),
    
    // Update settings
    update: (settings) => apiClient.put('/api/v1/settings', settings),
    
    // Get system health
    getHealth: () => apiClient.get('/api/v1/health')
};

window.settingsApi = settingsApi;
