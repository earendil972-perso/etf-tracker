import type { AppData } from "../types";

export function fmtEUR(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
}

export function fmtNum(n: number, digits = 2): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(n);
}

export function fmtPct(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${fmtNum(n, 2)} %`;
}

export function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  return new Intl.DateTimeFormat("fr-FR", { month: "short", year: "2-digit" }).format(
    new Date(y, m - 1, 1)
  );
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function monthsBetween(from: string, to: string): string[] {
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  const out: string[] = [];
  let y = fy;
  let m = fm;
  while (y < ty || (y === ty && m <= tm)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function backupFileName(): string {
  return `etf-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
}

export function validateAppData(raw: unknown): { ok: true; data: AppData } | { ok: false; error: string } {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "Fichier invalide : JSON attendu." };
  }
  const d = raw as Record<string, unknown>;
  if (!Array.isArray(d.purchases) || !Array.isArray(d.providers) || !Array.isArray(d.benchmarks)) {
    return { ok: false, error: "Fichier invalide : les clés purchases, providers et benchmarks sont requises." };
  }
  for (const p of d.purchases) {
    const o = p as Record<string, unknown>;
    if (
      typeof o.id !== "string" ||
      typeof o.provider !== "string" ||
      typeof o.date !== "string" ||
      !/^\d{4}-\d{2}$/.test(String(o.date)) ||
      typeof o.quantity !== "number" ||
      typeof o.buyPrice !== "number"
    ) {
      return { ok: false, error: "Achat invalide dans le fichier (id, provider, date YYYY-MM, quantity, buyPrice requis)." };
    }
  }
  for (const p of d.providers) {
    const o = p as Record<string, unknown>;
    if (typeof o.name !== "string" || typeof o.currentPrice !== "number") {
      return { ok: false, error: "Fournisseur invalide dans le fichier (name, currentPrice requis)." };
    }
  }
  for (const b of d.benchmarks) {
    const o = b as Record<string, unknown>;
    if (typeof o.id !== "string" || typeof o.name !== "string" || typeof o.currentPrice !== "number" || typeof o.prices !== "object" || o.prices === null) {
      return { ok: false, error: "Benchmark invalide dans le fichier (id, name, currentPrice, prices requis)." };
    }
  }
  return {
    ok: true,
    data: {
      purchases: d.purchases as AppData["purchases"],
      providers: d.providers as AppData["providers"],
      benchmarks: d.benchmarks as AppData["benchmarks"],
    },
  };
}
