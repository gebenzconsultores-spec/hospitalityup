/**
 * Format a number as currency based on the property's currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'es-MX'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    // Fallback for unsupported currency codes
    const symbol = getCurrencySymbol(currency)
    return `${symbol}${amount.toFixed(2)}`
  }
}

/**
 * Get currency symbol from currency code
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    MXN: '$',
    EUR: '€',
    GBP: '£',
    COP: '$',
    ARS: '$',
    CLP: '$',
    PEN: 'S/',
    BRL: 'R$',
  }
  return symbols[currency] || '$'
}

/**
 * Get display text for currency
 */
export function getCurrencyLabel(currency: string): string {
  const labels: Record<string, string> = {
    USD: 'USD',
    MXN: 'MXN',
    EUR: 'EUR',
    GBP: 'GBP',
    COP: 'COP',
    ARS: 'ARS',
    CLP: 'CLP',
    PEN: 'PEN',
    BRL: 'BRL',
  }
  return labels[currency] || currency
}
