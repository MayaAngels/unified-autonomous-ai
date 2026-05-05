// alerts Domain - Barrel Export
export * from './api.js';
export * as alertsComponents from './components/index.js';

// For browser global access
if (typeof window !== 'undefined') {
    window.alertsDomain = {
        api: window.alertsApi
    };
}
