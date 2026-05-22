import Link from "next/link";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { EmptyState } from "@/components/empty-state";
import { CoachRepository } from "@/lib/repositories/coach-repository";
import { createCoachClient } from "@/lib/supabase/server";

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = new CoachRepository(await createCoachClient());
  const [student, plans] = await Promise.all([repo.getStudent(id), repo.listPlansForStudent(id)]);

  return (
    <>
      <AppHeader />
      <main className="page-shell">
        <Link href="/dashboard" className="text-sm font-medium text-moss hover:underline">
          Back to dashboard
        </Link>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-ink">{student.name}</h1>
            <p className="mt-1 text-sm text-ink/70">{student.email ?? "No email on file"}</p>
            {student.notes ? <p className="mt-4 max-w-2xl text-sm text-ink/80">{student.notes}</p> : null}
          </div>
          <Link href={`/plans/new?studentId=${student.id}`} className="btn-primary">
            <Plus className="h-4 w-4" />
            New plan
          </Link>
        </div>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-ink">Plans</h2>
          {plans.length === 0 ? (
            <EmptyState
              title="No plans yet"
              body="Create a lesson plan for this student and share it through a secure magic link."
              href={`/plans/new?studentId=${student.id}`}
              cta="Create plan"
            />
          ) : (
            <div className="grid gap-3">
              {plans.map((plan) => (
                <Link key={plan.id} href={`/plans/${plan.id}`} className="rounded-lg border border-oat bg-white p-4 hover:border-moss">
                  <h3 className="font-semibold text-ink">{plan.title}</h3>
                  <p className="mt-1 text-sm text-ink/70">{plan.focus ?? "No focus recorded"}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
