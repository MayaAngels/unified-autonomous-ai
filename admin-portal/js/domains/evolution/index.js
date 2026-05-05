// evolution Domain - Barrel Export
export * from './api.js';
export * as evolutionComponents from './components/index.js';

// For browser global access
if (typeof window !== 'undefined') {
    window.evolutionDomain = {
        api: window.evolutionApi
    };
}
