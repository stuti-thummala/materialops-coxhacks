/**
 * Autonomous dispatch agent.
 *
 * Given a recovered batch, this agent proposes the full set of actions needed
 * to close the loop — pick a partner, draft the pickup request email, book a
 * window, assign a crew, and update the batch destination — as a plan that a
 * human approves before anything is "sent". This is the human-in-the-loop
 * agentic surface.
 */

import type { MaterialBatch } from "./types";
import { crews, zoneById, partnerDestinations } from "./mockData";
import { orchestrate } from "./orchestrator";
import { computeImpact } from "./warm";

export interface DispatchAction {
  kind: "email" | "booking" | "crew" | "route" | "passport";
  title: string;
  detail: string;
}

export interface DispatchPlan {
  batchId: string;
  partner: string;
  partnerLocation: string;
  pickupWindow: string;
  crewId: string;
  crewName: string;
  etaMinutes: number;
  co2eAvoidedLbs: number;
  emailSubject: string;
  emailBody: string;
  actions: DispatchAction[];
  confidence: number;
}

function pickPartner(batch: MaterialBatch): { name: string; location: string } {
  // Prefer the batch's named destination, else best partner by material match.
  const direct = partnerDestinations.find((p) =>
    batch.destination.toLowerCase().includes(p.name.toLowerCase().split(" ")[0]),
  );
  if (direct) return { name: direct.name, location: direct.location };
  const byMaterial = partnerDestinations.find((p) =>
    p.amount.toLowerCase().includes(batch.bestPath === "reuse" ? "metal" : "recycl"),
  );
  return {
    name: batch.destination,
    location: byMaterial?.location ?? "Atlanta, GA",
  };
}

function pickCrew(): { id: string; name: string } {
  const avail = crews.find((c) => c.status === "available") ?? crews[0];
  return { id: avail.id, name: avail.name };
}

export function planDispatch(batch: MaterialBatch): DispatchPlan {
  const orchestration = orchestrate(batch);
  const partner = pickPartner(batch);
  const crew = pickCrew();
  const zone = zoneById[batch.sourceZone];
  const impact = computeImpact(
    `${batch.material} ${batch.materialType}`,
    batch.estimatedWeightLbs,
    batch.bestPath,
  );

  const pickupWindow = batch.eta;
  const emailSubject = `Pickup request — Batch ${batch.id} (${batch.material}, ${batch.estimatedWeightLbs} lbs)`;
  const emailBody = [
    `Hi ${partner.name} team,`,
    "",
    `MaterialOps has a recovered batch ready for ${orchestration.finalPath} at Mercedes-Benz Stadium (FIFA World Cup 2026™).`,
    "",
    `• Batch: ${batch.id} — ${batch.material} (${batch.materialType})`,
    `• Quantity: ${batch.items.toLocaleString()} items, ~${batch.estimatedWeightLbs} lbs`,
    `• Source: ${zone?.name ?? batch.sourceZone}`,
    `• Contamination: ${batch.contaminationScore}`,
    `• Requested pickup window: ${pickupWindow}`,
    "",
    `A signed material passport with full chain of custody and verified impact (${impact.co2eAvoidedLbs.toLocaleString()} lbs CO₂e avoided) is attached at /passport/${batch.id}.`,
    "",
    "Please confirm acceptance and dock window.",
    "",
    "— MaterialOps Dispatch (autonomous), pending human approval",
  ].join("\n");

  return {
    batchId: batch.id,
    partner: partner.name,
    partnerLocation: partner.location,
    pickupWindow,
    crewId: crew.id,
    crewName: crew.name,
    etaMinutes: 60 + Math.round(batch.estimatedWeightLbs / 40),
    co2eAvoidedLbs: impact.co2eAvoidedLbs,
    emailSubject,
    emailBody,
    confidence: orchestration.finalConfidence,
    actions: [
      {
        kind: "email",
        title: `Email ${partner.name}`,
        detail: `Send pickup request for ${batch.id} to ${partner.location}.`,
      },
      {
        kind: "booking",
        title: "Book pickup window",
        detail: `Reserve ${pickupWindow} at the logistics dock.`,
      },
      {
        kind: "crew",
        title: `Assign ${crew.name}`,
        detail: `Dispatch ${crew.name} to ${zone?.shortName ?? batch.sourceZone}.`,
      },
      {
        kind: "route",
        title: "Update batch route",
        detail: `Set ${batch.id} destination → ${partner.name} (${orchestration.finalPath}).`,
      },
      {
        kind: "passport",
        title: "Issue signed passport",
        detail: `Sign & publish passport ${batch.id} for sponsor/auditor access.`,
      },
    ],
  };
}
