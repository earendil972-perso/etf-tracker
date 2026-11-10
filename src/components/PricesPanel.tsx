import { Button, Card, CardBody, CardHeader, Input } from "./ui";
import type { Provider } from "../types";

export interface PriceStatus {
  updated: string;
  ok: { name: string; price: number; ticker: string; exchange: string }[];
  failed: { name: string; error: string }[];
}

export default function PricesPanel({
  providers,
  onPriceChange,
  onDelete,
  onRefresh,
  refreshing,
  status,
}: {
  providers: Provider[];
  onPriceChange: (name: string, price: number) => void;
  onDelete: (name: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  status: PriceStatus | null;
}) {
  return (
    <Card>
      <CardHeader
        title="Prix du jour"
        subtitle="Mettez à jour le prix actuel de chaque ETF — les P&L se recalculent instantanément."
      />
      <CardBody>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Button onClick={onRefresh} disabled={refreshing || providers.length === 0}>
            {refreshing ? "Recherche des cours…" : "Actualiser les prix (marché)"}
          </Button>
          {status && (
            <span className="text-xs text-slate-400">
              {status.updated} — {status.ok.length} OK
              {status.failed.length > 0 ? `, ${status.failed.length} en échec` : ""}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {providers.map((p) => {
            const fail = status?.failed.find((f) => f.name === p.name);
            const ok = status?.ok.find((o) => o.name === p.name);
            return (
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
                {ok && (
                  <span className="text-xs text-emerald-400" title={`${ok.ticker} · ${ok.exchange}`}>
                    {ok.ticker} · {ok.exchange}
                  </span>
                )}
                {fail && <span className="text-xs text-red-400">{fail.error}</span>}
              </div>
            );
          })}
          {providers.length === 0 && (
            <p className="text-sm text-slate-400">Aucun ETF. Ajoutez un achat ou un nouvel ETF ci-dessous.</p>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Reconnaissance par ISIN ou nom via Yahoo Finance (bourses européennes, priorité Euronext Paris). La mise à
          jour automatique peut échouer : la saisie manuelle reste possible.
        </p>
      </CardBody>
    </Card>
  );
}
