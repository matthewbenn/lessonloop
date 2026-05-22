import Link from "next/link";

export function EmptyState({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <div className="rounded-lg border border-dashed border-oat bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink/70">{body}</p>
      <Link href={href} className="btn-primary mt-5">
        {cta}
      </Link>
    </div>
  );
}
