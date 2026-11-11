import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Input, Label, MonthInput, Select } from "../components/ui";
import { fmtEUR, fmtNum, monthLabel, uid } from "../lib/format";
import type { Purchase, Provider } from "../types";

type EditState = { id: string; provider: string; date: string; quantity: string; buyPrice: string };

export default function PurchaseLog({
  purchases,
  providers,
  onAdd,
  onUpdate,
  onDelete,
}: {
  purchases: Purchase[];
  providers: Provider[];
  onAdd: (p: Omit<Purchase, "id">) => void;
  onUpdate: (p: Purchase) => void;
  onDelete: (id: string) => void;
}) {
  const [provider, setProvider] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 7));
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  function startEdit(p: Purchase) {
    setEditing({ id: p.id, provider: p.provider, date: p.date, quantity: String(p.quantity), buyPrice: String(p.buyPrice) });
    setEditError(null);
  }

  function saveEdit() {
    if (!editing) return;
    const qty = Number(editing.quantity);
    const price = Number(editing.buyPrice);
    if (!/^\d{4}-\d{2}$/.test(editing.date)) {
      setEditError("Mois invalide.");
      return;
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      setEditError("Quantité invalide (doit être > 0).");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setEditError("Prix d'achat invalide (doit être > 0).");
      return;
    }
    onUpdate({ id: editing.id, provider: editing.provider, date: editing.date, quantity: qty, buyPrice: price });
    setEditing(null);
    setEditError(null);
  }

  function add() {
    const qty = Number(quantity);
    const price = Number(buyPrice);
    const prov = provider || providers[0]?.name;
    if (!prov) {
      setError("Ajoutez d'abord un ETF (via un premier achat ou le champ « Nouvel ETF »).");
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
        <CardHeader title="Ajouter un achat" subtitle="Enregistrer un achat mensuel d'ETF." />
        <CardBody>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <Label>ETF</Label>
              <Select value={provider} onChange={(e) => setProvider(e.target.value)}>
                {providers.map((p) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Mois</Label>
              <MonthInput value={date} onChange={setDate} />
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
                <th className="py-2 pr-3">ETF</th>
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
                .map((p) =>
                  editing?.id === p.id ? (
                    <tr key={p.id} className="border-b border-slate-800 last:border-0 bg-slate-800/40">
                      <td className="py-2 pr-3">
                        <Select
                          value={editing.provider}
                          onChange={(e) => setEditing({ ...editing, provider: e.target.value })}
                          className="w-44 text-xs"
                        >
                          {providers.map((pr) => (
                            <option key={pr.name} value={pr.name}>{pr.name}</option>
                          ))}
                        </Select>
                      </td>
                      <td className="py-2 pr-3">
                        <MonthInput
                          value={editing.date}
                          onChange={(v) => setEditing({ ...editing, date: v })}
                          className="text-xs"
                        />
                      </td>
                      <td className="py-2 pr-3 text-right">
                        <Input
                          type="number"
                          step="any"
                          min="0"
                          value={editing.quantity}
                          onChange={(e) => setEditing({ ...editing, quantity: e.target.value })}
                          className="w-24 text-right text-xs"
                        />
                      </td>
                      <td className="py-2 pr-3 text-right">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editing.buyPrice}
                          onChange={(e) => setEditing({ ...editing, buyPrice: e.target.value })}
                          className="w-28 text-right text-xs"
                        />
                      </td>
                      <td className="py-2 pr-3 text-right text-slate-400">—</td>
                      <td className="py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button onClick={saveEdit} className="px-2 py-1 text-xs">Enregistrer</Button>
                          <Button variant="ghost" onClick={() => setEditing(null)} className="px-2 py-1 text-xs">
                            Annuler
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={p.id} className="border-b border-slate-800 last:border-0">
                      <td className="py-2 pr-3 font-medium text-slate-200">{p.provider}</td>
                      <td className="py-2 pr-3 text-slate-300">{monthLabel(p.date)}</td>
                      <td className="py-2 pr-3 text-right text-slate-300">{fmtNum(p.quantity, 4)}</td>
                      <td className="py-2 pr-3 text-right text-slate-300">{fmtEUR(p.buyPrice)}</td>
                      <td className="py-2 pr-3 text-right text-slate-300">{fmtEUR(p.quantity * p.buyPrice)}</td>
                      <td className="py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" onClick={() => startEdit(p)} className="px-2 py-1 text-xs">
                            Modifier
                          </Button>
                          <Button variant="destructive" onClick={() => onDelete(p.id)} className="px-2 py-1 text-xs">
                            Supprimer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
          {editError && <p className="mt-2 text-sm text-red-400">{editError}</p>}
          {purchases.length === 0 && (
            <p className="mt-2 text-sm text-slate-400">Aucun achat enregistré.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
