export const timeAgo = (dateInput) => {
  if (!dateInput) return '';
  
  let past;
  if (dateInput instanceof Date) {
    past = dateInput;
  } else if (typeof dateInput === 'string') {
    // Ensure the date string is treated as UTC if no timezone is provided
    // Backend returns ISO format. If it doesn't have Z or +/-, we append Z.
    const normalizedDateStr = dateInput.includes('Z') || dateInput.includes('+') 
      ? dateInput 
      : `${dateInput}Z`;
    past = new Date(normalizedDateStr);
  } else {
    return '';
  }
    
  const now = new Date();
  const diffMs = now - past;
  
  // Handle cases where the server time might be slightly ahead of local time due to clock drift
  if (diffMs < 0) return 'Just now';
  
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  // For older dates, show a simple date string
  return past.toLocaleDateString();
};
