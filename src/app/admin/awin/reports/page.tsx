import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import AwinPlaceholderContent from "@/components/admin/AwinPlaceholderContent";

export const metadata: Metadata = {
  title: "Awin Reports | Admin | LinkHexa",
};

export default function Page() {
  return (
    <AdminShell>
      <AwinPlaceholderContent
        title="Awin — Reports"
        body="Performance reports (clicks, sales) will use Awin Advertiser Performance or Publisher APIs and render here."
      />
    </AdminShell>
  );
}
