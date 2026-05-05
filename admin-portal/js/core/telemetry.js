// Telemetry Collector (Opt-in)
class TelemetryCollector {
    constructor() {
        this.enabled = localStorage.getItem('telemetry_enabled') === 'true';
        this.sessionId = this.getSessionId();
        this.events = [];
        if (this.enabled) {
            this.log('session_start', {});
        }
    }

    getSessionId() {
        let id = sessionStorage.getItem('telemetry_session_id');
        if (!id) {
            id = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
            sessionStorage.setItem('telemetry_session_id', id);
        }
        return id;
    }

    log(eventType, data) {
        if (!this.enabled) return;
        this.events.push({ session_id: this.sessionId, timestamp: new Date().toISOString(), event_type: eventType, data: data });
        if (this.events.length >= 10) this.flush();
    }

    flush() {
        if (this.events.length === 0) return;
        const stored = JSON.parse(localStorage.getItem('telemetry_events') || '[]');
        localStorage.setItem('telemetry_events', JSON.stringify([...stored, ...this.events]));
        this.events = [];
    }

    enable() { this.enabled = true; localStorage.setItem('telemetry_enabled', 'true'); this.log('telemetry_enabled', {}); }
    disable() { this.enabled = false; localStorage.setItem('telemetry_enabled', 'false'); }
}

window.telemetry = new TelemetryCollector();
window.toggleTelemetry = (enable) => { enable ? window.telemetry.enable() : window.telemetry.disable(); console.log(`Telemetry ${enable ? 'enabled' : 'disabled'}`); };
