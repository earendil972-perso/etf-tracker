import type { AppData } from "../types";

export const sampleData: AppData = {
  providers: [
    { name: "Amundi MSCI World (LU1781541179)", currentPrice: 699.39 },
    { name: "Amundi PEA S&P 500 (FR0010315770)", currentPrice: 59.15 },
    { name: "Amundi Stoxx Europe 600 (LU0908500753)", currentPrice: 325.3 },
  ],
  purchases: [
    { id: "s1", provider: "Amundi MSCI World (LU1781541179)", date: "2025-01", quantity: 5, buyPrice: 655.2 },
    { id: "s2", provider: "Amundi PEA S&P 500 (FR0010315770)", date: "2025-01", quantity: 10, buyPrice: 55.4 },
    { id: "s3", provider: "Amundi Stoxx Europe 600 (LU0908500753)", date: "2025-02", quantity: 3, buyPrice: 308.5 },
    { id: "s4", provider: "Amundi MSCI World (LU1781541179)", date: "2025-03", quantity: 3, buyPrice: 672.8 },
    { id: "s5", provider: "Amundi PEA S&P 500 (FR0010315770)", date: "2025-04", quantity: 8, buyPrice: 56.9 },
    { id: "s6", provider: "Amundi Stoxx Europe 600 (LU0908500753)", date: "2025-05", quantity: 2, buyPrice: 315.4 },
    { id: "s7", provider: "Amundi MSCI World (LU1781541179)", date: "2025-06", quantity: 4, buyPrice: 683.1 },
  ],
  benchmarks: [
    {
      id: "b1",
      name: "Amundi MSCI World (LU1781541179)",
      currentPrice: 699.39,
      prices: {
        "2025-01": 656.0,
        "2025-02": 663.5,
        "2025-03": 674.1,
        "2025-04": 668.9,
        "2025-05": 690.2,
        "2025-06": 695.0,
      },
    },
    {
      id: "b2",
      name: "Amundi PEA S&P 500 (FR0010315770)",
      currentPrice: 59.15,
      prices: {
        "2025-01": 55.8,
        "2025-02": 56.6,
        "2025-03": 57.9,
        "2025-04": 57.1,
        "2025-05": 58.6,
        "2025-06": 58.9,
      },
    },
    {
      id: "b3",
      name: "Amundi Stoxx Europe 600 (LU0908500753)",
      currentPrice: 325.3,
      prices: {
        "2025-01": 309.5,
        "2025-02": 312.3,
        "2025-03": 316.8,
        "2025-04": 314.2,
        "2025-05": 321.6,
        "2025-06": 323.4,
      },
    },
  ],
};
