import { useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button, Card, CardBody, CardHeader, Input, Label, Select } from "../components/ui";
import { fmtEUR, fmtNum, monthLabel, uid } from "../lib/format";
import type { Benchmark } from "../types";

const LINE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#06b6d4", "#a855f7"];

export default function Benchmarks({
  benchmarks,
  onAdd,
  onDelete,
  onSetCurrentPrice,
  onLogPrice,
}: {
  benchmarks: Benchmark[];
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
  onSetCurrentPrice: (id: string, price: number) => void;
  onLogPrice: (id: string, month: string, price: number) => void;
}) {
  const [newName, setNewName] = useState("");
  const [logBenchmark, setLogBenchmark] = useState("");
  const [logMonth, setLogMonth] = useState(new Date().toISOString().slice(0, 7));
  const [logPrice, setLogPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  function add() {
    const name = newName.trim();
    if (!name) {
      setError("Le nom (ou ISIN) est requis.");
      return;
    }
    setError(null);
    onAdd(name);
    setNewName("");
  }

  function submitLogPrice() {
    const id = logBenchmark || benchmarks[0]?.id;
    const price = Number(logPrice);
    if (!id) {
      setError("Ajoutez d'abord un benchmark.");
      return;
    }
    if (!/^\d{4}-\d{2}$/.test(logMonth)) {
      setError("Mois invalide.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Prix invalide.");
      return;
    }
    setError(null);
    onLogPrice(id, logMonth, price);
    setLogPrice("");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Ajouter un benchmark" subtitle="Nom et/ou ISIN d'un ETF disponible chez votre banque (ex. catalogue SG)." />
        <CardBody>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <Label>Nom / ISIN</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="ex. iShares Core MSCI World (IE00B4L5Y983)"
                className="w-80"
              />
            </div>
            <Button onClick={add}>Ajouter</Button>
          </div>
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Saisir un prix mensuel" subtitle="Historique des prix saisi manuellement, mois par mois." />
        <CardBody>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <Label>ETF</Label>
              <Select value={logBenchmark} onChange={(e) => setLogBenchmark(e.target.value)}>
                {benchmarks.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Mois</Label>
              <Input type="month" value={logMonth} onChange={(e) => setLogMonth(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Prix (€)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={logPrice}
                onChange={(e) => setLogPrice(e.target.value)}
                placeholder="ex. 95,40"
                className="w-32"
              />
            </div>
            <Button onClick={submitLogPrice}>Enregistrer</Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {benchmarks.map((b, idx) => {
          const months = Object.keys(b.prices).sort();
          const data = months.map((m) => ({ month: monthLabel(m), prix: b.prices[m] }));
          return (
            <Card key={b.id}>
              <CardHeader title={b.name} />
              <CardBody className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label>Prix du jour</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={b.currentPrice}
                    onChange={(e) => onSetCurrentPrice(b.id, Number(e.target.value))}
                    className="w-28"
                    aria-label={`Prix du jour ${b.name}`}
                  />
                  <span className="text-sm text-slate-400">€</span>
                </div>
                {data.length > 0 ? (
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                        <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                        <YAxis
                          domain={["auto", "auto"]}
                          tick={{ fill: "#94a3b8", fontSize: 10 }}
                          tickFormatter={(v: number) => fmtNum(v, 0)}
                          width={40}
                        />
                        <Tooltip
                          formatter={(v: number) => fmtEUR(v)}
                          contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }}
                        />
                        <Line type="monotone" dataKey="prix" stroke={LINE_COLORS[idx % LINE_COLORS.length]} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Aucun prix mensuel saisi.</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {months.map((m) => (
                    <span key={m} className="rounded-md bg-slate-700/60 px-2 py-0.5 text-xs text-slate-300">
                      {monthLabel(m)} : {fmtEUR(b.prices[m])}
                    </span>
                  ))}
                </div>
                <Button variant="destructive" onClick={() => onDelete(b.id)} className="w-full">
                  Supprimer ce benchmark
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </div>
      {benchmarks.length === 0 && (
        <Card>
          <CardBody>
            <p className="text-sm text-slate-400">Aucun benchmark. Ajoutez un ETF ci-dessus pour comparer vos performances.</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
