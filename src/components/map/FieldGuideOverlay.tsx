"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ShieldAlert,
  Lightbulb,
  ChevronRight,
  Leaf,
  Scale,
  ChevronDown,
} from "lucide-react";
import { fieldGuide, type FieldGuide } from "@/lib/fieldGuide";
import type { ZoneId } from "@/lib/types";

export function FieldGuideOverlay({ zoneId }: Readonly<{ zoneId: ZoneId }>) {
  const [guide, setGuide] = useState<FieldGuide | null>(null);
  const [open, setOpen] = useState(true);
  const [typed, setTyped] = useState("");

  // Recompute + "type out" the headline when the zone changes.
  useEffect(() => {
    const g = fieldGuide(zoneId);
    setGuide(g);
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setTyped(g.headline.slice(0, i));
      if (i >= g.headline.length) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [zoneId]);

  if (!guide) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[500]">
      {/* AI guide card (bottom-left) */}
      <div className="pointer-events-auto absolute bottom-3 left-3 w-[320px] max-w-[calc(100%-1.5rem)]">
        <div className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#06121b]/92 shadow-2xl backdrop-blur-xl">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center gap-2 border-b border-white/10 px-3.5 py-2.5"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 text-[#06121b]">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="flex-1 text-left text-xs font-semibold text-white">
              AI Field Guide
            </span>
            <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-300">
              {Math.round(guide.confidence * 100)}% conf.
            </span>
            <ChevronDown
              className={`h-4 w-4 text-white/50 transition ${open ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 px-3.5 py-3">
                  {/* headline (typed) */}
                  <p className="text-[12.5px] leading-relaxed text-white/90">
                    {typed}
                    {typed.length < guide.headline.length && (
                      <span className="ml-0.5 inline-block animate-pulse">▋</span>
                    )}
                  </p>

                  {/* impact chips */}
                  <div className="flex gap-2">
                    <Chip icon={<Scale className="h-3 w-3" />} value={`${guide.forecastLbs.toLocaleString()} lbs`} label="forecast" />
                    <Chip icon={<Leaf className="h-3 w-3" />} value={`${guide.co2eLbs.toLocaleString()} lbs`} label="CO₂e" />
                  </div>

                  {/* tips */}
                  <div className="space-y-1.5">
                    {guide.tips.slice(0, 3).map((t) => (
                      <div key={t} className="flex gap-2">
                        <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-300" />
                        <span className="text-[11.5px] leading-snug text-white/75">{t}</span>
                      </div>
                    ))}
                  </div>

                  {/* safety */}
                  <div className="flex gap-2 rounded-xl border border-amber-400/20 bg-amber-500/10 px-2.5 py-1.5">
                    <ShieldAlert className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-300" />
                    <span className="text-[11px] leading-snug text-amber-100/90">{guide.safety}</span>
                  </div>

                  {/* recommended action */}
                  {guide.action.batchId ? (
                    <Link
                      href={`/batches/${guide.action.batchId}`}
                      className="flex items-center justify-between rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-3 py-2 text-[12px] font-semibold text-[#06121b] transition hover:brightness-110"
                    >
                      {guide.action.text}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <div className="rounded-xl bg-white/[0.05] px-3 py-2 text-[12px] font-medium text-white/80">
                      {guide.action.text}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Chip({
  icon,
  value,
  label,
}: Readonly<{ icon: React.ReactNode; value: string; label: string }>) {
  return (
    <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5">
      <span className="text-cyan-300">{icon}</span>
      <span>
        <span className="block text-[12px] font-bold leading-none text-white">{value}</span>
        <span className="block text-[9px] text-white/45">{label}</span>
      </span>
    </div>
  );
}
