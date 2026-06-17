"use client";

import { CircleHelp, Bell, ChevronDown } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#222831]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-8 py-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Live Operations
            </h1>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Post-Event Recovery
            </span>
          </div>
          <p className="mt-0.5 text-sm text-slate-500">
            Mercedes-Benz Stadium · Atlanta, Georgia
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <div className="leading-tight">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                Event Status
              </div>
              <div className="text-xs font-semibold text-slate-200">Post-Event</div>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 sm:flex">
            <span className="text-amber-300">☀</span>
            <div className="leading-tight">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                Weather
              </div>
              <div className="text-xs font-semibold text-slate-200">72°F</div>
            </div>
          </div>

          <button
            onClick={() => window.dispatchEvent(new Event("open-onboarding"))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08]"
            aria-label="Replay tour"
            title="Replay tour"
          >
            <CircleHelp className="h-4 w-4" />
          </button>

          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              3
            </span>
          </button>

          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3 transition hover:bg-white/[0.08]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-semibold text-[#06111f]">
              AJ
            </span>
            <div className="text-left leading-tight">
              <div className="text-xs font-semibold text-slate-100">A. Jordan</div>
              <div className="text-[10px] text-slate-500">Operations Lead</div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
