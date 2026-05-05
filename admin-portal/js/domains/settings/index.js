// settings Domain - Barrel Export
export * from './api.js';
export * as settingsComponents from './components/index.js';

// For browser global access
if (typeof window !== 'undefined') {
    window.settingsDomain = {
        api: window.settingsApi
    };
}
