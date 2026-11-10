# ETF Purchase Tracker

Application React monopage (SPA) pour suivre vos achats mensuels d'ETF auprès de plusieurs fournisseurs (courtiers), comparer vos performances à des ETF de référence (benchmarks), et visualiser vos plus/moins-values.

## Fonctionnalités

- **Cartes KPI** : total investi, valeur actuelle, P&L (€ et %) en vert/rouge.
- **Prix du jour** : prix actuel modifiable par fournisseur, recalcul instantané des P&L.
- **Onglet Résumé P&L** : graphique en barres gain/perte par achat (Recharts) + tableau détaillé.
- **Onglet « Et si j'avais acheté… »** : votre P&L réel vs le meilleur benchmark achetable avec le même montant, gain manqué par mois et badge de gain manqué total.
- **Onglet Benchmarks** : ajout/suppression d'ETF (nom/ISIN), prix du jour, saisie des prix mensuels, historique en mini-graphique.
- **Onglet Prix d'achat** : évolution du prix unitaire d'achat par mois, une ligne par fournisseur.
- **Onglet Journal des achats** : formulaire d'ajout et tableau avec suppression.
- **Persistance** : localStorage (sauvegarde automatique), export JSON daté, import JSON avec validation.
- **Données d'exemple** préchargées (supprimables via « Réinitialiser l'exemple » ou en important un fichier vide de vos données).

## Installation

```bash
cd etf-tracker
npm install
```

## Lancement en local

```bash
npm run dev
```

Ouvrez http://localhost:5173

## Build de production

```bash
npm run build
npm run preview
```

## Stack

React 18 + TypeScript, Vite, Recharts, Tailwind CSS v4, composants de style shadcn/ui, thème sombre « slate » avec accents indigo, montants en €.
