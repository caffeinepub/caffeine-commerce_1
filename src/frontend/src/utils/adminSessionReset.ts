/**
 * Utility for clearing admin session data from browser storage.
 * Clears localStorage, sessionStorage, and attempts to expire accessible cookies.
 */

export function clearAdminSession(): void {
  // Clear all localStorage
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }

  // Clear all sessionStorage
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Failed to clear sessionStorage:', error);
  }

  // Attempt to expire accessible cookies (non-HttpOnly only)
  try {
    const cookies = document.cookie.split(';');
    
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      
      // Set cookie to expire in the past for current domain and path
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      
      // Also try with domain specified
      const domain = window.location.hostname;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
    }
  } catch (error) {
    console.error('Failed to clear cookies:', error);
  }
}
