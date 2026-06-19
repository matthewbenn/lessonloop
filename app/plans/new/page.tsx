import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { CoachRepository } from "@/lib/repositories/coach-repository";
import { createCoachClient } from "@/lib/supabase/server";
import { PlanPreviewForm } from "./plan-preview-form";

export default async function NewPlanPage({ searchParams }: { searchParams: Promise<{ studentId?: string }> }) {
  const { studentId } = await searchParams;
  const repo = new CoachRepository(await createCoachClient());
  const students = await repo.listStudents();
  const selectedStudent = studentId ?? students[0]?.id;

  return (
    <>
      <AppHeader />
      <main className="page-shell max-w-5xl">
        <Link href={selectedStudent ? `/students/${selectedStudent}` : "/dashboard"} className="text-sm font-medium text-moss hover:underline">
          Back
        </Link>
        <h1 className="mt-4 text-3xl font-semibold text-ink">New plan</h1>
        <PlanPreviewForm students={students} selectedStudentId={selectedStudent} />
      </main>
    </>
  );
}
