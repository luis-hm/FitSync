import { z } from "zod";

const optionalText = z.string().trim().optional();
const requiredText = (message: string) => z.string().trim().min(1, message);

export const adminUserCreateSchema = z
  .object({
    nome: requiredText("Informe o nome."),
    email: z.string().trim().email("Informe um e-mail valido."),
    tipo: z.enum(["PERSONAL", "ALUNO"]),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    personal_id: optionalText,
    data_nascimento: optionalText,
    sexo: z.enum(["M", "F"]).optional(),
    objetivo_principal: optionalText,
    observacoes_medicas: optionalText,
  })
  .superRefine((value, context) => {
    if (value.tipo !== "ALUNO") return;

    if (!value.personal_id) {
      context.addIssue({ code: "custom", path: ["personal_id"], message: "Selecione um personal." });
    }
    if (!value.data_nascimento) {
      context.addIssue({ code: "custom", path: ["data_nascimento"], message: "Informe a data de nascimento." });
    }
    if (!value.sexo) {
      context.addIssue({ code: "custom", path: ["sexo"], message: "Informe o sexo." });
    }
  });

export const adminUserUpdateSchema = z.object({
  nome: requiredText("Informe o nome."),
  email: z.string().trim().email("Informe um e-mail valido."),
  is_active: z.boolean(),
  password: optionalText,
});

export const adminPersonalUpdateSchema = adminUserUpdateSchema.extend({
  especialidade: optionalText,
  bio: optionalText,
});

export const adminStudentUpdateSchema = z.object({
  nome: requiredText("Informe o nome."),
  email: z.string().trim().email("Informe um e-mail valido."),
  is_active: z.boolean(),
  personal_id: requiredText("Selecione um personal."),
  data_nascimento: requiredText("Informe a data de nascimento."),
  sexo: z.enum(["M", "F"]),
  objetivo_principal: optionalText,
  observacoes_medicas: optionalText,
});

export const personalStudentCreateSchema = z.object({
  nome: requiredText("Informe o nome."),
  email: z.string().trim().email("Informe um e-mail valido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
  data_nascimento: requiredText("Informe a data de nascimento."),
  sexo: z.enum(["M", "F"]),
  objetivo_principal: optionalText,
  observacoes_medicas: optionalText,
});

export const personalStudentUpdateSchema = z.object({
  nome: requiredText("Informe o nome."),
  data_nascimento: requiredText("Informe a data de nascimento."),
  sexo: z.enum(["M", "F"]),
  objetivo_principal: optionalText,
  observacoes_medicas: optionalText,
});

export const studentProfileSchema = z.object({
  nome: requiredText("Informe o nome."),
  data_nascimento: requiredText("Informe a data de nascimento."),
  sexo: z.enum(["M", "F"]),
  objetivo_principal: optionalText,
  observacoes_medicas: optionalText,
});

export const platformSettingsSchema = z.object({
  nome_plataforma: requiredText("Informe o nome da plataforma."),
  suporte_email: z.union([z.string().trim().email("Informe um e-mail valido."), z.literal("")]),
  cadastro_publico_ativo: z.boolean(),
});

export type AdminUserCreateForm = z.infer<typeof adminUserCreateSchema>;
export type AdminUserUpdateForm = z.infer<typeof adminUserUpdateSchema>;
export type AdminPersonalUpdateForm = z.infer<typeof adminPersonalUpdateSchema>;
export type AdminStudentUpdateForm = z.infer<typeof adminStudentUpdateSchema>;
export type PersonalStudentCreateForm = z.infer<typeof personalStudentCreateSchema>;
export type PersonalStudentUpdateForm = z.infer<typeof personalStudentUpdateSchema>;
export type StudentProfileForm = z.infer<typeof studentProfileSchema>;
export type PlatformSettingsForm = z.infer<typeof platformSettingsSchema>;
