"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSignupsSection from "@/components/admin/AdminSignupsSection";

export default function AdminDashboardContent() {
  return (
    <AdminShell>
      <AdminSignupsSection />
    </AdminShell>
  );
}
