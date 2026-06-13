import { isAxiosError } from "axios";
import { http } from "@/lib/api/http";
import type {
  Anamnese,
  AnamnesePayload,
  Assessment,
  AssessmentCreatePayload,
  AssessmentSummary,
  AssessmentUpdatePayload,
  AssessmentsParams,
  AssessmentsResponse,
  EvolutionParams,
  PersonalRankingResponse,
  StudentEvolutionResponse,
} from "@/features/assessments/types/assessments.types";

export async function listAssessments(params?: AssessmentsParams) {
  const response = await http.get<AssessmentsResponse>("/api/assessments/avaliacoes/", {
    params,
  });
  return response.data;
}

export async function createAssessment(payload: AssessmentCreatePayload) {
  const response = await http.post<Assessment>("/api/assessments/avaliacoes/", payload);
  return response.data;
}

export async function getAssessment(id: string) {
  const response = await http.get<Assessment>(`/api/assessments/avaliacoes/${id}/`);
  return response.data;
}

export async function getStudentSummary(studentId: string) {
  const response = await http.get<AssessmentSummary>(`/api/assessments/alunos/${studentId}/resumo/`);
  return response.data;
}

export async function getMySummary() {
  const response = await http.get<AssessmentSummary>("/api/assessments/me/resumo/");
  return response.data;
}

export async function getStudentAnamnese(studentId: string) {
  try {
    const response = await http.get<Anamnese>(`/api/assessments/alunos/${studentId}/anamnese/`);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function updateStudentAnamnese(studentId: string, payload: AnamnesePayload) {
  const response = await http.patch<Anamnese>(`/api/assessments/alunos/${studentId}/anamnese/`, payload);
  return response.data;
}

export async function getMyAnamnese() {
  try {
    const response = await http.get<Anamnese>("/api/assessments/me/anamnese/");
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function updateAssessment(id: string, payload: AssessmentUpdatePayload) {
  const response = await http.patch<Assessment>(`/api/assessments/avaliacoes/${id}/`, payload);
  return response.data;
}

export async function archiveAssessment(id: string) {
  const response = await http.post<Assessment>(`/api/assessments/avaliacoes/${id}/arquivar/`);
  return response.data;
}

export async function getStudentEvolution(studentId: string, params?: EvolutionParams) {
  const response = await http.get<StudentEvolutionResponse>(
    `/api/assessments/alunos/${studentId}/evolucao/`,
    { params },
  );
  return response.data;
}

export async function getMyEvolution(params?: EvolutionParams) {
  const response = await http.get<StudentEvolutionResponse>("/api/assessments/me/evolucao/", {
    params,
  });
  return response.data;
}

export async function getPersonalRanking(params?: EvolutionParams) {
  const response = await http.get<PersonalRankingResponse>("/api/assessments/personal/ranking/", {
    params,
  });
  return response.data;
}
