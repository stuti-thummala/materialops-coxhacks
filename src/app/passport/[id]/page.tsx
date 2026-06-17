"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Leaf,
  Car,
  Droplets,
  Recycle,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Fingerprint,
  BadgeCheck,
} from "lucide-react";
import { batchById } from "@/lib/mockData";
import { useMaterialOpsStore } from "@/store/useMaterialOpsStore";
import { buildLiveFieldBatch } from "@/lib/spotReports";
import {
  signPassport,
  verifyPassport,
  shortFingerprint,
  type SignedPassport,
  type VerificationResult,
} from "@/lib/passport";

export default function PassportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = (params?.id ?? "").toUpperCase();
  const spotReports = useMaterialOpsStore((s) => s.spotReports);
  // Live field captures (the Biltmore drop) have no seeded mock batch — fold
  // them into a single passport so the marker's "view passport" link resolves.
  const liveBatch = buildLiveFieldBatch(spotReports);
  const batch =
    batchById[id] ??
    (liveBatch?.id.toUpperCase() === id ? liveBatch : undefined);

  const [signed, setSigned] = useState<SignedPassport | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setUrl(window.location.href);
  }, []);

  function goBack() {
    if (typeof globalThis !== "undefined" && globalThis.history?.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  }

  useEffect(() => {
    if (!batch) return;
    let alive = true;
    (async () => {
      const s = await signPassport(batch);
      if (!alive) return;
      setSigned(s);
      const v = await verifyPassport(s);
      if (alive) setVerification(v);
    })();
    return () => {
      alive = false;
    };
  }, [batch]);

  if (!batch) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#081923] text-white">
        <div className="text-center">
          <p className="text-lg font-semibold">Passport not found</p>
          <p className="mt-1 text-sm text-white/50">No batch matches “{id}”.</p>
          <button
            type="button"
            onClick={goBack}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
        </div>
      </main>
    );
  }

  const p = signed?.passport;
  const verified = verification?.fingerprintValid && verification?.signatureValid;

  return (
    <main className="min-h-screen bg-[#081923] py-8 text-white">
      <div className="mx-auto max-w-3xl px-5">
        {/* back */}
        <button
          type="button"
          onClick={goBack}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>

        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-lg font-bold tracking-tight">MaterialOps</div>
            <div className="text-xs text-white/45">Public Material Passport</div>
          </div>
          <VerifyBadge state={verification ? (verified ? "ok" : "bad") : "loading"} />
        </div>

        {/* hero card */}
        <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d2a3f] to-[#081923]">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/70">
                {batch.id} · {batch.bestPath}
              </div>
              <h1 className="mt-1 font-display text-3xl font-bold">{batch.material}</h1>
              <div className="mt-1 text-sm text-white/55">{batch.materialType}</div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                <span><strong>{batch.items.toLocaleString()}</strong> items</span>
                <span><strong>{batch.estimatedWeightLbs.toLocaleString()}</strong> lbs</span>
                <span className="flex items-center gap-1 text-white/60">
                  <MapPin className="h-3.5 w-3.5" /> {p?.sourceZone ?? "—"}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-white p-3">
              {url ? (
                <QRCodeSVG value={url} size={104} level="M" fgColor="#081923" />
              ) : (
                <div className="h-[104px] w-[104px] animate-pulse rounded bg-slate-200" />
              )}
              <span className="mt-1.5 text-[9px] font-medium text-slate-500">Scan to verify</span>
            </div>
          </div>

          {/* impact strip */}
          {p && (
            <div className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-4">
              <Impact icon={<Leaf className="h-4 w-4" />} value={`${p.impact.co2eAvoidedLbs.toLocaleString()}`} unit="lbs CO₂e avoided" />
              <Impact icon={<Car className="h-4 w-4" />} value={p.impact.equivalents.carMiles.toLocaleString()} unit="car-miles offset" />
              <Impact icon={<Droplets className="h-4 w-4" />} value={p.impact.waterGal.toLocaleString()} unit="gal water saved" />
              <Impact icon={<Recycle className="h-4 w-4" />} value={`${p.impact.landfillCyd}`} unit="cu yd diverted" />
            </div>
          )}
        </div>

        {/* signature block */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Fingerprint className="h-4 w-4 text-cyan-300" /> Cryptographic provenance
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <KV label="Issuer" value="MaterialOps Recovery Authority" />
            <KV label="Signature" value="ECDSA P-256 · SHA-256" />
            <KV label="Passport fingerprint" value={signed ? shortFingerprint(signed.fingerprint) : "computing…"} mono />
            <KV label="Key ID" value="mops-issuer-2026-p256" mono />
          </div>
          {verification && (
            <div
              className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] ${
                verified
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-red-500/10 text-red-300"
              }`}
            >
              {verified ? <BadgeCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
              {verified
                ? "Signature valid — impact figures are authentic and unaltered since issuance."
                : "Verification failed — passport contents do not match the issuer signature."}
            </div>
          )}
        </div>

        {/* chain of custody */}
        {p && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-sm font-semibold">Chain of custody</div>
            <div className="mt-4 space-y-0">
              {p.custody.map((c, i) => (
                <div key={i} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < p.custody.length - 1 && (
                    <span className="absolute left-[7px] top-4 h-full w-px bg-white/15" />
                  )}
                  <span className="mt-1 h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 border-cyan-400 bg-[#081923]" />
                  <div>
                    <div className="text-sm font-medium">{c.step}</div>
                    <div className="text-[12px] text-white/50">
                      {c.actor} · {c.location} · {c.timestamp}
                    </div>
                    {c.note && <div className="mt-0.5 text-[12px] text-white/40">{c.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* line items */}
        {p && p.lineItems.length > 0 && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-sm font-semibold">Grouped items</div>
            <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
              {p.lineItems.map((l, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-white/5 px-3 py-2 text-[13px] last:border-0"
                >
                  <span className="font-medium">{l.name}</span>
                  <span className="text-white/50">
                    {l.count.toLocaleString()} · {l.weightLbs} lbs
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-[11px] text-white/35">
          <span>Mercedes-Benz Stadium · FIFA World Cup 2026™ Atlanta</span>
          <a href="/dashboard" className="flex items-center gap-1 text-cyan-300/70 hover:text-cyan-300">
            Open command center <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </main>
  );
}

function VerifyBadge({ state }: { state: "loading" | "ok" | "bad" }) {
  if (state === "loading")
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/60">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying…
      </span>
    );
  if (state === "ok")
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
        <ShieldCheck className="h-3.5 w-3.5" /> Verified
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300">
      <ShieldAlert className="h-3.5 w-3.5" /> Invalid
    </span>
  );
}

function Impact({ icon, value, unit }: { icon: React.ReactNode; value: string; unit: string }) {
  return (
    <div className="bg-[#081923] px-4 py-3">
      <div className="flex items-center gap-1.5 text-cyan-300">{icon}</div>
      <div className="mt-1 font-display text-xl font-bold">{value}</div>
      <div className="text-[11px] text-white/45">{unit}</div>
    </div>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-white/40">{label}</div>
      <div className={`text-sm text-white/90 ${mono ? "font-mono text-[12px]" : ""}`}>{value}</div>
    </div>
  );
}
