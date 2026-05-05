// vault Domain - Barrel Export
export * from './api.js';
export * as vaultComponents from './components/index.js';

// For browser global access
if (typeof window !== 'undefined') {
    window.vaultDomain = {
        api: window.vaultApi
    };
}
