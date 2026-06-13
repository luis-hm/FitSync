import { PersonalAssessmentsPage as PersonalAssessmentsScreen } from "@/features/assessments/components/personal-assessments-page";

export default async function PersonalAssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ aluno_id?: string }>;
}) {
  const params = await searchParams;
  return <PersonalAssessmentsScreen initialStudentFilter={params.aluno_id ?? ""} />;
}
