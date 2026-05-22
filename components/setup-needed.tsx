import Link from "next/link";

export function SetupNeeded({ detail }: { detail?: string }) {
  return (
    <div className="rounded-lg border border-clay/30 bg-white p-6">
      <p className="text-sm font-medium text-clay">Supabase setup needed</p>
      <h2 className="mt-2 text-xl font-semibold text-ink">The LessonLoop tables are not in this project yet.</h2>
      <p className="mt-3 text-sm text-ink/70">
        Apply the SQL in <span className="font-mono">supabase/schema.sql</span>, then refresh this page.
      </p>
      {detail ? <p className="mt-3 rounded-md bg-linen p-3 font-mono text-xs text-ink/70">{detail}</p> : null}
      <Link className="btn-secondary mt-5" href="/dashboard">
        Refresh dashboard
      </Link>
    </div>
  );
}
