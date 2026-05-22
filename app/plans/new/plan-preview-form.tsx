"use client";

import { useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { createPlanAction } from "@/app/actions";
import type { GeneratedLessonPlan } from "@/lib/ai/lesson-plan-generator";
import type { Student } from "@/types/domain";

export function PlanPreviewForm({ students, selectedStudentId }: { students: Student[]; selectedStudentId?: string }) {
  const [studentId, setStudentId] = useState(selectedStudentId ?? students[0]?.id ?? "");
  const [coachingNotes, setCoachingNotes] = useState("");
  const [bookingLink, setBookingLink] = useState("");
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

  const selectedStudent = useMemo(() => students.find((student) => student.id === studentId), [studentId, students]);
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

  const generatePreview = async () => {
    setError("");
    setIsGenerating(true);

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
    setPreview(generated);
    setTitle(generated.title);
    setFocus(generated.focus);
    setMainCue(generated.mainCue);
    setSummary(generated.planJson.summary);
    setWarmup(generated.planJson.warmup.join("\n"));
    setLessonSteps(generated.planJson.lesson_steps.join("\n"));
    setPracticePlan(generated.planJson.practice_plan.join("\n"));
    setSuccessMarkers(generated.planJson.success_markers.join("\n"));
  };

  return (
    <div className="mt-6 grid gap-5 rounded-lg border border-oat bg-white p-6">
      <label className="grid gap-2">
        <span className="form-label">Student</span>
        <select
          className="form-input"
          name="studentId"
          value={studentId}
          onChange={(event) => {
            setStudentId(event.target.value);
            setPreview(null);
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

      <label className="grid gap-2">
        <span className="form-label">Coach notes</span>
        <textarea
          className="form-input min-h-72"
          value={coachingNotes}
          onChange={(event) => {
            setCoachingNotes(event.target.value);
            setPreview(null);
          }}
          required
          placeholder="Paste or type the raw lesson notes: what happened, what improved, what was hard, what to practice, next steps..."
        />
      </label>

      <label className="grid gap-2">
        <span className="form-label">Booking link</span>
        <input className="form-input" value={bookingLink} onChange={(event) => setBookingLink(event.target.value)} type="url" placeholder="https://cal.com/..." />
      </label>

      <button className="btn-primary w-fit" type="button" disabled={students.length === 0 || isGenerating || !coachingNotes.trim()} onClick={generatePreview}>
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Preview AI plan
      </button>

      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {preview ? (
        <form action={createPlanAction} className="grid gap-5 border-t border-oat pt-5">
          <input type="hidden" name="studentId" value={studentId} />
          <input type="hidden" name="bookingLink" value={bookingLink} />
          <input type="hidden" name="planJson" value={planJsonText} />
          <p className="text-sm font-medium text-clay">Preview for {selectedStudent?.name ?? "student"}</p>
          <label className="grid gap-2">
            <span className="form-label">Generated title</span>
            <input className="form-input" name="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>
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
          <EditableList label="Warmup" value={warmup} onChange={setWarmup} />
          <EditableList label="Lesson steps" value={lessonSteps} onChange={setLessonSteps} />
          <EditableList label="Practice plan" value={practicePlan} onChange={setPracticePlan} />
          <EditableList label="Success markers" value={successMarkers} onChange={setSuccessMarkers} />
          <label className="grid gap-2">
            <span className="form-label">Original coach notes</span>
            <textarea className="form-input min-h-32" value={coachingNotes} onChange={(event) => setCoachingNotes(event.target.value)} />
          </label>
          <button className="btn-primary w-fit" type="submit">
            Save plan
          </button>
        </form>
      ) : null}
    </div>
  );
}

const toLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

function EditableList({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="form-label">{label}</span>
      <textarea className="form-input min-h-32" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
