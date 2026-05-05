// intelligence Domain - Barrel Export
export * from './api.js';
export * as intelligenceComponents from './components/index.js';

// For browser global access
if (typeof window !== 'undefined') {
    window.intelligenceDomain = {
        api: window.intelligenceApi
    };
}
