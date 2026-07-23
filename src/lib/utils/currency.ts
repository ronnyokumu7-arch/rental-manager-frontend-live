// src/lib/utils/currency.ts

export type CurrencyCode = "KES" | "USD" | "EUR" | "GBP";

export const DEFAULT_CURRENCY: CurrencyCode = "KES";

export function formatCurrency(
  amount: number | string | null | undefined,
  currency: CurrencyCode = DEFAULT_CURRENCY,
  options?: { showFraction?: boolean }
): string {
  const num = Number(amount) || 0;
  // Default showFraction to false for clean non-decimal displays
  const showFraction = options?.showFraction ?? false;

  const formatted = new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: showFraction ? 2 : 0,
    maximumFractionDigits: showFraction ? 2 : 0,
  }).format(num);

  return `${currency} ${formatted}`;
}
