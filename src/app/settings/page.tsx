"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { useState } from "react";
import Link from "next/link";
import { Bell, Moon, Radio, MapPin, RefreshCw, Smartphone } from "lucide-react";

interface Toggle {
  key: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  default: boolean;
}

const toggles: Toggle[] = [
  {
    key: "notifications",
    label: "Push Notifications",
    desc: "Alert me when crews complete pickups or batches are detected.",
    icon: <Bell className="h-4 w-4" />,
    default: true,
  },
  {
    key: "live",
    label: "Live Map Updates",
    desc: "Continuously refresh zone activity on the recovery map.",
    icon: <Radio className="h-4 w-4" />,
    default: true,
  },
  {
    key: "geo",
    label: "Crew Location Tracking",
    desc: "Show real-time crew positions across the stadium district.",
    icon: <MapPin className="h-4 w-4" />,
    default: true,
  },
  {
    key: "dark",
    label: "Dark Operations Theme",
    desc: "Use the premium dark theme optimized for control rooms.",
    icon: <Moon className="h-4 w-4" />,
    default: true,
  },
];

export default function SettingsPage() {
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(toggles.map((t) => [t.key, t.default])),
  );

  return (
    <AppShell header={<PageHeader title="Settings" subtitle="Operations preferences for this event" />}>
      <div className="animate-fade-up max-w-2xl space-y-4">
        <div className="rounded-lg border border-ops-border bg-ops-surface p-2">
          {toggles.map((t) => (
            <div
              key={t.key}
              className="flex items-center justify-between gap-4 rounded-md p-4 transition hover:bg-ops-bg"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-ops-green/10 text-ops-green">
                  {t.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-ops-ink">{t.label}</div>
                  <div className="text-xs text-ops-muted">{t.desc}</div>
                </div>
              </div>
              <button
                onClick={() => setState((s) => ({ ...s, [t.key]: !s[t.key] }))}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  state[t.key] ? "bg-ops-green" : "bg-ops-border"
                }`}
                aria-label={t.label}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    state[t.key] ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => window.dispatchEvent(new Event("open-onboarding"))}
          className="flex items-center gap-2 rounded-md border border-ops-border bg-ops-surface px-4 py-2.5 text-sm font-medium text-ops-ink transition hover:bg-ops-bg"
        >
          <RefreshCw className="h-4 w-4 text-ops-green" />
          Replay onboarding tour
        </button>

        <div className="rounded-lg border border-ops-border bg-ops-surface p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-ops-green/10 text-ops-green">
              <Smartphone className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ops-ink">
                Worker app (web fallback)
              </div>
              <div className="text-xs text-ops-muted">
                Crews use the native phone app to scan and recover materials. If
                a device is unavailable, open the browser-based fallback.
              </div>
              <Link
                href="/mobile/tasks"
                className="mt-3 inline-flex items-center gap-2 rounded-md border border-ops-border bg-ops-bg px-3 py-2 text-xs font-semibold text-ops-ink transition hover:bg-ops-surface"
              >
                <Smartphone className="h-3.5 w-3.5 text-ops-green" />
                Open web worker app
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
