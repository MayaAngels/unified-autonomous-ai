// Session Manager for The Vital Studio
// Handles session storage, expiration, and refresh

class SessionManager {
    constructor() {
        this.sessionKey = 'vital_session';
        this.sessionDuration = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
        this.warningThreshold = 5 * 60 * 1000; // 5 minutes warning
        this.refreshEndpoint = '/api/v1/auth/refresh';
        this.warningCallback = null;
        this.expiryTimer = null;
        this.warningTimer = null;
    }
    
    // Create a new session
    createSession(userData) {
        const session = {
            userId: userData.userId || 'admin',
            email: userData.email || 'admin@vitalstudio.com',
            displayName: userData.displayName || 'Administrator',
            roles: userData.roles || ['admin'],
            twoFactorEnabled: userData.twoFactorEnabled || false,
            twoFactorVerified: userData.twoFactorVerified || false,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + this.sessionDuration).toISOString(),
            token: this.generateToken()
        };
        
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
        this.startExpiryMonitoring();
        return session;
    }
    
    // Generate a simple session token
    generateToken() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    }
    
    // Get current session
    getSession() {
        const sessionJson = localStorage.getItem(this.sessionKey);
        if (!sessionJson) return null;
        
        try {
            return JSON.parse(sessionJson);
        } catch (e) {
            this.destroySession();
            return null;
        }
    }
    
    // Check if session is valid
    isSessionValid() {
        const session = this.getSession();
        if (!session) return false;
        
        const expiresAt = new Date(session.expiresAt);
        if (expiresAt <= new Date()) {
            this.destroySession();
            return false;
        }
        
        return true;
    }
    
    // Check if user has required role
    hasRole(requiredRoles) {
        const session = this.getSession();
        if (!session) return false;
        
        if (!requiredRoles || requiredRoles.length === 0) return true;
        
        return requiredRoles.some(role => session.roles.includes(role));
    }
    
    // Check if 2FA is required and verified
    isTwoFactorValid() {
        const session = this.getSession();
        if (!session) return false;
        
        // If 2FA is not enabled, it's automatically valid
        if (!session.twoFactorEnabled) return true;
        
        // If 2FA is enabled, must be verified
        return session.twoFactorVerified === true;
    }
    
    // Verify 2FA for current session
    verifyTwoFactor() {
        const session = this.getSession();
        if (session && session.twoFactorEnabled) {
            session.twoFactorVerified = true;
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
            return true;
        }
        return false;
    }
    
    // Update session (refresh expiry)
    refreshSession() {
        const session = this.getSession();
        if (session) {
            session.expiresAt = new Date(Date.now() + this.sessionDuration).toISOString();
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
            this.startExpiryMonitoring();
            return true;
        }
        return false;
    }
    
    // Start monitoring session expiry
    startExpiryMonitoring() {
        // Clear existing timers
        if (this.expiryTimer) clearTimeout(this.expiryTimer);
        if (this.warningTimer) clearTimeout(this.warningTimer);
        
        const session = this.getSession();
        if (!session) return;
        
        const expiresAt = new Date(session.expiresAt);
        const now = new Date();
        const timeToExpiry = expiresAt - now;
        
        if (timeToExpiry <= 0) {
            this.destroySession();
            return;
        }
        
        // Set warning timer (5 minutes before expiry)
        const timeToWarning = timeToExpiry - this.warningThreshold;
        if (timeToWarning > 0) {
            this.warningTimer = setTimeout(() => {
                this.showExpiryWarning();
            }, timeToWarning);
        }
        
        // Set expiry timer
        this.expiryTimer = setTimeout(() => {
            this.destroySession();
            this.redirectToLogin('Your session has expired');
        }, timeToExpiry);
    }
    
    // Show expiry warning to user
    showExpiryWarning() {
        const warningHtml = `
            <div id="session-warning" style="position: fixed; bottom: 20px; right: 20px; background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; max-width: 350px;">
                <div style="font-weight: 600; margin-bottom: 8px;">⚠️ Session Expiring Soon</div>
                <div style="font-size: 14px; color: #666; margin-bottom: 12px;">Your session will expire in 5 minutes.</div>
                <button onclick="window.sessionManager.refreshSession(); document.getElementById('session-warning').remove();" style="background: #ffc107; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 500;">Continue Session</button>
                <button onclick="document.getElementById('session-warning').remove();" style="background: none; border: none; padding: 8px 16px; cursor: pointer; margin-left: 8px;">Dismiss</button>
            </div>
        `;
        
        // Remove existing warning if present
        const existingWarning = document.getElementById('session-warning');
        if (existingWarning) existingWarning.remove();
        
        document.body.insertAdjacentHTML('beforeend', warningHtml);
        
        if (this.warningCallback) {
            this.warningCallback();
        }
    }
    
    // Destroy session
    destroySession() {
        localStorage.removeItem(this.sessionKey);
        if (this.expiryTimer) clearTimeout(this.expiryTimer);
        if (this.warningTimer) clearTimeout(this.warningTimer);
    }
    
    // Redirect to login page
    redirectToLogin(message) {
        if (message) {
            sessionStorage.setItem('login_message', message);
        }
        // Check if not already on login page
        if (!window.location.pathname.includes('login') && 
            !window.location.pathname.includes('verify-email') &&
            !window.location.pathname.includes('reset-password')) {
            window.location.href = '/login.html';
        }
    }
    
    // Set warning callback
    onWarning(callback) {
        this.warningCallback = callback;
    }
    
    // Logout
    logout() {
        this.destroySession();
        this.redirectToLogin('You have been logged out');
    }
}

// Initialize global session manager
window.sessionManager = new SessionManager();

// Auto-check session on page load
document.addEventListener('DOMContentLoaded', function() {
    // Skip session check for public routes
    const publicRoutes = ['/login.html', '/pages/forgot-password.html', '/pages/reset-password.html', 
                          '/pages/verify-email.html', '/pages/rate-limited.html', '/pages/session-expired.html'];
    
    const isPublicRoute = publicRoutes.some(route => window.location.pathname.includes(route));
    
    if (!isPublicRoute && !window.sessionManager.isSessionValid()) {
        window.sessionManager.redirectToLogin('Please log in to continue');
    }
});
