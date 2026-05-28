export type UserRole = "ADMIN" | "PERSONAL" | "ALUNO";

export type AuthUser = {
  id: string;
  nome: string;
  email: string;
  tipo: UserRole;
  data_criacao: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access: string;
  user: AuthUser;
};

export type RefreshResponse = {
  access: string;
};

export type RegisterRequest = {
  nome: string;
  email: string;
  password: string;
  tipo: "PERSONAL" | "ALUNO";
  personal_id?: string;
  data_nascimento?: string;
  sexo?: "M" | "F";
  altura_cm?: number;
  telefone?: string;
  observacoes_medicas?: string;
};

export type DetailResponse = {
  detail: string;
};
