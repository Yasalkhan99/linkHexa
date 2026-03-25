import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import AwinProgramsContent from "./AwinProgramsContent";

export const metadata: Metadata = {
  title: "Awin Programs | Admin | LinkHexa",
  description: "Synced Awin programmes.",
};

export default function Page() {
  return (
    <AdminShell>
      <AwinProgramsContent />
    </AdminShell>
  );
}
