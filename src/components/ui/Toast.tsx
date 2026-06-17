"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    window.setTimeout(() => setMessage(null), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fade-up">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-[#0b2034]/95 px-5 py-3 text-sm font-medium text-emerald-100 shadow-[0_0_40px_rgba(34,197,94,0.25)] backdrop-blur-xl">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            {message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { showToast: () => undefined };
  }
  return ctx;
}
