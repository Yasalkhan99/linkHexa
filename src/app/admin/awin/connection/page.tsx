import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import AwinConnectionContent from "./AwinConnectionContent";

export const metadata: Metadata = {
  title: "Awin Connection | Admin | LinkHexa",
  description: "Awin API connection status.",
};

export default function Page() {
  return (
    <AdminShell>
      <AwinConnectionContent />
    </AdminShell>
  );
}
