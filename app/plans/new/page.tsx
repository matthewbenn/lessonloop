import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { createPlanAction } from "@/app/actions";
import { CoachRepository } from "@/lib/repositories/coach-repository";
import { createCoachClient } from "@/lib/supabase/server";

export default async function NewPlanPage({ searchParams }: { searchParams: Promise<{ studentId?: string }> }) {
  const { studentId } = await searchParams;
  const repo = new CoachRepository(await createCoachClient());
  const students = await repo.listStudents();
  const selectedStudent = studentId ?? students[0]?.id;

  return (
    <>
      <AppHeader />
      <main className="page-shell max-w-3xl">
        <Link href={selectedStudent ? `/students/${selectedStudent}` : "/dashboard"} className="text-sm font-medium text-moss hover:underline">
          Back
        </Link>
        <h1 className="mt-4 text-3xl font-semibold text-ink">New plan</h1>
        <form action={createPlanAction} className="mt-6 grid gap-5 rounded-lg border border-oat bg-white p-6">
          <label className="grid gap-2">
            <span className="form-label">Student</span>
            <select className="form-input" name="studentId" defaultValue={selectedStudent} required>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="form-label">Coach notes</span>
            <textarea
              className="form-input min-h-72"
              name="coachingNotes"
              required
              placeholder="Paste or type the raw lesson notes: what happened, what improved, what was hard, what to practice, next steps..."
            />
          </label>
          <label className="grid gap-2">
            <span className="form-label">Booking link</span>
            <input className="form-input" name="bookingLink" type="url" placeholder="https://cal.com/..." />
          </label>
          <button className="btn-primary w-fit" type="submit" disabled={students.length === 0}>
            Generate plan
          </button>
        </form>
      </main>
    </>
  );
}
