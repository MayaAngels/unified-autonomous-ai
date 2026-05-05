// competitors Domain - Barrel Export
export * from './api.js';
export * as competitorsComponents from './components/index.js';

// For browser global access
if (typeof window !== 'undefined') {
    window.competitorsDomain = {
        api: window.competitorsApi
    };
}
