import type { Metadata } from "next";
import { Suspense } from "react";
import SignupContent from "./SignupContent";

export const metadata: Metadata = {
  title: "Sign up | LinkHexa",
  description: "Create your LinkHexa account. Join as a publisher or advertiser and start growing.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading…</div>}>
      <SignupContent />
    </Suspense>
  );
}
