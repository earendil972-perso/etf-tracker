import { Button, Card, CardBody, CardHeader, Input } from "./ui";
import type { Provider } from "../types";

export default function PricesPanel({
  providers,
  onPriceChange,
  onDelete,
}: {
  providers: Provider[];
  onPriceChange: (name: string, price: number) => void;
  onDelete: (name: string) => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Prix du jour"
        subtitle="Mettez à jour le prix actuel de chaque ETF — les P&L se recalculent instantanément."
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
                <Button
                  variant="ghost"
                  onClick={() => onDelete(p.name)}
                  className="px-2 py-1 text-slate-400 hover:text-red-300"
                  aria-label={`Supprimer ${p.name}`}
                  title="Supprimer cet ETF"
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}
          {providers.length === 0 && (
            <p className="text-sm text-slate-400">Aucun ETF. Ajoutez un achat ou un nouvel ETF ci-dessous.</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
