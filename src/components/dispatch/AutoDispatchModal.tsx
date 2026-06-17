"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  X,
  Mail,
  CalendarClock,
  Users,
  Route as RouteIcon,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import type { MaterialBatch } from "@/lib/types";
import { planDispatch, type DispatchAction } from "@/lib/dispatch";

const ICONS: Record<DispatchAction["kind"], React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  booking: <CalendarClock className="h-4 w-4" />,
  crew: <Users className="h-4 w-4" />,
  route: <RouteIcon className="h-4 w-4" />,
  passport: <ShieldCheck className="h-4 w-4" />,
};

type Phase = "review" | "executing" | "done";

export function AutoDispatchModal({ batch }: { batch: MaterialBatch }) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("review");
  const [step, setStep] = useState(0);
  const plan = planDispatch(batch);
  const [email, setEmail] = useState(plan.emailBody);

  function execute() {
    setPhase("executing");
    setStep(0);
    plan.actions.forEach((_, i) => {
      setTimeout(() => {
        setStep(i + 1);
        if (i === plan.actions.length - 1) {
          setTimeout(() => setPhase("done"), 500);
        }
      }, (i + 1) * 700);
    });
  }

  function close() {
    setOpen(false);
    setTimeout(() => {
      setPhase("review");
      setStep(0);
    }, 200);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-ops-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-125"
      >
        <Zap className="h-4 w-4 text-ops-green" />
        Auto-dispatch with approval
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-ops-border bg-ops-surface shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-ops-border bg-ops-navy px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-ops-green" />
                  <div>
                    <div className="font-display text-sm font-semibold text-white">
                      Autonomous Dispatch — {batch.id}
                    </div>
                    <div className="text-[11px] text-white/50">
                      Human-in-the-loop · {Math.round(plan.confidence * 100)}% agent confidence
                    </div>
                  </div>
                </div>
                <button onClick={close} className="text-white/60 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {phase === "done" ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-ops-green/15"
                    >
                      <CheckCircle2 className="h-9 w-9 text-ops-green" />
                    </motion.span>
                    <h3 className="mt-4 font-display text-lg font-semibold text-ops-ink">
                      Dispatch executed
                    </h3>
                    <p className="mt-1 max-w-xs text-sm text-ops-muted">
                      {plan.partner} notified, {plan.crewName} assigned for {plan.pickupWindow},
                      and a signed passport was published for {batch.id}.
                    </p>
                    <a
                      href={`/passport/${batch.id}`}
                      className="mt-4 rounded-xl bg-ops-green px-4 py-2 text-sm font-semibold text-white"
                    >
                      View signed passport
                    </a>
                  </div>
                ) : (
                  <>
                    {/* plan summary */}
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Partner" value={plan.partner} sub={plan.partnerLocation} />
                      <Field label="Pickup window" value={plan.pickupWindow} />
                      <Field label="Crew" value={plan.crewName} sub={`ETA ${plan.etaMinutes} min`} />
                      <Field label="CO₂e avoided" value={`${plan.co2eAvoidedLbs.toLocaleString()} lbs`} />
                    </div>

                    {/* action checklist */}
                    <div className="mt-4 space-y-1.5">
                      {plan.actions.map((a, i) => {
                        const active = phase === "executing";
                        const completed = active && step > i;
                        const running = active && step === i;
                        return (
                          <div
                            key={a.kind}
                            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                              completed
                                ? "border-ops-green/40 bg-ops-green/5"
                                : "border-ops-border bg-ops-bg/40"
                            }`}
                          >
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                completed ? "bg-ops-green text-white" : "bg-ops-navy/10 text-ops-navy"
                              }`}
                            >
                              {completed ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : running ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                ICONS[a.kind]
                              )}
                            </span>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-ops-ink">{a.title}</div>
                              <div className="text-[11px] text-ops-muted">{a.detail}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* draft email */}
                    {phase === "review" && (
                      <div className="mt-4">
                        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ops-ink">
                          <Mail className="h-3.5 w-3.5" /> Draft partner email (editable)
                        </div>
                        <div className="rounded-xl border border-ops-border bg-ops-bg/40 p-3">
                          <div className="mb-2 text-[11px] font-medium text-ops-muted">
                            Subject: {plan.emailSubject}
                          </div>
                          <textarea
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            rows={7}
                            className="w-full resize-none rounded-lg border border-ops-border bg-ops-surface p-2.5 text-[12px] leading-relaxed text-ops-ink outline-none focus:border-ops-green"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {phase === "review" && (
                <div className="flex items-center gap-2 border-t border-ops-border px-5 py-3.5">
                  <button
                    onClick={close}
                    className="flex-1 rounded-xl border border-ops-border py-2.5 text-sm font-medium text-ops-muted transition hover:bg-ops-bg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={execute}
                    className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-ops-green py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                  >
                    <Zap className="h-4 w-4" /> Approve &amp; execute
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Field({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-ops-border bg-ops-bg/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-ops-muted">{label}</div>
      <div className="text-sm font-semibold text-ops-ink">{value}</div>
      {sub && <div className="text-[11px] text-ops-muted">{sub}</div>}
    </div>
  );
}
