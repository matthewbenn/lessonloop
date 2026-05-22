export type Student = {
  id: string;
  coach_id: string;
  name: string;
  email: string | null;
  notes: string | null;
  created_at: string;
};

export type Plan = {
  id: string;
  coach_id: string;
  student_id: string;
  title: string;
  focus: string | null;
  main_cue: string | null;
  plan_json: Record<string, unknown>;
  booking_link: string | null;
  created_at: string;
};

export type CompletionReport = {
  id: string;
  plan_id: string;
  student_id: string;
  magic_link_id: string | null;
  completed: boolean;
  notes: string | null;
  created_at: string;
};

export type MagicLink = {
  id: string;
  coach_id: string;
  student_id: string;
  plan_id: string;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
};

export type StudentPlanPayload = {
  plan: Pick<Plan, "id" | "title" | "focus" | "main_cue" | "plan_json" | "booking_link">;
  student: Pick<Student, "id" | "name">;
  completion: {
    completed: boolean;
    latestReport: CompletionReport | null;
  };
};
