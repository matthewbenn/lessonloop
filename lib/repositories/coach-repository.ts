import type { SupabaseClient } from "@supabase/supabase-js";
import { toRepositoryError } from "@/lib/repositories/repository-error";
import type { CompletionReport, DashboardPlan, Plan, Student } from "@/types/domain";

type DashboardPlanRow = Plan & {
  students: Pick<Student, "id" | "name">;
};

export class CoachRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async requireUserId() {
    const {
      data: { user },
      error
    } = await this.supabase.auth.getUser();

    if (error || !user) throw new Error("Unauthorized");
    return user.id;
  }

  async listStudents() {
    const coachId = await this.requireUserId();
    const { data, error } = await this.supabase
      .from("students")
      .select("*")
      .eq("coach_id", coachId)
      .order("created_at", { ascending: false });

    if (error) throw toRepositoryError(error);
    return (data ?? []) as Student[];
  }

  async listDashboardPlans() {
    const coachId = await this.requireUserId();
    const { data, error } = await this.supabase
      .from("plans")
      .select("*, students!inner(id, name)")
      .eq("coach_id", coachId)
      .order("due_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) throw toRepositoryError(error);

    return ((data ?? []) as DashboardPlanRow[]).map(({ students, ...plan }) => ({
      ...plan,
      is_overdue: plan.completion_state === "pending" && Boolean(plan.due_at) && new Date(plan.due_at as string).getTime() < Date.now(),
      student: students
    })) as DashboardPlan[];
  }

  async createStudent(input: { name: string; email?: string; notes?: string }) {
    const coachId = await this.requireUserId();
    const { data, error } = await this.supabase
      .from("students")
      .insert({
        coach_id: coachId,
        created_by: coachId,
        name: input.name,
        email: input.email || null,
        notes: input.notes || null
      })
      .select("*")
      .single();

    if (error) throw toRepositoryError(error);
    return data as Student;
  }

  async getStudent(id: string) {
    const coachId = await this.requireUserId();
    const { data, error } = await this.supabase
      .from("students")
      .select("*")
      .eq("coach_id", coachId)
      .eq("id", id)
      .single();

    if (error) throw toRepositoryError(error);
    return data as Student;
  }

  async listPlansForStudent(studentId: string) {
    const coachId = await this.requireUserId();
    const { data, error } = await this.supabase
      .from("plans")
      .select("*")
      .eq("coach_id", coachId)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) throw toRepositoryError(error);
    return (data ?? []) as Plan[];
  }

  async createPlan(input: {
    studentId: string;
    title: string;
    focus?: string;
    mainCue?: string;
    planJson: Record<string, unknown>;
    bookingLink?: string;
    dueAt?: string;
  }) {
    const coachId = await this.requireUserId();
    const dueAt = input.dueAt ? new Date(input.dueAt).toISOString() : null;
    const { data, error } = await this.supabase
      .from("plans")
      .insert({
        coach_id: coachId,
        created_by: coachId,
        student_id: input.studentId,
        title: input.title,
        focus: input.focus || null,
        main_cue: input.mainCue || null,
        plan_json: input.planJson,
        booking_link: input.bookingLink || null,
        due_at: dueAt,
        completion_state: "pending"
      })
      .select("*")
      .single();

    if (error) throw toRepositoryError(error);
    return data as Plan;
  }

  async getPlan(id: string) {
    const coachId = await this.requireUserId();
    const { data, error } = await this.supabase
      .from("plans")
      .select("*")
      .eq("coach_id", coachId)
      .eq("id", id)
      .single();

    if (error) throw toRepositoryError(error);
    return data as Plan;
  }

  async listReportsForPlan(planId: string) {
    const coachId = await this.requireUserId();
    const { data, error } = await this.supabase
      .from("completion_reports")
      .select("*, plans!inner(coach_id)")
      .eq("plans.coach_id", coachId)
      .eq("plan_id", planId)
      .order("created_at", { ascending: false });

    if (error) throw toRepositoryError(error);
    return (data ?? []).map(({ plans, ...report }) => {
      void plans;
      return report;
    }) as CompletionReport[];
  }
}
