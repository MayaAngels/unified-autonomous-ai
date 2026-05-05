// Enhanced API Client
// Wraps the base API client with deduplication, caching, transformers, cancellation

class EnhancedAPIClient {
    constructor(baseClient) {
        this.baseClient = baseClient;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle cache stale events for background refresh
        window.addEventListener('cache-stale', (event) => {
            const { key, oldData } = event.detail;
            console.log('EnhancedClient: Background refresh for', key);
            // This would trigger a background refresh in a real implementation
        });
    }

    async request(endpoint, options = {}) {
        const {
            skipCache = false,
            skipDeduplication = false,
            transformResponse = true,
            transformRequest = true,
            cacheTtl = null,
            requestId = null
        } = options;

        const method = options.method || 'GET';
        const cacheKey = method === 'GET' && !skipCache ? 
            window.responseCache.generateKey(endpoint, options) : null;
        
        // Check cache for GET requests
        if (method === 'GET' && !skipCache && cacheKey) {
            const cached = window.responseCache.get(cacheKey);
            if (cached && !cached.stale) {
                console.log(`EnhancedClient: Cache hit for ${endpoint}`);
                return cached.data;
            }
            if (cached && cached.stale) {
                console.log(`EnhancedClient: Stale cache for ${endpoint}, returning stale data`);
                // Return stale data while revalidating in background
                return cached.data;
            }
        }

        // Transform request body if needed
        let transformedBody = options.body;
        if (transformRequest && options.body && typeof options.body === 'object') {
            transformedBody = window.dataTransformer.transformRequest(options.body);
        }

        const requestOptions = {
            ...options,
            body: transformedBody
        };

        // Generate deduplication key
        const dedupKey = !skipDeduplication ? 
            window.requestDeduplication.generateKey(endpoint, requestOptions) : null;

        // Execute with deduplication
        const executeRequest = async () => {
            // Generate cancellation request ID
            const cancelId = requestId || `${method}:${endpoint}:${Date.now()}`;
            const controller = window.requestCancellation.createController(cancelId);
            
            try {
                // Add abort signal to options
                const fetchOptions = { ...requestOptions };
                if (controller) {
                    fetchOptions.signal = controller.signal;
                }

                // Make the actual request
                const response = await this.baseClient.request(endpoint, fetchOptions);
                
                window.requestCancellation.complete(cancelId);
                
                // Transform response if needed
                let data = response;
                if (transformResponse && data && typeof data === 'object') {
                    data = window.dataTransformer.transformResponse(data);
                }
                
                // Cache GET responses
                if (method === 'GET' && !skipCache && cacheKey) {
                    window.responseCache.set(cacheKey, data, cacheTtl);
                }
                
                return data;
            } catch (error) {
                window.requestCancellation.complete(cancelId);
                if (error.name === 'AbortError') {
                    console.log(`EnhancedClient: Request cancelled ${endpoint}`);
                    throw new Error('Request cancelled');
                }
                throw error;
            }
        };

        if (dedupKey) {
            return window.requestDeduplication.execute(dedupKey, executeRequest);
        }
        
        return executeRequest();
    }

    // Convenience methods with enhanced features
    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    post(endpoint, data, options = {}) {
        return this.request(endpoint, { 
            ...options, 
            method: 'POST',
            body: data,
            skipCache: true // Don't cache POST requests
        });
    }

    put(endpoint, data, options = {}) {
        return this.request(endpoint, { 
            ...options, 
            method: 'PUT',
            body: data,
            skipCache: true
        });
    }

    delete(endpoint, options = {}) {
        return this.request(endpoint, { 
            ...options, 
            method: 'DELETE',
            skipCache: true
        });
    }

    // Invalidate cache for endpoints
    invalidateCache(pattern) {
        window.responseCache.invalidate(pattern);
    }

    // Clear all pending requests
    clearPending() {
        window.requestDeduplication.clearAll();
        window.requestCancellation.cancelAll();
    }
}

// Create enhanced client if base client exists
if (window.apiClient) {
    window.enhancedApiClient = new EnhancedAPIClient(window.apiClient);
    console.log('EnhancedAPI: Client initialized with deduplication, caching, and transformers');
}
