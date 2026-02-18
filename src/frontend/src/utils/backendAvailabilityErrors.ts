/**
 * Utility functions for detecting and handling backend unavailability errors,
 * including IC0508 "Canister is stopped" errors and deployment issues.
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
  const isCanisterNotFound = errorString.includes('canister not found');
  const isCanisterRejected = errorString.includes('canister rejected') || errorString.includes('reject code');
  const isDestinationInvalid = errorString.includes('destination invalid');
  const isNetworkError = 
    errorString.includes('no route to host') ||
    errorString.includes('connection refused') ||
    errorString.includes('timeout') ||
    errorString.includes('network error') ||
    errorString.includes('failed to fetch');
  
  const isDeploymentIssue = 
    errorString.includes('deployment') ||
    errorString.includes('not deployed') ||
    errorString.includes('canister id not found');

  const isUnavailable = 
    isIC0508 ||
    isCanisterNotFound ||
    isCanisterRejected ||
    isDestinationInvalid ||
    isNetworkError ||
    isDeploymentIssue;

  if (isUnavailable) {
    let userMessage = 'Service temporarily unavailable. ';
    
    if (isIC0508) {
      userMessage += 'The backend canister is stopped. Please start it and try again.';
    } else if (isCanisterNotFound || isDeploymentIssue) {
      userMessage += 'The backend canister may not be deployed. Please ensure it is running.';
    } else if (isNetworkError) {
      userMessage += 'Network connection issue. Please check your connection and try again.';
    } else {
      userMessage += 'Please ensure the backend is running and try again.';
    }

    return {
      isBackendUnavailable: true,
      userMessage,
      originalError: error,
    };
  }

  // For authorization-related errors during open admin phase, sanitize to neutral operational message
  if (errorString.includes('unauthorized') || 
      errorString.includes('permission') || 
      errorString.includes('access denied') ||
      errorString.includes('only admins can') ||
      errorString.includes('no permission') ||
      errorString.includes('only users can') ||
      errorString.includes('admin') && errorString.includes('action')) {
    return {
      isBackendUnavailable: false,
      userMessage: 'Unable to complete the operation. Please refresh the page and try again.',
      originalError: error,
    };
  }

  // Generic error - return the original message
  const originalMessage = error.message || String(error) || 'An error occurred';
  return {
    isBackendUnavailable: false,
    userMessage: originalMessage,
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
