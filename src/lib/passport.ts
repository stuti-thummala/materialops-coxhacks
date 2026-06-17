/**
 * Material Passport — cryptographically signed, auditable record of a recovered
 * material batch and its chain of custody.
 *
 * Every passport is canonicalised to a stable JSON string, fingerprinted with
 * SHA-256, and signed with the MaterialOps issuer key (ECDSA P-256). The public
 * passport page re-derives the fingerprint and verifies the signature in the
 * browser, so a sponsor or auditor can confirm the impact numbers were not
 * altered after issuance.
 *
 * NOTE: The issuer key below is a fixed DEMO key. In production the private key
 * lives in an HSM / signing service and never ships to the client — only the
 * public key does. It is embedded here so the prototype can sign and verify
 * fully offline.
 */

import type { MaterialBatch } from "./types";
import { computeImpact, type ImpactResult, type RecoveryPathKey } from "./warm";
import { zoneById, groupedItemsForBatch } from "./mockData";

const ISSUER_PUBLIC_JWK: JsonWebKey = {
  kty: "EC",
  crv: "P-256",
  x: "yqzBLclrdzOH3BfUDeuv09aHyOJNFA-ZsAQdD9DBdmk",
  y: "yT2kUK7gSWqcJDgBGJh-hKBWvCJcFbS3GINhtsdS4ig",
  key_ops: ["verify"],
  ext: true,
};

const ISSUER_PRIVATE_JWK: JsonWebKey = {
  kty: "EC",
  crv: "P-256",
  x: "yqzBLclrdzOH3BfUDeuv09aHyOJNFA-ZsAQdD9DBdmk",
  y: "yT2kUK7gSWqcJDgBGJh-hKBWvCJcFbS3GINhtsdS4ig",
  d: "XN--B1lTRpqgnlJ8NtF5JUJjtmDKlNpOZ6k_A8obOBo",
  key_ops: ["sign"],
  ext: true,
};

export const ISSUER = {
  name: "MaterialOps Recovery Authority",
  keyId: "mops-issuer-2026-p256",
  event: "FIFA World Cup 2026™ — Atlanta",
  venue: "Mercedes-Benz Stadium",
};

export interface CustodyEvent {
  step: string;
  actor: string;
  location: string;
  timestamp: string;
  note?: string;
}

export interface PassportLineItem {
  name: string;
  material: string;
  sourceZone: string;
  count: number;
  weightLbs: number;
}

export interface MaterialPassport {
  /** Canonical passport id (matches batch id). */
  id: string;
  version: 1;
  issuer: typeof ISSUER;
  issuedAt: string;
  material: string;
  materialType: string;
  recoveryPath: RecoveryPathKey;
  sourceZone: string;
  destination: string;
  items: number;
  weightLbs: number;
  valueUsd: number;
  lineItems: PassportLineItem[];
  custody: CustodyEvent[];
  impact: ImpactResult;
}

export interface SignedPassport {
  passport: MaterialPassport;
  /** Hex SHA-256 of the canonical passport body. */
  fingerprint: string;
  /** Base64 ECDSA P-256 signature over the canonical body. */
  signature: string;
  publicKeyJwk: JsonWebKey;
}

function subtle(): SubtleCrypto {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (!c?.subtle) throw new Error("WebCrypto unavailable in this runtime.");
  return c.subtle;
}

/** Deterministic key-sorted JSON serialisation. */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${canonicalize(obj[k])}`)
    .join(",")}}`;
}

function toBase64(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let bin = "";
  for (const byte of arr) bin += String.fromCodePoint(byte);
  if (typeof btoa === "function") return btoa(bin);
  return Buffer.from(bin, "binary").toString("base64");
}

function fromBase64(b64: string): ArrayBuffer {
  const bin =
    typeof atob === "function"
      ? atob(b64)
      : Buffer.from(b64, "base64").toString("binary");
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) view[i] = bin.codePointAt(i) ?? 0;
  return buf;
}

export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await subtle().digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Build the (unsigned) passport object for a batch. */
export function buildPassport(batch: MaterialBatch): MaterialPassport {
  const zone = zoneById[batch.sourceZone];
  const grouped = groupedItemsForBatch(batch);
  const impact = computeImpact(
    `${batch.material} ${batch.materialType}`,
    batch.estimatedWeightLbs,
    batch.bestPath,
  );

  const custody: CustodyEvent[] = [
    {
      step: "Detected & grouped",
      actor: "CV Intake (field app)",
      location: zone?.name ?? "Mercedes-Benz Stadium",
      timestamp: batch.createdAt,
      note: `${batch.items.toLocaleString()} items grouped into batch ${batch.id}.`,
    },
    {
      step: "Verified on-site",
      actor: "Crew lead",
      location: zone?.name ?? "Mercedes-Benz Stadium",
      timestamp: batch.createdAt,
      note: `Contamination assessed: ${batch.contaminationScore}.`,
    },
    {
      step: "Staged for pickup",
      actor: "Logistics agent",
      location: "Parking / Logistics dock",
      timestamp: batch.eta,
    },
    {
      step: `Routed to ${batch.destination}`,
      actor: "Dispatch",
      location: batch.destination,
      timestamp: batch.eta,
      note: `Recovery path: ${batch.bestPath}.`,
    },
  ];

  return {
    id: batch.id,
    version: 1,
    issuer: ISSUER,
    issuedAt: batch.createdAt,
    material: batch.material,
    materialType: batch.materialType,
    recoveryPath: batch.bestPath,
    sourceZone: zone?.name ?? batch.sourceZone,
    destination: batch.destination,
    items: batch.items,
    weightLbs: batch.estimatedWeightLbs,
    valueUsd: batch.estimatedValueUsd,
    lineItems: grouped.map((g) => ({
      name: g.name,
      material: g.material,
      sourceZone: g.sourceZone,
      count: g.count,
      weightLbs: g.weightLbs,
    })),
    custody,
    impact,
  };
}

/** Build, fingerprint, and cryptographically sign a passport for a batch. */
export async function signPassport(
  batch: MaterialBatch,
): Promise<SignedPassport> {
  const passport = buildPassport(batch);
  const body = canonicalize(passport);
  const fingerprint = await sha256Hex(body);

  const key = await subtle().importKey(
    "jwk",
    ISSUER_PRIVATE_JWK,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
  const sig = await subtle().sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(body),
  );

  return {
    passport,
    fingerprint,
    signature: toBase64(sig),
    publicKeyJwk: ISSUER_PUBLIC_JWK,
  };
}

export interface VerificationResult {
  fingerprintValid: boolean;
  signatureValid: boolean;
  recomputedFingerprint: string;
}

/** Independently re-derive the fingerprint and verify the issuer signature. */
export async function verifyPassport(
  signed: SignedPassport,
): Promise<VerificationResult> {
  const body = canonicalize(signed.passport);
  const recomputedFingerprint = await sha256Hex(body);

  const key = await subtle().importKey(
    "jwk",
    signed.publicKeyJwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"],
  );
  const signatureValid = await subtle().verify(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    fromBase64(signed.signature),
    new TextEncoder().encode(body),
  );

  return {
    fingerprintValid: recomputedFingerprint === signed.fingerprint,
    signatureValid,
    recomputedFingerprint,
  };
}

/** Short, human-checkable fingerprint (first 4 groups of 4 hex). */
export function shortFingerprint(fingerprint: string): string {
  return (
    fingerprint
      .slice(0, 16)
      .match(/.{1,4}/g)
      ?.join(" ")
      .toUpperCase() ?? fingerprint.slice(0, 16).toUpperCase()
  );
}
