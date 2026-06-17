"use client";

import { Sparkles, Send } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const reasons = [
  { title: "High reuse demand", detail: "Active partner request for vinyl banners" },
  { title: "Clean and consistent", detail: "Low contamination, uniform material" },
  { title: "Volume impact", detail: "78 items grouped into one batch" },
];

export function PriorityReasonPanel() {
  const { showToast } = useToast();
  return (
    <div className="rounded-lg border border-ops-navy bg-ops-navy p-6 text-white">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ops-green">
        <Sparkles className="h-4 w-4" />
        Why This Batch Is Prioritized
      </div>

      <div className="mt-4 space-y-3">
        {reasons.map((r) => (
          <div key={r.title} className="rounded-md border border-white/10 bg-white/[0.05] p-3">
            <div className="text-sm font-semibold text-white">{r.title}</div>
            <div className="text-xs text-white/60">{r.detail}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-white/85">
        Estimated recovery value:{" "}
        <span className="font-semibold text-white">$420</span>
      </div>
      <div className="mt-1 text-xs text-white/60">
        Recommended: Send to reuse partner GreenCircle
      </div>

      <button
        onClick={() => showToast("Sent to GreenCircle Reuse Program.")}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-ops-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-ops-green/90"
      >
        <Send className="h-4 w-4" />
        Send to Reuse Partner
      </button>
    </div>
  );
}
