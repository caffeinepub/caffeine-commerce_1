/**
 * Utility functions for detecting and handling backend unavailability errors,
 * including IC0508 "Canister is stopped" errors.
 */

export interface BackendErrorInfo {
  isBackendUnavailable: boolean;
  userMessage: string;
  originalError: any;
}

/**
 * Detects if an error indicates the backend canister is unavailable or stopped.
 * Checks for IC0508 error code and other common unavailability patterns.
 */
export function detectBackendUnavailability(error: any): BackendErrorInfo {
  if (!error) {
    return {
      isBackendUnavailable: false,
      userMessage: 'An unknown error occurred',
      originalError: error,
    };
  }

  const errorString = String(error.message || error).toLowerCase();
  
  // Check for IC0508 "Canister is stopped" error
  const isIC0508 = errorString.includes('ic0508') || errorString.includes('canister is stopped');
  
  // Check for other common unavailability patterns
  const isUnavailable = 
    isIC0508 ||
    errorString.includes('canister not found') ||
    errorString.includes('canister rejected') ||
    errorString.includes('destination invalid') ||
    errorString.includes('no route to host') ||
    errorString.includes('connection refused') ||
    errorString.includes('timeout');

  if (isUnavailable) {
    return {
      isBackendUnavailable: true,
      userMessage: 'The backend service is currently unavailable or stopped. Please ensure the canister is running and try again.',
      originalError: error,
    };
  }

  // Generic error
  return {
    isBackendUnavailable: false,
    userMessage: error.message || 'An error occurred while communicating with the backend',
    originalError: error,
  };
}

/**
 * Formats a user-friendly error message for display in the UI.
 */
export function formatBackendError(error: any): string {
  const info = detectBackendUnavailability(error);
  return info.userMessage;
}
