import { http } from "@/lib/api/http";

export async function listAdminUsers() {
  const response = await http.get("/api/accounts/admin/usuarios/");
  return response.data;
}

export async function listPersonalStudents() {
  const response = await http.get("/api/accounts/personal/alunos/");
  return response.data;
}

export async function getStudentProfile() {
  const response = await http.get("/api/accounts/aluno/me/");
  return response.data;
}
