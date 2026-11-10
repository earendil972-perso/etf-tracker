import { Card, CardBody } from "./ui";
import { fmtEUR, fmtPct } from "../lib/format";
import type { PurchasePnl } from "../lib/calc";
import { totals } from "../lib/calc";

export default function KpiCards({ pnls }: { pnls: PurchasePnl[] }) {
  const t = totals(pnls);
  const pos = t.pnl >= 0;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardBody>
          <p className="text-xs font-medium text-slate-400">Total investi</p>
          <p className="mt-1 text-2xl font-bold text-slate-100">{fmtEUR(t.invested)}</p>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <p className="text-xs font-medium text-slate-400">Valeur actuelle</p>
          <p className="mt-1 text-2xl font-bold text-slate-100">{fmtEUR(t.currentValue)}</p>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <p className="text-xs font-medium text-slate-400">Plus/moins-value (€)</p>
          <p className={`mt-1 text-2xl font-bold ${pos ? "text-emerald-400" : "text-red-400"}`}>
            {fmtEUR(t.pnl)}
          </p>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <p className="text-xs font-medium text-slate-400">Plus/moins-value (%)</p>
          <p className={`mt-1 text-2xl font-bold ${pos ? "text-emerald-400" : "text-red-400"}`}>
            {fmtPct(t.pnlPct)}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
