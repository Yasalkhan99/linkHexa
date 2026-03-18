import type { Metadata } from "next";
import LoginContent from "./LoginContent";

export const metadata: Metadata = {
  title: "Log in | LinkHexa",
  description: "Log in to your LinkHexa account. Access your publisher or advertiser dashboard.",
};

export default function LoginPage() {
  return <LoginContent />;
}
