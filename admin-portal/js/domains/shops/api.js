// Shops Domain API
import { apiClient } from '../../core/api/client.js';

export const shopsApi = {
    // Get all shops
    getAll: () => apiClient.get('/api/v1/shops'),
    
    // Get shop by ID
    getById: (id) => apiClient.get(`/api/v1/shops/${id}`),
    
    // Create new shop
    create: (data) => apiClient.post('/api/v1/spawn/create', data),
    
    // Update shop
    update: (id, data) => apiClient.put(`/api/v1/shops/${id}`, data),
    
    // Delete shop
    delete: (id) => apiClient.delete(`/api/v1/shops/${id}`),
    
    // Get shop uncatchability
    getUncatchability: (id) => apiClient.get(`/api/v1/shop/uncatchability/${id}`),
    
    // Trigger shop evolution
    triggerEvolution: (id) => apiClient.post(`/api/v1/shops/${id}/evolve`)
};

window.shopsApi = shopsApi;
