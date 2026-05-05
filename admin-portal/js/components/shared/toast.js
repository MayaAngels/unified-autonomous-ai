// Toast Notification System
// Displays temporary notification messages

class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.defaultDuration = 5000;
        this.maxToasts = 5;
        this.createContainer();
        this.injectStyles();
    }

    // Create toast container
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
        `;
        document.body.appendChild(this.container);
    }

    // Inject toast styles
    injectStyles() {
        const styleId = 'toast-styles';
        if (document.getElementById(styleId)) return;

        const styles = `
            .toast {
                background: #fff;
                border-radius: 12px;
                padding: 14px 16px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                animation: slideIn 0.3s ease;
                border-left: 4px solid;
                cursor: pointer;
            }
            .toast.success { border-left-color: #22c55e; }
            .toast.error { border-left-color: #ef4444; }
            .toast.warning { border-left-color: #f59e0b; }
            .toast.info { border-left-color: #3b82f6; }
            .toast-icon { font-size: 20px; }
            .toast-content { flex: 1; }
            .toast-title { font-weight: 600; margin-bottom: 4px; color: #111; }
            .toast-message { font-size: 13px; color: #666; }
            .toast-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #999;
                padding: 0 4px;
            }
            .toast-close:hover { color: #111; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = styleId;
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // Show a toast notification
    show(options) {
        const {
            title,
            message,
            type = 'info',
            duration = this.defaultDuration,
            onClose = null,
            onClick = null
        } = typeof options === 'string' ? { message: options, type: 'info' } : options;

        const toastId = Date.now() + '_' + Math.random().toString(36).substring(2, 8);
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('data-id', toastId);
        
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="window.toastManager.dismiss('${toastId}')">×</button>
        `;

        if (onClick) {
            toast.style.cursor = 'pointer';
            toast.addEventListener('click', (e) => {
                if (!e.target.classList.contains('toast-close')) {
                    onClick();
                    this.dismiss(toastId);
                }
            });
        }

        this.container.appendChild(toast);
        
        const toastObj = {
            id: toastId,
            element: toast,
            timeout: setTimeout(() => {
                this.dismiss(toastId);
                if (onClose) onClose();
            }, duration)
        };
        
        this.toasts.push(toastObj);
        
        // Limit number of toasts
        while (this.toasts.length > this.maxToasts) {
            const oldest = this.toasts.shift();
            if (oldest.element && oldest.element.parentNode) {
                oldest.element.remove();
            }
            if (oldest.timeout) clearTimeout(oldest.timeout);
        }

        return toastId;
    }

    // Show success toast
    success(message, title = 'Success') {
        return this.show({ title, message, type: 'success' });
    }

    // Show error toast
    error(message, title = 'Error') {
        return this.show({ title, message, type: 'error', duration: 6000 });
    }

    // Show warning toast
    warning(message, title = 'Warning') {
        return this.show({ title, message, type: 'warning' });
    }

    // Show info toast
    info(message, title = 'Info') {
        return this.show({ title, message, type: 'info' });
    }

    // Dismiss a toast
    dismiss(toastId) {
        const index = this.toasts.findIndex(t => t.id === toastId);
        if (index !== -1) {
            const toast = this.toasts[index];
            toast.element.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.element && toast.element.parentNode) {
                    toast.element.remove();
                }
                if (toast.timeout) clearTimeout(toast.timeout);
            }, 300);
            this.toasts.splice(index, 1);
        }
    }

    // Dismiss all toasts
    dismissAll() {
        this.toasts.forEach(toast => {
            if (toast.element && toast.element.parentNode) {
                toast.element.remove();
            }
            if (toast.timeout) clearTimeout(toast.timeout);
        });
        this.toasts = [];
    }
}

// Create global toast manager
window.toastManager = new ToastManager();

// Helper function for quick toasts
window.toast = {
    success: (msg, title) => window.toastManager.success(msg, title),
    error: (msg, title) => window.toastManager.error(msg, title),
    warning: (msg, title) => window.toastManager.warning(msg, title),
    info: (msg, title) => window.toastManager.info(msg, title)
};
