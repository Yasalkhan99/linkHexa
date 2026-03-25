import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import AwinPlaceholderContent from "@/components/admin/AwinPlaceholderContent";

export const metadata: Metadata = {
  title: "Awin Tracking links | Admin | LinkHexa",
};

export default function Page() {
  return (
    <AdminShell>
      <AwinPlaceholderContent
        title="Awin — Tracking links"
        body="Link Builder and short-link resolution (/go/…) will be wired here so admins can audit generated URLs."
      />
    </AdminShell>
  );
}
