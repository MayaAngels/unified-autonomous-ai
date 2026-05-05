// Migration Helper - Helps transition from old structure to new DDD structure
// This file provides backward compatibility while migrating

(function() {
    console.log('🔄 Domain Migration Helper Active');
    
    // Map old global variables to new domain APIs
    const oldGlobals = {
        // Shops
        'fetchShops': () => window.shopsApi?.getAll(),
        'createShop': (data) => window.shopsApi?.create(data),
        
        // Competitors
        'fetchCompetitors': (shopId) => window.competitorsApi?.getForShop(shopId),
        
        // Intelligence
        'fetchDashboard': () => window.intelligenceApi?.getDashboard(),
        'sendChat': (msg) => window.intelligenceApi?.chat(msg),
        
        // Evolution
        'triggerEvolution': () => window.evolutionApi?.trigger(),
        
        // Vault
        'getVaultStatus': () => window.vaultApi?.getStatus(),
        
        // Reports
        'generateReport': (type, params) => window.reportsApi?.generate(type, params)
    };
    
    // Register compatibility layer
    Object.keys(oldGlobals).forEach(key => {
        if (!window[key]) {
            Object.defineProperty(window, key, {
                get: function() {
                    console.warn(`⚠️ ${key}() is deprecated. Use domain APIs instead.`);
                    return oldGlobals[key];
                },
                configurable: true
            });
        }
    });
    
    // Add migration notice
    console.log('✅ Migration Helper Ready. New domains available:', Object.keys(window).filter(k => k.endsWith('Api')));
})();
