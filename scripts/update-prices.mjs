import { readFileSync, writeFileSync } from "node:fs";

const HEADERS = { "User-Agent": "Mozilla/5.0" };

async function getJson(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function overlap(name, hint) {
  const tokens = hint
    .toLowerCase()
    .split(/[^a-z0-9&]+/)
    .filter((t) => t.length >= 3);
  const lower = (name ?? "").toLowerCase();
  return tokens.filter((t) => lower.includes(t)).length;
}

async function chartPrice(symbol) {
  const chart = await getJson(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=5d&interval=1d`
  );
  const meta = chart.chart?.result?.[0]?.meta;
  if (!meta || typeof meta.regularMarketPrice !== "number") throw new Error("cours introuvable");
  return meta.regularMarketPrice;
}

async function resolveIsin(isin, hint) {
  try {
    const search = await getJson(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${isin}&quotesCount=8&newsCount=0`
    );
    const quotes = search.quotes ?? [];
    const known = quotes.some((q) => (q.symbol ?? "").toUpperCase().startsWith(isin));
    const etf = quotes.find((q) => q.quoteType === "ETF" && q.symbol);
    if (known && etf) {
      return { ticker: etf.symbol, price: await chartPrice(etf.symbol) };
    }
    const best = quotes.find((q) => q.symbol && overlap(q.shortname, hint) >= 2);
    if (best) {
      return { ticker: best.symbol, price: await chartPrice(best.symbol) };
    }
  } catch {
    // fall through to lookup
  }
  const lookup = await getJson(
    `https://query1.finance.yahoo.com/v1/finance/lookup?query=${isin}&type=etf&count=10`
  );
  const doc = lookup.finance?.result?.[0]?.documents?.[0];
  if (doc?.symbol && overlap(doc.shortName, hint) >= 2) {
    let price;
    try {
      price = await chartPrice(doc.symbol);
    } catch {
      price = doc.regularMarketPrice?.raw ?? doc.price?.raw;
    }
    if (typeof price === "number") {
      return { ticker: doc.symbol, price };
    }
  }
  return null;
}

const entries = JSON.parse(readFileSync("public/etf-isins.json", "utf8"));
let prices = {};
try {
  prices = JSON.parse(readFileSync("public/prices.json", "utf8")).prices ?? {};
} catch {
  // first run
}
for (const { isin, nom, ticker } of entries) {
  let resolved = null;
  for (let attempt = 0; attempt < 2 && !resolved; attempt++) {
    try {
      if (ticker) {
        resolved = { ticker, price: await chartPrice(ticker) };
      } else {
        resolved = await resolveIsin(isin, nom);
      }
    } catch (e) {
      console.log(isin, `→ tentative ${attempt + 1} échouée:`, e.message);
    }
    if (!resolved && attempt === 0) await new Promise((r) => setTimeout(r, 2000));
  }
  if (resolved) {
    prices[isin] = Number(resolved.price.toFixed(2));
    console.log(isin, "→", resolved.ticker, prices[isin], `(${nom})`);
  } else {
    console.log(isin, "→ introuvable, ancien prix conservé:", prices[isin] ?? "aucun", `(${nom})`);
  }
  await new Promise((r) => setTimeout(r, 500));
}
writeFileSync(
  "public/prices.json",
  JSON.stringify({ updated: new Date().toISOString(), prices }, null, 2) + "\n"
);
console.log("public/prices.json écrit pour", Object.keys(prices).length, "ISIN(s)");
