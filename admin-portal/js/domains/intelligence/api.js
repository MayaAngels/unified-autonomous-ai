// Intelligence Domain API
import { apiClient } from '../../core/api/client.js';

export const intelligenceApi = {
    // Get dashboard unified data
    getDashboard: () => apiClient.get('/api/v1/dashboard/unified'),
    
    // Add insight
    addInsight: (insight) => apiClient.post('/api/v1/knowledge/insights', insight),
    
    // Upload document
    uploadDocument: (formData) => {
        return fetch(`${apiClient.baseUrl}/api/v1/knowledge/documents`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${JSON.parse(localStorage.getItem('vital_session') || '{}').token}`
            }
        }).then(res => res.json());
    },
    
    // Chat with Vi
    chat: (message) => apiClient.post('/api/v1/knowledge/chat', { message })
};

window.intelligenceApi = intelligenceApi;
