import { NextResponse } from "next/server";
import { createAdminClient, createCoachClient } from "@/lib/supabase/server";

const isSafePath = (value: string) => value.startsWith("/") && !value.startsWith("//");

const isAlreadyRegisteredError = (error: { message?: string; code?: string; status?: number }) =>
  error.status === 422 || error.code === "email_exists" || error.message?.toLowerCase().includes("already");

const devLoginAllowed = (url: URL) =>
  process.env.DEV_LOGIN_ENABLED === "true" || (process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(url.hostname));

const requestOrigin = (request: Request, fallback: URL) => {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? fallback.host;
  const protocol = request.headers.get("x-forwarded-proto") ?? fallback.protocol.replace(":", "");
  return `${protocol}://${host}`;
};

const ensureDevUser = async (email: string, password: string) => {
  const admin = createAdminClient();
  const createResult = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: "Dev Coach"
    }
  });

  if (!createResult.error) return;
  if (!isAlreadyRegisteredError(createResult.error)) throw createResult.error;

  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw error;

  const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error("Dev coach user exists but could not be loaded.");

  const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
    user_metadata: {
      ...user.user_metadata,
      name: user.user_metadata?.name ?? "Dev Coach"
    }
  });

  if (updateError) throw updateError;
};

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestOrigin(request, requestUrl);
  const nextParam = requestUrl.searchParams.get("next") ?? "/dashboard";
  const next = isSafePath(nextParam) ? nextParam : "/dashboard";

  if (!devLoginAllowed(requestUrl)) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Dev login is disabled.")}`, origin));
  }

  const email = process.env.DEV_COACH_EMAIL ?? "dev-coach@lessonloop.local";
  const password = process.env.DEV_COACH_PASSWORD ?? "lessonloop-dev-password";

  try {
    await ensureDevUser(email, password);

    const supabase = await createCoachClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw error;

    return NextResponse.redirect(new URL(next, origin));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete dev login.";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, origin));
  }
}
