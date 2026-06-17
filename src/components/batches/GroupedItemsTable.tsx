import { GlassCard } from "@/components/ui/GlassCard";
import { groupedItemsForBatch } from "@/lib/mockData";
import type { MaterialBatch } from "@/lib/types";

export function GroupedItemsTable({ batch }: { batch: MaterialBatch }) {
  const items = groupedItemsForBatch(batch);
  return (
    <GlassCard className="overflow-hidden">
      <div className="border-b border-ops-border px-5 py-4">
        <h2 className="font-display text-lg font-semibold tracking-tight text-ops-ink">
          Grouped Items
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ops-border text-xs font-medium uppercase tracking-wide text-ops-muted">
              <th className="px-5 py-3 font-medium">Item</th>
              <th className="px-5 py-3 font-medium">Source Zone</th>
              <th className="px-5 py-3 font-medium">Material</th>
              <th className="px-5 py-3 font-medium">Count</th>
              <th className="px-5 py-3 font-medium">Weight</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.name}
                className="border-b border-ops-border transition hover:bg-ops-bg"
              >
                <td className="px-5 py-3 font-medium text-ops-ink">
                  {item.name}
                </td>
                <td className="px-5 py-3 text-ops-muted">{item.sourceZone}</td>
                <td className="px-5 py-3 text-ops-ink/80">{item.material}</td>
                <td className="px-5 py-3 text-ops-ink/80">{item.count}</td>
                <td className="px-5 py-3 text-ops-muted">{item.weightLbs} lbs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
