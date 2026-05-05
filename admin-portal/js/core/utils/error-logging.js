// Error Logging Utility
// Centralized error logging with console and optional remote logging

class ErrorLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 100;
        this.remoteEndpoint = null;
        this.shouldLogToConsole = true;
        this.shouldLogToRemote = false;
        this.loadConfig();
    }

    // Load configuration from localStorage
    loadConfig() {
        const config = localStorage.getItem('error_logger_config');
        if (config) {
            try {
                const parsed = JSON.parse(config);
                this.remoteEndpoint = parsed.remoteEndpoint || null;
                this.shouldLogToConsole = parsed.shouldLogToConsole !== false;
                this.shouldLogToRemote = parsed.shouldLogToRemote || false;
            } catch (e) {
                console.warn('ErrorLogger: Failed to load config');
            }
        }
    }

    // Save configuration
    saveConfig() {
        const config = {
            remoteEndpoint: this.remoteEndpoint,
            shouldLogToConsole: this.shouldLogToConsole,
            shouldLogToRemote: this.shouldLogToRemote
        };
        localStorage.setItem('error_logger_config', JSON.stringify(config));
    }

    // Log an error
    log(error, context = {}) {
        const logEntry = {
            id: Date.now() + '_' + Math.random().toString(36).substring(2, 8),
            timestamp: new Date().toISOString(),
            message: error.message || error.toString(),
            stack: error.stack,
            context: context,
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        // Add to log array
        this.logs.unshift(logEntry);
        
        // Trim logs if exceeding max
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }
        
        // Log to console
        if (this.shouldLogToConsole) {
            console.error('[ErrorLogger]', logEntry.message, context);
            if (error.stack) {
                console.error(error.stack);
            }
        }
        
        // Log to remote endpoint
        if (this.shouldLogToRemote && this.remoteEndpoint) {
            this.sendToRemote(logEntry);
        }
        
        return logEntry.id;
    }

    // Log an info message
    info(message, context = {}) {
        const logEntry = {
            id: Date.now() + '_' + Math.random().toString(36).substring(2, 8),
            timestamp: new Date().toISOString(),
            level: 'info',
            message: message,
            context: context
        };
        
        this.logs.unshift(logEntry);
        
        if (this.shouldLogToConsole) {
            console.info('[Info]', message, context);
        }
        
        return logEntry.id;
    }

    // Log a warning
    warn(message, context = {}) {
        const logEntry = {
            id: Date.now() + '_' + Math.random().toString(36).substring(2, 8),
            timestamp: new Date().toISOString(),
            level: 'warning',
            message: message,
            context: context
        };
        
        this.logs.unshift(logEntry);
        
        if (this.shouldLogToConsole) {
            console.warn('[Warning]', message, context);
        }
        
        return logEntry.id;
    }

    // Send log to remote endpoint
    async sendToRemote(logEntry) {
        if (!this.remoteEndpoint) return;
        
        try {
            await fetch(this.remoteEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logEntry)
            });
        } catch (e) {
            console.warn('ErrorLogger: Failed to send log to remote', e);
        }
    }

    // Get all logs
    getLogs() {
        return this.logs;
    }

    // Get logs by level
    getLogsByLevel(level) {
        return this.logs.filter(log => log.level === level);
    }

    // Clear logs
    clearLogs() {
        this.logs = [];
    }

    // Set remote endpoint
    setRemoteEndpoint(endpoint) {
        this.remoteEndpoint = endpoint;
        this.saveConfig();
    }

    // Enable/disable remote logging
    setRemoteLogging(enabled) {
        this.shouldLogToRemote = enabled;
        this.saveConfig();
    }

    // Enable/disable console logging
    setConsoleLogging(enabled) {
        this.shouldLogToConsole = enabled;
        this.saveConfig();
    }

    // Export logs as JSON
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }

    // Download logs as file
    downloadLogs() {
        const blob = new Blob([this.exportLogs()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Create global error logger
window.errorLogger = new ErrorLogger();

// Override console.error to also log errors
const originalConsoleError = console.error;
console.error = function(...args) {
    originalConsoleError.apply(console, args);
    window.errorLogger.log({ 
        message: args.join(' '),
        stack: new Error().stack 
    }, { source: 'console.error' });
};
