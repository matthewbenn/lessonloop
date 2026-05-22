export type GeneratedLessonPlan = {
  title: string;
  focus: string;
  mainCue: string;
  planJson: {
    coach_notes: string;
    summary: string;
    warmup: string[];
    lesson_steps: string[];
    practice_plan: string[];
    success_markers: string[];
  };
};

const fallbackList = (notes: string) =>
  notes
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5);

export const fallbackLessonPlan = (notes: string): GeneratedLessonPlan => {
  const bullets = fallbackList(notes);

  return {
    title: "Generated lesson plan",
    focus: bullets[0] ?? "Review the coach notes and reinforce the highest-priority skill.",
    mainCue: "Slow, clear repetitions with one target at a time.",
    planJson: {
      coach_notes: notes,
      summary: "AI generation is not configured, so this plan keeps the coach notes and creates a simple practice structure.",
      warmup: ["Easy review of the previous lesson", "One low-pressure repetition of the target skill"],
      lesson_steps: bullets.length > 0 ? bullets : ["Review notes with the student", "Choose one priority skill", "Practice in short focused rounds"],
      practice_plan: ["Practice 10 minutes per day", "Pause after each round and check the main cue", "Bring one question to the next lesson"],
      success_markers: ["Student can explain the main cue", "Student can complete the skill slowly", "Student knows what to practice next"]
    }
  };
};

const lessonPlanSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "focus", "mainCue", "planJson"],
  properties: {
    title: { type: "string" },
    focus: { type: "string" },
    mainCue: { type: "string" },
    planJson: {
      type: "object",
      additionalProperties: false,
      required: ["coach_notes", "summary", "warmup", "lesson_steps", "practice_plan", "success_markers"],
      properties: {
        coach_notes: { type: "string" },
        summary: { type: "string" },
        warmup: { type: "array", items: { type: "string" } },
        lesson_steps: { type: "array", items: { type: "string" } },
        practice_plan: { type: "array", items: { type: "string" } },
        success_markers: { type: "array", items: { type: "string" } }
      }
    }
  }
};

const getResponseText = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return "";
  if ("output_text" in payload && typeof payload.output_text === "string") return payload.output_text;

  const output = "output" in payload && Array.isArray(payload.output) ? payload.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object" || !("content" in item) || !Array.isArray(item.content)) continue;
    for (const content of item.content) {
      if (content && typeof content === "object" && "text" in content && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return "";
};

export async function generateLessonPlan(input: { studentName?: string; notes: string }): Promise<GeneratedLessonPlan> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallbackLessonPlan(input.notes);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      instructions:
        "You generate practical lesson plans from a coach's freeform notes. Keep output concise, specific, and student-friendly. Return only JSON that matches the schema.",
      input: [
        {
          role: "user",
          content: `Student: ${input.studentName ?? "Unknown"}\n\nCoach notes:\n${input.notes}`
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "lesson_plan",
          strict: true,
          schema: lessonPlanSchema
        }
      }
    })
  });

  if (!response.ok) {
    return fallbackLessonPlan(input.notes);
  }

  const payload = (await response.json()) as unknown;
  const text = getResponseText(payload);
  if (!text) return fallbackLessonPlan(input.notes);

  try {
    return JSON.parse(text) as GeneratedLessonPlan;
  } catch {
    return fallbackLessonPlan(input.notes);
  }
}
