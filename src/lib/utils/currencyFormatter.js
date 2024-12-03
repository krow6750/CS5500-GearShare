export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') {
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
