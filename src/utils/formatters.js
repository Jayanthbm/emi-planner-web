/**
 * Utility functions for currency and tenure formatting.
 */

export function formatINR(amount, includeDecimals = false) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const rounded = includeDecimals ? Math.round(amount * 100) / 100 : Math.round(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(rounded);
}

export function formatTenure(months) {
  if (!months || months <= 0) return '0 mos';
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  if (yrs === 0) return `${mos} mo${mos !== 1 ? 's' : ''}`;
  if (mos === 0) return `${yrs} yr${yrs !== 1 ? 's' : ''}`;
  return `${yrs} yr${yrs !== 1 ? 's' : ''} ${mos} mo${mos !== 1 ? 's' : ''}`;
}

export function formatCompactINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const abs = Math.abs(amount);
  if (abs >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  if (abs >= 1000) {
    return `₹${(amount / 1000).toFixed(1)} k`;
  }
  return formatINR(amount);
}
