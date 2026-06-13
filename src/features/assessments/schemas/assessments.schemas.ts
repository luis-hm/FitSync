import { z } from "zod";

const requiredText = (message: string) => z.string().trim().min(1, message);
const optionalText = z.string().trim().optional();
const requiredDecimal = (message: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => isNumberInRange(value, min, max), `Informe um valor entre ${min} e ${max}.`);
const optionalDecimal = (min: number, max: number) =>
  z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || isNumberInRange(value, min, max), `Informe um valor entre ${min} e ${max}.`);

function isNumberInRange(value: string, min: number, max: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max;
}

export const assessmentMethodSchema = z.enum(["DOBRAS", "BIOIMPEDANCIA", "CIRCUNFERENCIAS", "COMBINADO"]);

const dobrasSchema = z.object({
  peitoral_mm: optionalDecimal(1, 100),
  axilar_media_mm: optionalDecimal(1, 100),
  triceps_mm: optionalDecimal(1, 100),
  subescapular_mm: optionalDecimal(1, 100),
  abdominal_mm: optionalDecimal(1, 100),
  supra_iliaca_mm: optionalDecimal(1, 100),
  coxa_mm: optionalDecimal(1, 100),
});

const bioSchema = z.object({
  percentual_gordura: optionalDecimal(0, 100),
  massa_gorda_kg: optionalText,
  massa_magra_kg: optionalText,
  massa_muscular_kg: optionalText,
  agua_corporal_percentual: optionalDecimal(0, 100),
  gordura_visceral: optionalText,
  taxa_metabolica_basal: optionalText,
});

const circSchema = z.object({
  pescoco_cm: optionalDecimal(5, 200),
  torax_cm: optionalDecimal(5, 200),
  cintura_cm: optionalDecimal(5, 200),
  abdome_cm: optionalDecimal(5, 200),
  quadril_cm: optionalDecimal(5, 200),
  braco_relaxado_esq_cm: optionalDecimal(5, 200),
  braco_relaxado_dir_cm: optionalDecimal(5, 200),
  braco_contraido_esq_cm: optionalDecimal(5, 200),
  braco_contraido_dir_cm: optionalDecimal(5, 200),
  antebraco_esq_cm: optionalDecimal(5, 200),
  antebraco_dir_cm: optionalDecimal(5, 200),
  coxa_esq_cm: optionalDecimal(5, 200),
  coxa_dir_cm: optionalDecimal(5, 200),
  panturrilha_esq_cm: optionalDecimal(5, 200),
  panturrilha_dir_cm: optionalDecimal(5, 200),
});

function requireGroup(
  context: z.RefinementCtx,
  group: Record<string, string | undefined>,
  fields: string[],
  prefix: "dobras" | "bioimpedancia" | "circunferencias",
) {
  fields.forEach((field) => {
    if (!group[field]) {
      context.addIssue({
        code: "custom",
        path: [prefix, field],
        message: "Campo obrigatorio para este metodo.",
      });
    }
  });
}

export const assessmentSchema = z
  .object({
    aluno_id: optionalText,
    metodo: assessmentMethodSchema,
    data_avaliacao: requiredText("Informe a data da avaliacao."),
    data_proxima_avaliacao: optionalText,
    peso_kg: requiredDecimal("Informe o peso.", 1, 300),
    altura_cm: z.coerce.number().int().min(50, "Informe uma altura entre 50 e 250 cm.").max(250, "Informe uma altura entre 50 e 250 cm."),
    feedback_personal: optionalText,
    ativo: z.boolean(),
    dobras: dobrasSchema,
    bioimpedancia: bioSchema,
    circunferencias: circSchema,
  })
  .superRefine((value, context) => {
    if (!value.aluno_id) {
      context.addIssue({
        code: "custom",
        path: ["aluno_id"],
        message: "Selecione um aluno.",
      });
    }

    if (value.metodo === "DOBRAS" || value.metodo === "COMBINADO") {
      requireGroup(
        context,
        value.dobras,
        [
          "peitoral_mm",
          "axilar_media_mm",
          "triceps_mm",
          "subescapular_mm",
          "abdominal_mm",
          "supra_iliaca_mm",
          "coxa_mm",
        ],
        "dobras",
      );
    }

    if (value.metodo === "BIOIMPEDANCIA") {
      requireGroup(context, value.bioimpedancia, ["percentual_gordura"], "bioimpedancia");
    }

    if (value.metodo === "CIRCUNFERENCIAS" || value.metodo === "COMBINADO") {
      requireGroup(
        context,
        value.circunferencias,
        [
          "pescoco_cm",
          "torax_cm",
          "cintura_cm",
          "abdome_cm",
          "quadril_cm",
          "braco_relaxado_esq_cm",
          "braco_relaxado_dir_cm",
          "braco_contraido_esq_cm",
          "braco_contraido_dir_cm",
          "antebraco_esq_cm",
          "antebraco_dir_cm",
          "coxa_esq_cm",
          "coxa_dir_cm",
          "panturrilha_esq_cm",
          "panturrilha_dir_cm",
        ],
        "circunferencias",
      );
    }

    if (
      value.data_proxima_avaliacao
      && value.data_avaliacao
      && value.data_proxima_avaliacao < value.data_avaliacao
    ) {
      context.addIssue({
        code: "custom",
        path: ["data_proxima_avaliacao"],
        message: "A proxima avaliacao deve ser igual ou posterior a data da avaliacao.",
      });
    }
  });

export type AssessmentForm = z.infer<typeof assessmentSchema>;
