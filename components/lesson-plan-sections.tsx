type LessonPlanData = {
  coach_notes?: unknown;
  summary?: unknown;
  warmup?: unknown;
  lesson_steps?: unknown;
  practice_plan?: unknown;
  success_markers?: unknown;
};

const asText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const asList = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
};

function ListSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-lg border border-oat bg-white p-5">
      <h2 className="text-sm font-semibold uppercase text-ink/50">{title}</h2>
      <ul className="mt-3 grid gap-2 text-sm text-ink">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="rounded-md bg-linen px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LessonPlanSections({ planJson, showCoachNotes = false }: { planJson: Record<string, unknown>; showCoachNotes?: boolean }) {
  const plan = planJson as LessonPlanData;
  const summary = asText(plan.summary);
  const coachNotes = asText(plan.coach_notes);

  return (
    <div className="mt-6 grid gap-4">
      {summary ? (
        <section className="rounded-lg border border-oat bg-white p-5">
          <h2 className="text-sm font-semibold uppercase text-ink/50">Summary</h2>
          <p className="mt-2 text-sm leading-6 text-ink">{summary}</p>
        </section>
      ) : null}
      <ListSection title="Warmup" items={asList(plan.warmup)} />
      <ListSection title="Lesson steps" items={asList(plan.lesson_steps)} />
      <ListSection title="Practice plan" items={asList(plan.practice_plan)} />
      <ListSection title="Success markers" items={asList(plan.success_markers)} />
      {showCoachNotes && coachNotes ? (
        <section className="rounded-lg border border-oat bg-white p-5">
          <h2 className="text-sm font-semibold uppercase text-ink/50">Coach notes</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{coachNotes}</p>
        </section>
      ) : null}
    </div>
  );
}
