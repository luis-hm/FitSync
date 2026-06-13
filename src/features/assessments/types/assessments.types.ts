import type { components, operations } from "@/types/generated/api";

type GeneratedAssessment = components["schemas"]["Avaliacao"];
type GeneratedAssessmentCreatePayload = components["schemas"]["AvaliacaoRequest"];
type GeneratedAssessmentUpdatePayload = components["schemas"]["PatchedAvaliacaoRequest"];

export type AssessmentCircumferences = {
  pescoco_cm: string;
  torax_cm: string;
  cintura_cm: string;
  abdome_cm: string;
  quadril_cm: string;
  braco_relaxado_esq_cm?: string | null;
  braco_relaxado_dir_cm?: string | null;
  braco_contraido_esq_cm?: string | null;
  braco_contraido_dir_cm?: string | null;
  antebraco_esq_cm?: string | null;
  antebraco_dir_cm?: string | null;
  coxa_esq_cm?: string | null;
  coxa_dir_cm?: string | null;
  panturrilha_esq_cm?: string | null;
  panturrilha_dir_cm?: string | null;
  braco_relaxado_cm?: string | null;
  braco_contraido_cm?: string | null;
  antebraco_cm?: string | null;
  coxa_cm?: string | null;
  panturrilha_cm?: string | null;
};

export type AssessmentCircumferencesPayload = Omit<
  AssessmentCircumferences,
  "braco_relaxado_cm" | "braco_contraido_cm" | "antebraco_cm" | "coxa_cm" | "panturrilha_cm"
>;

export type Assessment = Omit<GeneratedAssessment, "circunferencias"> & {
  aluno_id?: string;
  data_proxima_avaliacao?: string | null;
  readonly data_atualizacao?: string;
  readonly imc?: string | null;
  readonly iac?: string | null;
  readonly classificacao_imc?: string | null;
  readonly classificacao_iac?: string | null;
  readonly classificacao_percentual_gordura?: string | null;
  readonly classificacao_rcq?: string | null;
  readonly status_periodicidade?: string | null;
  circunferencias?: AssessmentCircumferences | null;
};
export type AssessmentCreatePayload = Omit<GeneratedAssessmentCreatePayload, "circunferencias"> & {
  data_proxima_avaliacao?: string | null;
  circunferencias?: AssessmentCircumferencesPayload | null;
};
export type AssessmentUpdatePayload = Omit<GeneratedAssessmentUpdatePayload, "circunferencias"> & {
  data_proxima_avaliacao?: string | null;
  circunferencias?: Partial<AssessmentCircumferencesPayload> | null;
};
export type AssessmentMethod = components["schemas"]["AvaliacaoMetodoEnum"];
export type AssessmentsParams = operations["assessments_avaliacoes_list"]["parameters"]["query"];
export type AssessmentsResponse = Omit<
  operations["assessments_avaliacoes_list"]["responses"][200]["content"]["application/json"],
  "results"
> & {
  results: Assessment[];
};

export type EvolutionMetricValue = string | null;

export type EvolutionPoint = {
  id: string;
  data_avaliacao: string;
  metodo: AssessmentMethod;
  peso_kg: string;
  imc?: EvolutionMetricValue;
  iac?: EvolutionMetricValue;
  percentual_gordura: EvolutionMetricValue;
  massa_gorda_kg: EvolutionMetricValue;
  massa_magra_kg: EvolutionMetricValue;
  rcq: EvolutionMetricValue;
  classificacao_imc?: string | null;
  classificacao_iac?: string | null;
  classificacao_percentual_gordura?: string | null;
  classificacao_rcq?: string | null;
  status_periodicidade?: string | null;
  data_proxima_avaliacao?: string | null;
  circunferencias: {
    cintura_cm: EvolutionMetricValue;
    abdome_cm: EvolutionMetricValue;
    quadril_cm: EvolutionMetricValue;
    coxa_esq_cm?: EvolutionMetricValue;
    coxa_dir_cm?: EvolutionMetricValue;
    braco_contraido_esq_cm?: EvolutionMetricValue;
    braco_contraido_dir_cm?: EvolutionMetricValue;
    coxa_cm?: EvolutionMetricValue;
    braco_contraido_cm?: EvolutionMetricValue;
  };
  deltas: {
    peso_kg: EvolutionMetricValue;
    imc?: EvolutionMetricValue;
    iac?: EvolutionMetricValue;
    percentual_gordura: EvolutionMetricValue;
    massa_gorda_kg: EvolutionMetricValue;
    massa_magra_kg: EvolutionMetricValue;
    rcq: EvolutionMetricValue;
  };
};

export type StudentEvolutionResponse = {
  aluno_id: string;
  aluno_nome: string;
  results: EvolutionPoint[];
};

export type EvolutionParams = {
  data_inicio?: string;
  data_fim?: string;
};

export type RankingItem = {
  aluno_id: string;
  aluno_nome: string;
  percentual_inicial: string;
  percentual_final: string;
  variacao_percentual_gordura: string;
};

export type PersonalRankingResponse = {
  results: RankingItem[];
};

export type AssessmentSummary = {
  aluno_id: string;
  aluno_nome: string;
  total_avaliacoes?: number;
  ultima_avaliacao?: Assessment | null;
  proxima_avaliacao?: string | null;
  data_proxima_avaliacao?: string | null;
  status_periodicidade?: string | null;
  classificacoes?: Record<string, string | null | undefined>;
  deltas?: Record<string, string | number | null | undefined>;
};

export type Anamnese = {
  id?: string;
  aluno_id?: string;
  aluno_nome?: string;
  historico_familiar?: string;
  doencas_preexistentes?: string;
  lesoes?: string;
  medicamentos?: string;
  alergias?: string;
  cirurgias?: string;
  restricoes_exercicio?: string;
  observacoes?: string;
  ativo?: boolean;
  data_criacao?: string;
  data_atualizacao?: string;
};

export type AnamnesePayload = {
  aluno_id?: string;
  historico_familiar?: string;
  doencas_preexistentes?: string;
  lesoes?: string;
  medicamentos?: string;
  alergias?: string;
  cirurgias?: string;
  restricoes_exercicio?: string;
  observacoes?: string;
  ativo?: boolean;
};

export type AssessmentClassificationColor = "success" | "warning" | "danger" | "neutral" | string;

export type AssessmentClassificationMarker = {
  label?: string;
  valor: string | number;
};

export type AssessmentClassificationRange = {
  label: string;
  min?: string | number | null;
  max?: string | number | null;
  cor: AssessmentClassificationColor;
};

export type AssessmentClassification = {
  id: string;
  label: string;
  descricao?: string;
  valor?: string | number | null;
  unidade?: string;
  nivel?: string;
  cor?: AssessmentClassificationColor;
  min?: string | number | null;
  max?: string | number | null;
  marcadores?: AssessmentClassificationMarker[];
  faixas?: AssessmentClassificationRange[];
};
