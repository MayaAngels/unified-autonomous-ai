// Response Cache Manager
// Implements stale-while-revalidate caching strategy

class ResponseCacheManager {
    constructor() {
        this.cache = new Map();
        this.defaultTtl = 60000; // 1 minute default
        this.staleWhileRevalidateTtl = 300000; // 5 minutes for stale
    }

    // Generate cache key
    generateKey(url, options = {}) {
        const method = options.method || 'GET';
        // Only cache GET requests
        if (method !== 'GET') return null;
        
        const params = options.params ? JSON.stringify(options.params) : '';
        return `${url}:${params}`;
    }

    // Get cached response
    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const now = Date.now();
        
        // Check if fresh
        if (now < cached.expiresAt) {
            return { data: cached.data, stale: false };
        }
        
        // Check if stale but still usable (stale-while-revalidate)
        if (now < cached.staleExpiresAt) {
            // Trigger background refresh
            this.scheduleRevalidate(key, cached);
            return { data: cached.data, stale: true };
        }
        
        // Expired - remove
        this.cache.delete(key);
        return null;
    }

    // Set cached response
    set(key, data, ttl = null) {
        const now = Date.now();
        const expiresTtl = ttl || this.defaultTtl;
        
        const cached = {
            data: data,
            expiresAt: now + expiresTtl,
            staleExpiresAt: now + this.staleWhileRevalidateTtl,
            timestamp: now
        };
        
        this.cache.set(key, cached);
        
        // Auto-cleanup after stale expiry
        setTimeout(() => {
            const current = this.cache.get(key);
            if (current && current.staleExpiresAt <= Date.now()) {
                this.cache.delete(key);
            }
        }, this.staleWhileRevalidateTtl);
    }

    // Schedule background revalidation
    scheduleRevalidate(key, cached) {
        if (cached.revalidating) return;
        
        cached.revalidating = true;
        
        // Emit event for background refresh
        const event = new CustomEvent('cache-stale', { 
            detail: { key, oldData: cached.data }
        });
        window.dispatchEvent(event);
        
        // Clear revalidating flag after delay
        setTimeout(() => {
            if (cached) cached.revalidating = false;
        }, 5000);
    }

    // Invalidate cache for a key or pattern
    invalidate(keyPattern) {
        if (!keyPattern) {
            this.cache.clear();
            console.log('ResponseCache: Cleared all');
            return;
        }
        
        for (const [key, value] of this.cache) {
            if (key.includes(keyPattern)) {
                this.cache.delete(key);
            }
        }
    }

    // Get cache stats
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Create global instance
window.responseCache = new ResponseCacheManager();
