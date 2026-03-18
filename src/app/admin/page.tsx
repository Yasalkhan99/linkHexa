import type { Metadata } from "next";
import AdminDashboardContent from "./AdminDashboardContent";

export const metadata: Metadata = {
  title: "Admin Dashboard | LinkHexa",
  description: "LinkHexa admin dashboard.",
};

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}
