import { PersonalStudentDossierPage } from "@/features/accounts/components/personal-student-dossier-page";

export default async function PersonalStudentDossierRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PersonalStudentDossierPage studentId={id} />;
}
