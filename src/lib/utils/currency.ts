/**
 * Format cents (integer) to a currency string.
 * All monetary values are stored as integer cents to avoid float precision issues.
 */
export function formatCurrency(cents: number, currency = 'USD'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format cents to a compact string (e.g. $1.2K, $3.4M)
 */
export function formatCurrencyCompact(cents: number, currency = 'USD'): string {
  const amount = cents / 100;
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse a display string to cents integer.
 * Handles "$1,234.56" → 123456
 */
export function parseCents(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  if (!cleaned || isNaN(Number(cleaned))) return 0;
  return Math.round(parseFloat(cleaned) * 100);
}

/**
 * Convert cents to display decimal string (e.g. 123456 → "1234.56")
 */
export function centsToDecimalString(cents: number): string {
  return (cents / 100).toFixed(2);
}
