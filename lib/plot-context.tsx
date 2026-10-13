"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface PlotSelection {
  selectedId: string | null;
  /** Increments whenever the map should fly to the selected plot. */
  locateTick: number;
  select: (id: string | null) => void;
  /** Select a plot, scroll to the master plan and centre it on the map. */
  showOnPlan: (id: string) => void;
}

const Ctx = createContext<PlotSelection | null>(null);

export function PlotProvider({ children }: { children: React.ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locateTick, setLocateTick] = useState(0);

  const select = useCallback((id: string | null) => setSelectedId(id), []);

  const showOnPlan = useCallback((id: string) => {
    setSelectedId(id);
    setLocateTick((t) => t + 1);
    document.getElementById("master-plan")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const value = useMemo(
    () => ({ selectedId, locateTick, select, showOnPlan }),
    [selectedId, locateTick, select, showOnPlan],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlotSelection() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePlotSelection must be used inside <PlotProvider>");
  return v;
}
