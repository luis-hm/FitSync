import { http } from "@/lib/api/http";
import type {
  AdminDashboard,
  AdminPersonal,
  AdminPersonalsParams,
  AdminPersonalsResponse,
  AdminPersonalUpdatePayload,
  AdminStudent,
  AdminStudentsParams,
  AdminStudentsResponse,
  AdminStudentUpdatePayload,
  AdminUser,
  AdminUserCreatePayload,
  AdminUsersParams,
  AdminUsersResponse,
  AdminUserUpdatePayload,
  PersonalDashboard,
  PersonalStudent,
  PersonalStudentCreatePayload,
  PersonalStudentsParams,
  PersonalStudentsResponse,
  PersonalStudentUpdatePayload,
  PlatformSettings,
  PlatformSettingsUpdatePayload,
  StudentProfile,
  StudentProfileUpdatePayload,
  UserStatusAction,
} from "@/features/accounts/types/accounts.types";

export async function getAdminDashboard() {
  const response = await http.get<AdminDashboard>("/api/accounts/admin/dashboard/");
  return response.data;
}

export async function getPersonalDashboard() {
  const response = await http.get<PersonalDashboard>("/api/accounts/personal/dashboard/");
  return response.data;
}

export async function listAdminUsers(params?: AdminUsersParams) {
  const response = await http.get<AdminUsersResponse>("/api/accounts/admin/usuarios/", {
    params,
  });
  return response.data;
}

export async function getAdminUser(id: string) {
  const response = await http.get<AdminUser>(`/api/accounts/admin/usuarios/${id}/`);
  return response.data;
}

export async function createAdminUser(payload: AdminUserCreatePayload) {
  const response = await http.post<AdminUser>("/api/accounts/admin/usuarios/", payload);
  return response.data;
}

export async function updateAdminUser(id: string, payload: AdminUserUpdatePayload) {
  const response = await http.patch<AdminUser>(`/api/accounts/admin/usuarios/${id}/`, payload);
  return response.data;
}

export async function setAdminUserStatus(id: string, action: UserStatusAction) {
  const response = await http.post<AdminUser>(`/api/accounts/admin/usuarios/${id}/${action}/`);
  return response.data;
}

export async function listAdminPersonals(params?: AdminPersonalsParams) {
  const response = await http.get<AdminPersonalsResponse>("/api/accounts/admin/personais/", {
    params,
  });
  return response.data;
}

export async function getAdminPersonal(id: string) {
  const response = await http.get<AdminPersonal>(`/api/accounts/admin/personais/${id}/`);
  return response.data;
}

export async function updateAdminPersonal(id: string, payload: AdminPersonalUpdatePayload) {
  const response = await http.patch<AdminPersonal>(`/api/accounts/admin/personais/${id}/`, payload);
  return response.data;
}

export async function listAdminStudents(params?: AdminStudentsParams) {
  const response = await http.get<AdminStudentsResponse>("/api/accounts/admin/alunos/", {
    params,
  });
  return response.data;
}

export async function getAdminStudent(id: string) {
  const response = await http.get<AdminStudent>(`/api/accounts/admin/alunos/${id}/`);
  return response.data;
}

export async function updateAdminStudent(id: string, payload: AdminStudentUpdatePayload) {
  const response = await http.patch<AdminStudent>(`/api/accounts/admin/alunos/${id}/`, payload);
  return response.data;
}

export async function getPlatformSettings() {
  const response = await http.get<PlatformSettings>("/api/settings/");
  return response.data;
}

export async function updatePlatformSettings(payload: PlatformSettingsUpdatePayload) {
  const response = await http.patch<PlatformSettings>("/api/settings/", payload);
  return response.data;
}

export async function listPersonalStudents(params?: PersonalStudentsParams) {
  const response = await http.get<PersonalStudentsResponse>("/api/accounts/personal/alunos/", {
    params,
  });
  return response.data;
}

export async function getPersonalStudent(id: string) {
  const response = await http.get<PersonalStudent>(`/api/accounts/personal/alunos/${id}/`);
  return response.data;
}

export async function createPersonalStudent(payload: PersonalStudentCreatePayload) {
  const response = await http.post<PersonalStudent>("/api/accounts/personal/alunos/", payload);
  return response.data;
}

export async function updatePersonalStudent(id: string, payload: PersonalStudentUpdatePayload) {
  const response = await http.patch<PersonalStudent>(`/api/accounts/personal/alunos/${id}/`, payload);
  return response.data;
}

export async function getStudentProfile() {
  const response = await http.get<StudentProfile>("/api/accounts/aluno/me/");
  return response.data;
}

export async function updateStudentProfile(payload: StudentProfileUpdatePayload) {
  const response = await http.patch<StudentProfile>("/api/accounts/aluno/me/", payload);
  return response.data;
}
