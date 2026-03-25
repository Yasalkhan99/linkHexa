import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import AwinPlaceholderContent from "@/components/admin/AwinPlaceholderContent";

export const metadata: Metadata = {
  title: "Awin Actions | Admin | LinkHexa",
};

export default function Page() {
  return (
    <AdminShell>
      <AwinPlaceholderContent
        title="Awin — Actions"
        body="Bulk actions and automation (e.g. batch link operations) can live here alongside API logs."
      />
    </AdminShell>
  );
}
