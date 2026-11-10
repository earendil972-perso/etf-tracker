import { useState } from "react";
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
  onRename,
  onRefresh,
  refreshing,
  status,
}: {
  providers: Provider[];
  onPriceChange: (name: string, price: number) => void;
  onDelete: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  status: PriceStatus | null;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function startEdit(name: string) {
    setEditing(name);
    setDraft(name);
  }

  function saveEdit() {
    if (editing) onRename(editing, draft);
    setEditing(null);
  }

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
                {editing === p.name ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") setEditing(null);
                      }}
                      className="w-full"
                      autoFocus
                      aria-label={`Renommer ${p.name}`}
                      placeholder="Nom de l'ETF (ISIN recommandé)"
                    />
                    <Button variant="ghost" onClick={saveEdit} className="px-2 py-1 text-emerald-400" aria-label="Enregistrer le nom">
                      ✓
                    </Button>
                    <Button variant="ghost" onClick={() => setEditing(null)} className="px-2 py-1 text-slate-400" aria-label="Annuler">
                      ✕
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-slate-200">{p.name}</span>
                )}
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
                    onClick={() => startEdit(p.name)}
                    className="px-2 py-1 text-slate-400 hover:text-indigo-300"
                    aria-label={`Renommer ${p.name}`}
                    title="Renommer cet ETF (pour la recherche automatique)"
                  >
                    ✎
                  </Button>
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
          Renommez un ETF (✎) au format « Nom (ISIN) » pour fiabiliser la reconnaissance automatique. La mise à jour
          automatique peut échouer : la saisie manuelle reste possible.
        </p>
      </CardBody>
    </Card>
  );
}
