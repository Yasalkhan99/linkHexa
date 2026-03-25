"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export default function DashboardContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ username: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace("/login");
        return;
      }
      const { data: row } = await supabase
        .from("profiles")
        .select("username, email, role")
        .eq("id", session.user.id)
        .single();
      if (row) setProfile({ username: row.username, email: row.email, role: row.role });
      else setProfile({
        username: session.user.user_metadata?.username ?? "User",
        email: session.user.email ?? "",
        role: session.user.user_metadata?.role ?? "publisher",
      });
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pb-12 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold text-white sm:text-3xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>
            Dashboard
          </h1>
          <p className="mt-2 text-zinc-400">
            Welcome back{profile?.username ? `, ${profile.username}` : ""}.
          </p>
          <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/80 p-6 backdrop-blur-sm">
            {profile && (
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-zinc-500">Role</dt>
                  <dd className="mt-0.5 font-medium capitalize text-white">{profile.role}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Email</dt>
                  <dd className="mt-0.5 text-white">{profile.email}</dd>
                </div>
              </dl>
            )}
            {profile?.role === "publisher" && (
              <div className="mt-8 space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Awin</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/dashboard/brands"
                    className="rounded-xl border border-white/10 bg-zinc-950/50 p-4 transition-colors hover:border-indigo-500/40 hover:bg-zinc-800/50"
                  >
                    <p className="font-semibold text-white">Available brands</p>
                    <p className="mt-1 text-xs text-zinc-500">Awin joined programmes only; apply for LinkHexa approval.</p>
                  </Link>
                  <Link
                    href="/dashboard/brands?filter=approved"
                    className="rounded-xl border border-white/10 bg-zinc-950/50 p-4 transition-colors hover:border-violet-500/40 hover:bg-zinc-800/50"
                  >
                    <p className="font-semibold text-white">My brands</p>
                    <p className="mt-1 text-xs text-zinc-500">Open the catalogue filtered to approved partners.</p>
                  </Link>
                </div>
              </div>
            )}
            <p className="mt-6 text-zinc-500 text-sm">
              More dashboard tools will appear here as we extend the platform.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              <Image src="/LinkHexa Logo Svg.svg" alt="LinkHexa" width={80} height={26} className="h-5 w-auto" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
