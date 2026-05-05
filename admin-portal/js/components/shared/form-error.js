// Form Error Component
// Displays validation errors for forms

class FormError {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        if (!this.form) {
            console.error('FormError: Form not found:', formId);
            return;
        }
        this.options = {
            errorClass: options.errorClass || 'form-error',
            summaryContainer: options.summaryContainer || null,
            scrollToError: options.scrollToError !== false,
            highlightErrors: options.highlightErrors !== false
        };
        this.errors = [];
        this.createErrorContainer();
    }

    // Create error container for summary
    createErrorContainer() {
        if (this.options.summaryContainer) {
            const container = document.getElementById(this.options.summaryContainer);
            if (container) {
                this.summaryContainer = container;
                return;
            }
        }
        
        // Create summary container at top of form
        this.summaryContainer = document.createElement('div');
        this.summaryContainer.className = 'form-error-summary';
        this.summaryContainer.style.cssText = `
            margin-bottom: 20px;
            display: none;
        `;
        this.form.insertBefore(this.summaryContainer, this.form.firstChild);
    }

    // Show error for a specific field
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Remove existing error
        this.hideFieldError(fieldId);

        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = this.options.errorClass;
        errorElement.id = `${fieldId}-error`;
        errorElement.style.cssText = `
            color: #dc2626;
            font-size: 12px;
            margin-top: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
        `;
        errorElement.innerHTML = `⚠️ ${message}`;

        // Highlight field
        if (this.options.highlightErrors) {
            field.style.borderColor = '#dc2626';
            field.style.backgroundColor = '#fef2f2';
        }

        // Insert after field
        field.parentNode.insertBefore(errorElement, field.nextSibling);
        
        this.errors.push({ fieldId, message, element: errorElement });
        this.updateSummary();
    }

    // Hide error for a field
    hideFieldError(fieldId) {
        const existingError = document.getElementById(`${fieldId}-error`);
        if (existingError) {
            existingError.remove();
        }
        
        // Remove highlighting
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.borderColor = '';
            field.style.backgroundColor = '';
        }
        
        this.errors = this.errors.filter(e => e.fieldId !== fieldId);
        this.updateSummary();
    }

    // Show multiple errors from validation result
    showErrors(errors) {
        this.clearAll();
        
        for (const [fieldId, message] of Object.entries(errors)) {
            this.showFieldError(fieldId, message);
        }
        
        if (this.options.scrollToError && this.errors.length > 0) {
            const firstErrorField = document.getElementById(this.errors[0].fieldId);
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstErrorField.focus();
            }
        }
    }

    // Update error summary
    updateSummary() {
        if (!this.summaryContainer) return;
        
        if (this.errors.length === 0) {
            this.summaryContainer.style.display = 'none';
            this.summaryContainer.innerHTML = '';
            return;
        }
        
        this.summaryContainer.style.display = 'block';
        this.summaryContainer.innerHTML = `
            <div style="
                background: #fef2f2;
                border-left: 4px solid #dc2626;
                padding: 12px 16px;
                border-radius: 8px;
            ">
                <div style="font-weight: 600; color: #991b1b; margin-bottom: 8px;">
                    Please fix the following errors:
                </div>
                <ul style="margin: 0; padding-left: 20px; color: #dc2626; font-size: 13px;">
                    ${this.errors.map(e => `<li>${e.message}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // Clear all errors
    clearAll() {
        this.errors.forEach(error => {
            if (error.element && error.element.parentNode) {
                error.element.remove();
            }
            const field = document.getElementById(error.fieldId);
            if (field) {
                field.style.borderColor = '';
                field.style.backgroundColor = '';
            }
        });
        this.errors = [];
        this.updateSummary();
    }

    // Get all current errors
    getErrors() {
        return this.errors;
    }

    // Check if form has any errors
    hasErrors() {
        return this.errors.length > 0;
    }
}

// Helper function to create form error manager
window.createFormError = function(formId, options = {}) {
    return new FormError(formId, options);
};

// Common validation rules
window.FormValidators = {
    required: (value, fieldName) => {
        if (!value || value.trim() === '') {
            return `${fieldName} is required`;
        }
        return null;
    },
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
            return 'Please enter a valid email address';
        }
        return null;
    },
    minLength: (value, length, fieldName) => {
        if (value && value.length < length) {
            return `${fieldName} must be at least ${length} characters`;
        }
        return null;
    },
    maxLength: (value, length, fieldName) => {
        if (value && value.length > length) {
            return `${fieldName} must be at most ${length} characters`;
        }
        return null;
    },
    number: (value, fieldName) => {
        if (value && isNaN(Number(value))) {
            return `${fieldName} must be a number`;
        }
        return null;
    }
};
