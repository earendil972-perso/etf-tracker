export interface EtfQuote {
  price: number;
  currency: string;
  ticker: string;
  exchange: string;
}

const PROXIES = [
  (url: string) => url,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

async function fetchJson(url: string): Promise<unknown> {
  let lastError: unknown = null;
  for (const wrap of PROXIES) {
    try {
      const res = await fetch(wrap(url));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Recherche impossible");
}

export function extractIsin(text: string): string | null {
  const m = text.match(/\b[A-Z]{2}[A-Z0-9]{9}[0-9]\b/);
  return m ? m[0] : null;
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
  price?: { raw?: number };
  regularMarketPrice?: { raw?: number };
  exchange?: string;
}

function tokenOverlap(entry: string, name: string | undefined): number {
  if (!name) return 0;
  const tokens = entry
    .toLowerCase()
    .split(/[^a-z0-9&]+/)
    .filter((t) => t.length >= 3);
  const lower = name.toLowerCase();
  return tokens.filter((t) => lower.includes(t)).length;
}

async function lookupByIsin(isin: string, entry: string): Promise<EtfQuote | null> {
  const url = `https://query1.finance.yahoo.com/v1/finance/lookup?query=${encodeURIComponent(isin)}&type=etf&count=10`;
  const json = (await fetchJson(url)) as { finance?: { result?: { documents?: LookupDoc[] }[] } };
  const doc = json.finance?.result?.[0]?.documents?.[0];
  if (!doc?.symbol) return null;
  if (tokenOverlap(entry, doc.shortName) < 2) return null;
  const raw = doc.regularMarketPrice?.raw ?? doc.price?.raw;
  if (typeof raw !== "number") return null;
  return { price: raw, currency: "EUR", ticker: doc.symbol, exchange: doc.exchange ?? "" };
}

interface YahooQuote {
  symbol?: string;
  quoteType?: string;
  shortname?: string;
}

async function searchQuotes(query: string): Promise<YahooQuote[]> {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0`;
  const json = (await fetchJson(url)) as { quotes?: YahooQuote[] };
  return json.quotes ?? [];
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
  return { price, currency, ticker: best.symbol!, exchange };
}

export async function fetchEtfPrice(entry: string): Promise<EtfQuote> {
  const isin = extractIsin(entry);
  if (isin) {
    const looked = await lookupByIsin(isin, entry);
    if (looked) return looked;
  }
  return priceByName(nameQuery(entry) || entry);
}
