"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedSpotReports, type SpotReport } from "@/lib/spotReports";

export type ThemePref = "system" | "light" | "dark";
export type LanguagePref = "en" | "es" | "fr" | "de";

interface MaterialOpsState {
  selectedBatchIds: string[];
  selectedCrewIds: string[];
  dispatched: boolean;
  scanCount: number;
  taskAccepted: Record<string, boolean>;
  taskComplete: Record<string, boolean>;
  spotReports: SpotReport[];
  theme: ThemePref;
  language: LanguagePref;
  notificationsEnabled: boolean;

  toggleBatch: (id: string) => void;
  toggleCrew: (id: string) => void;
  clearSelection: () => void;
  dispatchCrews: () => void;
  resetDispatch: () => void;
  addScannedItem: () => void;
  acceptTask: (id: string) => void;
  completeTask: (id: string) => void;
  addSpotReport: (report: SpotReport) => void;
  claimSpotReport: (id: string) => void;
  setTheme: (theme: ThemePref) => void;
  setLanguage: (language: LanguagePref) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const useMaterialOpsStore = create<MaterialOpsState>()(
  persist(
    (set) => ({
      selectedBatchIds: [],
      selectedCrewIds: [],
      dispatched: false,
      scanCount: 12,
      taskAccepted: {},
      taskComplete: {},
      spotReports: seedSpotReports,
      theme: "system",
      language: "en",
      notificationsEnabled: true,

      toggleBatch: (id) =>
        set((s) => ({
          dispatched: false,
          selectedBatchIds: s.selectedBatchIds.includes(id)
            ? s.selectedBatchIds.filter((b) => b !== id)
            : [...s.selectedBatchIds, id],
        })),

      toggleCrew: (id) =>
        set((s) => ({
          dispatched: false,
          selectedCrewIds: s.selectedCrewIds.includes(id)
            ? s.selectedCrewIds.filter((c) => c !== id)
            : [...s.selectedCrewIds, id],
        })),

      clearSelection: () =>
        set({ selectedBatchIds: [], selectedCrewIds: [], dispatched: false }),

      dispatchCrews: () => set({ dispatched: true }),

      resetDispatch: () => set({ dispatched: false }),

      addScannedItem: () => set((s) => ({ scanCount: s.scanCount + 1 })),

      acceptTask: (id) =>
        set((s) => ({ taskAccepted: { ...s.taskAccepted, [id]: true } })),

      completeTask: (id) =>
        set((s) => ({ taskComplete: { ...s.taskComplete, [id]: true } })),

      addSpotReport: (report) =>
        set((s) => ({ spotReports: [report, ...s.spotReports] })),

      claimSpotReport: (id) =>
        set((s) => ({
          spotReports: s.spotReports.map((r) =>
            r.id === id ? { ...r, status: "claimed" } : r,
          ),
        })),

      setTheme: (theme) => set({ theme }),

      setLanguage: (language) => set({ language }),

      setNotificationsEnabled: (notificationsEnabled) =>
        set({ notificationsEnabled }),
    }),
    { name: "materialops-store" },
  ),
);

// Live cross-tab sync: when the mobile app (one tab) accepts a Biltmore
// recovery, every other open tab in the same browser — the command center and
// dashboard on the demo screen — rehydrates immediately so their maps, glowing
// bulbs and panels update without a manual refresh.
if (globalThis.window !== undefined) {
  globalThis.window.addEventListener("storage", (e) => {
    if (e.key === "materialops-store") {
      useMaterialOpsStore.persist.rehydrate();
    }
  });
}
