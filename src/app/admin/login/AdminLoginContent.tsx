"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const inputClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

export default function AdminLoginContent() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data?.error || "Invalid password.");
        return;
      }
      router.replace("/admin");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[100px]" />
      </div>
      <div className="relative w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <Image src="/LinkHexa Logo Svg.svg" alt="LinkHexa" width={120} height={38} className="h-9 w-auto" />
        </Link>
        <div className="mt-10 rounded-2xl border border-white/10 bg-zinc-900/80 p-6 backdrop-blur-sm">
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>
            Admin Login
          </h1>
          <p className="mt-1 text-sm text-zinc-400">Enter the admin password to continue.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {status === "error" && (
              <p className="rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-400">{errorMessage}</p>
            )}
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-zinc-300">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-lg bg-amber-600 py-3 font-semibold text-white transition-colors hover:bg-amber-500 disabled:opacity-70"
            >
              {status === "loading" ? "Checking…" : "Log in"}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
