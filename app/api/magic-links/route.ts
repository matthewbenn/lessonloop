import { NextResponse } from "next/server";
import { CoachRepository } from "@/lib/repositories/coach-repository";
import { StudentTokenRepository } from "@/lib/repositories/student-token-repository";
import { createMagicToken } from "@/lib/tokens";
import { createAdminClient, createCoachClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { planId, studentId } = (await request.json()) as { planId?: string; studentId?: string };
    if (!planId || !studentId) {
      return NextResponse.json({ error: "planId and studentId are required" }, { status: 400 });
    }

    const coachRepo = new CoachRepository(await createCoachClient());
    const coachId = await coachRepo.requireUserId();
    const plan = await coachRepo.getPlan(planId);

    if (plan.student_id !== studentId) {
      return NextResponse.json({ error: "Plan does not belong to this student" }, { status: 400 });
    }

    const rawToken = createMagicToken();
    const tokenRepo = new StudentTokenRepository(createAdminClient());
    await tokenRepo.createMagicLink({ coachId, studentId, planId, rawToken });

    const origin = new URL(request.url).origin;
    return NextResponse.json({ url: `${origin}/p/${rawToken}`, expiresInDays: 14 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create magic link";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
