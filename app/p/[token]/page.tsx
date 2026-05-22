import { StudentPlanView } from "./student-plan-view";

export default async function PublicPlanPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <StudentPlanView token={token} />;
}
