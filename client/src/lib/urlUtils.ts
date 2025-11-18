/**
 * Utility functions for handling API URLs
 */

/**
 * Constructs an API endpoint URL, ensuring there are no double slashes
 * @param path The API endpoint path (with or without leading slash)
 * @returns The complete URL with proper formatting
 */
export const buildApiUrl = (path: string): string => {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
  
  // Remove any leading slash from the path
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Combine and ensure no double slashes
  let url = `${baseUrl}/${cleanPath}`;
  
  // Replace any double slashes with single slashes, but preserve http:// or https://
  url = url.replace(/(https?:\/\/)|(\/\/)/g, (match) => {
    return match === '//' ? '/' : match;
  });
  
  return url;
};




