"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MobileShell } from "@/components/layout/MobileShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { useMaterialOpsStore } from "@/store/useMaterialOpsStore";
import { useToast } from "@/components/ui/Toast";
import {
  LANGUAGE_LABELS,
  LANGUAGE_ORDER,
  translate,
} from "@/lib/i18n";
import type { ThemePref } from "@/store/useMaterialOpsStore";
import {
  ScanLine,
  CheckCircle2,
  MapPinned,
  Bell,
  Globe,
  Moon,
  ShieldCheck,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronDown,
  Award,
} from "lucide-react";

const THEME_ORDER: ThemePref[] = ["system", "light", "dark"];

export default function MobileAccountPage() {
  const {
    scanCount,
    taskComplete,
    spotReports,
    theme,
    language,
    notificationsEnabled,
    setTheme,
    setLanguage,
    setNotificationsEnabled,
  } = useMaterialOpsStore();
  const { showToast } = useToast();

  const [openPanel, setOpenPanel] = useState<string | null>(null);

  const t = (key: string) => translate(language, key);

  const completedTasks = Object.values(taskComplete).filter(Boolean).length;
  const myReports = spotReports.filter((r) => r.reporter === "You").length;

  const stats = [
    { label: t("account.stat.scanned"), value: scanCount, icon: ScanLine },
    { label: t("account.stat.tasks"), value: completedTasks, icon: CheckCircle2 },
    { label: t("account.stat.reports"), value: myReports, icon: MapPinned },
  ];

  function cycleLanguage() {
    const idx = LANGUAGE_ORDER.indexOf(language);
    const next = LANGUAGE_ORDER[(idx + 1) % LANGUAGE_ORDER.length];
    setLanguage(next);
    showToast(`${translate(next, "account.language")}: ${LANGUAGE_LABELS[next]}`);
  }

  function cycleTheme() {
    const idx = THEME_ORDER.indexOf(theme);
    const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    setTheme(next);
    const themeLabel = translate(language, `theme.${next}`);
    showToast(`${t("account.darkMode")}: ${themeLabel}`);
  }

  function toggleNotifications() {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    showToast(next ? "Notifications enabled" : "Notifications muted");
  }

  function togglePanel(key: string) {
    setOpenPanel((cur) => (cur === key ? null : key));
  }


  return (
    <MobileShell>
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ops-ink">
            {t("account.title")}
          </h1>
          <p className="text-sm text-ops-muted">{t("account.subtitle")}</p>
        </div>

        {/* profile header */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-4">
            <Image
              src="/profile.jpg"
              alt="Stuti Thummala"
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover object-top ring-2 ring-ops-green/30"
            />
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold text-ops-ink">Stuti Thummala</div>
              <div className="text-sm text-ops-muted">{t("account.role")}</div>
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-ops-amber/10 px-2 py-0.5 text-xs font-medium text-ops-amber">
                <Award className="h-3.5 w-3.5" />
                {t("account.badge")}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* stats */}
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <GlassCard key={s.label} className="p-3 text-center">
                <Icon className="mx-auto h-5 w-5 text-ops-green" />
                <div className="mt-1.5 text-lg font-semibold text-ops-ink">
                  {s.value}
                </div>
                <div className="text-[11px] text-ops-muted">{s.label}</div>
              </GlassCard>
            );
          })}
        </div>

        {/* settings */}
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ops-muted">
            {t("account.settings")}
          </div>
          <GlassCard className="divide-y divide-ops-border p-0">
            {/* Notifications — toggle switch */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Bell className="h-5 w-5 text-ops-blue" />
              <span className="flex-1 text-sm font-medium text-ops-ink">
                {t("account.notifications")}
              </span>
              <button
                role="switch"
                aria-checked={notificationsEnabled}
                aria-label="Toggle notifications"
                onClick={toggleNotifications}
                className={`relative h-6 w-11 rounded-full transition ${
                  notificationsEnabled ? "bg-ops-green" : "bg-ops-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    notificationsEnabled ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Language — cycles through options */}
            <button
              onClick={cycleLanguage}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <Globe className="h-5 w-5 text-ops-blue" />
              <span className="flex-1 text-sm font-medium text-ops-ink">
                {t("account.language")}
              </span>
              <span className="text-sm text-ops-muted">
                {LANGUAGE_LABELS[language]}
              </span>
              <ChevronRight className="h-4 w-4 text-ops-muted" />
            </button>

            {/* Dark mode — cycles System / Light / Dark */}
            <button
              onClick={cycleTheme}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <Moon className="h-5 w-5 text-ops-blue" />
              <span className="flex-1 text-sm font-medium text-ops-ink">
                {t("account.darkMode")}
              </span>
              <span className="text-sm text-ops-muted">
                {translate(language, `theme.${theme}`)}
              </span>
              <ChevronRight className="h-4 w-4 text-ops-muted" />
            </button>

            {/* Privacy & data — expandable panel */}
            <div>
              <button
                onClick={() => togglePanel("privacy")}
                aria-expanded={openPanel === "privacy"}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                <ShieldCheck className="h-5 w-5 text-ops-blue" />
                <span className="flex-1 text-sm font-medium text-ops-ink">
                  {t("account.privacy")}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-ops-muted transition-transform ${
                    openPanel === "privacy" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openPanel === "privacy" && (
                <div className="space-y-2 px-4 pb-4 text-sm text-ops-muted">
                  <p>{t("account.privacyBody")}</p>
                  <button
                    onClick={() => showToast(t("account.exportData"))}
                    className="rounded-md border border-ops-border bg-ops-bg px-3 py-2 text-xs font-semibold text-ops-ink"
                  >
                    {t("account.exportData")}
                  </button>
                </div>
              )}
            </div>

            {/* Help & support — expandable panel */}
            <div>
              <button
                onClick={() => togglePanel("help")}
                aria-expanded={openPanel === "help"}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                <HelpCircle className="h-5 w-5 text-ops-blue" />
                <span className="flex-1 text-sm font-medium text-ops-ink">
                  {t("account.help")}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-ops-muted transition-transform ${
                    openPanel === "help" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openPanel === "help" && (
                <div className="space-y-2 px-4 pb-4 text-sm text-ops-muted">
                  <p>{t("account.helpBody")}</p>
                  <div className="flex gap-2">
                    <a
                      href="tel:+18005550199"
                      className="flex-1 rounded-md border border-ops-border bg-ops-bg px-3 py-2 text-center text-xs font-semibold text-ops-ink"
                    >
                      {t("account.callOps")}
                    </a>
                    <a
                      href="mailto:support@materialops.app"
                      className="flex-1 rounded-md border border-ops-border bg-ops-bg px-3 py-2 text-center text-xs font-semibold text-ops-ink"
                    >
                      {t("account.emailSupport")}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <Link
          href="/mobile/tasks"
          className="flex items-center justify-center gap-2 rounded-md border border-ops-border bg-ops-surface py-3.5 text-sm font-semibold text-ops-red"
        >
          <LogOut className="h-4 w-4" />
          {t("account.signOut")}
        </Link>

        <p className="pb-2 text-center text-xs text-ops-muted">
          MaterialOps · Field v1.0.0
        </p>
      </div>
    </MobileShell>
  );
}
