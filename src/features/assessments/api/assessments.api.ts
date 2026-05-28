import { http } from "@/lib/api/http";

export async function listAssessments() {
  const response = await http.get("/api/assessments/avaliacoes/");
  return response.data;
}

export async function getStudentEvolution(studentId: string) {
  const response = await http.get(`/api/assessments/alunos/${studentId}/evolucao/`);
  return response.data;
}

export async function getPersonalRanking() {
  const response = await http.get("/api/assessments/personal/ranking/");
  return response.data;
}
