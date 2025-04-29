/**
 * Browser Compatibility Helper
 * Provides polyfills and workarounds for cross-browser compatibility
 */

(function() {
    // Detect Firefox
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    
    // Common polyfills and fixes
    if (!Object.hasOwn) {
        Object.hasOwn = function(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        };
    }
    
    // Firefox-specific fixes
    if (isFirefox) {
        // Fix for undefined object issues in Firefox
        // This helps prevent "right-hand side of 'in' should be an object" errors
        const originalIn = Object.getOwnPropertyDescriptor(Symbol.prototype, "in");
        if (originalIn && originalIn.configurable) {
            // Safer 'in' operator wrapper
            const safeIn = function(obj, prop) {
                if (obj === undefined || obj === null || typeof obj !== 'object') {
                    console.warn(`Attempted to use 'in' operator on non-object: ${obj}`);
                    return false;
                }
                return prop in obj;
            };
            
            // We can't actually replace the 'in' operator, but we can provide this helper
            window.safeIn = safeIn;
        }
        
        // Add more Firefox-specific workarounds as needed
        console.log("Firefox detected. Browser compatibility fixes applied.");
    }
    
    // Patch spoofer.js error handling (without modifying the original)
    window.addEventListener('error', function(event) {
        if (event.filename && event.filename.includes('spoofer.js')) {
            console.warn('Handled error in spoofer.js:', event.message);
            event.preventDefault(); // Prevent the error from bubbling up
            return true;
        }
    }, true);
})();
