import { NextResponse } from "next/server";
import { StudentTokenRepository } from "@/lib/repositories/student-token-repository";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { token, completed, notes } = (await request.json()) as {
      token?: string;
      completed?: boolean;
      notes?: string;
    };

    if (!token || typeof completed !== "boolean") {
      return NextResponse.json({ error: "token and completed are required" }, { status: 400 });
    }

    const repo = new StudentTokenRepository(createAdminClient());
    const report = await repo.submitReport({ rawToken: token, completed, notes });

    if (!report) {
      return NextResponse.json({ error: "This link is invalid or expired" }, { status: 404 });
    }

    return NextResponse.json({
      status: {
        completed: report.completed,
        latestReport: report
      }
    });
  } catch {
    return NextResponse.json({ error: "Unable to submit report" }, { status: 500 });
  }
}
