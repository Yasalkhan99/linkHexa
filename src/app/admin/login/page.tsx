import type { Metadata } from "next";
import AdminLoginContent from "./AdminLoginContent";

export const metadata: Metadata = {
  title: "Admin Login | LinkHexa",
  description: "LinkHexa admin sign in.",
};

export default function AdminLoginPage() {
  return <AdminLoginContent />;
}
