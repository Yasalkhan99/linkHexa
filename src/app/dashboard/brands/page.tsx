import type { Metadata } from "next";
import { Suspense } from "react";
import BrandsGridContent from "./BrandsGridContent";

export const metadata: Metadata = {
  title: "Available brands | LinkHexa",
  description: "Browse and apply to Awin programmes.",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 pt-24 flex items-center justify-center text-zinc-400">Loading…</div>
      }
    >
      <BrandsGridContent />
    </Suspense>
  );
}
