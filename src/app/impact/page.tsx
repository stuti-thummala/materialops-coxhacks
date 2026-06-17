"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ImpactDonutChart } from "@/components/impact/ImpactDonutChart";
import { PartnerDestinations } from "@/components/impact/PartnerDestinations";
import { ImpactReceipt } from "@/components/impact/ImpactReceipt";
import { EventROI } from "@/components/impact/EventROI";
import { DiversionBenchmark } from "@/components/impact/DiversionBenchmark";
import { partnerDestinations } from "@/lib/mockData";
import {
  Recycle,
  Leaf,
  Package,
  ShieldCheck,
  Check,
  TreePine,
  Droplets,
  Zap,
  Handshake,
  MapPin,
  BadgeCheck,
  CheckCircle2,
  FileBarChart,
  DollarSign,
  Download,
  ArrowRight,
  FileText,
  X,
} from "lucide-react";

const kpis = [
  { label: "Landfill Diversion", value: "87.3%", icon: <Recycle className="h-5 w-5" /> },
  { label: "CO₂ Avoided", value: "214.1 tCO₂e", icon: <Leaf className="h-5 w-5" /> },
  { label: "Money Saved", value: "$42,180", icon: <DollarSign className="h-5 w-5" /> },
  { label: "Total Material Recovered", value: "18.7 tons", icon: <Package className="h-5 w-5" /> },
  { label: "Chain-of-Custody", value: "100%", icon: <ShieldCheck className="h-5 w-5" /> },
];

const custodySteps = [
  "Material Collected",
  "Transport Initiated",
  "Received by Partner",
  "Processed",
  "Documentation",
];

const environmental = [
  { label: "CO₂ Avoided", value: "214.1 t", icon: <Leaf className="h-5 w-5" /> },
  { label: "Trees Preserved", value: "472", icon: <TreePine className="h-5 w-5" /> },
  { label: "Gallons of Water Saved", value: "81,302", icon: <Droplets className="h-5 w-5" /> },
  { label: "kWh Energy Saved", value: "368,410", icon: <Zap className="h-5 w-5" /> },
];

const partnerStatuses = ["On site", "En route", "Scheduled", "Confirmed", "Confirmed"];

const reports = [
  {
    title: "Post-Event Impact Report",
    desc: "Verified diversion, recovered materials, and chain of custody.",
    meta: "Mercedes-Benz Stadium · May 15-16, 2025",
    href: "/impact",
  },
  {
    title: "Crew Performance Summary",
    desc: "Pickups completed, average task time, and zone coverage.",
    meta: "32 crews · 187 tasks completed",
    href: "/dispatch",
  },
  {
    title: "Batch Recovery Log",
    desc: "Every grouped batch with material passport and destination.",
    meta: "24 active batches",
    href: "/batches",
  },
  {
    title: "Cost Savings Statement",
    desc: "Avoided landfill disposal fees and recovered material value.",
    meta: "$42,180 saved · EPA WARM verified",
    href: "/impact",
  },
  {
    title: "Partner Allocation Report",
    desc: "Material volumes routed to each verified partner destination.",
    meta: "5 verified partners",
    href: "/impact",
  },
];

const TABS = [
  { id: "impact", label: "Impact", icon: Leaf },
  { id: "partners", label: "Partners", icon: Handshake },
  { id: "reports", label: "Reports", icon: FileBarChart },
] as const;

interface ReportSection {
  readonly summary: string;
  readonly columns: readonly string[];
  readonly rows: readonly (readonly (string | number)[])[];
  readonly totalRow?: readonly (string | number)[];
  readonly footnote: string;
}

