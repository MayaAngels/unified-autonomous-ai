// Vault Domain API
import { apiClient } from '../../core/api/client.js';

export const vaultApi = {
    // Get vault status
    getStatus: () => apiClient.get('/api/v1/vault/status'),
    
    // Save secret
    saveSecret: (service, field, value) => apiClient.post('/api/v1/vault/save', { service, field, value }),
    
    // Distribute secrets to shops
    distribute: (secrets, shops) => apiClient.post('/api/v1/vault/distribute', { secrets, shops }),
    
    // Test connection
    testConnection: (service) => apiClient.post(`/api/v1/vault/test/${service}`)
};

window.vaultApi = vaultApi;
