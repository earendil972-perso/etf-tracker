import { Card, CardBody, CardHeader, Input } from "./ui";
import type { Provider } from "../types";

export default function PricesPanel({
  providers,
  onPriceChange,
}: {
  providers: Provider[];
  onPriceChange: (name: string, price: number) => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Prix du jour"
        subtitle="Mettez à jour le prix actuel de chaque fournisseur — les P&L se recalculent instantanément."
      />
      <CardBody>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {providers.map((p) => (
            <div key={p.name} className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-200">{p.name}</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={p.currentPrice}
                  onChange={(e) => onPriceChange(p.name, Number(e.target.value))}
                  className="w-full"
                  aria-label={`Prix actuel ${p.name}`}
                />
                <span className="text-sm text-slate-400">€</span>
              </div>
            </div>
          ))}
          {providers.length === 0 && (
            <p className="text-sm text-slate-400">Aucun fournisseur. Ajoutez un achat pour créer un fournisseur.</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
