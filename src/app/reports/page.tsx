import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { FileBarChart, Download, ArrowRight, FileText } from "lucide-react";

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
    href: "/partners",
  },
];

export default function ReportsPage() {
  return (
    <AppShell header={<PageHeader title="Reports" subtitle="Generate and export operational and impact reports" />}>
      <div className="animate-fade-up space-y-4">
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
                <Link
                  href={r.href}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-ops-border bg-white py-2.5 text-sm font-medium text-ops-ink transition hover:bg-ops-bg"
                >
                  View
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button className="flex items-center justify-center gap-1.5 rounded-md bg-ops-green px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ops-green/90">
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
