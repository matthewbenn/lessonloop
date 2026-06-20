import { Apple, Chrome, FlaskConical } from "lucide-react";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next = "/dashboard", error } = await searchParams;
  const encodedNext = encodeURIComponent(next);
  const showDevLogin = process.env.NODE_ENV !== "production" || process.env.DEV_LOGIN_ENABLED === "true";

  return (
    <main className="flex min-h-screen items-center justify-center bg-linen px-4">
      <section className="w-full max-w-sm rounded-lg border border-oat bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium text-clay">LessonLoop</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">Coach sign in</h1>
          <p className="mt-2 text-sm text-ink/70">Manage students, plans, and secure student share links.</p>
        </div>
        <div className="grid gap-3">
          <a className="btn-primary w-full" href={`/auth/sign-in/google?next=${encodedNext}`}>
            <Chrome className="h-4 w-4" />
            Sign in with Google
          </a>
          <a className="btn-secondary w-full" href={`/auth/sign-in/apple?next=${encodedNext}`}>
            <Apple className="h-4 w-4" />
            Sign in with Apple
          </a>
          {showDevLogin ? (
            <form action={`/auth/dev-login?next=${encodedNext}`} method="post">
              <button className="btn-secondary w-full border-dashed" type="submit">
                <FlaskConical className="h-4 w-4" />
                Dev login
              </button>
            </form>
          ) : null}
          {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}
