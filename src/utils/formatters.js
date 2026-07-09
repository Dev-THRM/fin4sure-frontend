/**
 * Format numbers as Indian Rupee short format (Cr, L, K)
 * @param {number} n 
 * @returns {string}
 */
export function fmtINR(n) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + ' L';
  if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

/**
 * Format numbers as full Indian Rupee currency format (e.g., ₹12,34,567)
 * @param {number} n 
 * @returns {string}
 */
export function fmtINRFull(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

/**
 * Format tenure months into Years and Months string representation
 * @param {number} m - months
 * @returns {string}
 */
export function fmtTenure(m) {
  const y = Math.floor(m / 12);
  const mo = m % 12;
  return y > 0 
    ? (mo > 0 ? y + 'y ' + mo + 'm' : y + (y > 1 ? ' Yrs' : ' Yr')) 
    : (mo + 'm');
}
