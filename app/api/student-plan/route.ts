import { NextResponse } from "next/server";
import { StudentTokenRepository } from "@/lib/repositories/student-token-repository";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  try {
    const repo = new StudentTokenRepository(createAdminClient());
    const payload = await repo.getStudentPlan(token);

    if (!payload) {
      return NextResponse.json({ error: "This link is invalid or expired" }, { status: 404 });
    }

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Unable to load plan" }, { status: 500 });
  }
}
