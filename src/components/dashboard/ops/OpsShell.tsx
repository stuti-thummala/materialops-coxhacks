import { Sidebar } from "@/components/layout/Sidebar";
import { Onboarding } from "@/components/onboarding/Onboarding";

interface OpsShellProps {
  readonly children: React.ReactNode;
  readonly header?: React.ReactNode;
}

export function OpsShell({ children, header }: OpsShellProps) {
  return (
    <div className="min-h-screen bg-ops-bg font-sans text-ops-ink">
      <Onboarding />
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-[230px]">
        {header}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
