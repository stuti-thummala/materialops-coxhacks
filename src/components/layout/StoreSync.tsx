"use client";

import { useEffect } from "react";
import { useMaterialOpsStore } from "@/store/useMaterialOpsStore";
import { setLiveReports } from "@/lib/liveReports";
import { makeBiltmoreDrop, type SpotKind } from "@/lib/spotReports";

const SEEN_KEY = "materialops-recovery-seen";

type RecoveryEvent = { id: string; kind: string; item: string; at: number };

const KIND_SET: ReadonlySet<SpotKind> = new Set<SpotKind>([
  "lanyards",
  "cups",
  "bottles",
  "banner",
  "carpet",
  "cardboard",
  "organics",
  "other",
]);

function loadSeen(): Set<string> {
  try {
    const raw = globalThis.localStorage?.getItem(SEEN_KEY);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set<string>();
  }
}

function saveSeen(seen: Set<string>): void {
  try {
    // Keep the seen list bounded so it doesn't grow forever.
    const ids = [...seen].slice(-200);
    globalThis.localStorage?.setItem(SEEN_KEY, JSON.stringify(ids));
  } catch {
    // ignore quota / serialization issues
  }
}

/**
 * Bridges the persisted Zustand store across tabs and into the module-level
 * `liveReports` snapshot the chatbot reads.
 *
 * Zustand's `persist` middleware writes to localStorage but does NOT rehydrate
 * other tabs automatically — so a report submitted on the mobile tab wouldn't
 * reach the dashboard tab without this listener.
 *
 * It also polls `/api/recovery` so an accepted recovery scanned on the physical
 * phone (Flutter worker app) lights up every Biltmore-reactive screen here.
 */
export function StoreSync() {
  useEffect(() => {
    // Seed + keep the chatbot snapshot in sync with the store.
    setLiveReports(useMaterialOpsStore.getState().spotReports);
    const unsub = useMaterialOpsStore.subscribe((s) =>
      setLiveReports(s.spotReports),
    );

    const onStorage = (e: StorageEvent) => {
      if (e.key === "materialops-store") {
        useMaterialOpsStore.persist.rehydrate()?.catch(() => undefined);
      }
    };
    globalThis.addEventListener("storage", onStorage);

    // Poll the recovery bridge for scans accepted on the physical phone.
    const seen = loadSeen();
    let stopped = false;

    const poll = async () => {
      try {
        const res = await fetch("/api/recovery", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { events?: RecoveryEvent[] };
        const events = data.events ?? [];
        let changed = false;
        for (const ev of events) {
          if (seen.has(ev.id)) continue;
          seen.add(ev.id);
          changed = true;
          const kind = (KIND_SET.has(ev.kind as SpotKind) ? ev.kind : "other") as SpotKind;
          useMaterialOpsStore
            .getState()
            .addSpotReport(makeBiltmoreDrop(kind, ev.item));
        }
        if (changed) saveSeen(seen);
      } catch {
        // network hiccup — try again next tick
      }
    };

    void poll();
    const timer = setInterval(() => {
      if (!stopped) void poll();
    }, 2000);

    return () => {
      stopped = true;
      clearInterval(timer);
      unsub();
      globalThis.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}
