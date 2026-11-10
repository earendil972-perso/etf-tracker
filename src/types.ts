export interface Purchase {
  id: string;
  provider: string;
  date: string; // YYYY-MM
  quantity: number;
  buyPrice: number;
}

export interface Provider {
  name: string;
  currentPrice: number;
}

export interface Benchmark {
  id: string;
  name: string;
  currentPrice: number;
  prices: Record<string, number>; // "YYYY-MM" -> price
}

export interface AppData {
  purchases: Purchase[];
  providers: Provider[];
  benchmarks: Benchmark[];
  lastPriceUpdate?: string;
}
