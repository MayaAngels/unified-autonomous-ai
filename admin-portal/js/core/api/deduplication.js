// Request Deduplication Manager
// Prevents duplicate in-flight requests for the same endpoint

class RequestDeduplicationManager {
    constructor() {
        this.pendingRequests = new Map();
        this.timeoutMs = 30000; // Default 30 second timeout
    }

    // Generate a unique key for a request
    generateKey(url, options = {}) {
        const method = options.method || 'GET';
        const body = options.body ? JSON.stringify(options.body) : '';
        return `${method}:${url}:${body}`;
    }

    // Execute request with deduplication
    async execute(key, requestFn) {
        // Check if request is already in flight
        if (this.pendingRequests.has(key)) {
            console.log(`RequestDeduplication: Reusing pending request for ${key}`);
            return this.pendingRequests.get(key);
        }

        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Request timeout after ${this.timeoutMs}ms`));
            }, this.timeoutMs);
        });

        // Execute request
        const requestPromise = requestFn();
        
        // Store promise
        this.pendingRequests.set(key, Promise.race([requestPromise, timeoutPromise]));

        try {
            const result = await this.pendingRequests.get(key);
            return result;
        } finally {
            // Clean up after request completes (with delay to handle rapid repeats)
            setTimeout(() => {
                this.pendingRequests.delete(key);
            }, 100);
        }
    }

    // Clear all pending requests (useful for navigation)
    clearAll() {
        this.pendingRequests.clear();
        console.log('RequestDeduplication: Cleared all pending requests');
    }

    // Get count of pending requests
    getPendingCount() {
        return this.pendingRequests.size;
    }
}

// Create global instance
window.requestDeduplication = new RequestDeduplicationManager();
