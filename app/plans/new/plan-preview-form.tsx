"use client";

import type { DragEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ClipboardList, GripVertical, Library, Loader2, Plus, Save, Sparkles, X } from "lucide-react";
import { createPlanAction } from "@/app/actions";
import type { GeneratedLessonPlan } from "@/lib/ai/lesson-plan-generator";
import { DRILL_LIBRARY, type Drill } from "@/lib/drill-library";
import { planTemplates, type PlanTemplate } from "@/lib/plan-templates";
import type { Student } from "@/types/domain";

type PlanSectionId = "warmup" | "lesson_steps" | "practice_plan";

const DRILL_TRANSFER_TYPE = "application/x-lessonloop-drill-id";

const PLAN_SECTIONS: { id: PlanSectionId; label: string; shortLabel: string }[] = [
  { id: "warmup", label: "Warmup", shortLabel: "Warmup" },
  { id: "lesson_steps", label: "Lesson steps", shortLabel: "Lesson" },
  { id: "practice_plan", label: "Practice plan", shortLabel: "Practice" }
];

export function PlanPreviewForm({ students, selectedStudentId }: { students: Student[]; selectedStudentId?: string }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [studentId, setStudentId] = useState(selectedStudentId ?? students[0]?.id ?? "");
  const [coachingNotes, setCoachingNotes] = useState("");
  const [bookingLink, setBookingLink] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [preview, setPreview] = useState<GeneratedLessonPlan | null>(null);
  const [title, setTitle] = useState("");
  const [focus, setFocus] = useState("");
  const [mainCue, setMainCue] = useState("");
  const [summary, setSummary] = useState("");
  const [warmup, setWarmup] = useState("");
  const [lessonSteps, setLessonSteps] = useState("");
  const [practicePlan, setPracticePlan] = useState("");
  const [successMarkers, setSuccessMarkers] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [draggingDrillId, setDraggingDrillId] = useState<string | null>(null);
  const [activeDropSection, setActiveDropSection] = useState<PlanSectionId | null>(null);

  const selectedStudent = useMemo(() => students.find((student) => student.id === studentId), [studentId, students]);
  const selectedTemplate = useMemo(() => planTemplates.find((template) => template.id === selectedTemplateId), [selectedTemplateId]);
  const planJsonText = useMemo(
    () =>
      JSON.stringify(
        {
          coach_notes: coachingNotes,
          summary,
          warmup: toLines(warmup),
          lesson_steps: toLines(lessonSteps),
          practice_plan: toLines(practicePlan),
          success_markers: toLines(successMarkers)
        },
        null,
        2
      ),
    [coachingNotes, lessonSteps, practicePlan, successMarkers, summary, warmup]
  );

  const applyDraftPlan = (draft: GeneratedLessonPlan, options?: { updateCoachNotes?: boolean }) => {
    setPreview(draft);
    setTitle(draft.title);
    setFocus(draft.focus);
    setMainCue(draft.mainCue);
    if (options?.updateCoachNotes) setCoachingNotes(draft.planJson.coach_notes);
    setSummary(draft.planJson.summary);
    setWarmup(draft.planJson.warmup.join("\n"));
    setLessonSteps(draft.planJson.lesson_steps.join("\n"));
    setPracticePlan(draft.planJson.practice_plan.join("\n"));
    setSuccessMarkers(draft.planJson.success_markers.join("\n"));
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ block: "start" }));
  };

  const applyTemplate = (template: PlanTemplate) => {
    setError("");
    setIsGenerating(false);
    setSelectedTemplateId(template.id);
    applyDraftPlan(template.draft, { updateCoachNotes: true });
  };

  const clearDraft = () => {
    setPreview(null);
    setSelectedTemplateId("");
  };

  const generatePreview = async () => {
    setError("");
    setIsGenerating(true);
    setSelectedTemplateId("");

    const response = await fetch("/api/plan-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, coachingNotes })
    });
    const payload = await response.json();
    setIsGenerating(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to generate preview");
      return;
    }

    const generated = payload as GeneratedLessonPlan;
    applyDraftPlan(generated);
  };

  const addDrillToSection = (sectionId: PlanSectionId, drill: Drill) => {
    const drillLine = formatDrillLine(drill);

    if (sectionId === "warmup") {
      setWarmup((current) => appendPlanLine(current, drillLine));
      return;
    }

    if (sectionId === "lesson_steps") {
      setLessonSteps((current) => appendPlanLine(current, drillLine));
      return;
    }

    setPracticePlan((current) => appendPlanLine(current, drillLine));
  };

  const handleDrillDragStart = (event: DragEvent<HTMLElement>, drill: Drill) => {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(DRILL_TRANSFER_TYPE, drill.id);
    event.dataTransfer.setData("text/plain", formatDrillLine(drill));
    setDraggingDrillId(drill.id);
  };

  const handleSectionDragOver = (event: DragEvent<HTMLLabelElement>, sectionId: PlanSectionId) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setActiveDropSection(sectionId);
  };

  const handleSectionDrop = (event: DragEvent<HTMLLabelElement>, sectionId: PlanSectionId) => {
    event.preventDefault();
    const drillId = event.dataTransfer.getData(DRILL_TRANSFER_TYPE) || draggingDrillId;
    const drill = DRILL_LIBRARY.find((item) => item.id === drillId);

    if (drill) addDrillToSection(sectionId, drill);

    setActiveDropSection(null);
    setDraggingDrillId(null);
  };

  if (preview) {
    return (
      <div ref={panelRef} className="mt-6 grid gap-5 rounded-lg border border-oat bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-oat pb-5">
          <div>
            <p className="text-sm font-medium text-clay">
              {selectedTemplate ? `${selectedTemplate.name} template` : "Draft preview"} for {selectedStudent?.name ?? "student"}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">Review and edit plan</h2>
          </div>
          <button className="btn-secondary w-fit" type="button" onClick={clearDraft}>
            <ArrowLeft className="h-4 w-4" />
            Edit notes
          </button>
        </div>

        <form action={createPlanAction} className="grid gap-5">
          <input type="hidden" name="studentId" value={studentId} />
          <input type="hidden" name="planJson" value={planJsonText} />
          <DrillLibrary
            draggingDrillId={draggingDrillId}
            onAddDrill={addDrillToSection}
            onDragStartDrill={handleDrillDragStart}
            onDragEndDrill={() => {
              setDraggingDrillId(null);
              setActiveDropSection(null);
            }}
          />

          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="form-label">Generated title</span>
              <input className="form-input" name="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="form-label">Booking link</span>
                <input className="form-input" name="bookingLink" value={bookingLink} onChange={(event) => setBookingLink(event.target.value)} type="url" placeholder="https://cal.com/..." />
              </label>
              <label className="grid gap-2">
                <span className="form-label">Due date</span>
                <input className="form-input" name="dueAt" value={dueAt} onChange={(event) => setDueAt(event.target.value)} type="date" />
              </label>
            </div>
            <label className="grid gap-2">
              <span className="form-label">Focus</span>
              <input className="form-input" name="focus" value={focus} onChange={(event) => setFocus(event.target.value)} />
            </label>
            <label className="grid gap-2">
              <span className="form-label">Main cue</span>
              <input className="form-input" name="mainCue" value={mainCue} onChange={(event) => setMainCue(event.target.value)} />
            </label>
            <label className="grid gap-2">
              <span className="form-label">Summary</span>
              <textarea className="form-input min-h-24" value={summary} onChange={(event) => setSummary(event.target.value)} />
            </label>
            <EditableList
              label="Warmup"
              value={warmup}
              onChange={setWarmup}
              dropSection="warmup"
              isDropActive={activeDropSection === "warmup"}
              onDragOverDrill={handleSectionDragOver}
              onDropDrill={handleSectionDrop}
              onDragLeaveDrill={() => setActiveDropSection(null)}
            />
            <EditableList
              label="Lesson steps"
              value={lessonSteps}
              onChange={setLessonSteps}
              dropSection="lesson_steps"
              isDropActive={activeDropSection === "lesson_steps"}
              onDragOverDrill={handleSectionDragOver}
              onDropDrill={handleSectionDrop}
              onDragLeaveDrill={() => setActiveDropSection(null)}
            />
            <EditableList
              label="Practice plan"
              value={practicePlan}
              onChange={setPracticePlan}
              dropSection="practice_plan"
              isDropActive={activeDropSection === "practice_plan"}
              onDragOverDrill={handleSectionDragOver}
              onDropDrill={handleSectionDrop}
              onDragLeaveDrill={() => setActiveDropSection(null)}
            />
            <EditableList label="Success markers" value={successMarkers} onChange={setSuccessMarkers} />
            <label className="grid gap-2">
              <span className="form-label">Original coach notes</span>
              <textarea className="form-input min-h-32" value={coachingNotes} onChange={(event) => setCoachingNotes(event.target.value)} />
            </label>
            <button className="btn-primary w-fit" type="submit">
              <Save className="h-4 w-4" />
              Save plan
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div ref={panelRef} className="mt-6 grid gap-5 rounded-lg border border-oat bg-white p-6">
      <label className="grid gap-2">
        <span className="form-label">Student</span>
        <select
          className="form-input"
          name="studentId"
          value={studentId}
          onChange={(event) => {
            setStudentId(event.target.value);
            setPreview(null);
            setSelectedTemplateId("");
          }}
          required
        >
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>
      </label>

      <section className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="form-label">Plan templates</h2>
          {selectedTemplate ? (
            <button className="btn-secondary px-3 py-1.5 text-xs" type="button" onClick={clearDraft}>
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          ) : null}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {planTemplates.map((template) => {
            const isSelected = template.id === selectedTemplateId;

            return (
              <button
                key={template.id}
                type="button"
                aria-pressed={isSelected}
                className={`min-h-28 rounded-md border px-3 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-moss/20 ${
                  isSelected ? "border-moss bg-linen text-ink" : "border-oat bg-white text-ink hover:border-moss hover:bg-linen/60"
                }`}
                onClick={() => applyTemplate(template)}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <ClipboardList className="h-4 w-4 text-moss" />
                    {template.name}
                  </span>
                  {isSelected ? <Check className="h-4 w-4 text-moss" /> : null}
                </span>
                <span className="mt-2 block text-xs leading-5 text-ink/70">{template.draft.focus}</span>
              </button>
            );
          })}
        </div>
      </section>

      <label className="grid gap-2">
        <span className="form-label">Coach notes</span>
        <textarea
          className="form-input min-h-72"
          value={coachingNotes}
          onChange={(event) => {
            setCoachingNotes(event.target.value);
            setPreview(null);
            setSelectedTemplateId("");
          }}
          required
          placeholder="Paste or type the raw lesson notes: what happened, what improved, what was hard, what to practice, next steps..."
        />
      </label>

      <label className="grid gap-2">
        <span className="form-label">Booking link</span>
        <input className="form-input" value={bookingLink} onChange={(event) => setBookingLink(event.target.value)} type="url" placeholder="https://cal.com/..." />
      </label>

      <label className="grid gap-2">
        <span className="form-label">Due date</span>
        <input className="form-input" value={dueAt} onChange={(event) => setDueAt(event.target.value)} type="date" />
      </label>

      <button className="btn-primary w-fit" type="button" disabled={students.length === 0 || isGenerating || !coachingNotes.trim()} onClick={generatePreview}>
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Preview draft plan
      </button>

      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

    </div>
  );
}

const toLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const formatDrillLine = (drill: Drill) => `${drill.title}: ${drill.description}`;

const appendPlanLine = (value: string, line: string) => {
  const lines = toLines(value);
  if (lines.some((item) => item.toLowerCase() === line.toLowerCase())) return value;

  return [...lines, line].join("\n");
};

function EditableList({
  label,
  value,
  onChange,
  dropSection,
  isDropActive = false,
  onDragOverDrill,
  onDropDrill,
  onDragLeaveDrill
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dropSection?: PlanSectionId;
  isDropActive?: boolean;
  onDragOverDrill?: (event: DragEvent<HTMLLabelElement>, sectionId: PlanSectionId) => void;
  onDropDrill?: (event: DragEvent<HTMLLabelElement>, sectionId: PlanSectionId) => void;
  onDragLeaveDrill?: () => void;
}) {
  const dropHandlers =
    dropSection && onDragOverDrill && onDropDrill
      ? {
          onDragOver: (event: DragEvent<HTMLLabelElement>) => onDragOverDrill(event, dropSection),
          onDrop: (event: DragEvent<HTMLLabelElement>) => onDropDrill(event, dropSection),
          onDragLeave: () => onDragLeaveDrill?.()
        }
      : {};

  return (
    <label className={`grid gap-2 rounded-md transition ${isDropActive ? "bg-moss/5 ring-2 ring-moss/30 ring-offset-2 ring-offset-white" : ""}`} {...dropHandlers}>
      <span className="form-label">{label}</span>
      <textarea className="form-input min-h-32" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function DrillLibrary({
  draggingDrillId,
  onAddDrill,
  onDragStartDrill,
  onDragEndDrill
}: {
  draggingDrillId: string | null;
  onAddDrill: (sectionId: PlanSectionId, drill: Drill) => void;
  onDragStartDrill: (event: DragEvent<HTMLElement>, drill: Drill) => void;
  onDragEndDrill: () => void;
}) {
  return (
    <aside className="grid content-start gap-3 border-b border-oat pb-5">
      <div className="flex items-center gap-2">
        <Library className="h-4 w-4 text-moss" />
        <h2 className="text-sm font-semibold uppercase text-ink/50">Drill library</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {DRILL_LIBRARY.map((drill) => (
          <article
            key={drill.id}
            className={`rounded-md border border-oat bg-linen/60 p-3 transition ${draggingDrillId === drill.id ? "border-moss bg-moss/10" : ""}`}
            draggable
            onDragStart={(event) => onDragStartDrill(event, drill)}
            onDragEnd={onDragEndDrill}
          >
            <div className="flex items-start gap-2">
              <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-ink/35" aria-hidden="true" />
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-ink">{drill.title}</h3>
                <p className="mt-1 text-xs leading-5 text-ink/70">{drill.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {drill.tags.map((tag) => (
                    <span key={tag} className="rounded-sm bg-white px-1.5 py-0.5 text-[11px] font-medium text-ink/60">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {PLAN_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-oat bg-white px-2 text-[11px] font-medium text-ink transition hover:bg-linen"
                  title={`Add to ${section.label}`}
                  aria-label={`Add ${drill.title} to ${section.label}`}
                  onClick={() => onAddDrill(section.id, drill)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {section.shortLabel}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
