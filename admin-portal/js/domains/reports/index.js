// reports Domain - Barrel Export
export * from './api.js';
export * as reportsComponents from './components/index.js';

// For browser global access
if (typeof window !== 'undefined') {
    window.reportsDomain = {
        api: window.reportsApi
    };
}
