import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardBody, CardHeader } from "../components/ui";
import { fmtEUR, fmtNum, fmtPct, monthLabel } from "../lib/format";
import { cumulativePnlTimeline, purchasePnl, shortEtfName, type PurchasePnl } from "../lib/calc";
import type { Provider } from "../types";

const LINE_COLORS = ["#818cf8", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#a855f7", "#eab308"];

export default function PnlSummary({
  purchases,
  providers,
}: {
  purchases: PurchasePnl[];
  providers: Provider[];
}) {
  const rows = purchases.map((p) => purchasePnl(p.purchase, providers));
  const chartData = cumulativePnlTimeline(purchases.map((p) => p.purchase), providers);
  const etfNames = [
    ...new Set(
      purchases
        .map((p) => p.purchase.provider)
        .filter((name) => chartData.some((row) => row[name] !== null))
    ),
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Plus-value par ETF"
          subtitle="Plus-value cumulée au prix du jour, mois par mois, une courbe par ETF."
        />
        <CardBody>
          {chartData.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun achat enregistré.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(m: string) => monthLabel(m)}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => `${v} €`} width={70} />
                  <Tooltip
                    formatter={(v) => (v === null || v === undefined || Number.isNaN(Number(v)) ? "—" : fmtEUR(Number(v)))}
                    labelFormatter={(m) => monthLabel(String(m))}
                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }}
                  />
                  <Legend formatter={(v: string) => shortEtfName(v)} />
                  <ReferenceLine y={0} stroke="#64748b" />
                  {etfNames.map((name, i) => (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      name={name}
                      stroke={LINE_COLORS[i % LINE_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
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
