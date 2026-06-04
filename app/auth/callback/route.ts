import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createCoachClient } from "@/lib/supabase/server";

const safeNextPath = (next: string | null) => (next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const appUrl = env.appUrl();
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createCoachClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const loginUrl = new URL("/login", appUrl);
      loginUrl.searchParams.set("error", error.message);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.redirect(new URL(next, appUrl));
}
