// Core API Client
// Centralized fetch wrapper for all API calls

class APIClient {
    constructor(baseUrl = null) {
        this.baseUrl = baseUrl || this.getBaseUrl();
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
        this.requestQueue = [];
        this.isRefreshing = false;
    }

    getBaseUrl() {
        // Auto-detect API endpoint
        const savedApi = localStorage.getItem('selected_api');
        if (savedApi) return savedApi;
        
        // Default to Render or localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:8001';
        }
        return 'https://unified-autonomous-ai-docker.onrender.com';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.defaultHeaders,
                ...options.headers
            }
        };

        // Add auth token if available
        const session = JSON.parse(localStorage.getItem('vital_session') || '{}');
        if (session.token) {
            config.headers['Authorization'] = `Bearer ${session.token}`;
        }

        try {
            const response = await fetch(url, config);
            
            if (response.status === 401) {
                // Token expired - redirect to login
                localStorage.removeItem('vital_session');
                window.location.href = '/login.html';
                throw new Error('Session expired');
            }
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    setBaseUrl(url) {
        this.baseUrl = url;
        localStorage.setItem('selected_api', url);
    }
}

// Create global API client
window.apiClient = new APIClient();

// Domain-specific API modules will be added in each domain
