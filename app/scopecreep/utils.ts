
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
};

/**
 * Convert a currency code to its symbol.
 * Falls back to the code itself if unknown.
 */
export function getCurrencySymbol(code?: string): string {
  if (!code) return '$';
  return CURRENCY_SYMBOLS[code.toUpperCase()] || code;
}
