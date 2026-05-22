import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { createPlanAction } from "@/app/actions";
import { CoachRepository } from "@/lib/repositories/coach-repository";
import { createCoachClient } from "@/lib/supabase/server";

const starterPlan = JSON.stringify(
  {
    warmup: ["5 minutes easy review"],
    practice: ["Main drill", "Targeted repetition"],
    reflection: ["What felt easier today?"]
  },
  null,
  2
);

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
            <span className="form-label">Title</span>
            <input className="form-input" name="title" required placeholder="Week 4 bow hold reset" />
          </label>
          <label className="grid gap-2">
            <span className="form-label">Focus</span>
            <input className="form-input" name="focus" placeholder="Tone consistency and relaxed right hand" />
          </label>
          <label className="grid gap-2">
            <span className="form-label">Main cue</span>
            <input className="form-input" name="mainCue" placeholder="Heavy elbow, soft thumb" />
          </label>
          <label className="grid gap-2">
            <span className="form-label">Booking link</span>
            <input className="form-input" name="bookingLink" type="url" placeholder="https://cal.com/..." />
          </label>
          <label className="grid gap-2">
            <span className="form-label">Plan JSON</span>
            <textarea className="form-input min-h-56 font-mono text-xs" name="planJson" defaultValue={starterPlan} />
          </label>
          <button className="btn-primary w-fit" type="submit" disabled={students.length === 0}>
            Create plan
          </button>
        </form>
      </main>
    </>
  );
}