const REPORT_CONTENT: Record<string, ReportSection> = {
  "Post-Event Impact Report": {
    summary:
      "Mercedes-Benz Stadium recovered 18.7 tons of material across the activation, achieving an 87.3% landfill diversion rate and avoiding 214.1 tCO₂e — every batch verified through a signed material passport.",
    columns: ["Metric", "Result", "Basis"],
    rows: [
      ["Landfill diversion", "87.3%", "Weight diverted ÷ total collected"],
      ["Material recovered", "18.7 tons", "Across 24 grouped batches"],
      ["CO₂e avoided", "214.1 tCO₂e", "EPA WARM methodology"],
      ["Water saved", "81,302 gal", "Lifecycle offset vs. virgin production"],
      ["Energy saved", "368,410 kWh", "Lifecycle offset vs. virgin production"],
      ["Chain-of-custody", "100%", "Every batch passport-signed"],
    ],
    footnote:
      "Figures reconciled against weigh-station tickets and partner intake receipts. EPA WARM v15 emission factors.",
  },
  "Crew Performance Summary": {
    summary:
      "32 crews completed 187 recovery tasks at an 11.8-minute average task time, covering all stadium recovery zones with zero missed scheduled pickups.",
    columns: ["Crew", "Tasks", "Avg. task time", "Zones"],
    rows: [
      ["Crew Alpha", 41, "11.4 min", 3],
      ["Crew Bravo", 38, "12.1 min", 2],
      ["Crew Charlie", 35, "10.8 min", 3],
      ["Crew Delta", 33, "13.0 min", 2],
      ["Crew Echo", 40, "11.9 min", 4],
    ],
    totalRow: ["Total", 187, "11.8 min avg", "All zones"],
    footnote:
      "Task times measured from accept-to-complete in the worker app. Excludes idle and travel between assigned zones.",
  },
  "Batch Recovery Log": {
    summary:
      "24 batches were grouped, weighed, and routed during the activation. A representative sample is shown below; every batch carries a signed material passport and verified destination.",
    columns: ["Batch", "Material", "Weight", "Destination", "Path"],
    rows: [
      ["VB-104", "Vinyl Banners", "640 lbs", "ReUse Hub ATL", "Upcycle"],
      ["CU-091", "Reusable Cups", "210 lbs", "Stadium Wash Line", "Reuse"],
      ["LY-072", "Lanyards", "95 lbs", "ReUse Hub ATL", "Donate"],
      ["CT-033", "Cardboard", "1,180 lbs", "Pratt Recycling", "Recycle"],
      ["FS-058", "Food Scraps", "820 lbs", "Compost ATL", "Compost"],
    ],
    totalRow: ["5 of 24 shown", "—", "2,945 lbs", "—", "—"],
    footnote:
      "Full log of all 24 batches is available in Material Batches. Weights captured at staging scale; passports cryptographically signed.",
  },
  "Cost Savings Statement": {
    summary:
      "The recovery program returned $42,180 in verified value for this activation — combining avoided disposal, recovered material value, logistics efficiency, ESG equity, and circular-economy incentives.",
    columns: ["Savings category", "Amount", "Basis"],
    rows: [
      ["Avoided landfill & hauling fees", "$6,420", "Tipping fees + diverted haul loads"],
      ["Recovered material & resale value", "$11,950", "Resale + reuse offsetting new stock"],
      ["AI-optimized logistics & labor", "$9,380", "Route consolidation, less manual sort"],
      ["ESG & earned-media equity", "$10,240", "Verified disclosure + sponsor brand lift"],
      ["Tax credits & incentives", "$4,190", "Diversion + circular-economy credits"],
    ],
    totalRow: ["Total verified savings", "$42,180", "EPA WARM verified"],
    footnote:
      "Illustrative executive summary modeled from recovery volume and regional disposal rates. Annualizes across the activation program.",
  },
  "Partner Allocation Report": {
    summary:
      "Recovered material was routed to 5 verified partner destinations, each confirming intake and final processing through the chain-of-custody ledger.",
    columns: ["Partner", "Location", "Allocated", "Status"],
    rows: partnerDestinations.map((p, i) => [
      p.name,
      p.location,
      p.amount,
      partnerStatuses[i % partnerStatuses.length],
    ]),
    footnote:
      "Allocations reconciled against partner intake receipts. Status reflects latest chain-of-custody ledger entry.",
  },
};
type TabId = (typeof TABS)[number]["id"];

