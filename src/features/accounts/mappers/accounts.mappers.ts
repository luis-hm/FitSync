import type {
  AdminDashboard,
  AdminPersonal,
  AdminPersonalUpdatePayload,
  AdminStudent,
  AdminStudentUpdatePayload,
  AdminUser,
  AdminUserCreatePayload,
  AdminUserUpdatePayload,
  PersonalStudentCreatePayload,
  PersonalStudentUpdatePayload,
  PlatformSettings,
  PlatformSettingsUpdatePayload,
  StudentProfile,
  StudentProfileUpdatePayload,
} from "@/features/accounts/types/accounts.types";
import type {
  AdminPersonalUpdateForm,
  AdminStudentUpdateForm,
  AdminUserCreateForm,
  AdminUserUpdateForm,
  PersonalStudentCreateForm,
  PersonalStudentUpdateForm,
  PlatformSettingsForm,
  StudentProfileForm,
} from "@/features/accounts/schemas/accounts.schemas";

export function compactPayload<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== ""),
  ) as T;
}

export function toAdminUserCreatePayload(form: AdminUserCreateForm): AdminUserCreatePayload {
  return compactPayload({
    nome: form.nome,
    email: form.email,
    tipo: form.tipo,
    password: form.password,
    personal_id: form.personal_id,
    data_nascimento: form.data_nascimento,
    sexo: form.sexo,
    objetivo_principal: form.objetivo_principal,
    observacoes_medicas: form.observacoes_medicas,
  });
}

export function toAdminUserUpdatePayload(form: AdminUserUpdateForm): AdminUserUpdatePayload {
  return compactPayload({
    nome: form.nome,
    email: form.email,
    is_active: form.is_active,
    password: form.password,
  });
}

export function toAdminPersonalUpdatePayload(form: AdminPersonalUpdateForm): AdminPersonalUpdatePayload {
  return compactPayload({
    nome: form.nome,
    email: form.email,
    is_active: form.is_active,
    password: form.password,
    especialidade: form.especialidade,
    bio: form.bio,
  });
}

export function toAdminStudentUpdatePayload(form: AdminStudentUpdateForm): AdminStudentUpdatePayload {
  return compactPayload({
    nome: form.nome,
    email: form.email,
    is_active: form.is_active,
    personal_id: form.personal_id,
    data_nascimento: form.data_nascimento,
    sexo: form.sexo,
    objetivo_principal: form.objetivo_principal,
    observacoes_medicas: form.observacoes_medicas,
  });
}

export function toPersonalStudentCreatePayload(form: PersonalStudentCreateForm): PersonalStudentCreatePayload {
  return compactPayload({
    nome: form.nome,
    email: form.email,
    password: form.password,
    data_nascimento: form.data_nascimento,
    sexo: form.sexo,
    objetivo_principal: form.objetivo_principal,
    observacoes_medicas: form.observacoes_medicas,
  });
}

export function toPersonalStudentUpdatePayload(form: PersonalStudentUpdateForm): PersonalStudentUpdatePayload {
  return compactPayload({
    nome: form.nome,
    data_nascimento: form.data_nascimento,
    sexo: form.sexo,
    objetivo_principal: form.objetivo_principal,
    observacoes_medicas: form.observacoes_medicas,
  });
}

export function toStudentProfilePayload(form: StudentProfileForm): StudentProfileUpdatePayload {
  return compactPayload({
    nome: form.nome,
    data_nascimento: form.data_nascimento,
    sexo: form.sexo,
    objetivo_principal: form.objetivo_principal,
    observacoes_medicas: form.observacoes_medicas,
  });
}

export function toPlatformSettingsUpdatePayload(form: PlatformSettingsForm): PlatformSettingsUpdatePayload {
  return {
    nome_plataforma: form.nome_plataforma,
    suporte_email: form.suporte_email,
    cadastro_publico_ativo: form.cadastro_publico_ativo,
  };
}

export function getInitials(name?: string) {
  return (name ?? "FS")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function formatRole(role?: AdminUser["tipo"] | AdminPersonal["tipo"] | AdminStudent["tipo"]) {
  if (role === "ADMIN") return "Admin";
  if (role === "PERSONAL") return "Personal";
  if (role === "ALUNO") return "Aluno";
  return "-";
}

export function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(value?: string | null) {
  if (!value) return "Sem acesso";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function metricGroup(group: AdminDashboard[keyof AdminDashboard] | undefined) {
  return typeof group === "object" && group !== null ? group : {};
}

export function metricNumber(group: AdminDashboard[keyof AdminDashboard] | undefined, key: string) {
  const value = metricGroup(group)[key];
  return typeof value === "number" ? value : 0;
}

export function plainMetricNumber(group: Record<string, number> | undefined, key: string) {
  const value = group?.[key];
  return typeof value === "number" ? value : 0;
}

export function settingsToForm(settings?: PlatformSettings): PlatformSettingsForm {
  return {
    nome_plataforma: settings?.nome_plataforma ?? "FitSync",
    suporte_email: settings?.suporte_email ?? "",
    cadastro_publico_ativo: settings?.cadastro_publico_ativo ?? true,
  };
}

export function studentProfileToForm(profile?: StudentProfile): StudentProfileForm {
  return {
    nome: profile?.nome ?? "",
    data_nascimento: profile?.data_nascimento ?? "",
    sexo: profile?.sexo ?? "M",
    objetivo_principal: profile?.objetivo_principal ?? "",
    observacoes_medicas: profile?.observacoes_medicas ?? "",
  };
}
