// Retry Logic Utility
// Implements exponential backoff for failed operations

class RetryLogic {
    constructor() {
        this.defaultConfig = {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 10000,
            backoffFactor: 2,
            retryableStatuses: [408, 429, 500, 502, 503, 504]
        };
    }

    // Execute a function with retry logic
    async execute(fn, options = {}) {
        const config = { ...this.defaultConfig, ...options };
        let lastError = null;
        
        for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
            try {
                const result = await fn();
                return result;
            } catch (error) {
                lastError = error;
                
                // Check if error is retryable
                const isRetryable = this.isRetryableError(error);
                
                if (isRetryable && attempt < config.maxRetries) {
                    const delay = this.calculateDelay(attempt, config);
                    console.log(`RetryLogic: Attempt ${attempt} failed, retrying in ${delay}ms`, error);
                    await this.sleep(delay);
                    continue;
                } else {
                    throw error;
                }
            }
        }
        
        throw lastError;
    }

    // Execute with exponential backoff (alias)
    async withBackoff(fn, options = {}) {
        return this.execute(fn, options);
    }

    // Check if error is retryable
    isRetryableError(error) {
        // Check HTTP status codes
        if (error.status && this.defaultConfig.retryableStatuses.includes(error.status)) {
            return true;
        }
        
        // Check for network errors
        if (error.message && (
            error.message.includes('network') ||
            error.message.includes('fetch') ||
            error.message.includes('timeout') ||
            error.message.includes('offline')
        )) {
            return true;
        }
        
        // Check for rate limiting
        if (error.message && error.message.includes('rate limit')) {
            return true;
        }
        
        return false;
    }

    // Calculate delay using exponential backoff
    calculateDelay(attempt, config) {
        const delay = Math.min(
            config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
            config.maxDelay
        );
        
        // Add jitter to prevent thundering herd
        const jitter = delay * 0.1 * Math.random();
        return delay + jitter;
    }

    // Sleep for specified milliseconds
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Create a retry wrapper for async functions
    wrap(fn, options = {}) {
        const self = this;
        return async function(...args) {
            return self.execute(() => fn(...args), options);
        };
    }

    // Create a retry wrapper for fetch requests
    wrapFetch(fetchFn, options = {}) {
        const self = this;
        return async function(url, fetchOptions = {}) {
            return self.execute(async () => {
                const response = await fetchFn(url, fetchOptions);
                if (!response.ok && self.defaultConfig.retryableStatuses.includes(response.status)) {
                    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                    error.status = response.status;
                    throw error;
                }
                return response;
            }, options);
        };
    }
}

// Create global retry logic instance
window.retryLogic = new RetryLogic();

// Enhanced fetch with retry
const originalFetchWithRetry = window.fetch;
window.fetchWithRetry = function(url, options = {}, retryOptions = {}) {
    return window.retryLogic.execute(async () => {
        const response = await originalFetchWithRetry(url, options);
        if (!response.ok && window.retryLogic.defaultConfig.retryableStatuses.includes(response.status)) {
            const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
            error.status = response.status;
            throw error;
        }
        return response;
    }, retryOptions);
};
