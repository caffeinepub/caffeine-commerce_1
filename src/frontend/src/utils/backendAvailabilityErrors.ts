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

  // Extract the most relevant error message from the backend
  let userMessage = error.message || String(error) || 'An error occurred';
  
  // If the error contains "Reject text:", extract that
  const rejectTextMatch = userMessage.match(/Reject text:\s*(.+?)(?:\n|$)/i);
  if (rejectTextMatch) {
    userMessage = rejectTextMatch[1].trim();
  }
  
  // If the error contains "Call was rejected:", extract that
  const rejectedMatch = userMessage.match(/Call was rejected:\s*(.+?)(?:\n|$)/i);
  if (rejectedMatch) {
    userMessage = rejectedMatch[1].trim();
  }

  // Clean up common prefixes
  userMessage = userMessage
    .replace(/^Error:\s*/i, '')
    .replace(/^Reject text:\s*/i, '')
    .replace(/^Call was rejected:\s*/i, '')
    .trim();

  // If the message is still too generic or empty, provide a more helpful fallback
  if (!userMessage || userMessage.length < 3) {
    userMessage = 'An error occurred while processing your request. Please try again.';
  }

  // Avoid returning the generic "Backend service is not available" message
  if (userMessage === 'Backend service is not available') {
    userMessage = 'Unable to connect to the backend service. Please ensure the canister is running and try again.';
  }

  return {
    isBackendUnavailable: false,
    userMessage,
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
