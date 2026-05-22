import Link from "next/link";
import { LogOut } from "lucide-react";

export function AppHeader() {
  return (
    <header className="border-b border-oat bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="text-lg font-semibold text-ink">
          LessonLoop
        </Link>
        <form action="/auth/logout" method="post">
          <button className="btn-secondary" type="submit">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
