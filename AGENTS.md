# LessonLoop Agent Instructions

LessonLoop is a Next.js App Router, TypeScript, and Tailwind app backed by Supabase. These instructions apply to Codex and other AI coding agents working in this repository.

## Always-On LessonLoop Rules

- Preserve existing route protection for coach routes, including `/dashboard`, `/students`, and `/plans`.
- Do not enable dev-only auth in production. The local/dev login flow must remain restricted to local or explicitly enabled development use.
- Do not bypass Supabase RLS.
- Prefer small, reviewable changes.
- Keep generated AI output editable by the coach before saving.
- Use structured lesson sections in the UI, not raw JSON.
- Run lint, typecheck, and tests when possible.
- Explain any validation that could not be run.
- Coach-owned records should include `coach_id`.
- New Supabase tables need RLS policies.
- Use audit fields where appropriate: `created_at`, `updated_at`, `created_by`, and `updated_by`.
- Prefer explicit workflow status fields over inferred state.

## Compound Engineering Mode

Compound engineering mode is an optional workflow inspired by https://every.to/guides/compound-engineering. It is controlled by `.lessonloop/compound-engineering.json`, which is the source of truth for whether the mode is enabled.

When `.lessonloop/compound-engineering.json` has `"enabled": true`, use the compound workflow for non-trivial changes: ideate → brainstorm → plan → work → review → polish → compound → repeat. Scale the workflow to the task. Small, obvious fixes do not need every artifact, but meaningful product, data, auth, architecture, or user-facing changes should leave useful notes behind.

When `.lessonloop/compound-engineering.json` has `"enabled": false`, use normal lightweight repo instructions. Do not require brainstorm docs, implementation plans, solution notes, or compound review loops. Continue following the always-on LessonLoop rules above.

### Compound engineering commands

Codex should recognize these user commands when they appear as a standalone message or at the beginning of a task prompt:

- `compound on`
- `compound off`
- `compound status`

Command behavior:

- If the user says `compound on`, update `.lessonloop/compound-engineering.json` so `"enabled": true`, confirm that compound engineering mode is enabled, and perform future non-trivial changes with the compound workflow.
- If the user says `compound off`, update `.lessonloop/compound-engineering.json` so `"enabled": false`, confirm that compound engineering mode is disabled, and do not require brainstorm docs, implementation plans, solution notes, or compound review loops for future work.
- If the user says `compound status`, read `.lessonloop/compound-engineering.json`, report whether compound engineering mode is currently enabled or disabled, and do not make other changes unless the user also asks for them.

Important command handling rules:

- Do not treat casual mentions of "compound engineering" as commands.
- Only treat `compound on`, `compound off`, and `compound status` as commands when they appear as a standalone message or at the beginning of the user's prompt.
- If the user combines a command with a task, apply the command first, then perform the task under the resulting mode.
- Do not delete docs when compound engineering is disabled.
- Disabling compound engineering only changes Codex behavior; it does not remove existing documentation.
- Re-enabling compound engineering should not require rebuilding the docs.

### Compound Engineering Artifacts

When compound engineering mode is enabled and the task is substantial enough to benefit from artifacts, use these locations:

- Brainstorm docs: `docs/brainstorms/`
- Implementation plans: `docs/plans/`
- Architecture and product decisions: `docs/decisions/`
- Reusable solved-problem notes: `docs/solutions/`
- Templates: `docs/templates/`
