import type { components, operations } from "@/types/generated/api";

export type AdminDashboard = components["schemas"]["AdminDashboard"];
export type AdminUser = components["schemas"]["AdminUsuario"];
export type AdminUserCreatePayload = components["schemas"]["AdminUsuarioRequest"];
export type AdminUserUpdatePayload = components["schemas"]["PatchedAdminUsuarioRequest"];
export type AdminPersonal = components["schemas"]["AdminPersonal"];
export type AdminPersonalUpdatePayload = components["schemas"]["PatchedAdminPersonalRequest"];
export type AdminStudent = components["schemas"]["AdminAlunoUpdate"];
export type AdminStudentUpdatePayload = components["schemas"]["PatchedAdminAlunoUpdateRequest"];
export type PersonalStudent = components["schemas"]["Aluno"];
export type StudentProfile = components["schemas"]["AlunoSelf"];
export type StudentProfileUpdatePayload = components["schemas"]["PatchedAlunoSelfRequest"];
export type PlatformSettings = components["schemas"]["PlatformSettings"];
export type PlatformSettingsUpdatePayload = components["schemas"]["PatchedPlatformSettingsRequest"];

export type MetricGroup = Record<string, number>;

export type PersonalDashboard = {
  alunos: MetricGroup;
  treinos: MetricGroup;
  avaliacoes: MetricGroup;
  ranking: Array<{
    aluno_id: string;
    aluno_nome: string;
    percentual_inicial: string;
    percentual_final: string;
    variacao_percentual_gordura: string;
  }>;
};

export type PersonalStudentCreatePayload = {
  nome: string;
  email: string;
  password: string;
  data_nascimento: string;
  sexo: "M" | "F";
  objetivo_principal?: string;
  observacoes_medicas?: string;
};

export type PersonalStudentUpdatePayload = {
  nome?: string;
  data_nascimento?: string;
  sexo?: "M" | "F";
  objetivo_principal?: string;
  observacoes_medicas?: string;
};

export type AdminUsersParams =
  operations["accounts_admin_usuarios_list"]["parameters"]["query"];
export type AdminPersonalsParams =
  operations["accounts_admin_personais_list"]["parameters"]["query"];
export type AdminStudentsParams =
  operations["accounts_admin_alunos_list"]["parameters"]["query"];
export type PersonalStudentsParams =
  operations["accounts_personal_alunos_list"]["parameters"]["query"];

export type AdminUsersResponse =
  operations["accounts_admin_usuarios_list"]["responses"][200]["content"]["application/json"];
export type AdminPersonalsResponse =
  operations["accounts_admin_personais_list"]["responses"][200]["content"]["application/json"];
export type AdminStudentsResponse =
  operations["accounts_admin_alunos_list"]["responses"][200]["content"]["application/json"];
export type PersonalStudentsResponse =
  operations["accounts_personal_alunos_list"]["responses"][200]["content"]["application/json"];

export type UserStatusAction = "ativar" | "desativar";
