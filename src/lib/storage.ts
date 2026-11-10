import { useEffect, useState } from "react";

const KEY = "etf-tracker-data";

export function loadInitial<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveData(data: unknown): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearStored(): void {
  localStorage.removeItem(KEY);
}

export function useAutoSave(data: unknown): void {
  useEffect(() => {
    saveData(data);
  }, [data]);
}

export function usePersistentState<T>(fallback: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => loadInitial(fallback));
  useAutoSave(state);
  return [state, setState];
}
