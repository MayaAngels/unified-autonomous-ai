// values Domain - Barrel Export
export * from './api.js';
export * as valuesComponents from './components/index.js';

// For browser global access
if (typeof window !== 'undefined') {
    window.valuesDomain = {
        api: window.valuesApi
    };
}
