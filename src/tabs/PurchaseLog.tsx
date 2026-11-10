import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Input, Label, Select } from "../components/ui";
import { fmtEUR, fmtNum, monthLabel, uid } from "../lib/format";
import type { Purchase, Provider } from "../types";

export default function PurchaseLog({
  purchases,
  providers,
  onAdd,
  onDelete,
}: {
  purchases: Purchase[];
  providers: Provider[];
  onAdd: (p: Omit<Purchase, "id">) => void;
  onDelete: (id: string) => void;
}) {
  const [provider, setProvider] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 7));
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  function add() {
    const qty = Number(quantity);
    const price = Number(buyPrice);
    const prov = provider || providers[0]?.name;
    if (!prov) {
      setError("Ajoutez d'abord un fournisseur (via un premier achat ou le panneau des prix).");
      return;
    }
    if (!/^\d{4}-\d{2}$/.test(date)) {
      setError("Mois invalide.");
      return;
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Quantité invalide (doit être > 0).");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Prix d'achat invalide (doit être > 0).");
      return;
    }
    setError(null);
    onAdd({ provider: prov, date, quantity: qty, buyPrice: price });
    setQuantity("");
    setBuyPrice("");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Ajouter un achat" />
        <CardBody>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <Label>Fournisseur</Label>
              <Select value={provider} onChange={(e) => setProvider(e.target.value)}>
                {providers.map((p) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Mois</Label>
              <Input type="month" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Quantité</Label>
              <Input
                type="number"
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="ex. 5"
                className="w-28"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Prix d'achat (€)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="ex. 42,10"
                className="w-32"
              />
            </div>
            <Button onClick={add}>Ajouter l'achat</Button>
          </div>
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Historique des achats" subtitle={`${purchases.length} achat(s) enregistré(s).`} />
        <CardBody className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-xs text-slate-400">
                <th className="py-2 pr-3">Fournisseur</th>
                <th className="py-2 pr-3">Mois</th>
                <th className="py-2 pr-3 text-right">Quantité</th>
                <th className="py-2 pr-3 text-right">Prix d'achat</th>
                <th className="py-2 pr-3 text-right">Total</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...purchases]
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((p) => (
                  <tr key={p.id} className="border-b border-slate-800 last:border-0">
                    <td className="py-2 pr-3 font-medium text-slate-200">{p.provider}</td>
                    <td className="py-2 pr-3 text-slate-300">{monthLabel(p.date)}</td>
                    <td className="py-2 pr-3 text-right text-slate-300">{fmtNum(p.quantity, 4)}</td>
                    <td className="py-2 pr-3 text-right text-slate-300">{fmtEUR(p.buyPrice)}</td>
                    <td className="py-2 pr-3 text-right text-slate-300">{fmtEUR(p.quantity * p.buyPrice)}</td>
                    <td className="py-2 text-right">
                      <Button variant="destructive" onClick={() => onDelete(p.id)} className="px-2 py-1 text-xs">
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {purchases.length === 0 && (
            <p className="mt-2 text-sm text-slate-400">Aucun achat enregistré.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
