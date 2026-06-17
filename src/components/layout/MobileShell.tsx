"use client";

import { useEffect, useState } from "react";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { useMaterialOpsStore } from "@/store/useMaterialOpsStore";

interface MobileShellProps {
  children: React.ReactNode;
}

export function MobileShell({ children }: Readonly<MobileShellProps>) {
  const theme = useMaterialOpsStore((s) => s.theme);
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    const mq = globalThis.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const isDark = theme === "dark" || (theme === "system" && systemDark);

  return (
    <div
      className={`min-h-screen bg-ops-navy py-0 sm:py-8 ${isDark ? "theme-dark" : ""}`}
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(31,157,102,0.18),transparent_45%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-ops-bg font-sans text-ops-ink shadow-[0_30px_120px_rgba(0,0,0,0.5)] sm:min-h-[860px] sm:rounded-[40px] sm:border sm:border-black/10">
        <div className="flex-1 overflow-y-auto px-5 pb-4 pt-6">{children}</div>
        <MobileBottomNav />
      </div>
    </div>
  );
}
