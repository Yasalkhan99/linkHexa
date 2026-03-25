import type { ReactNode } from "react";
import PublisherDashboardNavbar from "@/components/publisher/PublisherDashboardNavbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <PublisherDashboardNavbar />
      {/* Match publisher nav: 3.75rem bar + 1px border — avoids extra same-color strip under the hairline */}
      <div className="pt-[calc(3.75rem+1px)]">{children}</div>
    </div>
  );
}
