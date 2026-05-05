// Reports Domain API
import { apiClient } from '../../core/api/client.js';

export const reportsApi = {
    // Generate report
    generate: (type, params) => apiClient.post('/api/v1/reports/generate', { type, ...params }),
    
    // Get saved reports
    getSaved: () => apiClient.get('/api/v1/reports/saved'),
    
    // Download report
    download: (reportId) => {
        window.open(`${apiClient.baseUrl}/api/v1/reports/download/${reportId}`, '_blank');
    },
    
    // Schedule report
    schedule: (config) => apiClient.post('/api/v1/reports/schedule', config)
};

window.reportsApi = reportsApi;
