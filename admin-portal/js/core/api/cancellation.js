// Request Cancellation Manager
// Uses AbortController to cancel pending requests

class RequestCancellationManager {
    constructor() {
        this.controllers = new Map();
        this.enabled = true;
    }

    // Create abort controller for a request
    createController(requestId) {
        if (!this.enabled) return null;
        
        // Cancel existing controller for same request if present
        if (this.controllers.has(requestId)) {
            this.cancel(requestId);
        }
        
        const controller = new AbortController();
        this.controllers.set(requestId, controller);
        return controller;
    }

    // Cancel a specific request
    cancel(requestId) {
        if (this.controllers.has(requestId)) {
            const controller = this.controllers.get(requestId);
            controller.abort();
            this.controllers.delete(requestId);
            console.log(`RequestCancellation: Cancelled ${requestId}`);
            return true;
        }
        return false;
    }

    // Cancel all pending requests
    cancelAll() {
        for (const [requestId, controller] of this.controllers) {
            controller.abort();
        }
        this.controllers.clear();
        console.log('RequestCancellation: Cancelled all pending requests');
    }

    // Complete a request (remove from tracking)
    complete(requestId) {
        this.controllers.delete(requestId);
    }

    // Enable/disable cancellation
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.cancelAll();
        }
    }

    // Get signal for a request
    getSignal(requestId) {
        const controller = this.controllers.get(requestId);
        return controller ? controller.signal : null;
    }

    // Get count of active requests
    getActiveCount() {
        return this.controllers.size;
    }
}

// Create global instance
window.requestCancellation = new RequestCancellationManager();

// Auto-cancel on page navigation
window.addEventListener('beforeunload', () => {
    window.requestCancellation.cancelAll();
});

// Helper for navigation cancellation
window.cancelPendingRequests = () => window.requestCancellation.cancelAll();
