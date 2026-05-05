// Request/Response Transformers
// Converts between camelCase (JS) and snake_case (API)

class DataTransformer {
    constructor() {
        this.cache = new Map();
    }

    // Convert snake_case to camelCase
    toCamelCase(str) {
        if (this.cache.has(str)) return this.cache.get(str);
        
        const result = str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        this.cache.set(str, result);
        return result;
    }

    // Convert camelCase to snake_case
    toSnakeCase(str) {
        if (this.cache.has(str)) return this.cache.get(str);
        
        const result = str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        this.cache.set(str, result);
        return result;
    }

    // Transform object keys from snake_case to camelCase
    transformResponse(data) {
        if (data === null || typeof data !== 'object') return data;
        
        if (Array.isArray(data)) {
            return data.map(item => this.transformResponse(item));
        }
        
        const transformed = {};
        for (const [key, value] of Object.entries(data)) {
            const camelKey = this.toCamelCase(key);
            transformed[camelKey] = this.transformResponse(value);
        }
        return transformed;
    }

    // Transform object keys from camelCase to snake_case
    transformRequest(data) {
        if (data === null || typeof data !== 'object') return data;
        
        if (Array.isArray(data)) {
            return data.map(item => this.transformRequest(item));
        }
        
        const transformed = {};
        for (const [key, value] of Object.entries(data)) {
            const snakeKey = this.toSnakeCase(key);
            transformed[snakeKey] = this.transformRequest(value);
        }
        return transformed;
    }
}

// Create global instance
window.dataTransformer = new DataTransformer();

// Helper to wrap API responses with transformation
window.transformApiResponse = (data) => window.dataTransformer.transformResponse(data);
window.transformApiRequest = (data) => window.dataTransformer.transformRequest(data);
