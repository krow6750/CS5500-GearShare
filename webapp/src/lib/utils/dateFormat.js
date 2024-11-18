export function formatDate(date) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  // Use UTC to ensure consistent formatting
  return date.toISOString().split('T')[0];
}

export const generateId = () => {
  return Math.floor(Math.random() * 1000000000);
}; 