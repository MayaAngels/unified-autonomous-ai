// Offline Indicator Component
// Shows a banner when the user goes offline

class OfflineIndicator {
    constructor() {
        this.indicatorElement = null;
        this.isOffline = false;
        this.listeners = [];
        this.createIndicator();
        this.setupListeners();
    }

    // Create the indicator DOM element
    createIndicator() {
        this.indicatorElement = document.createElement('div');
        this.indicatorElement.id = 'offline-indicator';
        this.indicatorElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #fef3c7;
            color: #92400e;
            text-align: center;
            padding: 12px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            transform: translateY(-100%);
            transition: transform 0.3s ease;
            border-bottom: 1px solid #fde68a;
        `;
        this.indicatorElement.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
                <span>📡</span>
                <span>You are offline. Some features may be unavailable.</span>
                <button id="retry-connection" style="background: #92400e; color: #fff; border: none; padding: 4px 12px; border-radius: 6px; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
        document.body.insertBefore(this.indicatorElement, document.body.firstChild);
        
        // Add retry button listener
        const retryBtn = document.getElementById('retry-connection');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.checkConnection());
        }
    }

    // Show offline indicator
    show() {
        if (this.indicatorElement && !this.isOffline) {
            this.isOffline = true;
            this.indicatorElement.style.transform = 'translateY(0)';
            this.notifyListeners(false);
        }
    }

    // Hide offline indicator
    hide() {
        if (this.indicatorElement && this.isOffline) {
            this.isOffline = false;
            this.indicatorElement.style.transform = 'translateY(-100%)';
            this.notifyListeners(true);
            
            // Trigger event for queued requests
            const event = new CustomEvent('online-reconnected');
            window.dispatchEvent(event);
        }
    }

    // Check current connection status
    checkConnection() {
        if (navigator.onLine) {
            this.hide();
            return true;
        } else {
            this.show();
            return false;
        }
    }

    // Setup online/offline event listeners
    setupListeners() {
        window.addEventListener('online', () => {
            console.log('Online');
            this.hide();
        });
        
        window.addEventListener('offline', () => {
            console.log('Offline');
            this.show();
        });
        
        // Initial check
        if (!navigator.onLine) {
            this.show();
        }
    }

    // Add listener for connection status changes
    addListener(callback) {
        this.listeners.push(callback);
    }

    // Notify all listeners of status change
    notifyListeners(isOnline) {
        this.listeners.forEach(callback => callback(isOnline));
    }

    // Get current offline status
    isCurrentlyOffline() {
        return this.isOffline;
    }
}

// Create global offline indicator
window.offlineIndicator = new OfflineIndicator();
