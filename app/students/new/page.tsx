import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { createStudentAction } from "@/app/actions";

export default function NewStudentPage() {
  return (
    <>
      <AppHeader />
      <main className="page-shell max-w-3xl">
        <Link href="/dashboard" className="text-sm font-medium text-moss hover:underline">
          Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-semibold text-ink">New student</h1>
        <form action={createStudentAction} className="mt-6 grid gap-5 rounded-lg border border-oat bg-white p-6">
          <label className="grid gap-2">
            <span className="form-label">Name</span>
            <input className="form-input" name="name" required />
          </label>
          <label className="grid gap-2">
            <span className="form-label">Email</span>
            <input className="form-input" name="email" type="email" />
          </label>
          <label className="grid gap-2">
            <span className="form-label">Notes</span>
            <textarea className="form-input min-h-28" name="notes" />
          </label>
          <button className="btn-primary w-fit" type="submit">
            Create student
          </button>
        </form>
      </main>
    </>
  );
}
