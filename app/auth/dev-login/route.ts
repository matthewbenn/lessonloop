import { NextResponse } from "next/server";
import { requestOrigin, safeNextPath } from "@/lib/auth-redirect";
import { createAdminClient, createCoachClient } from "@/lib/supabase/server";

const isAlreadyRegisteredError = (error: { message?: string; code?: string; status?: number }) =>
  error.status === 422 || error.code === "email_exists" || error.message?.toLowerCase().includes("already");

const devLoginAllowed = (url: URL) =>
  process.env.DEV_LOGIN_ENABLED === "true" || ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(url.hostname);

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

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestOrigin(request);
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  const loginRedirect = (message: string) => {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("next", next);
    loginUrl.searchParams.set("error", message);
    return NextResponse.redirect(loginUrl, 303);
  };

  if (!devLoginAllowed(requestUrl)) {
    return loginRedirect("Dev login is disabled.");
  }

  const email = process.env.DEV_COACH_EMAIL ?? "dev-coach@lessonloop.local";
  const password = process.env.DEV_COACH_PASSWORD ?? "lessonloop-dev-password";

  try {
    await ensureDevUser(email, password);

    const supabase = await createCoachClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw error;

    return NextResponse.redirect(new URL(next, origin), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete dev login.";
    return loginRedirect(message);
  }
}
