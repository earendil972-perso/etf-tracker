import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardBody, CardHeader } from "../components/ui";
import { fmtEUR, fmtNum, fmtPct, monthLabel } from "../lib/format";
import { purchasePnl, type PurchasePnl } from "../lib/calc";
import type { Provider } from "../types";

export default function PnlSummary({
  purchases,
  providers,
}: {
  purchases: PurchasePnl[];
  providers: Provider[];
}) {
  const rows = purchases.map((p) => purchasePnl(p.purchase, providers));
  const chartData = rows.map((r) => ({
    name: `${r.purchase.provider} · ${monthLabel(r.purchase.date)}`,
    pnl: Number(r.pnl.toFixed(2)),
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Gain/perte par achat" subtitle="Prix du jour vs prix d'achat, par achat individuel." />
        <CardBody>
          {chartData.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun achat enregistré.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 40, left: 8 }}>
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => `${v} €`} width={60} />
                  <Tooltip
                    formatter={(v: number) => fmtEUR(v)}
                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }}
                  />
                  <ReferenceLine y={0} stroke="#64748b" />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {chartData.map((d, i) => (
                      <Cell key={i} fill={d.pnl >= 0 ? "#10b981" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Détail des plus/moins-values" />
        <CardBody className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-xs text-slate-400">
                <th className="py-2 pr-3">ETF</th>
                <th className="py-2 pr-3">Mois</th>
                <th className="py-2 pr-3 text-right">Qté</th>
                <th className="py-2 pr-3 text-right">Prix d'achat</th>
                <th className="py-2 pr-3 text-right">Prix du jour</th>
                <th className="py-2 pr-3 text-right">P&L (€)</th>
                <th className="py-2 text-right">P&L (%)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.purchase.id} className="border-b border-slate-800 last:border-0">
                  <td className="py-2 pr-3 font-medium text-slate-200">{r.purchase.provider}</td>
                  <td className="py-2 pr-3 text-slate-300">{monthLabel(r.purchase.date)}</td>
                  <td className="py-2 pr-3 text-right text-slate-300">{fmtNum(r.purchase.quantity, 4)}</td>
                  <td className="py-2 pr-3 text-right text-slate-300">{fmtEUR(r.purchase.buyPrice)}</td>
                  <td className="py-2 pr-3 text-right text-slate-300">{fmtEUR(r.currentPrice)}</td>
                  <td className={`py-2 pr-3 text-right font-medium ${r.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {fmtEUR(r.pnl)}
                  </td>
                  <td className={`py-2 text-right font-medium ${r.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {fmtPct(r.pnlPct)}
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
