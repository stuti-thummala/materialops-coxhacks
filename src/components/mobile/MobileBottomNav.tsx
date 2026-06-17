"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListChecks, ScanLine, Camera, MapPinned, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMaterialOpsStore } from "@/store/useMaterialOpsStore";
import { translate } from "@/lib/i18n";

const navItems = [
  { key: "nav.tasks", href: "/mobile/tasks", icon: ListChecks },
  { key: "nav.scan", href: "/mobile/scan", icon: ScanLine },
  { key: "nav.report", href: "/mobile/report", icon: MapPinned },
  { key: "nav.proof", href: "/mobile/progress/T-24781", icon: Camera },
  { key: "nav.account", href: "/mobile/account", icon: UserRound },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const language = useMaterialOpsStore((s) => s.language);
  return (
    <nav className="sticky bottom-0 z-20 mt-auto border-t border-ops-border bg-ops-surface/95 px-2 py-2 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const label = translate(language, item.key);
          const active = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium transition",
                active ? "text-ops-green" : "text-ops-muted hover:text-ops-ink",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
