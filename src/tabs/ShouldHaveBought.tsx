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
import { Badge, Card, CardBody, CardHeader } from "../components/ui";
import { fmtEUR, monthLabel } from "../lib/format";
import { shouldHaveBoughtRows, shortEtfName, type ShouldRow } from "../lib/calc";
import type { Benchmark, Purchase, Provider } from "../types";

const BAR_COLORS = ["#f59e0b", "#10b981", "#ec4899", "#06b6d4", "#a855f7", "#eab308"];

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
