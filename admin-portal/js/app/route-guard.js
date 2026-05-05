// Route Guard for The Vital Studio
// Protects routes based on authentication and roles

class RouteGuard {
    constructor() {
        this.redirectTo = '/login.html';
        this.unauthorizedRedirect = '/pages/unauthorized.html';
        this.setupInterceptors();
    }
    
    // Setup navigation interceptors
    setupInterceptors() {
        // Intercept navigation clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.href.startsWith(window.location.origin)) {
                const path = link.pathname;
                if (!this.canActivate(path)) {
                    e.preventDefault();
                    this.handleBlockedNavigation(path);
                }
            }
        });
        
        // Check current route on load
        this.checkCurrentRoute();
    }
    
    // Check if route can be activated
    canActivate(path) {
        // Normalize path
        if (!path) path = window.location.pathname;
        
        // Check public routes
        if (ROUTE_CONFIG.public.includes(path)) {
            return true;
        }
        
        // Check authentication
        if (!window.sessionManager || !window.sessionManager.isSessionValid()) {
            console.log('Route blocked: Not authenticated', path);
            return false;
        }
        
        // Check role requirements
        const protectedRoute = ROUTE_CONFIG.protected[path];
        if (protectedRoute) {
            if (!window.sessionManager.hasRole(protectedRoute.roles)) {
                console.log('Route blocked: Insufficient role', path);
                return false;
            }
        }
        
        // Check 2FA requirements
        if (ROUTE_CONFIG.twoFactorRequired.includes(path)) {
            if (!window.sessionManager.isTwoFactorValid()) {
                console.log('Route blocked: 2FA required', path);
                // Store intended destination for after 2FA
                sessionStorage.setItem('intended_destination', path);
                return false;
            }
        }
        
        return true;
    }
    
    // Check current route on page load
    checkCurrentRoute() {
        const currentPath = window.location.pathname;
        
        if (!this.canActivate(currentPath)) {
            // Determine appropriate redirect
            if (!window.sessionManager || !window.sessionManager.isSessionValid()) {
                sessionStorage.setItem('intended_destination', currentPath);
                window.location.href = this.redirectTo;
            } else if (ROUTE_CONFIG.twoFactorRequired.includes(currentPath) && 
                       window.sessionManager.getSession()?.twoFactorEnabled && 
                       !window.sessionManager.isTwoFactorValid()) {
                window.location.href = '/pages/two-factor-setup.html';
            } else {
                window.location.href = this.unauthorizedRedirect;
            }
        }
    }
    
    // Handle blocked navigation
    handleBlockedNavigation(path) {
        let message = 'Access denied';
        
        if (!window.sessionManager || !window.sessionManager.isSessionValid()) {
            message = 'Please log in to access this page';
            sessionStorage.setItem('intended_destination', path);
        } else if (ROUTE_CONFIG.protected[path] && !window.sessionManager.hasRole(ROUTE_CONFIG.protected[path].roles)) {
            message = 'You do not have permission to access this page';
        } else if (ROUTE_CONFIG.twoFactorRequired.includes(path)) {
            message = 'Two-factor authentication required';
        }
        
        this.showAccessDeniedModal(message);
    }
    
    // Show access denied modal
    showAccessDeniedModal(message) {
        const modalHtml = `
            <div id="access-denied-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 20000;">
                <div style="background: #fff; border-radius: 24px; padding: 32px; max-width: 400px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
                    <h2 style="margin-bottom: 8px;">Access Denied</h2>
                    <p style="color: #666; margin-bottom: 24px;">${message}</p>
                    <button onclick="document.getElementById('access-denied-modal').remove(); window.history.back();" style="background: #111; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer;">Go Back</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    
    // Verify 2FA for current session
    verifyTwoFactor(code) {
        // This would typically call an API to verify the TOTP code
        // For now, using the session manager's verification
        if (window.sessionManager.verifyTwoFactor()) {
            const intended = sessionStorage.getItem('intended_destination');
            if (intended) {
                sessionStorage.removeItem('intended_destination');
                window.location.href = intended;
            } else {
                window.location.reload();
            }
            return true;
        }
        return false;
    }
}

// Initialize route guard
window.routeGuard = new RouteGuard();
