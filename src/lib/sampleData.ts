import type { AppData } from "../types";

export const sampleData: AppData = {
  providers: [
    { name: "BNP Paribas Easy", currentPrice: 42.8 },
    { name: "Fortuneo", currentPrice: 118.5 },
    { name: "Trade Republic", currentPrice: 76.2 },
  ],
  purchases: [
    { id: "s1", provider: "BNP Paribas Easy", date: "2025-01", quantity: 10, buyPrice: 38.4 },
    { id: "s2", provider: "Fortuneo", date: "2025-01", quantity: 4, buyPrice: 109.2 },
    { id: "s3", provider: "Trade Republic", date: "2025-02", quantity: 6, buyPrice: 71.0 },
    { id: "s4", provider: "BNP Paribas Easy", date: "2025-03", quantity: 8, buyPrice: 40.1 },
    { id: "s5", provider: "Fortuneo", date: "2025-04", quantity: 3, buyPrice: 115.0 },
    { id: "s6", provider: "Trade Republic", date: "2025-05", quantity: 5, buyPrice: 73.4 },
    { id: "s7", provider: "BNP Paribas Easy", date: "2025-06", quantity: 7, buyPrice: 41.6 },
  ],
  benchmarks: [
    {
      id: "b1",
      name: "Amundi MSCI World (LU1781541179)",
      currentPrice: 98.6,
      prices: {
        "2025-01": 91.2,
        "2025-02": 92.8,
        "2025-03": 94.1,
        "2025-04": 93.5,
        "2025-05": 96.0,
        "2025-06": 97.4,
      },
    },
    {
      id: "b2",
      name: "Amundi PEA S&P 500 (FR0010315770)",
      currentPrice: 112.3,
      prices: {
        "2025-01": 104.5,
        "2025-02": 106.2,
        "2025-03": 108.9,
        "2025-04": 107.1,
        "2025-05": 110.4,
        "2025-06": 111.8,
      },
    },
    {
      id: "b3",
      name: "Amundi Stoxx Europe 600 (LU0908500753)",
      currentPrice: 74.9,
      prices: {
        "2025-01": 70.3,
        "2025-02": 71.1,
        "2025-03": 72.6,
        "2025-04": 71.8,
        "2025-05": 73.9,
        "2025-06": 74.5,
      },
    },
  ],
};
