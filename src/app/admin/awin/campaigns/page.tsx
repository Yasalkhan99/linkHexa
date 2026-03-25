import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import AwinPlaceholderContent from "@/components/admin/AwinPlaceholderContent";

export const metadata: Metadata = {
  title: "Awin Campaigns | Admin | LinkHexa",
};

export default function Page() {
  return (
    <AdminShell>
      <AwinPlaceholderContent
        title="Awin — Campaigns"
        body="Campaign-level data from Awin can be layered on top of programmes when you are ready (e.g. promotions, segments)."
      />
    </AdminShell>
  );
}
