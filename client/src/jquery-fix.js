// This script helps ensure jQuery is properly loaded before plugins try to use it
// Fix for "Cannot set properties of undefined (setting 'magnificPopup')" error

(function() {
  // Check if jQuery exists
  if (typeof window.jQuery === 'undefined') {
    console.warn('jQuery not found, jQuery plugins may not initialize properly');
    return;
  }
  
  // If jQuery exists but plugins are causing errors
  const originalFn = window.jQuery.fn;
  
  if (originalFn) {
    // Create a safety wrapper for plugin initialization
    const safePluginInit = function(name, fn) {
      try {
        if (typeof fn === 'function') {
          originalFn[name] = fn;
        }
      } catch (e) {
        console.warn(`Failed to initialize jQuery plugin: ${name}`, e);
      }
    };
    
    // Add waypoint plugin support
    if (!originalFn.waypoint) {
      originalFn.waypoint = function() {
        console.warn('Waypoint plugin not loaded correctly - ignoring waypoint call');
        return this; // Return the jQuery object to allow chaining
      };
    }
    
    // Monitor for magnificPopup specifically
    Object.defineProperty(window.jQuery.fn, 'magnificPopup', {
      set: function(val) {
        safePluginInit('magnificPopup', val);
      },
      get: function() {
        return originalFn.magnificPopup;
      },
      configurable: true
    });
    
    // Monitor for waypoint plugin
    Object.defineProperty(window.jQuery.fn, 'waypoint', {
      set: function(val) {
        safePluginInit('waypoint', val);
      },
      get: function() {
        return originalFn.waypoint || function() { 
          console.warn('Waypoint plugin not loaded - ignoring waypoint call');
          return this; 
        };
      },
      configurable: true
    });
  }
})();
