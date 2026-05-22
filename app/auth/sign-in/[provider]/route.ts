import { NextResponse } from "next/server";
import { createCoachClient } from "@/lib/supabase/server";

const isProvider = (provider: string): provider is "google" | "apple" => provider === "google" || provider === "apple";

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (!isProvider(provider)) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Unsupported auth provider")}`, requestUrl.origin));
  }

  const supabase = await createCoachClient();
  const redirectTo = `${requestUrl.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo
    }
  });

  if (error || !data.url) {
    const message = error?.message ?? "Supabase did not return an OAuth URL.";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, requestUrl.origin));
  }

  return NextResponse.redirect(data.url);
}
