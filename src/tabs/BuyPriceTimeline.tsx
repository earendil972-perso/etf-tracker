import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardBody, CardHeader } from "../components/ui";
import { fmtEUR, monthLabel } from "../lib/format";
import { buyPriceTimeline } from "../lib/calc";
import type { Purchase, Provider } from "../types";

const LINE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#06b6d4", "#a855f7"];

export default function BuyPriceTimeline({
  purchases,
  providers,
}: {
  purchases: Purchase[];
  providers: Provider[];
}) {
  const data = buyPriceTimeline(purchases, providers);

  return (
    <Card>
      <CardHeader
        title="Évolution du prix d'achat"
        subtitle="Prix unitaire d'achat par mois, une ligne par ETF (les mois sans achat sont reliés)."
      />
      <CardBody>
        {data.length === 0 ? (
          <p className="text-sm text-slate-400">Aucun achat enregistré.</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={(v) => `${v} €`}
                  width={60}
                />
                <Tooltip
                  formatter={(v: number) => fmtEUR(v)}
                  labelFormatter={(l) => `Mois : ${l}`}
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }}
                />
                <Legend wrapperStyle={{ color: "#94a3b8" }} />
                {providers.map((p, i) => (
                  <Line
                    key={p.name}
                    type="monotone"
                    dataKey={p.name}
                    connectNulls
                    stroke={LINE_COLORS[i % LINE_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
