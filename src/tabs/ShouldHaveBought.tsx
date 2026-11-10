import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Card, CardBody, CardHeader } from "../components/ui";
import { fmtEUR, monthLabel } from "../lib/format";
import { shouldHaveBoughtRows } from "../lib/calc";
import type { Benchmark, Purchase, Provider } from "../types";

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
  const chartData = rows.map((r) => ({
    month: monthLabel(r.month),
    réel: Number(r.actualGain.toFixed(2)),
    "meilleure alternative": r.bestGain !== null ? Number(r.bestGain.toFixed(2)) : 0,
  }));
  const totalMissed = rows.reduce((s, r) => s + Math.max(0, r.missedGain ?? 0), 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Et si j'avais acheté un benchmark ?"
          subtitle="Pour chaque mois : votre P&L réel vs le meilleur benchmark achetable avec le même montant."
        />
        <CardBody>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm text-slate-300">Gain manqué total :</span>
            <Badge tone={totalMissed > 0 ? "red" : "green"}>{fmtEUR(totalMissed)}</Badge>
          </div>
          {chartData.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun achat enregistré.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => `${v} €`} width={60} />
                  <Tooltip
                    formatter={(v: number) => fmtEUR(v)}
                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ color: "#94a3b8" }} />
                  <Bar dataKey="réel" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="meilleure alternative" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Gain manqué par mois" />
        <CardBody className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-xs text-slate-400">
                <th className="py-2 pr-3">Mois</th>
                <th className="py-2 pr-3 text-right">Somme investie</th>
                <th className="py-2 pr-3 text-right">P&L réel</th>
                <th className="py-2 pr-3">Meilleure alternative</th>
                <th className="py-2 pr-3 text-right">P&L alternative</th>
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
                  <td className="py-2 pr-3 text-slate-300">{r.bestName ?? "—"}</td>
                  <td className="py-2 pr-3 text-right text-slate-300">
                    {r.bestGain !== null ? fmtEUR(r.bestGain) : "—"}
                  </td>
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
