// Mock Data for Development
// Used when backend is unavailable

export const mockData = {
    // Dashboard mock
    dashboard: {
        fractal_intelligence_score: 0.42,
        marketing_autonomy: { score: 68.5 },
        shop_intelligence: {
            shops: [
                { shop_id: 'prompts-shop', uncatchability: 0.45, status: 'COMPETITIVE', lead_time_days: 5 },
                { shop_id: 'digital-shop', uncatchability: 0.52, status: 'AHEAD', lead_time_days: 3 },
                { shop_id: 'analytics-shop', uncatchability: 0.38, status: 'CATCHING_UP', lead_time_days: 8 }
            ]
        }
    },
    
    // Shops mock
    shops: [
        { id: 'prompts-shop', name: 'Prompts Shop', focus: 'AI Prompts', uncatchability: 45, status: 'active' },
        { id: 'digital-shop', name: 'Digital Shop', focus: 'Digital Products', uncatchability: 52, status: 'active' },
        { id: 'analytics-shop', name: 'Analytics Shop', focus: 'Analytics', uncatchability: 38, status: 'active' }
    ],
    
    // Competitors mock
    competitors: {
        macro: [
            { name: 'Anatoly', type: 'Technology', status: 'Monitoring' },
            { name: 'Assay', type: 'Technology', status: 'Monitoring' },
            { name: 'Shadow', type: 'Technology', status: 'Monitoring' },
            { name: 'KernelEvolve', type: 'Technology', status: 'Monitoring' }
        ],
        prompts_shop: [
            { competitor: 'PromptBase', price_index: 0.95, strength_score: 0.6 },
            { competitor: 'Promptify', price_index: 0.85, strength_score: 0.55 }
        ]
    },
    
    // Insights mock
    insights: [
        { id: 1, text: 'Market trend: AI prompts demand up 23%', importance: 0.8 },
        { id: 2, text: 'Competitor weakness detected: Anatoly has slow response times', importance: 0.7 },
        { id: 3, text: 'Opportunity: Bundle digital products with AI prompts', importance: 0.9 }
    ],
    
    // Evolution status mock
    evolution: {
        cycle: 42,
        status: 'idle',
        lastTrigger: new Date().toISOString(),
        history: [
            { cycle: 41, changes: ['Improved competitor detection', 'Optimized pricing algorithm'], impact: '+5% uncatchability' },
            { cycle: 40, changes: ['Added new competitor watcher'], impact: '+3% uncatchability' }
        ]
    },
    
    // Vault status mock
    vault: {
        stripe_configured: true,
        render_configured: true,
        netlify_configured: true,
        github_configured: true,
        last_updated: new Date().toISOString()
    }
};

// Helper to enable mock mode
let mockEnabled = false;

export function enableMockMode(enabled = true) {
    mockEnabled = enabled;
    console.log(`Mock mode ${enabled ? 'enabled' : 'disabled'}`);
}

export function isMockEnabled() {
    return mockEnabled;
}

// Mock API interceptor
export async function mockFetch(endpoint, options = {}) {
    if (!mockEnabled) return null;
    
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    // Route to appropriate mock data
    if (endpoint.includes('/dashboard/unified')) {
        return mockData.dashboard;
    }
    if (endpoint.includes('/shops')) {
        return mockData.shops;
    }
    if (endpoint.includes('/competitors')) {
        return mockData.competitors;
    }
    if (endpoint.includes('/insights')) {
        return mockData.insights;
    }
    if (endpoint.includes('/evolution/status')) {
        return mockData.evolution;
    }
    if (endpoint.includes('/vault/status')) {
        return mockData.vault;
    }
    
    return null;
}
