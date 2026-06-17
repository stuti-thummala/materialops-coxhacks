import { GlassCard } from "@/components/ui/GlassCard";
import { partnerDestinations } from "@/lib/mockData";
import { MapPin, BadgeCheck } from "lucide-react";

export function PartnerDestinations() {
  return (
    <div className="space-y-3">
      {partnerDestinations.map((partner) => (
        <GlassCard
          key={partner.name}
          className="flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ops-green/10 text-ops-green">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-ops-ink">
                {partner.name}
              </div>
              <div className="flex items-center gap-1 text-xs text-ops-muted">
                <MapPin className="h-3 w-3" />
                {partner.location}
              </div>
            </div>
          </div>
          <div className="text-sm font-semibold text-ops-green">
            {partner.amount}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
