# Compound Engineering

LessonLoop's compound engineering workflow is inspired by https://every.to/guides/compound-engineering. The idea is simple: each meaningful change should make future changes easier by capturing useful decisions, patterns, and solved problems.

This workflow is optional. It is controlled by `.lessonloop/compound-engineering.json`, and the `"enabled"` value in that file is the source of truth.

## Commands

Use these plain-language commands as a standalone message or at the beginning of a task prompt:

- `compound on`: enable compound engineering mode.
- `compound off`: disable compound engineering mode.
- `compound status`: report whether compound engineering mode is enabled or disabled.

If a command is combined with a task, apply the command first, then do the task under the resulting mode. Casual mentions of "compound engineering" are not commands.

## Manual Control

To turn the workflow off manually, edit `.lessonloop/compound-engineering.json` and set:

```json
"enabled": false
```

To turn it back on manually, set:

```json
"enabled": true
```

Disabling the workflow does not remove docs. It only stops Codex from requiring compound workflow steps such as brainstorm docs, implementation plans, review loops, polish passes, or solution notes.

## Workflow

When compound engineering mode is enabled, use this loop for non-trivial work:

ideate → brainstorm → plan → work → review → polish → compound → repeat

Use the parts that fit the task. A small obvious fix can stay lightweight. Product, data, auth, architecture, or user-facing changes should usually leave behind at least a short plan or reusable note.

### Ideate

Turn ambiguity into a focused direction. Clarify the user problem, the product area, the constraints, and the most valuable next move before committing to implementation.

### Brainstorm

Turn a promising idea into requirements. Identify users, desired outcomes, affected screens, data model impact, auth and RLS impact, edge cases, out-of-scope items, and success criteria. Save brainstorm artifacts in `docs/brainstorms/`.

### Plan

Turn requirements into an implementation blueprint. Reuse existing repo patterns, identify files likely to change, call out database or Supabase/RLS work, name UI states, note TypeScript impact, define validation, and list risks. Save implementation plans in `docs/plans/`.

### Work

Implement the plan in small, reviewable steps. Keep LessonLoop's always-on rules intact: protect coach routes, keep dev-only auth out of production, preserve RLS, and keep generated lesson content editable before saving.

### Review

Check correctness, security, data ownership, auth/RLS behavior, UI states, accessibility, tests, and drift from project patterns. Fix important findings before considering the work done.

### Polish

Use the feature like a coach or student would. Look for confusing copy, missing states, awkward flows, visual regressions, and anything that makes the experience feel unfinished.

### Compound

Capture what should be remembered next time. Save architecture or product decisions in `docs/decisions/` and reusable solved-problem notes in `docs/solutions/`. A good solution note explains the problem, the pattern, watch outs, and when to reuse it.

## Artifacts

- Brainstorm docs live in `docs/brainstorms/`.
- Implementation plans live in `docs/plans/`.
- Architecture and product decisions live in `docs/decisions/`.
- Reusable solved-problem notes live in `docs/solutions/`.
- Templates live in `docs/templates/`.
