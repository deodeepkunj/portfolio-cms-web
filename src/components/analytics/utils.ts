export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatDuration(secs: number): string {
  const total = Math.round(secs);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export function formatDelta(pct: number | null): string | null {
  if (pct === null) return null;
  return `${Math.abs(pct).toFixed(2)}%`;
}

export function formatCurrency(value: number, currencyCode = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

export function formatDecimal(value: number): string {
  return value.toFixed(2);
}

export function formatRoas(roas: number): string {
  return `${roas.toFixed(2)}x`;
}
