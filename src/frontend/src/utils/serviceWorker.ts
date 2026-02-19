/**
 * Utility to unregister any existing service workers.
 * This ensures no PWA/SW behavior slows down the customer page.
 */
export async function unregisterServiceWorkers(): Promise<void> {
  // Check if service worker API is available
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    for (const registration of registrations) {
      await registration.unregister();
    }
    
    if (registrations.length > 0) {
      console.log(`Unregistered ${registrations.length} service worker(s)`);
    }
  } catch (error) {
    // Silently fail - don't break the app if SW unregistration fails
    console.warn('Failed to unregister service workers:', error);
  }
}
