export const USD_TO_INR = 83.5;
export const GBP_TO_INR = 106.0;
export const EUR_TO_INR = 90.0;
export type DisplayCurrency = "INR" | "USD";

export function toINR(amount: bigint | number, currency: string): number {
  const n = Number(amount);
  switch (currency) {
    case "USD": return n * USD_TO_INR;
    case "GBP": return n * GBP_TO_INR;
    case "EUR": return n * EUR_TO_INR;
    default:    return n;
  }
}

export function formatSalary(
  amount: bigint | number,
  currency: string,
  displayCurrency: DisplayCurrency = "INR",
  compact = false
): string {
  const n = Number(amount);
  if (displayCurrency === "USD") {
    const usd = toINR(n, currency) / USD_TO_INR;
    if (compact) return `$${abbreviate(usd)}`;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(usd);
  }
  const inr = toINR(n, currency);
  if (compact) return `₹${abbreviateINR(inr)}`;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(inr);
}

function abbreviateINR(n: number): string {
  if (n >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(1).replace(/\.0$/, "")} Cr`;
  if (n >= 1_00_000)    return `${(n / 1_00_000).toFixed(1).replace(/\.0$/, "")} L`;
  return n.toLocaleString("en-IN");
}

function abbreviate(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

export function formatDelta(delta: number, displayCurrency: DisplayCurrency = "INR"): { text: string; positive: boolean } {
  const abs = Math.abs(delta);
  const positive = delta >= 0;
  const sign = positive ? "+" : "-";
  if (displayCurrency === "USD") {
    const usd = abs / USD_TO_INR;
    return { text: `${sign}${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(usd)}`, positive };
  }
  return { text: `${sign}${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(abs)}`, positive };
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}