"use client";

import { useState } from "react";
import { LinkIcon, Loader2 } from "lucide-react";

export function ShareLinkPanel({ planId, studentId }: { planId: string; studentId: string }) {
  const [magicLink, setMagicLink] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createLink = async () => {
    setIsLoading(true);
    setError("");
    setMagicLink("");

    const response = await fetch("/api/magic-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, studentId })
    });

    const payload = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Could not create magic link");
      return;
    }

    setMagicLink(payload.url);
  };

  return (
    <section className="rounded-lg border border-oat bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Student magic link</h2>
          <p className="mt-1 text-sm text-ink/70">Creates a 14-day token and stores only its SHA-256 hash.</p>
        </div>
        <button className="btn-primary" onClick={createLink} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
          Generate link
        </button>
      </div>
      {magicLink ? (
        <input className="form-input mt-4 font-mono text-xs" readOnly value={magicLink} onFocus={(event) => event.currentTarget.select()} />
      ) : null}
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
