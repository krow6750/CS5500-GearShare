export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') {
    // Try to parse the amount if it's a string
    const parsed = parseFloat(amount);
    if (isNaN(parsed)) return '$0.00';
    amount = parsed;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};
