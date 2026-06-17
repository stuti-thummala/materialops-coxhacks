import type { SpotReport } from "./spotReports";

/**
 * Module-level snapshot of the live field reports held in the Zustand store.
 *
 * The chatbot tools are pure, synchronous functions with no React context, so
 * they read the latest reports from here. `StoreSync` keeps this in sync with
 * the store (including across browser tabs).
 */
let snapshot: SpotReport[] = [];

export function setLiveReports(reports: SpotReport[]): void {
  snapshot = reports;
}

export function getLiveReports(): SpotReport[] {
  return snapshot;
}

/** Field captures only (those with GPS coords) — newest first. */
export function getFieldDrops(): SpotReport[] {
  return snapshot.filter((r) => r.coords);
}
