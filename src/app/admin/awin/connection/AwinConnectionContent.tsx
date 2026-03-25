"use client";

import { useState } from "react";

export default function AwinConnectionContent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const test = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/awin/connection", { credentials: "include" });
      const data = await res.json();
      if (data.ok) {
        setResult(
          `Connected. Sample joined programmes from Awin: ${data.joinedProgrammeCount ?? 0}.`
        );
      } else {
        setResult(data.message || data.error || "Connection check failed.");
      }
    } catch {
      setResult("Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1
        className="text-2xl font-bold text-white"
        style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
      >
        Awin — Connection
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Server-side only: set <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-200">AWIN_API_TOKEN</code> and{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-200">AWIN_PUBLISHER_ID</code> in{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-200">.env.local</code>. Tokens are never sent to the
        browser.
      </p>
      <div className="mt-8 rounded-xl border border-white/10 bg-zinc-900/80 p-6">
        <p className="text-sm text-zinc-400">
          Run a live call to Awin (joined programmes) to verify credentials and rate limits.
        </p>
        <button
          type="button"
          onClick={test}
          disabled={loading}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Testing…" : "Test connection"}
        </button>
        {result && <p className="mt-4 text-sm text-zinc-300">{result}</p>}
      </div>
    </>
  );
}
