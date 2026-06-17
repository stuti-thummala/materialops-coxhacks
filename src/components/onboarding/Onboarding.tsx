"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Boxes,
  Truck,
  Smartphone,
  Leaf,
  ArrowRight,
  ArrowLeft,
  X,
} from "lucide-react";

const STORAGE_KEY = "materialops-onboarded";

interface Step {
  icon: React.ReactNode;
  accent: string;
  title: string;
  body: string;
  bullets: string[];
}

const steps: Step[] = [
  {
    icon: <MapPin className="h-7 w-7" />,
    accent: "bg-ops-green/10 text-ops-green",
    title: "Welcome to MaterialOps",
    body: "The post-event material recovery command center for Mercedes-Benz Stadium and the surrounding event district.",
    bullets: [
      "Live recovery operations across 5 stadium zones",
      "Built for the FIFA World Cup 2026™ Atlanta event",
      "Turn leftover materials into verified diversion",
    ],
  },
  {
    icon: <Boxes className="h-7 w-7" />,
    accent: "bg-ops-blue/10 text-ops-blue",
    title: "Scan & Group Materials",
    body: "Crews scan leftover items and the system automatically groups similar materials into recovery batches.",
    bullets: [
      "AI-style detection identifies material & condition",
      "Items group into batches like VB-104 Vinyl Banners",
      "Each batch carries a material passport & value estimate",
    ],
  },
  {
    icon: <Truck className="h-7 w-7" />,
    accent: "bg-ops-amber/10 text-ops-amber",
    title: "Dispatch Recovery Crews",
    body: "From the Dispatch Center, select ready batches, assign crews, and send tasks straight to the worker app.",
    bullets: [
      "Pick batches and crews on an interactive map",
      "See route distance, duration and impact estimates",
      "One click dispatches mobile tasks to crews",
    ],
  },
  {
    icon: <Smartphone className="h-7 w-7" />,
    accent: "bg-ops-purple/10 text-ops-purple",
    title: "Worker Mobile App",
    body: "Crews accept tasks, scan items, follow step-by-step instructions, and upload proof for chain of custody.",
    bullets: [
      "Clear assigned tasks with mini route maps",
      "Scan-to-batch workflow on the phone",
      "Proof photos verify every pickup",
    ],
  },
  {
    icon: <Leaf className="h-7 w-7" />,
    accent: "bg-ops-green/10 text-ops-green",
    title: "Prove Your Impact",
    body: "Generate a verified impact report showing landfill diversion, recovered materials, and partner destinations.",
    bullets: [
      "87.3% landfill diversion, 214 tCO₂e avoided",
      "Verified partner destinations & chain of custody",
      "Export an event impact receipt for sponsors",
    ],
  },
];

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
    const handler = () => {
      setIndex(0);
      setOpen(true);
    };
    window.addEventListener("open-onboarding", handler);
    return () => window.removeEventListener("open-onboarding", handler);
  }, []);

  function finish() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
    setOpen(false);
  }

  if (!open) return null;

  const step = steps[index];
  const isLast = index === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ops-navy/70 p-4 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-lg overflow-hidden rounded-2xl border border-ops-border bg-ops-surface shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
        <div className="relative h-40 overflow-hidden border-b border-ops-border bg-ops-bg">
          <button
            onClick={finish}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md border border-ops-border bg-ops-surface text-ops-muted transition hover:bg-ops-bg"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex h-full items-center justify-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-2xl ${step.accent} ring-1 ring-inset ring-ops-border`}
            >
              {step.icon}
            </div>
          </div>
        </div>

        <div className="px-7 pb-7 pt-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-ops-green">
            Step {index + 1} of {steps.length}
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ops-ink">
            {step.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ops-muted">
            {step.body}
          </p>

          <ul className="mt-5 space-y-2.5">
            {step.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-ops-ink/80">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ops-green" />
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-ops-green" : "w-1.5 bg-ops-border"
                  }`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {index > 0 && (
                <button
                  onClick={() => setIndex((i) => i - 1)}
                  className="flex items-center gap-1.5 rounded-md border border-ops-border bg-ops-surface px-4 py-2.5 text-sm font-medium text-ops-ink transition hover:bg-ops-bg"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              {isLast ? (
                <button
                  onClick={finish}
                  className="flex items-center gap-1.5 rounded-md bg-ops-green px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ops-green/90"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIndex((i) => i + 1)}
                  className="flex items-center gap-1.5 rounded-md bg-ops-green px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ops-green/90"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {!isLast && (
            <button
              onClick={finish}
              className="mt-4 w-full text-center text-xs text-ops-muted transition hover:text-ops-ink"
            >
              Skip tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
