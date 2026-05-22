"use server";

import { redirect } from "next/navigation";
import { generateLessonPlan } from "@/lib/ai/lesson-plan-generator";
import { CoachRepository } from "@/lib/repositories/coach-repository";
import { createCoachClient } from "@/lib/supabase/server";

const getCoachRepo = async () => new CoachRepository(await createCoachClient());

export async function createStudentAction(formData: FormData) {
  const repo = await getCoachRepo();
  const student = await repo.createStudent({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    notes: String(formData.get("notes") ?? "")
  });

  redirect(`/students/${student.id}`);
}

export async function createPlanAction(formData: FormData) {
  const repo = await getCoachRepo();
  const studentId = String(formData.get("studentId") ?? "");
  const coachingNotes = String(formData.get("coachingNotes") ?? "").trim();
  const student = await repo.getStudent(studentId);
  const generatedPlan = await generateLessonPlan({
    studentName: student.name,
    notes: coachingNotes
  });

  const plan = await repo.createPlan({
    studentId,
    title: generatedPlan.title,
    focus: generatedPlan.focus,
    mainCue: generatedPlan.mainCue,
    bookingLink: String(formData.get("bookingLink") ?? ""),
    planJson: generatedPlan.planJson
  });

  redirect(`/plans/${plan.id}`);
}
