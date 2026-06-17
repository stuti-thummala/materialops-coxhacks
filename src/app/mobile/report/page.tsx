"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MobileShell } from "@/components/layout/MobileShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { useMaterialOpsStore } from "@/store/useMaterialOpsStore";
import { useToast } from "@/components/ui/Toast";
import { recoveryZones } from "@/lib/mockData";
import {
  SPOT_KINDS,
  classifySpot,
  newReportId,
  newPassportId,
  planDisposal,
  toneForKind,
  DEMO_ORIGIN,
  type GeoFix,
  type SpotKind,
  type SpotReport,
} from "@/lib/spotReports";
import {
  ArrowLeft,
  Camera,
  Sparkles,
  MapPin,
  Leaf,
  Scale,
  Send,
  CheckCircle2,
  Hand,
  Truck,
  Route,
} from "lucide-react";

const VOLUMES: SpotReport["volume"][] = ["a few", "a pile", "a truckload"];

function currentLocation(): Promise<GeoFix> {
  return new Promise((resolve) => {
    const geo = globalThis.navigator?.geolocation;
    if (!geo) {
      resolve(DEMO_ORIGIN);
      return;
    }
    geo.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading ?? DEMO_ORIGIN.heading,
          label: "Your current location",
        }),
      () => resolve(DEMO_ORIGIN),
      { timeout: 4000 },
    );
  });
}


