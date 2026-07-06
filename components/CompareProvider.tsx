"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Car } from "@/lib/types";

const MAX = 3;
const KEY = "wmtransport_compare";

type Ctx = {
  items: Car[];
  has: (id: number) => boolean;
  toggle: (car: Car) => void;
  remove: (id: number) => void;
  clear: () => void;
  full: boolean;
};

const CompareContext = createContext<Ctx | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Car[]>([]);
  const [ready, setReady] = useState(false);

  // load dari localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  // simpan
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(KEY, JSON.stringify(items));
      } catch {}
    }
  }, [items, ready]);

  const has = useCallback((id: number) => items.some((c) => c.id === id), [items]);

  const toggle = useCallback((car: Car) => {
    setItems((prev) => {
      if (prev.some((c) => c.id === car.id)) {
        return prev.filter((c) => c.id !== car.id);
      }
      if (prev.length >= MAX) return prev; // batas tercapai
      return [...prev, car];
    });
  }, []);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return (
    <CompareContext.Provider
      value={{ items, has, toggle, remove, clear, full: items.length >= MAX }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare harus dipakai di dalam CompareProvider");
  return ctx;
}
