import type { SupabaseClient } from "@supabase/supabase-js";
import { daysFromNow, hashMagicToken } from "@/lib/tokens";
import type { CompletionReport, MagicLink, Plan, Student, StudentPlanPayload } from "@/types/domain";

type ValidTokenRecord = MagicLink & {
  plans: Plan;
  students: Student;
};

export class StudentTokenRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createMagicLink(input: { coachId: string; studentId: string; planId: string; rawToken: string; expiresInDays?: number }) {
    const { data, error } = await this.supabase
      .from("magic_links")
      .insert({
        coach_id: input.coachId,
        student_id: input.studentId,
        plan_id: input.planId,
        token_hash: hashMagicToken(input.rawToken),
        expires_at: daysFromNow(input.expiresInDays ?? 14)
      })
      .select("*")
      .single();

    if (error) throw error;
    return data as MagicLink;
  }

  async getValidToken(rawToken: string) {
    const tokenHash = hashMagicToken(rawToken);
    const { data, error } = await this.supabase
      .from("magic_links")
      .select("*, plans(*), students(*)")
      .eq("token_hash", tokenHash)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !data) return null;
    return data as ValidTokenRecord;
  }

  async getStudentPlan(rawToken: string): Promise<StudentPlanPayload | null> {
    const tokenRecord = await this.getValidToken(rawToken);
    if (!tokenRecord) return null;

    const latestReport = await this.getLatestReport(tokenRecord.plan_id, tokenRecord.student_id);

    return {
      plan: {
        id: tokenRecord.plans.id,
        title: tokenRecord.plans.title,
        focus: tokenRecord.plans.focus,
        main_cue: tokenRecord.plans.main_cue,
        plan_json: tokenRecord.plans.plan_json,
        booking_link: tokenRecord.plans.booking_link
      },
      student: {
        id: tokenRecord.students.id,
        name: tokenRecord.students.name
      },
      completion: {
        completed: Boolean(latestReport?.completed),
        latestReport
      }
    };
  }

  async submitReport(input: { rawToken: string; completed: boolean; notes?: string }) {
    const tokenRecord = await this.getValidToken(input.rawToken);
    if (!tokenRecord) return null;

    const { data, error } = await this.supabase
      .from("completion_reports")
      .insert({
        plan_id: tokenRecord.plan_id,
        student_id: tokenRecord.student_id,
        magic_link_id: tokenRecord.id,
        completed: input.completed,
        notes: input.notes || null
      })
      .select("*")
      .single();

    if (error) throw error;
    return data as CompletionReport;
  }

  private async getLatestReport(planId: string, studentId: string) {
    const { data, error } = await this.supabase
      .from("completion_reports")
      .select("*")
      .eq("plan_id", planId)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as CompletionReport | null;
  }
}