export default function ImpactPage() {
  const [tab, setTab] = useState<TabId>("impact");

  return (
    <AppShell header={<PageHeader title="Impact & Reporting" subtitle="Mercedes-Benz Stadium · verified recovery, partners, and exports" />}>
      <div className="animate-fade-up space-y-6">
        <div className="flex gap-1.5 rounded-xl border border-ops-border bg-ops-surface p-1.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-ops-navy text-white"
                    : "text-ops-muted hover:bg-ops-bg"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "impact" && <ImpactTab />}
        {tab === "partners" && <PartnersTab />}
        {tab === "reports" && <ReportsTab onOpenImpact={() => setTab("impact")} />}
      </div>
    </AppShell>
  );
}

function ImpactTab() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <MetricCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div>
        <SectionHeader
          title="Event ROI"
          subtitle="Verified return on the recovery program vs. platform cost"
        />
        <EventROI />
      </div>

      <div>
        <SectionHeader
          title="Diversion vs. Baseline"
          subtitle="The counterfactual proof this program works"
        />
        <DiversionBenchmark />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div>
            <SectionHeader title="Materials Recovered by Category" />
            <GlassCard className="p-6">
              <ImpactDonutChart />
            </GlassCard>
          </div>

          <div>
            <SectionHeader title="Verified Partner Destinations" />
            <PartnerDestinations />
          </div>

          <div>
            <SectionHeader title="Chain-of-Custody Progress" />
            <GlassCard className="p-6">
              <div className="flex flex-wrap items-center gap-3">
                {custodySteps.map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-ops-green/40 bg-ops-green/12 text-ops-green">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm text-ops-ink">{step}</span>
                    </div>
                    {i < custodySteps.length - 1 && (
                      <span className="hidden h-px w-6 bg-ops-green/30 md:block" />
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <div>
            <SectionHeader title="Environmental Impact" />
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {environmental.map((item) => (
                <GlassCard key={item.label} className="p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ops-green/10 text-ops-green">
                    {item.icon}
                  </div>
                  <div className="mt-4 font-display text-2xl font-bold text-ops-ink">
                    {item.value}
                  </div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-wide text-ops-muted">
                    {item.label}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>

        <div>
          <SectionHeader title="Event Impact Receipt" />
          <ImpactReceipt />
        </div>
      </div>
    </div>
  );
}

function PartnersTab() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {partnerDestinations.map((partner, i) => (
        <div
          key={partner.name}
          className="rounded-lg border border-ops-border bg-ops-surface p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ops-green/12 text-ops-green">
              <Handshake className="h-5 w-5" />
            </div>
            <span className="flex items-center gap-1 rounded border border-ops-green/30 bg-ops-green/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ops-green">
              <CheckCircle2 className="h-3 w-3" />
              {partnerStatuses[i % partnerStatuses.length]}
            </span>
          </div>
          <div className="mt-3 font-display text-base font-semibold text-ops-ink">
            {partner.name}
          </div>
          <div className="mt-1 flex items-center gap-1 text-sm text-ops-muted">
            <MapPin className="h-3.5 w-3.5" />
            {partner.location}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-ops-border pt-3">
            <span className="text-sm text-ops-muted">Allocated</span>
            <span className="flex items-center gap-1 text-sm font-semibold text-ops-green">
              <BadgeCheck className="h-4 w-4" />
              {partner.amount}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportsTab({ onOpenImpact }: { readonly onOpenImpact: () => void }) {
  const [openReport, setOpenReport] = useState<(typeof reports)[number] | null>(
    null,
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {reports.map((r) => (
        <div
          key={r.title}
          className="flex flex-col rounded-lg border border-ops-border bg-ops-surface p-5"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ops-blue/12 text-ops-blue">
              <FileBarChart className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-display text-base font-semibold text-ops-ink">{r.title}</div>
              <p className="mt-1 text-sm text-ops-muted">{r.desc}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-ops-muted">
            <FileText className="h-3.5 w-3.5" />
            {r.meta}
          </div>
          <div className="mt-4 flex gap-2 border-t border-ops-border pt-4">
            {r.href === "/impact" ? (
              <button
                onClick={onOpenImpact}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-ops-border bg-white py-2.5 text-sm font-medium text-ops-ink transition hover:bg-ops-bg"
              >
                View
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href={r.href}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-ops-border bg-white py-2.5 text-sm font-medium text-ops-ink transition hover:bg-ops-bg"
              >
                View
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <button
              onClick={() => setOpenReport(r)}
              className="flex items-center justify-center gap-1.5 rounded-md bg-ops-green px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ops-green/90"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      ))}

      {openReport && (
        <ReportPreviewModal
          report={openReport}
          onClose={() => setOpenReport(null)}
        />
      )}
    </div>
  );
}

interface ReportPreviewModalProps {
  readonly report: (typeof reports)[number];
  readonly onClose: () => void;
}

function ReportPreviewModal({ report, onClose }: ReportPreviewModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [onClose]);

  const content = REPORT_CONTENT[report.title];
  const issued = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <dialog
      open
      className="fixed inset-0 z-50 m-0 flex h-full w-full max-w-none items-start justify-center overflow-y-auto bg-ops-ink/50 p-4 backdrop-blur-sm print:static print:bg-white print:p-0"
      aria-label={`${report.title} export`}
    >
      <button
        type="button"
        aria-label="Close report"
        onClick={onClose}
        className="absolute inset-0 cursor-default print:hidden"
      />
      <div className="report-doc relative z-10 my-8 w-full max-w-2xl overflow-hidden rounded-2xl border border-ops-border bg-ops-surface shadow-2xl print:my-0 print:shadow-none">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-ops-bg text-ops-muted transition hover:text-ops-ink print:hidden"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-8">
          {/* letterhead */}
          <div className="flex items-center justify-between border-b-2 border-ops-ink pb-4">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-ops-ink">
              MaterialOps
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ops-green">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Recovery Report
            </div>
          </div>

          <h2 className="mt-6 font-display text-2xl font-bold text-ops-ink">
            {report.title}
          </h2>
          <div className="mt-1 text-sm text-ops-muted">{report.meta}</div>
          <div className="mt-0.5 text-xs text-ops-muted">Issued {issued}</div>

          <p className="mt-5 text-sm leading-relaxed text-ops-ink">
            {content.summary}
          </p>

          {/* data table */}
          <div className="mt-6 overflow-hidden rounded-lg border border-ops-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ops-border bg-ops-bg text-[11px] uppercase tracking-wide text-ops-muted">
                <tr>
                  {content.columns.map((c, ci) => (
                    <th
                      key={c}
                      className={`px-4 py-2.5 font-semibold ${ci > 0 ? "text-right" : ""}`}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {content.rows.map((row) => (
                  <tr key={String(row[0])} className="border-t border-ops-border">
                    {row.map((cell, ci) => (
                      <td
                        key={`${String(row[0])}-${content.columns[ci]}`}
                        className={`px-4 py-2.5 ${
                          ci === 0
                            ? "font-medium text-ops-ink"
                            : "text-right text-ops-ink"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {content.totalRow && (
                <tfoot>
                  <tr className="border-t-2 border-ops-ink bg-ops-bg/60 font-semibold">
                    {content.totalRow.map((cell, ci) => (
                      <td
                        key={`total-${content.columns[ci]}`}
                        className={`px-4 py-2.5 text-ops-ink ${ci > 0 ? "text-right" : ""}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <p className="mt-5 text-[11px] leading-relaxed text-ops-muted">
            {content.footnote}
          </p>

          <div className="mt-6 flex items-center justify-between border-t border-ops-border pt-4">
            <div className="flex items-center gap-1.5 text-[11px] text-ops-muted">
              <BadgeCheck className="h-3.5 w-3.5 text-ops-green" />
              Chain-of-custody verified · MaterialOps ledger
            </div>
            <div className="flex gap-2 print:hidden">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-ops-border px-4 py-2.5 text-sm font-medium text-ops-ink transition hover:bg-ops-bg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => globalThis.print()}
                className="flex items-center gap-1.5 rounded-md bg-ops-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-125"
              >
                <Download className="h-4 w-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
