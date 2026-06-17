"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MapPin,
  Boxes,
  Truck,
  Leaf,
  Settings,
  Radio,
  TrendingUp,
  Building2,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Command", href: "/dashboard", icon: Home },
  { label: "3D Command Center", href: "/command", icon: Globe },
  { label: "Forecast", href: "/forecast", icon: TrendingUp },
  { label: "Recovery Zones", href: "/zones", icon: MapPin },
  { label: "Material Batches", href: "/batches", icon: Boxes },
  { label: "Dispatch Center", href: "/dispatch", icon: Truck },
  { label: "Sponsors", href: "/sponsors", icon: Building2 },
  { label: "Impact & Reporting", href: "/impact", icon: Leaf },
  { label: "Settings", href: "/settings", icon: Settings },
];

function StadiumGlyph() {
  return (
    <svg viewBox="0 0 120 70" className="h-12 w-24 text-slate-500">
      <polygon
        points="60,8 96,26 96,48 60,62 24,48 24,26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <ellipse
        cx="60"
        cy="35"
        rx="20"
        ry="11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="60" cy="35" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="24" y1="26" x2="40" y2="30" stroke="currentColor" strokeWidth="1" />
      <line x1="96" y1="26" x2="80" y2="30" stroke="currentColor" strokeWidth="1" />
      <line x1="60" y1="8" x2="60" y2="24" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[230px] flex-col border-r border-black/20 bg-ops-navy lg:flex">
      <div className="px-6 py-6">
        <div className="font-display text-xl font-bold tracking-tight text-white">
          MaterialOps
        </div>
        <div className="mt-0.5 text-xs text-white/45">Mercedes-Benz Stadium</div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-white/[0.08] text-white shadow-[inset_2px_0_0_#1F9D66]"
                  : "text-white/55 hover:bg-white/[0.05] hover:text-white/90",
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px]",
                  active ? "text-ops-green" : "text-white/40",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-1 px-6 py-5">
        <StadiumGlyph />
        <div className="text-center text-xs font-medium text-white/55">
          FIFA World Cup 2026™
        </div>
        <div className="text-center text-xs text-white/35">Atlanta, GA</div>
      </div>

      <div className="px-4 pb-5">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.08]">
          <Radio className="h-4 w-4 text-ops-green" />
          Event Control
        </button>
        <p className="mt-4 text-center text-xs font-medium italic text-ops-green/80">
          Build a better future for the planet
        </p>
      </div>
    </aside>
  );
}
