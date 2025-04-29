/**
 * Data Validator Utility
 * Provides safe methods for checking and accessing data
 */

// Safe property checker to prevent "in" operator errors
function hasProperty(obj, prop) {
    return obj !== undefined && obj !== null && typeof obj === 'object' && prop in obj;
}

// Safe getter that won't throw errors
function safeGet(obj, path, defaultValue = undefined) {
    if (!obj) return defaultValue;
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
        if (current === undefined || current === null || typeof current !== 'object') {
            return defaultValue;
        }
        current = current[key];
    }
    
    return current !== undefined ? current : defaultValue;
}

// Wrapper for data collection functions to prevent common errors
function safeDataCollection(collectionFn) {
    return function() {
        try {
            return collectionFn.apply(this, arguments);
        } catch (error) {
            console.error(`Error collecting data: ${error.message}`);
            document.getElementById('loading-indicator').classList.add('hidden');
            
            // Show error message in UI
            const introSection = document.getElementById('intro-section');
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error collecting data: ${error.message}`;
            introSection.appendChild(errorMsg);
            
            return null;
        }
    };
}

// Export utilities to global scope
window.DataValidator = {
    hasProperty,
    safeGet,
    safeDataCollection
};
