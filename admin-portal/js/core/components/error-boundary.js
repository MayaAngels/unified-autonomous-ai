// Error Boundary Component
// Catches JavaScript errors in child components and displays fallback UI

class ErrorBoundary {
    constructor(containerId, fallbackRenderer = null) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.fallbackRenderer = fallbackRenderer || this.defaultFallbackRenderer;
        this.originalContent = null;
        this.isErrorState = false;
        this.errorLog = [];
        this.setupGlobalErrorHandler();
    }

    // Wrap a component with error boundary
    wrap(renderFunction) {
        if (!this.container) {
            console.error('ErrorBoundary: Container not found:', this.containerId);
            return;
        }

        this.originalContent = this.container.innerHTML;
        
        try {
            const result = renderFunction();
            if (result) {
                this.container.innerHTML = result;
                this.isErrorState = false;
            }
            return result;
        } catch (error) {
            this.handleError(error, renderFunction);
            return null;
        }
    }

    // Handle caught error
    handleError(error, originalRender) {
        console.error('ErrorBoundary caught error:', error);
        
        // Log error
        this.errorLog.push({
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            component: this.containerId
        });
        
        // Display fallback UI
        this.container.innerHTML = this.fallbackRenderer(error);
        this.isErrorState = true;
        
        // Attempt recovery after 5 seconds
        setTimeout(() => {
            this.recover(originalRender);
        }, 5000);
    }

    // Attempt to recover from error
    recover(originalRender) {
        try {
            const result = originalRender();
            if (result) {
                this.container.innerHTML = result;
                this.isErrorState = false;
                console.log('ErrorBoundary: Successfully recovered');
            }
        } catch (retryError) {
            console.warn('ErrorBoundary: Recovery failed, will retry later');
            // Exponential backoff for retry
            setTimeout(() => this.recover(originalRender), 30000);
        }
    }

    // Default fallback UI renderer
    defaultFallbackRenderer(error) {
        return `
            <div class="error-boundary-fallback" style="padding: 40px; text-align: center; background: #fef2f2; border-radius: 16px; border: 1px solid #fecaca;">
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <h3 style="color: #991b1b; margin-bottom: 8px;">Something went wrong</h3>
                <p style="color: #666; margin-bottom: 16px;">${error.message || 'An unexpected error occurred'}</p>
                <button onclick="location.reload()" style="background: #111; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
                    Reload Page
                </button>
            </div>
        `;
    }

    // Setup global error handler
    setupGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            console.error('Global error caught:', event.error);
            this.errorLog.push({
                timestamp: new Date().toISOString(),
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
            
            // Prevent default error display
            event.preventDefault();
            return true;
        });
        
        // Handle promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.errorLog.push({
                timestamp: new Date().toISOString(),
                type: 'unhandledrejection',
                reason: event.reason?.toString() || 'Unknown reason'
            });
            event.preventDefault();
        });
    }

    // Get error log
    getErrorLog() {
        return this.errorLog;
    }

    // Clear error log
    clearErrorLog() {
        this.errorLog = [];
    }

    // Reset boundary (clear error state)
    reset() {
        if (this.originalContent && !this.isErrorState) {
            this.container.innerHTML = this.originalContent;
            this.isErrorState = false;
        }
    }
}

// Create global error boundary instance for main app
window.ErrorBoundary = ErrorBoundary;

// Auto-wrap main content on page load
document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('main-content') || document.querySelector('main');
    if (mainContent) {
        const boundary = new ErrorBoundary('main-content', null);
        window.mainErrorBoundary = boundary;
    }
});
