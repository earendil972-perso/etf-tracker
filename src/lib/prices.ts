export interface EtfQuote {
  price: number;
  currency: string;
  ticker: string;
  exchange: string;
  name?: string;
}

export interface CatalogEntryData {
  nom: string;
  categorie: string;
  prix: number;
  perf: { m1: number | null; m3: number | null; m6: number | null; y1: number | null };
}

export interface RepoPrices {
  updated: string;
  prices: Record<string, number>;
  catalog?: Record<string, CatalogEntryData>;
}

export async function fetchRepoPrices(): Promise<RepoPrices | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}prices.json?t=${Date.now()}`);
    if (!res.ok) return null;
    const j = await res.json();
    if (j && typeof j === "object" && j.prices) {
      return { updated: String(j.updated ?? ""), prices: j.prices, catalog: j.catalog };
    }
    return null;
  } catch {
    return null;
  }
}

export function tokenOverlap(entry: string, name: string | undefined): number {
  if (!name) return 0;
  const tokens = entry
    .toLowerCase()
    .split(/[^a-z0-9&]+/)
    .filter((t) => t.length >= 3);
  const lower = name.toLowerCase();
  return tokens.filter((t) => lower.includes(t)).length;
}

const PROXIES = [
  (url: string) => url,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
];

async function fetchJson(url: string): Promise<unknown> {
  let lastError: unknown = null;
  for (const wrap of PROXIES) {
    try {
      const res = await fetch(wrap(url));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (typeof json?.contents === "string") {
        return JSON.parse(json.contents);
      }
      return json;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Recherche impossible");
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function extractIsin(text: string): string | null {
  const m = text.match(/\b[A-Z]{2}[A-Z0-9]{9}[0-9]\b/);
  return m ? m[0] : null;
}

export function isValidIsin(text: string): boolean {
  return /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(text.trim().toUpperCase());
}

export function nameQuery(entry: string): string {
  return entry
    .replace(/\b[A-Z]{2}[A-Z0-9]{9}[0-9]\b/g, "")
    .replace(/[()]/g, "")
    .trim();
}

interface LookupDoc {
  symbol?: string;
  shortName?: string;
  regularMarketPrice?: { raw?: number };
  price?: { raw?: number };
  exchange?: string;
}

async function lookupDoc(isin: string): Promise<LookupDoc | null> {
  const url = `https://query1.finance.yahoo.com/v1/finance/lookup?query=${encodeURIComponent(isin)}&type=etf&count=10`;
  const json = (await fetchJson(url)) as { finance?: { result?: { documents?: LookupDoc[] }[] } };
  return json.finance?.result?.[0]?.documents?.[0] ?? null;
}

async function chartPrice(symbol: string): Promise<{ price: number; currency: string; exchange: string }> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`;
  const json = (await fetchJson(url)) as {
    chart?: { result?: { meta?: { regularMarketPrice?: number; currency?: string; exchangeName?: string } }[] };
  };
  const meta = json.chart?.result?.[0]?.meta;
  if (!meta || typeof meta.regularMarketPrice !== "number") {
    throw new Error("Cours introuvable");
  }
  return {
    price: meta.regularMarketPrice,
    currency: meta.currency ?? "",
    exchange: meta.exchangeName ?? "",
  };
}

interface YahooQuote {
  symbol?: string;
  quoteType?: string;
  shortname?: string;
  longname?: string;
}

async function searchQuotes(query: string): Promise<YahooQuote[]> {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0`;
  const json = (await fetchJson(url)) as { quotes?: YahooQuote[] };
  return json.quotes ?? [];
}

async function resolveByIsin(isin: string, entry: string): Promise<EtfQuote | null> {
  const quotes = await searchQuotes(isin);
  const known = quotes.some((q) => q.symbol?.toUpperCase().startsWith(isin));
  if (known) {
    const etf = quotes.find((q) => q.quoteType === "ETF" && q.symbol);
    if (etf?.symbol) {
      const { price, currency, exchange } = await chartPrice(etf.symbol);
      return {
        price,
        currency,
        ticker: etf.symbol,
        exchange,
        name: etf.shortname ?? etf.longname,
      };
    }
  }
  const doc = await lookupDoc(isin);
  if (doc?.symbol && tokenOverlap(entry, doc.shortName) >= 2) {
    const raw = doc.regularMarketPrice?.raw ?? doc.price?.raw;
    if (typeof raw === "number") {
      return { price: raw, currency: "EUR", ticker: doc.symbol, exchange: doc.exchange ?? "", name: doc.shortName };
    }
  }
  return null;
}

export async function resolveEtfByIsin(isin: string): Promise<(EtfQuote & { name: string }) | null> {
  const quotes = await searchQuotes(isin);
  const known = quotes.some((q) => q.symbol?.toUpperCase().startsWith(isin));
  const etf = quotes.find((q) => q.quoteType === "ETF" && q.symbol);
  if (known && etf?.symbol) {
    const { price, currency, exchange } = await chartPrice(etf.symbol);
    return {
      price,
      currency,
      ticker: etf.symbol,
      exchange,
      name: (etf.shortname ?? etf.longname ?? "").trim(),
    };
  }
  const doc = await lookupDoc(isin);
  const raw = doc ? (doc.regularMarketPrice?.raw ?? doc.price?.raw) : undefined;
  if (doc?.symbol && typeof raw === "number") {
    return {
      price: raw,
      currency: "EUR",
      ticker: doc.symbol,
      exchange: doc.exchange ?? "",
      name: (doc.shortName ?? "").trim(),
    };
  }
  return null;
}

async function priceByName(query: string): Promise<EtfQuote> {
  const quotes = await searchQuotes(query);
  const pool = quotes.filter((q) => q.symbol);
  if (pool.length === 0) {
    throw new Error("ETF introuvable sur le marché");
  }
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9&]+/)
    .filter((t) => t.length >= 2);
  const score = (q: YahooQuote): number => {
    const name = (q.shortname ?? "").toLowerCase();
    let s = 0;
    for (const t of tokens) {
      if (name.includes(t)) s += 2;
    }
    if (q.quoteType === "ETF") s += 3;
    if (q.symbol!.endsWith(".PA")) s += 1;
    return s;
  };
  const best = [...pool].sort((a, b) => score(b) - score(a))[0];
  const { price, currency, exchange } = await chartPrice(best.symbol!);
  return { price, currency, ticker: best.symbol!, exchange, name: best.shortname };
}

export async function fetchEtfPrice(entry: string): Promise<EtfQuote> {
  const isin = extractIsin(entry);
  if (isin) {
    const resolved = await resolveByIsin(isin, entry);
    if (resolved) return resolved;
  }
  return priceByName(nameQuery(entry) || entry);
}
