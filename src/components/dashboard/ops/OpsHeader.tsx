"use client";

import { Bell, ChevronDown, Radio, Users } from "lucide-react";

export function OpsHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-ops-border bg-[#e7e7e2]/95 backdrop-blur-xl">
      <div className="flex items-center justify-between px-7 py-4">
        <div>
          <h1 className="font-display text-[22px] font-bold leading-tight tracking-tight text-ops-ink">
            Recovery Command Center
          </h1>
          <p className="mt-0.5 text-[13px] text-ops-muted">
            Mercedes-Benz Stadium · FIFA World Cup 2026 Atlanta
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-md border border-ops-green/30 bg-ops-green/10 px-3 py-1.5 text-[13px] font-medium text-ops-green">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            Post-Event Recovery
          </span>

          <span className="hidden items-center gap-2 rounded-md border border-ops-border bg-white px-3 py-1.5 text-[13px] font-medium text-ops-ink sm:inline-flex">
            <Users className="h-3.5 w-3.5 text-ops-blue" />
            24 / 32 crews active
          </span>

          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-md border border-ops-border bg-white text-ops-muted transition hover:text-ops-ink"
            aria-label="Alerts"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ops-red px-1 text-[10px] font-semibold text-white">
              3
            </span>
          </button>

          <button
            type="button"
            className="flex items-center gap-2.5 rounded-md border border-ops-border bg-white py-1.5 pl-1.5 pr-2.5 transition hover:border-ops-muted/50"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ops-navy text-xs font-semibold text-white">
              AJ
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-[13px] font-semibold text-ops-ink">A. Jordan</span>
              <span className="block text-[11px] text-ops-muted">Operations Lead</span>
            </span>
            <ChevronDown className="h-4 w-4 text-ops-muted" />
          </button>
        </div>
      </div>
    </header>
  );
}
