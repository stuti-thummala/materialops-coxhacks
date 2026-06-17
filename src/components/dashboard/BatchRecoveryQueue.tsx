import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { materialBatches, zoneById } from "@/lib/mockData";
import { formatUsd, formatWeight } from "@/lib/formatters";

export function BatchRecoveryQueue() {
  return (
    <GlassCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3 font-medium">Batch ID</th>
              <th className="px-5 py-3 font-medium">Zone</th>
              <th className="px-5 py-3 font-medium">Material Type</th>
              <th className="px-5 py-3 font-medium">Items / Weight</th>
              <th className="px-5 py-3 font-medium">Est. Value</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">ETA</th>
            </tr>
          </thead>
          <tbody>
            {materialBatches.map((batch) => (
              <tr
                key={batch.id}
                className="border-b border-white/5 transition hover:bg-white/[0.03]"
              >
                <td className="px-5 py-3">
                  <Link
                    href={`/batches/${batch.id}`}
                    className="font-semibold text-cyan-300 hover:underline"
                  >
                    {batch.id}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-300">
                  {zoneById[batch.sourceZone]?.shortName}
                </td>
                <td className="px-5 py-3 text-slate-300">{batch.material}</td>
                <td className="px-5 py-3 text-slate-400">
                  {batch.items.toLocaleString()} ·{" "}
                  {formatWeight(batch.estimatedWeightLbs)}
                </td>
                <td className="px-5 py-3 font-medium text-slate-100">
                  {formatUsd(batch.estimatedValueUsd)}
                </td>
                <td className="px-5 py-3">
                  <StatusPill status={batch.status} />
                </td>
                <td className="px-5 py-3 text-slate-400">{batch.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
