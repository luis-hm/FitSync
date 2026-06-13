import type { AssessmentForm } from "@/features/assessments/schemas/assessments.schemas";
import type {
  AssessmentCreatePayload,
  Assessment,
  AssessmentMethod,
  AssessmentUpdatePayload,
  EvolutionPoint,
} from "@/features/assessments/types/assessments.types";

function compact<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== ""),
  ) as T;
}

export function toAssessmentPayload(
  form: AssessmentForm,
  options: { includeAluno: boolean } = { includeAluno: true },
): AssessmentCreatePayload | AssessmentUpdatePayload {
  const payload: AssessmentCreatePayload | AssessmentUpdatePayload = compact({
    aluno_id: options.includeAluno ? form.aluno_id : undefined,
    metodo: form.metodo,
    data_avaliacao: form.data_avaliacao,
    data_proxima_avaliacao: form.data_proxima_avaliacao || undefined,
    peso_kg: form.peso_kg,
    altura_cm: form.altura_cm,
    feedback_personal: form.feedback_personal,
    ativo: form.ativo,
  });

  if (form.metodo === "DOBRAS" || form.metodo === "COMBINADO") {
    payload.dobras = compact(form.dobras) as AssessmentCreatePayload["dobras"];
  }

  if (form.metodo === "BIOIMPEDANCIA") {
    payload.bioimpedancia = compact({
      ...form.bioimpedancia,
      taxa_metabolica_basal: form.bioimpedancia.taxa_metabolica_basal
        ? Number(form.bioimpedancia.taxa_metabolica_basal)
        : undefined,
    }) as AssessmentCreatePayload["bioimpedancia"];
  }

  if (form.metodo === "CIRCUNFERENCIAS" || form.metodo === "COMBINADO") {
    payload.circunferencias = compact(form.circunferencias) as AssessmentCreatePayload["circunferencias"];
  }

  return payload;
}

export function methodLabel(method?: AssessmentMethod | string) {
  const labels: Record<string, string> = {
    DOBRAS: "Dobras",
    BIOIMPEDANCIA: "Bioimpedancia",
    CIRCUNFERENCIAS: "Circunferencias",
    COMBINADO: "Combinado",
  };
  return method ? labels[method] ?? method : "-";
}

export function numberValue(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatMetric(value?: string | number | null, suffix = "") {
  const parsed = numberValue(value);
  if (parsed === null) return "-";
  return `${parsed.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}${suffix}`;
}

export function formatDelta(value?: string | number | null, suffix = "") {
  const parsed = numberValue(value);
  if (parsed === null) return "-";
  const sign = parsed > 0 ? "+" : "";
  return `${sign}${parsed.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}${suffix}`;
}

export function deltaStatus(value?: string | number | null, lowerIsBetter = false) {
  const parsed = numberValue(value);
  if (parsed === null || parsed === 0) return "neutral";
  const improved = lowerIsBetter ? parsed < 0 : parsed > 0;
  return improved ? "positive" : "negative";
}

function difference(current?: string | number | null, previous?: string | number | null) {
  const currentValue = numberValue(current);
  const previousValue = numberValue(previous);
  if (currentValue === null || previousValue === null) return null;
  return currentValue - previousValue;
}

export function assessmentListDeltas(assessments: Assessment[]) {
  const sorted = [...assessments].sort((left, right) => {
    const leftStudent = left.aluno_id ?? left.aluno_nome;
    const rightStudent = right.aluno_id ?? right.aluno_nome;
    if (leftStudent !== rightStudent) return leftStudent.localeCompare(rightStudent);
    return new Date(left.data_avaliacao).getTime() - new Date(right.data_avaliacao).getTime();
  });

  const previousByStudent = new Map<string, Assessment>();
  const deltasById = new Map<string, { peso_kg: number | null; percentual_gordura: number | null }>();

  sorted.forEach((assessment) => {
    const studentKey = assessment.aluno_id ?? assessment.aluno_nome;
    const previous = previousByStudent.get(studentKey);
    deltasById.set(assessment.id, {
      peso_kg: previous ? difference(assessment.peso_kg, previous.peso_kg) : null,
      percentual_gordura: previous
        ? difference(assessment.percentual_gordura, previous.percentual_gordura)
        : null,
    });
    previousByStudent.set(studentKey, assessment);
  });

  return deltasById;
}

export function evolutionChartData(points?: EvolutionPoint[]) {
  return (points ?? []).map((point) => ({
    date: new Date(point.data_avaliacao).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    peso: numberValue(point.peso_kg),
    imc: numberValue(point.imc),
    iac: numberValue(point.iac),
    gordura: numberValue(point.percentual_gordura),
    massaMagra: numberValue(point.massa_magra_kg),
    rcq: numberValue(point.rcq),
  }));
}
