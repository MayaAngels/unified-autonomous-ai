// TOTP Helper for Two-Factor Authentication
window.TOTPHelper = {
    generateSecret: function() {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        var secret = '';
        for (var i = 0; i < 16; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return secret;
    },
    generateRecoveryCodes: function() {
        var codes = [];
        for (var i = 0; i < 8; i++) {
            codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
        }
        return codes;
    }
};
