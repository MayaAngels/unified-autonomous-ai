// Components Barrel Export
// Central export point for all shared components

// Export all component classes
window.VitalComponents = {
    EmptyState: window.EmptyState,
    ToastManager: window.ToastManager,
    FormError: window.FormError,
    UploadProgress: window.UploadProgress
};

// Export helper functions
window.VitalHelpers = {
    showEmptyState: window.showEmptyState,
    showEmptyTable: window.showEmptyTable,
    showEmptyChart: window.showEmptyChart,
    toast: window.toast,
    createFormError: window.createFormError,
    createUploadProgress: window.createUploadProgress,
    FormValidators: window.FormValidators
};

console.log('Vital Components Library loaded');
