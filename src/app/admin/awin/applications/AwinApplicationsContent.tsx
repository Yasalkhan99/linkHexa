"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AppRow = {
  id: string;
  status: string;
  created_at: string;
  publisher_email: string;
  publisher_name: string;
  programme_name: string;
  programme_id: number;
};

export default function AwinApplicationsContent() {
  const [rows, setRows] = useState<AppRow[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const pendingIds = useMemo(
    () => rows.filter((r) => r.status === "pending").map((r) => r.id),
    [rows]
  );
  const allPendingSelected =
    pendingIds.length > 0 && pendingIds.every((id) => selected.includes(id));
  const somePendingSelected = pendingIds.some((id) => selected.includes(id)) && !allPendingSelected;

  useEffect(() => {
    const el = selectAllRef.current;
    if (el) el.indeterminate = somePendingSelected;
  }, [somePendingSelected]);

  const load = async () => {
    const res = await fetch("/api/admin/awin/applications", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setRows(data.applications ?? []);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const patch = async (id: string, status: "approved" | "rejected") => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/awin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        setSelected((s) => s.filter((x) => x !== id));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleRow = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const toggleSelectAllPending = () => {
    if (allPendingSelected) {
      setSelected((s) => s.filter((id) => !pendingIds.includes(id)));
    } else {
      setSelected((s) => [...new Set([...s, ...pendingIds])]);
    }
  };

  const bulkPatch = async (status: "approved" | "rejected") => {
    const ids = selected.filter((id) => pendingIds.includes(id));
    if (ids.length === 0) return;
    setBulkLoading(true);
    setBulkError(null);
    try {
      const res = await fetch("/api/admin/awin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids, status }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; updated?: { id: string }[] };
      if (!res.ok) {
        setBulkError(data.error || "Bulk update failed.");
        return;
      }
      const updatedSet = new Set((data.updated ?? []).map((u) => u.id));
      setRows((prev) => prev.map((r) => (updatedSet.has(r.id) ? { ...r, status } : r)));
      setSelected((s) => s.filter((id) => !updatedSet.has(id)));
    } finally {
      setBulkLoading(false);
    }
  };

  const selectedPendingCount = selected.filter((id) => pendingIds.includes(id)).length;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  return (
    <>
      <h1
        className="text-2xl font-bold text-white"
        style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
      >
        Awin — Applications
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-zinc-400">
        Publishers apply for brands from <strong className="text-zinc-300">Dashboard → Available brands</strong>. Approve
        to allow them to treat the programme as part of &quot;My brands&quot; (same flow as a typical network admin queue).
      </p>
      {rows.length > 0 && pendingIds.length > 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-400">
            <span className="font-medium text-zinc-200">{selectedPendingCount}</span> pending
            {selectedPendingCount === 1 ? "" : "s"} selected
            {pendingIds.length > 0 && (
              <span className="text-zinc-600"> · {pendingIds.length} pending total</span>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected([])}
              disabled={selected.length === 0 || bulkLoading}
              className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear selection
            </button>
            <button
              type="button"
              onClick={() => bulkPatch("approved")}
              disabled={selectedPendingCount === 0 || bulkLoading}
              className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {bulkLoading ? "Updating…" : "Approve selected"}
            </button>
            <button
              type="button"
              onClick={() => bulkPatch("rejected")}
              disabled={selectedPendingCount === 0 || bulkLoading}
              className="rounded-md border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reject selected
            </button>
          </div>
        </div>
      )}
      {bulkError && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {bulkError}
        </p>
      )}
      <div className="mt-8 overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/80">
        {rows.length === 0 ? (
          <p className="p-6 text-center text-zinc-500">No applications yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <th className="w-12 p-4 font-medium" scope="col">
                  {pendingIds.length > 0 ? (
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allPendingSelected}
                      onChange={toggleSelectAllPending}
                      className="h-4 w-4 rounded border-white/30 bg-zinc-800 text-emerald-600 focus:ring-emerald-500/40"
                      aria-label="Select all pending applications"
                    />
                  ) : (
                    <span className="sr-only">Select</span>
                  )}
                </th>
                <th className="p-4 font-medium">Publisher</th>
                <th className="p-4 font-medium">Programme</th>
                <th className="p-4 font-medium">Applied</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="p-4 align-top">
                    {r.status === "pending" ? (
                      <input
                        type="checkbox"
                        checked={selected.includes(r.id)}
                        onChange={() => toggleRow(r.id)}
                        disabled={bulkLoading}
                        className="h-4 w-4 rounded border-white/30 bg-zinc-800 text-emerald-600 focus:ring-emerald-500/40 disabled:opacity-50"
                        aria-label={`Select application ${r.programme_name}`}
                      />
                    ) : (
                      <span className="inline-block w-4" aria-hidden />
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-white">{r.publisher_email || "—"}</div>
                    <div className="mt-0.5 text-zinc-500">{r.publisher_name || "—"}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-white">{r.programme_name}</div>
                    <div className="mt-0.5 text-xs text-zinc-500">Awin ID: {r.programme_id}</div>
                  </td>
                  <td className="p-4 text-zinc-400">{formatDate(r.created_at)}</td>
                  <td className="p-4">
                    <span
                      className={
                        r.status === "approved"
                          ? "text-emerald-400"
                          : r.status === "rejected"
                            ? "text-red-400"
                            : "text-amber-400"
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {r.status === "pending" && (
                      <span className="inline-flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => patch(r.id, "approved")}
                          disabled={updatingId === r.id}
                          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => patch(r.id, "rejected")}
                          disabled={updatingId === r.id}
                          className="rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
