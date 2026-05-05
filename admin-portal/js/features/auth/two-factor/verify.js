// 2FA Verification Module
// Handles code verification during setup and login

class TwoFactorVerification {
    constructor() {
        this.totp = null;
        this.init();
    }

    init() {
        if (window.TOTPGenerator) {
            this.totp = new window.TOTPGenerator();
        } else {
            console.warn('TOTPGenerator not loaded');
        }
    }

    // Verify code during setup
    verifySetupCode(secret, code) {
        if (!this.totp) {
            console.error('TOTPGenerator not available');
            return false;
        }
        return this.totp.verifyCode(secret, code);
    }

    // Complete 2FA setup
    completeSetup(secret, code) {
        if (this.verifySetupCode(secret, code)) {
            // Generate recovery codes
            const recoveryCodes = this.totp.generateRecoveryCodes(8);
            
            // Store in session
            const session = JSON.parse(localStorage.getItem('vital_session') || '{}');
            session.twoFactorEnabled = true;
            session.twoFactorSecret = secret;
            session.twoFactorVerified = true;
            localStorage.setItem('vital_session', JSON.stringify(session));
            
            // Store recovery codes (in production, these would be hashed on server)
            sessionStorage.setItem('recovery_codes', JSON.stringify(recoveryCodes));
            
            return { success: true, recoveryCodes: recoveryCodes };
        }
        return { success: false, error: 'Invalid verification code' };
    }

    // Verify during login
    verifyLogin(code) {
        const session = JSON.parse(localStorage.getItem('vital_session') || '{}');
        
        if (!session.twoFactorEnabled) {
            return { success: true, message: '2FA not enabled' };
        }
        
        if (!this.totp) {
            return { success: false, error: 'TOTP generator not available' };
        }
        
        if (this.totp.verifyCode(session.twoFactorSecret, code)) {
            session.twoFactorVerified = true;
            localStorage.setItem('vital_session', JSON.stringify(session));
            return { success: true, message: '2FA verified' };
        }
        
        return { success: false, error: 'Invalid verification code' };
    }

    // Verify using recovery code
    verifyRecoveryCode(code) {
        const session = JSON.parse(localStorage.getItem('vital_session') || '{}');
        const storedCodes = JSON.parse(sessionStorage.getItem('recovery_codes') || '[]');
        
        if (storedCodes.includes(code)) {
            // Remove used code
            const newCodes = storedCodes.filter(c => c !== code);
            sessionStorage.setItem('recovery_codes', JSON.stringify(newCodes));
            
            session.twoFactorVerified = true;
            localStorage.setItem('vital_session', JSON.stringify(session));
            return { success: true, message: 'Recovery code accepted' };
        }
        
        return { success: false, error: 'Invalid recovery code' };
    }

    // Disable 2FA
    disable2FA() {
        const session = JSON.parse(localStorage.getItem('vital_session') || '{}');
        session.twoFactorEnabled = false;
        session.twoFactorVerified = false;
        delete session.twoFactorSecret;
        localStorage.setItem('vital_session', JSON.stringify(session));
        sessionStorage.removeItem('recovery_codes');
        return true;
    }

    // Check if 2FA is enabled for current user
    isEnabled() {
        const session = JSON.parse(localStorage.getItem('vital_session') || '{}');
        return session.twoFactorEnabled === true;
    }

    // Check if 2FA is verified for current session
    isVerified() {
        const session = JSON.parse(localStorage.getItem('vital_session') || '{}');
        return session.twoFactorVerified === true;
    }
}

window.TwoFactorVerification = TwoFactorVerification;
