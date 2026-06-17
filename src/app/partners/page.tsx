import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { partnerDestinations } from "@/lib/mockData";
import { Handshake, MapPin, BadgeCheck, CheckCircle2 } from "lucide-react";

const statuses = ["On site", "En route", "Scheduled", "Confirmed", "Confirmed"];

export default function PartnersPage() {
  return (
    <AppShell header={<PageHeader title="Partners" subtitle="Recycler, reuse, and logistics partners for this event" />}>
      <div className="animate-fade-up space-y-4">
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
                  {statuses[i % statuses.length]}
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
      </div>
    </AppShell>
  );
}
