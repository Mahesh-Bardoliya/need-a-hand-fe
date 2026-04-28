/**
 * Safely extracts a displayable error message from an API error response.
 * Handles strings, objects with detail, and nested validation errors.
 */
export const extractErrorMessage = (error, defaultMsg = 'An unexpected error occurred.') => {
  if (!error) return defaultMsg;

  const detail = error?.response?.data?.detail;

  if (!detail) {
    return error.message || defaultMsg;
  }

  // Handle standard detail object from raise_error_message
  if (typeof detail === 'object') {
    if (detail.error_message) return detail.error_message;
    
    // Handle Pydantic validation errors (often an array or nested object)
    if (Array.isArray(detail)) {
      return detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join('\n');
    }
    
    // Fallback for generic objects
    try {
      return JSON.stringify(detail);
    } catch (e) {
      return defaultMsg;
    }
  }

  // Handle direct string detail
  if (typeof detail === 'string') {
    return detail;
  }

  return defaultMsg;
};
