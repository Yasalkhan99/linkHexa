import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import AwinApplicationsContent from "./AwinApplicationsContent";

export const metadata: Metadata = {
  title: "Awin Applications | Admin | LinkHexa",
  description: "Approve publisher applications to Awin programmes.",
};

export default function Page() {
  return (
    <AdminShell>
      <AwinApplicationsContent />
    </AdminShell>
  );
}
