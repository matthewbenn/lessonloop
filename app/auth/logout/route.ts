import { redirect } from "next/navigation";
import { createCoachClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createCoachClient();
  await supabase.auth.signOut();
  redirect("/login");
}
