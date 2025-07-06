/**
 * Format a date to a localized string
 * @param {string|Date} date - The date to format
 * @returns {string} The formatted date
 */
export const formatDate = (date) => {
  if (!date) return '';
  const options = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit'
  };
  return new Date(date).toLocaleDateString('fr-FR', options);
};

/**
 * Format a number as a price with currency symbol
 * @param {number} price - The price to format
 * @returns {string} The formatted price
 */
export const formatPrice = (price) => {
  if (typeof price !== 'number') return '';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

/**
 * Format a percentage
 * @param {number} value - The value to format as percentage
 * @returns {string} The formatted percentage
 */
export const formatPercent = (value) => {
  if (typeof value !== 'number') return '';
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value / 100);
};

/**
 * Format a number with thousand separators
 * @param {number} value - The number to format
 * @returns {string} The formatted number
 */
export const formatNumber = (value) => {
  if (typeof value !== 'number') return '';
  return new Intl.NumberFormat('fr-FR').format(value);
}; 