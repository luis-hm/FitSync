import { AssessmentResultPage } from "@/features/assessments/components/assessment-result-page";

export default async function PersonalAssessmentResultRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AssessmentResultPage assessmentId={id} audience="personal" />;
}
