export default function AwinPlaceholderContent({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <>
      <h1
        className="text-2xl font-bold text-white"
        style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
      >
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">{body}</p>
      <div className="mt-8 rounded-xl border border-dashed border-white/15 bg-zinc-900/40 p-8 text-center text-sm text-zinc-500">
        Coming soon — this section will map to the next Awin API module (same pattern as Programs).
      </div>
    </>
  );
}
