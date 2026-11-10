import type { Benchmark, Purchase, Provider } from "../types";
import { monthsBetween } from "./format";

export interface PurchasePnl {
  purchase: Purchase;
  currentPrice: number;
  invested: number;
  currentValue: number;
  pnl: number;
  pnlPct: number;
}

export function purchasePnl(p: Purchase, providers: Provider[]): PurchasePnl {
  const currentPrice = providers.find((pr) => pr.name === p.provider)?.currentPrice ?? 0;
  const invested = p.quantity * p.buyPrice;
  const currentValue = p.quantity * currentPrice;
  const pnl = currentValue - invested;
  return {
    purchase: p,
    currentPrice,
    invested,
    currentValue,
    pnl,
    pnlPct: invested > 0 ? (pnl / invested) * 100 : 0,
  };
}

export function totals(pnls: PurchasePnl[]) {
  const invested = pnls.reduce((s, x) => s + x.invested, 0);
  const currentValue = pnls.reduce((s, x) => s + x.currentValue, 0);
  const pnl = currentValue - invested;
  return { invested, currentValue, pnl, pnlPct: invested > 0 ? (pnl / invested) * 100 : 0 };
}

export function purchaseMonths(purchases: Purchase[]): string[] {
  const set = new Set(purchases.map((p) => p.date));
  return [...set].sort();
}

export function actualPnlByMonth(purchases: Purchase[], providers: Provider[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const p of purchases) {
    const currentPrice = providers.find((pr) => pr.name === p.provider)?.currentPrice ?? 0;
    const pnl = (currentPrice - p.buyPrice) * p.quantity;
    map.set(p.date, (map.get(p.date) ?? 0) + pnl);
  }
  return map;
}

export function investedByMonth(purchases: Purchase[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const p of purchases) {
    map.set(p.date, (map.get(p.date) ?? 0) + p.quantity * p.buyPrice);
  }
  return map;
}

export function benchmarkGain(
  b: Benchmark,
  month: string,
  amount: number
): number | null {
  const price = b.prices[month];
  if (!price || price <= 0) return null;
  const shares = amount / price;
  return shares * b.currentPrice - amount;
}

export function shouldHaveBoughtRows(
  purchases: Purchase[],
  providers: Provider[],
  benchmarks: Benchmark[]
) {
  const months = purchaseMonths(purchases);
  const invested = investedByMonth(purchases);
  const actual = actualPnlByMonth(purchases, providers);
  return months.map((month) => {
    const amount = invested.get(month) ?? 0;
    let best: { name: string; gain: number } | null = null;
    for (const b of benchmarks) {
      const gain = benchmarkGain(b, month, amount);
      if (gain !== null && (best === null || gain > best.gain)) {
        best = { name: b.name, gain };
      }
    }
    const actualGain = actual.get(month) ?? 0;
    return {
      month,
      amount,
      actualGain,
      bestName: best?.name ?? null,
      bestGain: best?.gain ?? null,
      missedGain: best ? best.gain - actualGain : null,
    };
  });
}

export function buyPriceTimeline(purchases: Purchase[], providers: Provider[]) {
  const months = purchaseMonths(purchases);
  if (months.length === 0) return [];
  const all = monthsBetween(months[0], months[months.length - 1]);
  return all.map((month) => {
    const row: Record<string, string | number | null> = { month };
    for (const pr of providers) {
      const buys = purchases.filter((p) => p.provider === pr.name && p.date === month);
      row[pr.name] = buys.length > 0 ? buys.reduce((s, b) => s + b.buyPrice, 0) / buys.length : null;
    }
    return row;
  });
}
