import { Sidebar } from "./Sidebar";
import { AppFooter } from "./AppFooter";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";

interface AppShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: boolean;
}

export function AppShell({ children, header, footer = true }: AppShellProps) {
  return (
    <div className="min-h-screen bg-ops-bg font-sans text-ops-ink">
      <Onboarding />
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-[230px]">
        {header}
        <main className="flex-1">
          <div className="mx-auto max-w-[1400px] px-8 py-6">{children}</div>
        </main>
        {footer && <AppFooter />}
      </div>
      <AssistantPanel />
    </div>
  );
}
