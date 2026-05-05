// shops Domain - Barrel Export
export * from './api.js';
export * as shopsComponents from './components/index.js';

// For browser global access
if (typeof window !== 'undefined') {
    window.shopsDomain = {
        api: window.shopsApi
    };
}
