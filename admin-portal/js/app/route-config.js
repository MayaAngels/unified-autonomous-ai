// Route Configuration for The Vital Studio
// Defines all routes, their authentication requirements, and role permissions

const ROUTE_CONFIG = {
    // Public routes (no authentication required)
    public: [
        '/login.html',
        '/pages/login.html',
        '/pages/forgot-password.html',
        '/pages/reset-password.html',
        '/pages/reset-password-confirm.html',
        '/pages/verify-email.html',
        '/pages/verify-email-pending.html',
        '/pages/rate-limited.html',
        '/pages/session-expired.html'
    ],
    
    // Protected routes (authentication required)
    protected: {
        '/index.html': { roles: ['admin', 'viewer'] },
        '/pages/overview.html': { roles: ['admin', 'viewer'] },
        '/pages/shops.html': { roles: ['admin', 'viewer'] },
        '/pages/competitors.html': { roles: ['admin', 'viewer'] },
        '/pages/intelligence.html': { roles: ['admin', 'viewer'] },
        '/pages/evolution.html': { roles: ['admin'] },
        '/pages/values.html': { roles: ['admin'] },
        '/pages/alerts.html': { roles: ['admin', 'viewer'] },
        '/pages/vault.html': { roles: ['admin'] },
        '/pages/reports.html': { roles: ['admin', 'viewer'] },
        '/pages/settings.html': { roles: ['admin'] },
        '/pages/profile.html': { roles: ['admin', 'viewer'] },
        '/pages/audit-log.html': { roles: ['admin'] },
        '/pages/two-factor-setup.html': { roles: ['admin', 'viewer'] },
        '/pages/two-factor-recovery.html': { roles: ['admin', 'viewer'] }
    },
    
    // 2FA protected routes (require 2FA completion)
    twoFactorRequired: [
        '/pages/vault.html',
        '/pages/settings.html',
        '/pages/evolution.html'
    ]
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ROUTE_CONFIG;
}
