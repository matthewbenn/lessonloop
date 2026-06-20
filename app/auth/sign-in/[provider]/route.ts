import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authNextCookie, requestOrigin, safeNextPath } from "@/lib/auth-redirect";
import { createCoachClient } from "@/lib/supabase/server";

const isProvider = (provider: string): provider is "google" | "apple" => provider === "google" || provider === "apple";

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const requestUrl = new URL(request.url);
  const origin = requestOrigin(request);
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (!isProvider(provider)) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Unsupported auth provider")}`, origin));
  }

  const supabase = await createCoachClient();
  const cookieStore = await cookies();
  const callbackUrl = new URL("/auth/callback", origin);
  cookieStore.set(authNextCookie.name, next, authNextCookie.options);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl.toString()
    }
  });

  if (error || !data.url) {
    const message = error?.message ?? "Supabase did not return an OAuth URL.";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, origin));
  }

  return NextResponse.redirect(data.url);
}
