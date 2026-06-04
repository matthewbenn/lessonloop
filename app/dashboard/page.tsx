import Link from "next/link";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { EmptyState } from "@/components/empty-state";
import { DueDateText, PlanStatusBadge } from "@/components/plan-status";
import { SetupNeeded } from "@/components/setup-needed";
import { CoachRepository } from "@/lib/repositories/coach-repository";
import { isMissingSchemaError } from "@/lib/repositories/repository-error";
import { createCoachClient } from "@/lib/supabase/server";
import type { DashboardPlan, Student } from "@/types/domain";

export default async function DashboardPage() {
  const repo = new CoachRepository(await createCoachClient());
  let students: Student[] = [];
  let plans: DashboardPlan[] = [];

  try {
    [students, plans] = await Promise.all([repo.listStudents(), repo.listDashboardPlans()]);
  } catch (error) {
    if (!isMissingSchemaError(error)) throw error;

    return (
      <>
        <AppHeader />
        <main className="page-shell">
          <SetupNeeded detail={error.message} />
        </main>
      </>
    );
  }

  const pendingPlans = plans.filter((plan) => plan.completion_state === "pending" && !plan.is_overdue);
  const overduePlans = plans.filter((plan) => plan.completion_state === "pending" && plan.is_overdue);
  const completedPlans = plans.filter((plan) => plan.completion_state === "completed");

  return (
    <>
      <AppHeader />
      <main className="page-shell">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-clay">Dashboard</p>
            <h1 className="text-3xl font-semibold text-ink">Plans</h1>
          </div>
          <Link href="/students/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            New student
          </Link>
        </div>

        <div className="grid gap-5">
          <PlanSection title="Overdue" plans={overduePlans} emptyText="No overdue plans." />
          <PlanSection title="Pending" plans={pendingPlans} emptyText="No pending plans." />
          <PlanSection title="Completed" plans={completedPlans} emptyText="No completed plans yet." />
        </div>

        <div className="mb-4 mt-10 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-ink">Students</h2>
        </div>

        {students.length === 0 ? (
          <EmptyState
            title="No students yet"
            body="Create a student profile, add a plan, then generate a magic link for student access."
            href="/students/new"
            cta="Create student"
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-oat bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-linen text-ink/70">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-oat">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-linen/60">
                    <td className="px-4 py-3">
                      <Link className="font-medium text-moss hover:underline" href={`/students/${student.id}`}>
                        {student.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink/70">{student.email ?? "Not provided"}</td>
                    <td className="px-4 py-3 text-ink/70">{new Date(student.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}

function PlanSection({ title, plans, emptyText }: { title: string; plans: DashboardPlan[]; emptyText: string }) {
  return (
    <section className="rounded-lg border border-oat bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <span className="text-sm font-medium text-ink/50">{plans.length}</span>
      </div>

      {plans.length === 0 ? (
        <p className="text-sm text-ink/60">{emptyText}</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <Link key={plan.id} href={`/plans/${plan.id}`} className="rounded-lg border border-oat bg-linen/35 p-4 hover:border-moss">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-ink">{plan.title}</h3>
                  <p className="mt-1 text-sm text-ink/70">{plan.student.name}</p>
                </div>
                <PlanStatusBadge completionState={plan.completion_state} isOverdue={plan.is_overdue} />
              </div>
              <p className="mt-3 text-sm text-ink/70">
                <DueDateText dueAt={plan.due_at} />
              </p>
              {plan.focus ? <p className="mt-2 line-clamp-2 text-sm text-ink/70">{plan.focus}</p> : null}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