export default function MobileReportPage() {
  const { spotReports, addSpotReport, claimSpotReport } = useMaterialOpsStore();
  const { showToast } = useToast();

  const [kind, setKind] = useState<SpotKind>("banner");
  const [zoneId, setZoneId] = useState(recoveryZones[0].id);
  const [detail, setDetail] = useState("");
  const [volume, setVolume] = useState<SpotReport["volume"]>("a pile");
  const [photo, setPhoto] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const ai = useMemo(() => classifySpot(kind, volume), [kind, volume]);
  const disposalPreview = useMemo(
    () => planDisposal(ai, DEMO_ORIGIN, "MP-preview"),
    [ai],
  );
  const zone = recoveryZones.find((z) => z.id === zoneId) ?? recoveryZones[0];

  function onPhotoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    setLocating(true);
    const coords = await currentLocation();
    setLocating(false);
    const passportId = newPassportId();
    const report: SpotReport = {
      id: newReportId(),
      kind,
      zoneId: zone.id,
      zoneName: zone.name,
      locationDetail: detail.trim() || `${zone.shortName} — exact spot not given`,
      volume,
      reporter: "You",
      minutesAgo: 0,
      status: "new",
      ai,
      photoTone: toneForKind(kind),
      passportId,
      coords,
      photoDataUrl: photo ?? undefined,
      disposal: planDisposal(ai, coords, passportId),
    };
    addSpotReport(report);
    showToast(`Sent to ops · ${ai.type} dropped at ${coords.label}`);
    setDetail("");
    setPhoto(null);
  }

  return (
    <MobileShell>
      <div className="space-y-5">
        <Link
          href="/mobile/tasks"
          className="inline-flex items-center gap-2 text-sm text-ops-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Tasks
        </Link>

        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ops-ink">
            Report a Spot
          </h1>
          <p className="text-sm text-ops-muted">
            See materials piling up? Drop a pin and our model pre-sorts it for
            dispatch.
          </p>
        </div>

        {/* what */}
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ops-muted">
            What did you spot?
          </div>
          <div className="flex flex-wrap gap-2">
            {SPOT_KINDS.map((k) => (
              <button
                key={k.kind}
                onClick={() => setKind(k.kind)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                  kind === k.kind
                    ? "border-ops-green bg-ops-green/10 text-ops-green"
                    : "border-ops-border bg-ops-surface text-ops-muted"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>

        {/* where */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-ops-muted">
            Where is it?
          </div>
          <select
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value as typeof zoneId)}
            className="w-full rounded-md border border-ops-border bg-ops-surface px-3 py-3 text-sm text-ops-ink"
          >
            {recoveryZones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
          <input
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Exact spot — e.g. Section 122 rail, near gate 3"
            className="w-full rounded-md border border-ops-border bg-ops-surface px-3 py-3 text-sm text-ops-ink placeholder:text-ops-muted/60"
          />
        </div>

        {/* how much */}
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ops-muted">
            How much?
          </div>
          <div className="flex gap-2">
            {VOLUMES.map((v) => (
              <button
                key={v}
                onClick={() => setVolume(v)}
                className={`flex-1 rounded-md border py-2.5 text-sm font-medium capitalize transition ${
                  volume === v
                    ? "border-ops-blue bg-ops-blue/10 text-ops-blue"
                    : "border-ops-border bg-ops-surface text-ops-muted"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* AI preview */}
        <GlassCard className="overflow-hidden p-0">
          <div className="flex items-stretch">
            <div
              className={`w-20 shrink-0 bg-gradient-to-b ${toneForKind(kind)}`}
            />
            <div className="flex-1 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-ops-green">
                <Sparkles className="h-3.5 w-3.5" />
                AI pre-sorted this
                <span className="ml-auto rounded-full bg-ops-green/10 px-2 py-0.5 text-ops-green">
                  {Math.round(ai.confidence * 100)}%
                </span>
              </div>
              <div className="mt-1.5 text-base font-semibold text-ops-ink">
                {ai.type}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-md border border-ops-border bg-ops-bg px-2 py-1 text-ops-ink">
                  <Scale className="h-3.5 w-3.5 text-ops-blue" />
                  ~{ai.estWeightLbs} lbs
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-ops-border bg-ops-bg px-2 py-1 text-ops-ink">
                  <Leaf className="h-3.5 w-3.5 text-ops-green" />
                  {ai.co2eLbs} lbs CO₂e
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-ops-border bg-ops-bg px-2 py-1 font-medium text-ops-ink">
                  {ai.path}
                </span>
              </div>
            </div>
          </div>
          {/* auto disposal routing */}
          <div className="border-t border-ops-border bg-ops-bg/60 px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ops-blue">
              <Route className="h-3.5 w-3.5" />
              Auto disposal plan
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-sm text-ops-ink">
              <Truck className="h-4 w-4 text-ops-muted" />
              <span className="font-medium">{disposalPreview.dropOff.name}</span>
              <span className="text-ops-muted">· {disposalPreview.dropOff.location}</span>
            </div>
            <div className="mt-1 text-xs text-ops-muted">
              ~{disposalPreview.distanceMi} mi · ETA {disposalPreview.etaMin} min ·{" "}
              {disposalPreview.path}
            </div>
          </div>
        </GlassCard>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPhotoPick}
          className="hidden"
        />
        <div className="flex gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-md border border-ops-border bg-ops-surface py-3.5 text-sm font-semibold text-ops-ink"
          >
            {photo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt="Captured material"
                  className="h-6 w-6 rounded object-cover"
                />
                <span>Photo added</span>
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Add Photo
              </>
            )}
          </button>
          <button
            onClick={handleSubmit}
            disabled={locating}
            className="flex flex-[1.4] items-center justify-center gap-2 rounded-md bg-ops-green py-3.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {locating ? "Locating…" : "Submit Report"}
          </button>
        </div>

        {/* live feed */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-ops-ink">Live spot feed</div>
            <span className="text-xs text-ops-muted">{spotReports.length} reports</span>
          </div>

          {spotReports.map((r) => (
            <GlassCard key={r.id} className="overflow-hidden p-0">
              <div className="flex items-stretch">
                <div className={`w-1.5 shrink-0 bg-gradient-to-b ${r.photoTone}`} />
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-ops-ink">
                        {r.ai.type} · ~{r.ai.estWeightLbs} lbs
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ops-muted">
                        <MapPin className="h-3.5 w-3.5 text-ops-blue" />
                        {r.zoneName}
                      </div>
                    </div>
                    <StatusChip status={r.status} />
                  </div>

                  <p className="mt-2 text-sm text-ops-muted">{r.locationDetail}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-ops-muted">
                      {r.reporter} · {r.minutesAgo === 0 ? "just now" : `${r.minutesAgo}m ago`}
                    </span>
                    {r.status === "new" ? (
                      <button
                        onClick={() => {
                          claimSpotReport(r.id);
                          showToast(`Claimed ${r.ai.type} at ${r.zoneName}`);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md bg-ops-blue/10 px-3 py-1.5 text-xs font-semibold text-ops-blue"
                      >
                        <Hand className="h-3.5 w-3.5" />
                        Claim
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-ops-green">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {r.status === "recovered" ? "Recovered" : "Claimed"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}

function StatusChip({ status }: Readonly<{ status: SpotReport["status"] }>) {
  const map = {
    new: { label: "New", cls: "border-ops-amber/40 bg-ops-amber/10 text-ops-amber" },
    claimed: { label: "Claimed", cls: "border-ops-blue/40 bg-ops-blue/10 text-ops-blue" },
    recovered: {
      label: "Recovered",
      cls: "border-ops-green/40 bg-ops-green/10 text-ops-green",
    },
  } as const;
  const s = map[status];
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
