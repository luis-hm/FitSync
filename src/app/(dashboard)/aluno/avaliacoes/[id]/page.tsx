import { AssessmentResultPage } from "@/features/assessments/components/assessment-result-page";

export default async function StudentAssessmentResultRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AssessmentResultPage assessmentId={id} audience="student" />;
}
