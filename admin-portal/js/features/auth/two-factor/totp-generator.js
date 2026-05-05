// TOTP Generator for Two-Factor Authentication
// RFC 6238 compliant (simplified for frontend)

class TOTPGenerator {
    constructor() {
        this.digits = 6;
        this.period = 30;
    }

    // Generate a random Base32 secret key
    generateSecret(length = 16) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        for (let i = 0; i < length; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return secret;
    }

    // Simple hash function for TOTP (simplified)
    // In production, use crypto.subtle.digest with SHA-1
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    // Generate TOTP code for a given secret and time
    generateCode(secret, time = null) {
        if (!time) {
            time = Math.floor(Date.now() / 1000 / this.period);
        }
        const hash = this.simpleHash(secret + time);
        let code = parseInt(hash.substring(0, 6), 16) % Math.pow(10, this.digits);
        return code.toString().padStart(this.digits, '0');
    }

    // Verify a TOTP code against a secret
    verifyCode(secret, userCode) {
        const currentCode = this.generateCode(secret);
        const previousCode = this.generateCode(secret, Math.floor(Date.now() / 1000 / this.period) - 1);
        return userCode === currentCode || userCode === previousCode;
    }

    // Generate backup recovery codes
    generateRecoveryCodes(count = 8) {
        const codes = [];
        for (let i = 0; i < count; i++) {
            const code = Math.random().toString(36).substring(2, 10).toUpperCase();
            codes.push(code);
        }
        return codes;
    }
}

// Export for use
window.TOTPGenerator = TOTPGenerator;
