"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckCircle2, Loader2, Send } from "lucide-react";
import type { StudentPlanPayload } from "@/types/domain";

export function StudentPlanView({ token }: { token: string }) {
  const [data, setData] = useState<StudentPlanPayload | null>(null);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadPlan = async () => {
      const response = await fetch(`/api/student-plan?token=${encodeURIComponent(token)}`);
      const payload = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        setError(payload.error ?? "Unable to load this plan");
        return;
      }

      setData(payload);
    };

    loadPlan();
  }, [token]);

  const submitReport = async (completed: boolean) => {
    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/submit-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, completed, notes })
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to submit report");
      return;
    }

    setData((current) => (current ? { ...current, completion: payload.status } : current));
    setNotes("");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linen">
        <Loader2 className="h-6 w-6 animate-spin text-moss" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-linen px-4">
        <section className="max-w-md rounded-lg border border-oat bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-ink">Link unavailable</h1>
          <p className="mt-2 text-sm text-ink/70">{error}</p>
        </section>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="min-h-screen bg-linen">
      <section className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-sm font-medium text-clay">LessonLoop</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">{data.plan.title}</h1>
        <p className="mt-2 text-sm text-ink/70">For {data.student.name}</p>

        <div className="mt-6 grid gap-4 rounded-lg border border-oat bg-white p-5">
          <div>
            <h2 className="text-sm font-semibold uppercase text-ink/50">Focus</h2>
            <p className="mt-1 text-ink">{data.plan.focus ?? "Your coach did not add a focus."}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase text-ink/50">Main cue</h2>
            <p className="mt-1 text-ink">{data.plan.main_cue ?? "Your coach did not add a cue."}</p>
          </div>
          <pre className="overflow-auto rounded-md bg-linen p-4 text-sm text-ink">{JSON.stringify(data.plan.plan_json, null, 2)}</pre>
          {data.plan.booking_link ? (
            <a className="btn-secondary w-fit" href={data.plan.booking_link}>
              <Calendar className="h-4 w-4" />
              Book next session
            </a>
          ) : null}
        </div>

        <section className="mt-6 rounded-lg border border-oat bg-white p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className={data.completion.completed ? "h-5 w-5 text-moss" : "h-5 w-5 text-ink/30"} />
            <h2 className="text-lg font-semibold text-ink">{data.completion.completed ? "Marked complete" : "Completion report"}</h2>
          </div>
          <textarea
            className="form-input mt-4 min-h-28"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add a quick note for your coach"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={() => submitReport(true)} disabled={isSubmitting}>
              <Send className="h-4 w-4" />
              Submit complete
            </button>
            <button className="btn-secondary" onClick={() => submitReport(false)} disabled={isSubmitting}>
              Save note only
            </button>
          </div>
          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        </section>
      </section>
    </main>
  );
}
