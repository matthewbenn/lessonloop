import { NextResponse } from "next/server";
import { generateLessonPlan } from "@/lib/ai/lesson-plan-generator";
import { CoachRepository } from "@/lib/repositories/coach-repository";
import { createCoachClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { studentId, coachingNotes } = (await request.json()) as {
      studentId?: string;
      coachingNotes?: string;
    };

    if (!studentId || !coachingNotes?.trim()) {
      return NextResponse.json({ error: "studentId and coachingNotes are required" }, { status: 400 });
    }

    const repo = new CoachRepository(await createCoachClient());
    const student = await repo.getStudent(studentId);
    const plan = await generateLessonPlan({
      studentName: student.name,
      notes: coachingNotes.trim()
    });

    return NextResponse.json(plan);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate plan preview";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
