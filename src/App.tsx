import { useRef, useState } from "react";
import KpiCards from "./components/KpiCards";
import PricesPanel from "./components/PricesPanel";
import PnlSummary from "./tabs/PnlSummary";
import ShouldHaveBought from "./tabs/ShouldHaveBought";
import BenchmarksTab from "./tabs/Benchmarks";
import BuyPriceTimeline from "./tabs/BuyPriceTimeline";
import PurchaseLog from "./tabs/PurchaseLog";
import { Button, Card, Input, Label } from "./components/ui";
import { backupFileName, currentMonth, uid, validateAppData } from "./lib/format";
import { loadInitial, useAutoSave } from "./lib/storage";
import { sampleData } from "./lib/sampleData";
import { purchasePnl } from "./lib/calc";
import type { AppData, Benchmark, Purchase, Provider } from "./types";

const TABS = [
  { id: "summary", label: "Résumé P&L" },
  { id: "should", label: "Et si j'avais acheté…" },
  { id: "benchmarks", label: "Benchmarks" },
  { id: "timeline", label: "Prix d'achat" },
  { id: "log", label: "Journal des achats" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function App() {
  const [data, setData] = useState<AppData>(() => loadInitial<AppData>(sampleData));
  useAutoSave(data);
  const [tab, setTab] = useState<TabId>("summary");
  const [importError, setImportError] = useState<string | null>(null);
  const [newProvider, setNewProvider] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const { purchases, providers, benchmarks } = data;

  const setPurchases = (fn: (prev: Purchase[]) => Purchase[]) =>
    setData((d) => ({ ...d, purchases: fn(d.purchases) }));
  const setProviders = (fn: (prev: Provider[]) => Provider[]) =>
    setData((d) => ({ ...d, providers: fn(d.providers) }));
  const setBenchmarks = (fn: (prev: Benchmark[]) => Benchmark[]) =>
    setData((d) => ({ ...d, benchmarks: fn(d.benchmarks) }));

  const pnls = purchases.map((p) => purchasePnl(p, providers));

  function addPurchase(p: Omit<Purchase, "id">) {
    setPurchases((prev) => [...prev, { ...p, id: uid() }]);
    setProviders((prev) =>
      prev.some((pr) => pr.name === p.provider)
        ? prev
        : [...prev, { name: p.provider, currentPrice: p.buyPrice }]
    );
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = backupFileName();
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const result = validateAppData(parsed);
        if (!result.ok) {
          setImportError(result.error);
          return;
        }
        setImportError(null);
        setData(result.data);
      } catch {
        setImportError("Fichier illisible : JSON invalide.");
      }
    };
    reader.onerror = () => setImportError("Impossible de lire le fichier.");
    reader.readAsText(file);
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">ETF Purchase Tracker</h1>
            <p className="text-sm text-slate-400">
              Suivi de vos achats mensuels d'ETF et comparaison aux benchmarks · sauvegarde automatique locale
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportData}>Exporter (JSON)</Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>Importer</Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm("Effacer toutes les données et restaurer les données d'exemple ?")) {
                  setData(sampleData);
                  setImportError(null);
                }
              }}
            >
              Réinitialiser l'exemple
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Supprimer TOUTES les données (achats, ETF, benchmarks) ? Cette action est irréversible.")) {
                  setData({ purchases: [], providers: [], benchmarks: [] });
                  setImportError(null);
                }
              }}
            >
              Tout supprimer
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importData(f);
                e.target.value = "";
              }}
            />
          </div>
        </header>

        {importError && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            Import : {importError}
          </div>
        )}

        <KpiCards pnls={pnls} />

        <PricesPanel
          providers={providers}
          onPriceChange={(name, price) =>
            setProviders((prev) => prev.map((p) => (p.name === name ? { ...p, currentPrice: price } : p)))
          }
        />

        <Card>
          <div className="flex flex-wrap items-end gap-3 border-b border-slate-700 p-4">
            <div className="flex flex-col gap-1">
              <Label>Nouvel ETF</Label>
              <Input
                value={newProvider}
                onChange={(e) => setNewProvider(e.target.value)}
                placeholder="ex. Amundi MSCI World (LU1781541179)"
                className="w-52"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const name = newProvider.trim();
                if (!name) return;
                setProviders((prev) =>
                  prev.some((p) => p.name === name) ? prev : [...prev, { name, currentPrice: 0 }]
                );
                setNewProvider("");
              }}
            >
              Ajouter l'ETF
            </Button>
          </div>
        </Card>

        <nav className="flex flex-wrap gap-1 rounded-xl border border-slate-700 bg-slate-800/60 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-700/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <main>
          {tab === "summary" && <PnlSummary purchases={pnls} providers={providers} />}
          {tab === "should" && (
            <ShouldHaveBought purchases={purchases} providers={providers} benchmarks={benchmarks} />
          )}
          {tab === "benchmarks" && (
            <BenchmarksTab
              benchmarks={benchmarks}
              onAdd={(name) =>
                setBenchmarks((prev) => [...prev, { id: uid(), name, currentPrice: 0, prices: {} }])
              }
              onDelete={(id) => setBenchmarks((prev) => prev.filter((b) => b.id !== id))}
              onSetCurrentPrice={(id, price) =>
                setBenchmarks((prev) => prev.map((b) => (b.id === id ? { ...b, currentPrice: price } : b)))
              }
              onLogPrice={(id, month, price) =>
                setBenchmarks((prev) =>
                  prev.map((b) => (b.id === id ? { ...b, prices: { ...b.prices, [month]: price } } : b))
                )
              }
            />
          )}
          {tab === "timeline" && <BuyPriceTimeline purchases={purchases} providers={providers} />}
          {tab === "log" && (
            <PurchaseLog
              purchases={purchases}
              providers={providers}
              onAdd={addPurchase}
              onDelete={(id) => setPurchases((prev) => prev.filter((p) => p.id !== id))}
            />
          )}
        </main>

        <footer className="pb-4 text-center text-xs text-slate-500">
          Données stockées localement dans votre navigateur (localStorage) · {currentMonth()}
        </footer>
      </div>
    </div>
  );
}
