import Link from "next/link";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { EmptyState } from "@/components/empty-state";
import { SetupNeeded } from "@/components/setup-needed";
import { CoachRepository } from "@/lib/repositories/coach-repository";
import { isMissingSchemaError } from "@/lib/repositories/repository-error";
import { createCoachClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const repo = new CoachRepository(await createCoachClient());
  let students = [];

  try {
    students = await repo.listStudents();
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

  return (
    <>
      <AppHeader />
      <main className="page-shell">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-clay">Dashboard</p>
            <h1 className="text-3xl font-semibold text-ink">Students</h1>
          </div>
          <Link href="/students/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            New student
          </Link>
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
