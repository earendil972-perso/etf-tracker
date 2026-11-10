import type { AppData } from "../types";

export const sampleData: AppData = {
  providers: [
    { name: "Amundi MSCI World (LU1781541179)", currentPrice: 112.4 },
    { name: "Amundi PEA S&P 500 (FR0010315770)", currentPrice: 96.8 },
    { name: "Amundi Stoxx Europe 600 (LU0908500753)", currentPrice: 252.1 },
  ],
  purchases: [
    { id: "s1", provider: "Amundi MSCI World (LU1781541179)", date: "2025-01", quantity: 5, buyPrice: 103.2 },
    { id: "s2", provider: "Amundi PEA S&P 500 (FR0010315770)", date: "2025-01", quantity: 4, buyPrice: 88.4 },
    { id: "s3", provider: "Amundi Stoxx Europe 600 (LU0908500753)", date: "2025-02", quantity: 2, buyPrice: 241.5 },
    { id: "s4", provider: "Amundi MSCI World (LU1781541179)", date: "2025-03", quantity: 3, buyPrice: 106.8 },
    { id: "s5", provider: "Amundi PEA S&P 500 (FR0010315770)", date: "2025-04", quantity: 3, buyPrice: 91.2 },
    { id: "s6", provider: "Amundi Stoxx Europe 600 (LU0908500753)", date: "2025-05", quantity: 2, buyPrice: 246.9 },
    { id: "s7", provider: "Amundi MSCI World (LU1781541179)", date: "2025-06", quantity: 4, buyPrice: 109.5 },
  ],
  benchmarks: [
    {
      id: "b1",
      name: "Amundi MSCI World (LU1781541179)",
      currentPrice: 112.4,
      prices: {
        "2025-01": 103.5,
        "2025-02": 105.1,
        "2025-03": 107.4,
        "2025-04": 106.2,
        "2025-05": 109.8,
        "2025-06": 111.0,
      },
    },
    {
      id: "b2",
      name: "Amundi PEA S&P 500 (FR0010315770)",
      currentPrice: 96.8,
      prices: {
        "2025-01": 88.9,
        "2025-02": 90.3,
        "2025-03": 92.6,
        "2025-04": 91.4,
        "2025-05": 94.7,
        "2025-06": 95.9,
      },
    },
    {
      id: "b3",
      name: "Amundi Stoxx Europe 600 (LU0908500753)",
      currentPrice: 252.1,
      prices: {
        "2025-01": 242.0,
        "2025-02": 244.6,
        "2025-03": 247.8,
        "2025-04": 245.9,
        "2025-05": 250.3,
        "2025-06": 251.2,
      },
    },
  ],
};
