/**
 * Format a number as Pakistani Rupees (PKR)
 * @param amount - The amount to format
 * @returns Formatted string with currency symbol (e.g., "Rs 1,000")
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

