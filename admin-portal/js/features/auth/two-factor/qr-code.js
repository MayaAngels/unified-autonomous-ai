// QR Code Generator for 2FA Setup
// Uses external API for QR generation (no external dependencies)

class QRCodeGenerator {
    constructor() {
        this.apiUrl = 'https://api.qrserver.com/v1/create-qr-code/';
    }

    // Generate QR code URL for TOTP setup
    generateTOTPUrl(secret, accountName = 'Vital Studio', issuer = 'The Vital Studio') {
        const encodedAccount = encodeURIComponent(accountName);
        const encodedIssuer = encodeURIComponent(issuer);
        return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&digits=6&period=30`;
    }

    // Get QR code image URL
    getQRCodeImageUrl(data, size = 200) {
        return `${this.apiUrl}?size=${size}x${size}&data=${encodeURIComponent(data)}&margin=0`;
    }

    // Render QR code to an image element
    renderToImage(elementId, secret, accountName = 'Vital Studio', issuer = 'The Vital Studio') {
        const url = this.generateTOTPUrl(secret, accountName, issuer);
        const imageUrl = this.getQRCodeImageUrl(url);
        
        const imgElement = document.getElementById(elementId);
        if (imgElement) {
            imgElement.src = imageUrl;
            imgElement.alt = 'QR Code for 2FA Setup';
            return true;
        }
        return false;
    }

    // Display QR code in a container
    displayQRCode(containerId, secret, accountName = 'Vital Studio', issuer = 'The Vital Studio') {
        const url = this.generateTOTPUrl(secret, accountName, issuer);
        const imageUrl = this.getQRCodeImageUrl(url);
        
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div style="text-align: center;">
                    <img src="${imageUrl}" alt="QR Code" style="width: 200px; height: 200px; border: 1px solid #ddd; border-radius: 12px;">
                    <p style="font-size: 12px; color: #888; margin-top: 8px;">Scan with Google Authenticator or similar app</p>
                </div>
            `;
            return true;
        }
        return false;
    }
}

window.QRCodeGenerator = QRCodeGenerator;
