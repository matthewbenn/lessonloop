import type { PlanCompletionState } from "@/types/domain";

export function isPlanOverdue(plan: { completion_state: PlanCompletionState; due_at: string | null }) {
  return plan.completion_state === "pending" && Boolean(plan.due_at) && new Date(plan.due_at as string).getTime() < Date.now();
}

export function PlanStatusBadge({ completionState, isOverdue }: { completionState: PlanCompletionState; isOverdue: boolean }) {
  if (completionState === "completed") {
    return <span className="rounded-full bg-moss/10 px-2.5 py-1 text-xs font-semibold uppercase text-moss">Completed</span>;
  }

  if (isOverdue) {
    return <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold uppercase text-red-700">Overdue</span>;
  }

  return <span className="rounded-full bg-clay/10 px-2.5 py-1 text-xs font-semibold uppercase text-clay">Pending</span>;
}

export function DueDateText({ dueAt }: { dueAt: string | null }) {
  return <span>{dueAt ? `Due ${new Date(dueAt).toLocaleDateString()}` : "No due date"}</span>;
}
