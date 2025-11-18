// Conditional plugin loader to prevent jQuery conflicts with React
// Only loads jQuery plugins when they're needed and safe to use

let pluginsLoaded = false;

export const loadJQueryPlugins = async () => {
  // Only load once and only if we're not in a React-heavy context
  if (pluginsLoaded || isReactPage()) {
    return;
  }

  try {
    // Dynamically import the main jQuery plugins file
    await import('../js/main');
    pluginsLoaded = true;
    console.log('jQuery plugins loaded successfully');
  } catch (error) {
    console.warn('Failed to load jQuery plugins:', error);
  }
};

// Check if current page is React-heavy and shouldn't use jQuery plugins
const isReactPage = (): boolean => {
  const reactRoutes = [
    '/prescriptions',
    '/dashboard',
    '/appointments',
    '/sign-in',
    '/sign-up',
    '/admin',
    '/doctor-auth'
  ];
  
  const currentPath = window.location.pathname;
  return reactRoutes.some(route => currentPath.includes(route));
};

// Safe initialization for pages that need jQuery plugins
export const initializePluginsForPage = () => {
  // Only initialize plugins for static pages (home, about, contact, etc.)
  if (!isReactPage()) {
    loadJQueryPlugins();
  }
};

// Clean up function to prevent memory leaks
export const cleanupPlugins = () => {
  if (typeof (window as any).jQuery !== 'undefined') {
    try {
      // Remove event listeners that might interfere with React
      (window as any).jQuery(document).off('.plugin-namespace');
      (window as any).jQuery(window).off('.plugin-namespace');
    } catch (error) {
      console.warn('Error during plugin cleanup:', error);
    }
  }
};
