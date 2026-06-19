---
title: Status State Pattern
category: product-state
tags:
  - workflow-state
  - dashboards
  - supabase
created: 2026-06-19
---

# Status State Pattern

## Problem

Workflow records often need a clear product state that coaches can scan quickly. If important state is inferred only from nullable content fields, dashboards and filters become harder to reason about, and future changes risk encoding the same inference in multiple places.

## Solution

Use explicit status fields for workflow records when the state matters to the product. Prefer statuses like `pending`, `complete`, and `overdue` only when the distinction is meaningful to users or system behavior.

Use `completed_at` alongside a status field when the timestamp matters for reporting, ordering, or audit history.

## Pattern

- Add a dedicated status field for important workflow state.
- Keep status values small, named, and tied to product language.
- Avoid inferring important product state only from nullable content fields.
- Use status fields to keep dashboards scannable.
- Add `completed_at` when the completion time matters.
- Protect status updates with proper auth and RLS.

## Watch Outs

- Do not add statuses that are not used by the UI, workflow, or reporting.
- Do not let client-side UI update coach-owned status records without enforcing ownership.
- Keep transitions explicit when a record can move between states.
- Make sure new Supabase tables or status-bearing records include RLS policies.

## Reuse This When

Use this pattern when adding plans, assignments, reports, reminders, review flows, or any coach-owned workflow record that needs to appear in dashboards, filters, or progress summaries.
