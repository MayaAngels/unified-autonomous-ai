// Evolution Domain API
import { apiClient } from '../../core/api/client.js';

export const evolutionApi = {
    // Trigger evolution cycle
    trigger: () => apiClient.post('/api/v1/evolution/trigger'),
    
    // Get evolution status
    getStatus: () => apiClient.get('/api/v1/evolution/status'),
    
    // Get evolution history
    getHistory: () => apiClient.get('/api/v1/evolution/history'),
    
    // Approve refactor proposal
    approveProposal: (proposalId) => apiClient.post(`/api/v1/evolution/approve/${proposalId}`)
};

window.evolutionApi = evolutionApi;
