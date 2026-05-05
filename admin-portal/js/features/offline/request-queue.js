// Request Queue for Offline Support
// Queues API requests when offline and replays when online

class RequestQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.loadQueue();
        this.setupReplay();
    }

    // Load queue from localStorage
    loadQueue() {
        const saved = localStorage.getItem('request_queue');
        if (saved) {
            try {
                this.queue = JSON.parse(saved);
                console.log(`RequestQueue: Loaded ${this.queue.length} queued requests`);
            } catch (e) {
                console.error('RequestQueue: Failed to load queue', e);
                this.queue = [];
            }
        }
    }

    // Save queue to localStorage
    saveQueue() {
        localStorage.setItem('request_queue', JSON.stringify(this.queue));
    }

    // Add request to queue
    enqueue(request) {
        const queuedRequest = {
            id: Date.now() + '_' + Math.random().toString(36).substring(2, 8),
            url: request.url,
            method: request.method || 'GET',
            body: request.body,
            headers: request.headers || {},
            retries: 0,
            timestamp: new Date().toISOString(),
            maxRetries: request.maxRetries || this.maxRetries
        };
        
        this.queue.push(queuedRequest);
        this.saveQueue();
        console.log(`RequestQueue: Queued ${request.method} ${request.url}`);
        
        // Try to process immediately if online
        if (navigator.onLine) {
            this.processQueue();
        }
        
        return queuedRequest.id;
    }

    // Process the queue
    async processQueue() {
        if (this.isProcessing || !navigator.onLine || this.queue.length === 0) {
            return;
        }
        
        this.isProcessing = true;
        
        while (this.queue.length > 0 && navigator.onLine) {
            const request = this.queue[0];
            const success = await this.processRequest(request);
            
            if (success) {
                // Remove successfully processed request
                this.queue.shift();
                this.saveQueue();
                console.log(`RequestQueue: Processed ${request.method} ${request.url}`);
            } else {
                // Increment retry count
                request.retries++;
                
                if (request.retries >= request.maxRetries) {
                    // Remove failed request after max retries
                    this.queue.shift();
                    this.saveQueue();
                    console.warn(`RequestQueue: Failed ${request.method} ${request.url} after ${request.maxRetries} retries`);
                    
                    // Dispatch event for failed request
                    window.dispatchEvent(new CustomEvent('request-failed', { 
                        detail: request 
                    }));
                } else {
                    // Move to end of queue for retry
                    this.queue.shift();
                    this.queue.push(request);
                    this.saveQueue();
                    
                    // Wait before retry
                    await this.delay(this.retryDelay * request.retries);
                }
            }
        }
        
        this.isProcessing = false;
        
        if (this.queue.length === 0) {
            window.dispatchEvent(new CustomEvent('queue-empty'));
        }
    }

    // Process a single request
    async processRequest(request) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const options = {
                method: request.method,
                headers: {
                    'Content-Type': 'application/json',
                    ...request.headers
                },
                signal: controller.signal
            };
            
            if (request.body && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
                options.body = request.body;
            }
            
            const response = await fetch(request.url, options);
            clearTimeout(timeoutId);
            
            if (response.ok) {
                return true;
            } else {
                console.warn(`RequestQueue: ${request.url} returned ${response.status}`);
                return false;
            }
        } catch (error) {
            console.warn(`RequestQueue: Failed to process ${request.url}:`, error);
            return false;
        }
    }

    // Setup replay on reconnect
    setupReplay() {
        window.addEventListener('online', () => {
            console.log('RequestQueue: Online detected, processing queue');
            this.processQueue();
        });
        
        window.addEventListener('online-reconnected', () => {
            console.log('RequestQueue: Reconnected, processing queue');
            this.processQueue();
        });
        
        // Process queue on page load if online
        if (navigator.onLine && this.queue.length > 0) {
            setTimeout(() => this.processQueue(), 1000);
        }
    }

    // Get queue status
    getQueueStatus() {
        return {
            queuedRequests: this.queue.length,
            isProcessing: this.isProcessing,
            queue: this.queue.map(r => ({
                id: r.id,
                url: r.url,
                method: r.method,
                retries: r.retries,
                timestamp: r.timestamp
            }))
        };
    }

    // Clear queue
    clearQueue() {
        this.queue = [];
        this.saveQueue();
        console.log('RequestQueue: Queue cleared');
    }

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create global request queue
window.requestQueue = new RequestQueue();

// Enhanced fetch wrapper that queues requests when offline
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    if (!navigator.onLine) {
        // Queue the request
        return new Promise((resolve, reject) => {
            const requestId = window.requestQueue.enqueue({
                url: url,
                method: options.method || 'GET',
                body: options.body,
                headers: options.headers
            });
            
            // Return a placeholder response
            resolve(new Response(JSON.stringify({
                queued: true,
                requestId: requestId,
                message: 'Request queued for when you are back online'
            }), {
                status: 202,
                headers: { 'Content-Type': 'application/json' }
            }));
        });
    }
    
    return originalFetch.call(this, url, options);
};
