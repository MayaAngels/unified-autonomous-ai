// Online Manager
// Monitors connection quality and manages online/offline state

class OnlineManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.connectionType = 'unknown';
        this.effectiveType = 'unknown';
        this.listeners = [];
        this.monitorInterval = null;
        this.setupConnectionMonitoring();
        this.startQualityMonitoring();
    }

    // Setup basic connection monitoring
    setupConnectionMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.notifyListeners('online');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notifyListeners('offline');
        });
        
        // Monitor Network Information API if available
        if (navigator.connection) {
            this.connectionType = navigator.connection.type || 'unknown';
            this.effectiveType = navigator.connection.effectiveType || 'unknown';
            
            navigator.connection.addEventListener('change', () => {
                this.connectionType = navigator.connection.type;
                this.effectiveType = navigator.connection.effectiveType;
                this.notifyListeners('connection-change', {
                    type: this.connectionType,
                    effectiveType: this.effectiveType
                });
            });
        }
    }

    // Start quality monitoring (ping test)
    startQualityMonitoring() {
        this.monitorInterval = setInterval(() => {
            if (this.isOnline) {
                this.checkConnectionQuality();
            }
        }, 30000); // Check every 30 seconds
    }

    // Check connection quality via ping
    async checkConnectionQuality() {
        const startTime = Date.now();
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            await fetch('/ping', { 
                method: 'HEAD',
                signal: controller.signal,
                cache: 'no-store'
            });
            
            clearTimeout(timeoutId);
            const latency = Date.now() - startTime;
            
            let quality = 'good';
            if (latency > 500) quality = 'poor';
            else if (latency > 200) quality = 'fair';
            
            this.notifyListeners('quality-change', { latency, quality });
        } catch (error) {
            this.notifyListeners('quality-change', { 
                latency: null, 
                quality: 'offline',
                error: error.message 
            });
        }
    }

    // Check if currently online
    getIsOnline() {
        return this.isOnline;
    }

    // Get connection information
    getConnectionInfo() {
        return {
            isOnline: this.isOnline,
            connectionType: this.connectionType,
            effectiveType: this.effectiveType,
            timestamp: new Date().toISOString()
        };
    }

    // Add listener for connection events
    addListener(eventType, callback) {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }
        this.listeners[eventType].push(callback);
    }

    // Notify listeners of events
    notifyListeners(eventType, data = null) {
        if (this.listeners[eventType]) {
            this.listeners[eventType].forEach(callback => callback(data));
        }
    }

    // Stop monitoring
    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
    }
}

// Create global online manager
window.onlineManager = new OnlineManager();
