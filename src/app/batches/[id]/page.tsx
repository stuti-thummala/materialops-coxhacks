import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { GradientButton } from "@/components/ui/GradientButton";
import { SiteRecoveryMap } from "@/components/dashboard/SiteRecoveryMap";
import { MaterialPassport } from "@/components/batches/MaterialPassport";
import { GroupedItemsTable } from "@/components/batches/GroupedItemsTable";
import { ChainOfCustody } from "@/components/batches/ChainOfCustody";
import { PriorityReasonPanel } from "@/components/batches/PriorityReasonPanel";
import { AgentDecisions } from "@/components/batches/AgentDecisions";
import { ReasoningTrace } from "@/components/agents/ReasoningTrace";
import { AutoDispatchModal } from "@/components/dispatch/AutoDispatchModal";
import { batchById } from "@/lib/mockData";
import { ArrowLeft, Users, MoreHorizontal, ShieldCheck } from "lucide-react";

export default function BatchDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const batch = batchById[params.id] ?? batchById["VB-104"];

  return (
    <AppShell header={<PageHeader title={`${batch.id} · ${batch.material}`} subtitle="Batch detail & material passport" />}>
      <div className="animate-fade-up space-y-6">
        <Link
          href="/batches"
          className="inline-flex items-center gap-2 text-sm text-ops-muted hover:text-ops-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Batches
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold tracking-tight text-ops-ink">
                {batch.id} {batch.material}
              </h1>
              <StatusPill status={batch.status} />
            </div>
            <p className="mt-1 text-sm text-ops-muted">
              Grouped from {batch.items.toLocaleString()} scanned items across
              multiple zones.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <GradientButton variant="secondary">
              <Users className="h-4 w-4" />
              Assign Crew
            </GradientButton>
            <Link
              href={`/passport/${batch.id}`}
              className="flex items-center gap-2 rounded-md border border-ops-border bg-ops-surface px-4 py-2.5 text-sm font-semibold text-ops-ink transition hover:bg-ops-bg"
            >
              <ShieldCheck className="h-4 w-4 text-ops-green" />
              Public passport
            </Link>
            <AutoDispatchModal batch={batch} />
            <button className="flex h-11 w-11 items-center justify-center rounded-md border border-ops-border bg-ops-surface text-ops-muted hover:bg-ops-bg">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <MaterialPassport batch={batch} />
            <GroupedItemsTable batch={batch} />
            <ReasoningTrace batch={batch} />
            <div>
              <h2 className="mb-3 font-display text-lg font-semibold tracking-tight text-ops-ink">
                Source Zones
              </h2>
              <GlassCard className="p-3">
                <SiteRecoveryMap height="h-[260px]" />
              </GlassCard>
            </div>
          </div>

          <div className="space-y-6">
            <ChainOfCustody batch={batch} />
            <PriorityReasonPanel />
            <AgentDecisions batch={batch} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
