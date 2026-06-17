"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ScanLine } from "lucide-react";
import type { ZoneId } from "@/lib/types";

interface SceneBoxDef {
  label: string;
  /** percentage strings relative to the photo (e.g. "57%"). */
  left: string;
  top: string;
  width: string;
  height: string;
  conf: number;
}

interface Scene {
  src: string;
  alt: string;
  /** intrinsic aspect ratio (width / height) so boxes stay anchored. */
  ratio: number;
  boxes: SceneBoxDef[];
}

/**
 * Real recovery-scene photos captured at the venue, used as a *static* backdrop
 * for the walk-through. Because the scene never pans, the AI detection boxes
 * stay pinned to the actual objects in the photo — they read as a natural part
 * of the environment instead of floating overlays.
 */
const SCENES: Record<ZoneId, Scene> = {
  "stadium-bowl": {
    src: "/props/cups.jpeg",
    alt: "Reusable cups scattered across the seating bowl concourse",
    ratio: 1456 / 1080,
    boxes: [
      { label: "Vinyl Banner", left: "6%", top: "2%", width: "22%", height: "18%", conf: 89 },
      { label: "Reusable Cups", left: "57%", top: "9%", width: "25%", height: "30%", conf: 96 },
      { label: "Cardboard", left: "84%", top: "20%", width: "15%", height: "30%", conf: 91 },
    ],
  },
  gwcc: {
    src: "/props/cardboard%20boxes.jpeg",
    alt: "Stacked cardboard boxes and plastic film on the loading concourse",
    ratio: 1456 / 1080,
    boxes: [
      { label: "Vinyl Banner", left: "1%", top: "0%", width: "23%", height: "26%", conf: 88 },
      { label: "Cardboard", left: "38%", top: "50%", width: "32%", height: "47%", conf: 95 },
      { label: "LDPE Film", left: "16%", top: "47%", width: "27%", height: "24%", conf: 87 },
    ],
  },
  "fan-plaza": {
    src: "/props/banner-fifa.jpg",
    alt: "Stacked FIFA World Cup 2026 vinyl banners on the plaza",
    ratio: 1456 / 1080,
    boxes: [
      { label: "Vinyl Banner", left: "4%", top: "15%", width: "90%", height: "76%", conf: 97 },
      { label: "Wood Pallet", left: "0%", top: "0%", width: "31%", height: "17%", conf: 90 },
    ],
  },
  "arena-district": {
    src: "/props/pallete.jpeg",
    alt: "Stacked wood pallets staged in the arena district",
    ratio: 1175 / 430,
    boxes: [
      { label: "Vinyl Banner", left: "2%", top: "3%", width: "19%", height: "58%", conf: 88 },
      { label: "Wood Pallets", left: "25%", top: "28%", width: "46%", height: "60%", conf: 95 },
      { label: "Pallet Stack", left: "70%", top: "22%", width: "28%", height: "62%", conf: 92 },
    ],
  },
  "home-depot-backyard": {
    src: "/props/compost.jpeg",
    alt: "Overflowing compost bins of food and organic waste",
    ratio: 1175 / 430,
    boxes: [
      { label: "Food Waste", left: "12%", top: "3%", width: "44%", height: "85%", conf: 94 },
      { label: "Compost", left: "58%", top: "5%", width: "32%", height: "78%", conf: 91 },
      { label: "Compostable Fiber", left: "33%", top: "72%", width: "38%", height: "24%", conf: 86 },
    ],
  },
  "parking-logistics": {
    src: "/props/cardboard%20boxes.jpeg",
    alt: "Cardboard, plastic film, and road cases at the loading dock",
    ratio: 1456 / 1080,
    boxes: [
      { label: "Cardboard", left: "38%", top: "50%", width: "32%", height: "47%", conf: 95 },
      { label: "LDPE Film", left: "16%", top: "47%", width: "27%", height: "24%", conf: 88 },
      { label: "Reusable Cases", left: "70%", top: "0%", width: "29%", height: "27%", conf: 90 },
    ],
  },
};

interface FitRect {
  w: number;
  h: number;
  left: number;
  top: number;
}

/** Compute the letterbox-contained rect for the photo inside the stage. */
function containRect(cw: number, ch: number, ratio: number): FitRect {
  let w = cw;
  let h = cw / ratio;
  if (h > ch) {
    h = ch;
    w = ch * ratio;
  }
  return { w, h, left: (cw - w) / 2, top: (ch - h) / 2 };
}

export function RecoveryScene({ zoneId }: Readonly<{ zoneId: ZoneId }>) {
  const scene = SCENES[zoneId] ?? SCENES["stadium-bowl"];
  const stageRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<FitRect>({ w: 0, h: 0, left: 0, top: 0 });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const compute = () =>
      setRect(containRect(el.clientWidth, el.clientHeight, scene.ratio));
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scene.ratio]);

  return (
    <div ref={stageRef} className="absolute inset-0 overflow-hidden bg-[#040d14]">
      {/* aspect-locked photo plate — boxes are children so they stay anchored */}
      <div
        className="absolute"
        style={{ left: rect.left, top: rect.top, width: rect.w, height: rect.h }}
      >
        <img
          key={scene.src}
          src={scene.src}
          alt={scene.alt}
          className="h-full w-full select-none object-fill"
          draggable={false}
        />

        {/* subtle vignette so detection chrome reads against bright photos */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15" />

        {rect.w > 0 &&
          scene.boxes.map((box, i) => (
            <SceneBox key={box.label} box={box} index={i} />
          ))}

        {/* "live detection" scan line sweeping the plate */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent"
          initial={{ top: "0%" }}
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

function SceneBox({ box, index }: Readonly<{ box: SceneBoxDef; index: number }>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 + index * 0.22, duration: 0.4, ease: "easeOut" }}
      className="absolute"
      style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
    >
      {/* bounding box */}
      <span className="absolute inset-0 rounded-md border-2 border-cyan-400/85 shadow-[inset_0_0_22px_rgba(34,211,238,0.18)]" />
      <Corner className="-left-px -top-px border-l-2 border-t-2" />
      <Corner className="-right-px -top-px border-r-2 border-t-2" />
      <Corner className="-bottom-px -left-px border-b-2 border-l-2" />
      <Corner className="-bottom-px -right-px border-b-2 border-r-2" />

      {/* anchored label chip */}
      <div className="absolute left-0 top-0 -translate-y-full whitespace-nowrap rounded-md rounded-bl-none border border-cyan-400/40 bg-[#06121b]/95 px-1.5 py-0.5 shadow-lg backdrop-blur">
        <div className="flex items-center gap-1">
          <ScanLine className="h-2.5 w-2.5 text-cyan-300" />
          <span className="text-[10px] font-bold text-white">{box.label}</span>
          <span className="text-[9px] font-semibold text-cyan-200/85">{box.conf}%</span>
        </div>
      </div>
    </motion.div>
  );
}

function Corner({ className }: Readonly<{ className: string }>) {
  return (
    <span className={`absolute h-3 w-3 border-cyan-300 ${className}`} />
  );
}
