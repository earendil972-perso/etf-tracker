import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Button, Card, CardBody, CardHeader, Select } from "../components/ui";
import { fmtEUR, fmtPct, monthLabel } from "../lib/format";
import { shouldHaveBoughtRows, shortEtfName, type ShouldRow } from "../lib/calc";
import { extractIsin, fetchRepoPrices, tokenOverlap, type CatalogEntryData, type RepoPrices } from "../lib/prices";
import type { Benchmark, Purchase, Provider } from "../types";

const BAR_COLORS = ["#f59e0b", "#10b981", "#ec4899", "#06b6d4", "#a855f7", "#eab308"];

const WINDOWS = [
  { id: "m1", label: "1 mois" },
  { id: "m3", label: "3 mois" },
  { id: "m6", label: "6 mois" },
  { id: "y1", label: "1 an" },
] as const;

type WindowId = (typeof WINDOWS)[number]["id"];

function MarketSuggestions({ providers }: { providers: Provider[] }) {
  const [repo, setRepo] = useState<RepoPrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [window, setWindow] = useState<WindowId>("m6");

  async function load() {
    setLoading(true);
    setRepo(await fetchRepoPrices());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const entries = Object.entries(repo?.catalog ?? {}).map(([ticker, d]: [string, CatalogEntryData]) => ({
    ticker,
    ...d,
  }));
  const isHeld = (e: { nom: string }) =>
    providers.some(
      (p) =>
        (extractIsin(p.name) !== null && extractIsin(p.name) === extractIsin(e.nom)) ||
        tokenOverlap(e.nom, p.name) >= 2
    );
  const ranked = entries
    .filter((e) => e.perf[window] !== null)
    .sort((a, b) => (b.perf[window] ?? 0) - (a.perf[window] ?? 0));
  const suggestion = ranked.find((e) => !isHeld(e));
  const updated = repo?.updated ? new Date(repo.updated).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : null;

  return (
    <Card>
      <CardHeader
        title="Suggestions du marché"
        subtitle="Classement automatique des ETF disponibles chez SG, d'après leur performance passée."
      />
      <CardBody>
        {loading ? (
          <p className="text-sm text-slate-400">Chargement des performances…</p>
        ) : ranked.length === 0 ? (
          <p className="text-sm text-slate-400">
            Aucune donnée de marché disponible. Lancez l'action GitHub « Update ETF prices » ou attendez la mise à
            jour quotidienne (17h35 UTC), puis rechargez la page.
          </p>
        ) : (
          <>
            {suggestion && (
              <div className="mb-4 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-4 py-3">
                <p className="text-xs font-medium text-indigo-300">Prochaine suggestion (hors de vos ETF actuels)</p>
                <p className="mt-1 text-lg font-bold text-slate-100">
                  {suggestion.nom} <span className="text-sm font-normal text-slate-400">· {suggestion.categorie}</span>
                </p>
                <p className="text-sm text-emerald-400">
                  {fmtPct(suggestion.perf[window] ?? 0)} sur {WINDOWS.find((w) => w.id === window)?.label} · {fmtEUR(suggestion.prix)}
                </p>
              </div>
            )}
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs text-slate-400">Fenêtre :</span>
              <Select value={window} onChange={(e) => setWindow(e.target.value as WindowId)} className="w-28">
                {WINDOWS.map((w) => (
                  <option key={w.id} value={w.id}>{w.label}</option>
                ))}
              </Select>
              <Button variant="ghost" onClick={load} className="px-2 py-1 text-xs">Rafraîchir</Button>
              {updated && <span className="text-xs text-slate-500">données du {updated}</span>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-left text-xs text-slate-400">
                    <th className="py-2 pr-3">ETF</th>
                    <th className="py-2 pr-3">Catégorie</th>
                    <th className="py-2 pr-3 text-right">Prix</th>
                    <th className="py-2 pr-3 text-right">1 mois</th>
                    <th className="py-2 pr-3 text-right">3 mois</th>
                    <th className="py-2 pr-3 text-right">6 mois</th>
                    <th className="py-2 text-right">1 an</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((e) => {
                    const held = isHeld(e);
                    return (
                      <tr
                        key={e.ticker}
                        className={`border-b border-slate-800 last:border-0 ${held ? "opacity-50" : ""}`}
                      >
                        <td className="py-2 pr-3 font-medium text-slate-200">
                          {e.nom}
                          {held && <span className="ml-2 text-xs text-slate-400">(détenu)</span>}
                        </td>
                        <td className="py-2 pr-3 text-slate-300">{e.categorie}</td>
                        <td className="py-2 pr-3 text-right text-slate-300">{fmtEUR(e.prix)}</td>
                        {(["m1", "m3", "m6", "y1"] as const).map((k) => {
                          const v = e.perf[k];
                          return (
                            <td
                              key={k}
                              className={`py-2 pr-3 text-right ${
                                k === window ? "font-semibold" : ""
                              } ${v === null ? "text-slate-500" : v >= 0 ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {v === null ? "—" : fmtPct(v)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Performances passées, données Yahoo Finance via la mise à jour quotidienne — ne constitue pas un conseil
              d'investissement.
            </p>
          </>
        )}
      </CardBody>
    </Card>
  );
}

export default function ShouldHaveBought({
  purchases,
  providers,
  benchmarks,
}: {
  purchases: Purchase[];
  providers: Provider[];
  benchmarks: Benchmark[];
}) {
  const rows = shouldHaveBoughtRows(purchases, providers, benchmarks);
  const chartData = rows.map((r) => {
    const row: Record<string, string | number> = {
      month: monthLabel(r.month),
      réel: Number(r.actualGain.toFixed(2)),
    };
    for (const g of r.etfGains) {
      row[g.shortName] = g.gain !== null ? Number(g.gain.toFixed(2)) : 0;
    }
    return row;
  });
  const etfKeys = benchmarks.map((b) => shortEtfName(b.name));
  const totalMissed = rows.reduce((s, r) => s + Math.max(0, r.missedGain ?? 0), 0);

  function bestCell(r: ShouldRow, id: string): boolean {
    return r.bestId === id;
  }

  return (
    <div className="space-y-4">
      <MarketSuggestions providers={providers} />
      <Card>
        <CardHeader
          title="Et si j'avais acheté un autre ETF ?"
          subtitle="Pour chaque mois : votre P&L réel vs chaque ETF disponible chez SG, acheté avec le même montant."
        />
        <CardBody>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm text-slate-300">Gain manqué total (vs meilleur ETF) :</span>
            <Badge tone={totalMissed > 0 ? "red" : "green"}>{fmtEUR(totalMissed)}</Badge>
          </div>
          {chartData.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun achat enregistré.</p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => `${v} €`} width={60} />
                  <Tooltip
                    formatter={(v: number) => fmtEUR(v)}
                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
                  <ReferenceLine y={0} stroke="#64748b" />
                  <Bar dataKey="réel" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  {etfKeys.map((k, i) => (
                    <Bar key={k} dataKey={k} fill={BAR_COLORS[i % BAR_COLORS.length]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Gain manqué par mois" subtitle="Le meilleur ETF du mois est mis en évidence." />
        <CardBody className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-xs text-slate-400">
                <th className="py-2 pr-3">Mois</th>
                <th className="py-2 pr-3 text-right">Somme investie</th>
                <th className="py-2 pr-3 text-right">P&L réel</th>
                {benchmarks.map((b) => (
                  <th key={b.id} className="py-2 pr-3 text-right">{shortEtfName(b.name)}</th>
                ))}
                <th className="py-2 text-right">Gain manqué</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.month} className="border-b border-slate-800 last:border-0">
                  <td className="py-2 pr-3 font-medium text-slate-200">{monthLabel(r.month)}</td>
                  <td className="py-2 pr-3 text-right text-slate-300">{fmtEUR(r.amount)}</td>
                  <td className={`py-2 pr-3 text-right ${r.actualGain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {fmtEUR(r.actualGain)}
                  </td>
                  {r.etfGains.map((g) => (
                    <td
                      key={g.id}
                      className={`py-2 pr-3 text-right ${
                        bestCell(r, g.id) ? "font-semibold text-amber-300" : "text-slate-300"
                      }`}
                    >
                      {g.gain !== null ? fmtEUR(g.gain) : "—"}
                    </td>
                  ))}
                  <td className={`py-2 text-right font-medium ${r.missedGain !== null && r.missedGain > 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {r.missedGain !== null ? fmtEUR(r.missedGain) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="mt-2 text-sm text-slate-400">Aucun achat enregistré.</p>}
        </CardBody>
      </Card>
    </div>
  );
}
