// Empty State Component
// Displays a friendly message when no data is available

class EmptyState {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('EmptyState: Container not found:', containerId);
            return;
        }
        this.options = {
            icon: options.icon || '📭',
            title: options.title || 'No data available',
            message: options.message || 'Nothing to display here yet.',
            actionText: options.actionText || null,
            actionCallback: options.actionCallback || null,
            size: options.size || 'medium' // small, medium, large
        };
    }

    // Render the empty state
    render() {
        if (!this.container) return;

        const sizeStyles = {
            small: { icon: '48px', title: '18px', message: '14px', padding: '30px' },
            medium: { icon: '64px', title: '20px', message: '14px', padding: '40px' },
            large: { icon: '80px', title: '24px', message: '16px', padding: '60px' }
        };

        const styles = sizeStyles[this.options.size];

        const actionButton = this.options.actionText ? `
            <button class="empty-state-action" style="
                margin-top: 20px;
                padding: 10px 20px;
                background: #111;
                color: #fff;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
            ">${this.options.actionText}</button>
        ` : '';

        const html = `
            <div class="empty-state" style="
                text-align: center;
                padding: ${styles.padding};
                background: #fafafa;
                border-radius: 16px;
                border: 1px dashed #ddd;
            ">
                <div style="font-size: ${styles.icon}; margin-bottom: 16px;">${this.options.icon}</div>
                <h3 style="font-size: ${styles.title}; font-weight: 600; margin-bottom: 8px; color: #333;">${this.options.title}</h3>
                <p style="font-size: ${styles.message}; color: #888; margin-bottom: 0;">${this.options.message}</p>
                ${actionButton}
            </div>
        `;

        this.container.innerHTML = html;

        // Bind action button click
        if (this.options.actionText && this.options.actionCallback) {
            const actionBtn = this.container.querySelector('.empty-state-action');
            if (actionBtn) {
                actionBtn.addEventListener('click', this.options.actionCallback);
            }
        }
    }

    // Update empty state options
    update(options) {
        this.options = { ...this.options, ...options };
        this.render();
    }

    // Clear empty state (show original content)
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Helper function to show empty state
window.showEmptyState = function(containerId, options) {
    const emptyState = new EmptyState(containerId, options);
    emptyState.render();
    return emptyState;
};

// Table-specific empty state
window.showEmptyTable = function(containerId, entityName = 'records') {
    return window.showEmptyState(containerId, {
        icon: '📊',
        title: `No ${entityName} found`,
        message: `Try adjusting your filters or add a new ${entityName.slice(0, -1)}.`
    });
};

// Chart-specific empty state
window.showEmptyChart = function(containerId) {
    return window.showEmptyState(containerId, {
        icon: '📈',
        title: 'No chart data available',
        message: 'Add data to see visualizations here.'
    });
};
