import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { LessonPlanSections } from "@/components/lesson-plan-sections";
import { CoachRepository } from "@/lib/repositories/coach-repository";
import { createCoachClient } from "@/lib/supabase/server";
import { ShareLinkPanel } from "./share-link-panel";

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = new CoachRepository(await createCoachClient());
  const [plan, reports] = await Promise.all([repo.getPlan(id), repo.listReportsForPlan(id)]);
  const student = await repo.getStudent(plan.student_id);

  return (
    <>
      <AppHeader />
      <main className="page-shell">
        <Link href={`/students/${plan.student_id}`} className="text-sm font-medium text-moss hover:underline">
          Back to {student.name}
        </Link>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section>
            <p className="text-sm font-medium text-clay">{student.name}</p>
            <h1 className="mt-1 text-3xl font-semibold text-ink">{plan.title}</h1>
            <dl className="mt-6 grid gap-4 rounded-lg border border-oat bg-white p-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase text-ink/50">Focus</dt>
                <dd className="mt-1 text-sm text-ink">{plan.focus ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-ink/50">Main cue</dt>
                <dd className="mt-1 text-sm text-ink">{plan.main_cue ?? "Not set"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase text-ink/50">Booking</dt>
                <dd className="mt-1 text-sm text-ink">
                  {plan.booking_link ? (
                    <a className="text-moss hover:underline" href={plan.booking_link}>
                      {plan.booking_link}
                    </a>
                  ) : (
                    "Not set"
                  )}
                </dd>
              </div>
            </dl>
            <LessonPlanSections planJson={plan.plan_json} showCoachNotes />
          </section>

          <aside className="grid content-start gap-5">
            <ShareLinkPanel planId={plan.id} studentId={plan.student_id} />
            <section className="rounded-lg border border-oat bg-white p-5">
              <h2 className="text-lg font-semibold text-ink">Completion reports</h2>
              {reports.length === 0 ? (
                <p className="mt-3 text-sm text-ink/70">No student submissions yet.</p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {reports.map((report) => (
                    <div key={report.id} className="rounded-md border border-oat p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-ink">{report.completed ? "Completed" : "Not completed"}</span>
                        <span className="text-xs text-ink/50">{new Date(report.created_at).toLocaleString()}</span>
                      </div>
                      {report.notes ? <p className="mt-2 text-sm text-ink/70">{report.notes}</p> : null}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
