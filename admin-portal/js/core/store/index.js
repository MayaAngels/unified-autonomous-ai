// Core Store - Central State Management
// Simple pub/sub state manager

class Store {
    constructor() {
        this.state = {
            shops: [],
            competitors: [],
            intelligence: { insights: [], feed: [] },
            evolution: { cycle: 0, status: 'idle' },
            alerts: [],
            vault: { status: {} },
            ui: { sidebarCollapsed: false, theme: 'light', activeModal: null }
        };
        this.listeners = new Map();
        this.loadPersistedState();
    }

    // Load persisted state from localStorage
    loadPersistedState() {
        const saved = localStorage.getItem('vital_store');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                Object.assign(this.state, parsed);
            } catch (e) {
                console.warn('Failed to load persisted state', e);
            }
        }
    }

    // Save state to localStorage
    persistState() {
        localStorage.setItem('vital_store', JSON.stringify(this.state));
    }

    // Get entire state or specific slice
    getState(slice = null) {
        if (slice) {
            return this.state[slice];
        }
        return this.state;
    }

    // Update state
    setState(slice, updates) {
        if (this.state[slice]) {
            this.state[slice] = { ...this.state[slice], ...updates };
        } else {
            this.state[slice] = updates;
        }
        this.persistState();
        this.notifyListeners(slice);
    }

    // Subscribe to state changes
    subscribe(slice, callback, id = null) {
        const key = id || `${slice}_${Date.now()}_${Math.random()}`;
        if (!this.listeners.has(slice)) {
            this.listeners.set(slice, new Map());
        }
        this.listeners.get(slice).set(key, callback);
        return key;
    }

    // Unsubscribe from state changes
    unsubscribe(slice, id) {
        if (this.listeners.has(slice)) {
            this.listeners.get(slice).delete(id);
        }
    }

    // Notify listeners of state change
    notifyListeners(slice) {
        if (this.listeners.has(slice)) {
            this.listeners.get(slice).forEach(callback => {
                callback(this.state[slice]);
            });
        }
    }

    // Reset state (logout)
    reset() {
        this.state = {
            shops: [],
            competitors: [],
            intelligence: { insights: [], feed: [] },
            evolution: { cycle: 0, status: 'idle' },
            alerts: [],
            vault: { status: {} },
            ui: { sidebarCollapsed: false, theme: 'light', activeModal: null }
        };
        this.persistState();
    }
}

// Create global store
window.vitalStore = new Store();

// Domain-specific store slices
window.storeSlices = {
    shops: () => window.vitalStore.getState('shops'),
    competitors: () => window.vitalStore.getState('competitors'),
    intelligence: () => window.vitalStore.getState('intelligence'),
    evolution: () => window.vitalStore.getState('evolution'),
    alerts: () => window.vitalStore.getState('alerts'),
    vault: () => window.vitalStore.getState('vault'),
    ui: () => window.vitalStore.getState('ui')
};
