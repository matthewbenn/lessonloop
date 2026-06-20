import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authNextCookie, requestOrigin, safeNextPath } from "@/lib/auth-redirect";
import { createCoachClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestOrigin(request);
  const code = requestUrl.searchParams.get("code");
  const cookieStore = await cookies();
  const next = safeNextPath(cookieStore.get(authNextCookie.name)?.value ?? requestUrl.searchParams.get("next"));

  cookieStore.set(authNextCookie.name, "", {
    ...authNextCookie.options,
    maxAge: 0
  });

  if (code) {
    const supabase = await createCoachClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("error", error.message);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.redirect(new URL(next, origin));
}
