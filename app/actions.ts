"use server";

import { redirect } from "next/navigation";
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
  const planJsonText = String(formData.get("planJson") ?? "{}");
  let planJson: Record<string, unknown>;

  try {
    planJson = JSON.parse(planJsonText);
  } catch {
    planJson = { raw: planJsonText };
  }

  const plan = await repo.createPlan({
    studentId,
    title: String(formData.get("title") ?? "Untitled plan"),
    focus: String(formData.get("focus") ?? ""),
    mainCue: String(formData.get("mainCue") ?? ""),
    bookingLink: String(formData.get("bookingLink") ?? ""),
    dueAt: String(formData.get("dueAt") ?? ""),
    planJson
  });

  redirect(`/plans/${plan.id}`);
}
