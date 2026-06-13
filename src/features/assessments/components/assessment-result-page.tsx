"use client";

import { ArrowLeft, BarChart3, CalendarClock, ClipboardList, MessageSquareText, Ruler, Scale } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PeriodicityStatusBadge } from "@/components/shared/list-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyPanel, ErrorPanel, LoadingPanel } from "@/components/shared/admin-screen";
import { PageHeader } from "@/components/shared/page-header";
import { useAssessment } from "@/features/assessments/hooks/use-assessments";
import { formatMetric, methodLabel, numberValue } from "@/features/assessments/mappers/assessments.mappers";
import type { Assessment, AssessmentClassification, AssessmentClassificationColor } from "@/features/assessments/types/assessments.types";
import { formatDate, formatDateTime } from "@/features/accounts/mappers/accounts.mappers";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type Audience = "student" | "personal";

export function AssessmentResultPage({
  assessmentId,
  audience,
}: {
  assessmentId: string;
  audience: Audience;
}) {
  const assessmentQuery = useAssessment(assessmentId);
  const backHref = audience === "personal" ? "/personal/avaliacoes" : "/aluno/avaliacoes";

  if (assessmentQuery.isLoading) {
    return <LoadingPanel rows={6} />;
  }

  if (assessmentQuery.isError) {
    return (
      <ErrorPanel
        description={getApiErrorMessage(assessmentQuery.error, "Nao foi possivel carregar o resultado da avaliacao.")}
      />
    );
  }

  if (!assessmentQuery.data) {
    return (
      <EmptyPanel
        icon={BarChart3}
        title="Resultado nao encontrado"
        description="Nao encontramos os dados desta avaliacao."
      />
    );
  }

  const assessment = assessmentQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Avaliacao de ${assessment.aluno_nome}`}
        description={`${methodLabel(assessment.metodo)} em ${formatDate(assessment.data_avaliacao)} por ${assessment.personal_nome}`}
        action={
          <Button asChild variant="outline">
            <Link href={backHref}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Voltar
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <SummaryPanel assessment={assessment} />
        <PeriodicityPanel assessment={assessment} />
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        {assessmentClassifications(assessment).map((classification) => (
          <ClassificationCard key={classification.id} classification={classification} />
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <CircumferencesPanel assessment={assessment} />
        <SkinfoldsPanel assessment={assessment} />
      </div>

      <BioimpedancePanel assessment={assessment} />

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <FeedbackPanel feedback={assessment.feedback_personal} />
        <DerivedFieldsPanel assessment={assessment} />
      </div>
    </div>
  );
}

function SummaryPanel({ assessment }: { assessment: Assessment }) {
  const fatPercent = numberValue(assessment.percentual_gordura);
  const leanPercent = fatPercent === null ? null : Math.max(0, 100 - fatPercent);

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{assessment.aluno_nome}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline">{methodLabel(assessment.metodo)}</Badge>
            <Badge variant="outline">{formatDate(assessment.data_avaliacao)}</Badge>
            <PeriodicityStatusBadge status={assessment.status_periodicidade} />
          </div>
        </div>
        <Scale className="size-10 text-primary" aria-hidden="true" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Peso" value={formatMetric(assessment.peso_kg, " kg")} />
        <MetricCard label="Gordura" value={formatMetric(assessment.percentual_gordura, "%")} />
        <MetricCard label="IMC" value={formatMetric(assessment.imc)} />
        <MetricCard label="IAC" value={formatMetric(assessment.iac, "%")} />
      </div>

      {fatPercent !== null ? (
        <div className="mt-5 rounded-lg border border-border bg-muted/20 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Composicao corporal</h3>
            <p className="text-sm text-muted-foreground">Percentual calculado pela API a partir da avaliacao registrada.</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <LegendDot color="danger" label={`${formatMetric(fatPercent, "%")} - Massa gorda`} />
              <LegendDot color="success" label={`${formatMetric(leanPercent, "%")} - Massa magra`} />
            </div>
            <div
              className="size-28 rounded-full"
              style={{
                background: `conic-gradient(#dc2626 0 ${fatPercent}%, #16a34a ${fatPercent}% 100%)`,
              }}
            >
              <div className="m-4 size-20 rounded-full bg-card" />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PeriodicityPanel({ assessment }: { assessment: Assessment }) {
  return (
    <aside className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <CalendarClock className="size-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-foreground">Ciclo da avaliacao</h2>
      </div>
      <div className="space-y-3">
        <InfoRow label="Realizada" value={formatDate(assessment.data_avaliacao)} />
        <InfoRow label="Proxima avaliacao" value={formatDate(assessment.data_proxima_avaliacao)} />
        <InfoRow label="Status" value={<PeriodicityStatusBadge status={assessment.status_periodicidade} />} />
        <InfoRow label="Atualizada" value={formatDateTime(assessment.data_atualizacao)} />
      </div>
    </aside>
  );
}

function ClassificationCard({ classification }: { classification: AssessmentClassification }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">{classification.label}</h2>
          {classification.descricao ? (
            <p className="mt-1 text-sm text-muted-foreground">{classification.descricao}</p>
          ) : null}
        </div>
        {classification.nivel ? (
          <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold", levelClassName(classification.cor))}>
            {classification.nivel}
            <span className={cn("size-3 rounded-full", levelDotClassName(classification.cor))} />
          </span>
        ) : null}
      </div>
      <div className="text-3xl font-semibold text-foreground">
        {formatMetric(classification.valor, classification.unidade ? ` ${classification.unidade}` : "")}
      </div>
    </section>
  );
}

function CircumferencesPanel({ assessment }: { assessment: Assessment }) {
  const circ = assessment.circunferencias;
  if (!circ) return null;

  return (
    <MeasurementPanel title="Perimetros" subtitle="Medidas em centimetros">
      <BilateralGroup
        title="Membros superiores"
        items={[
          ["Braco relaxado", circ.braco_relaxado_esq_cm ?? circ.braco_relaxado_cm, circ.braco_relaxado_dir_cm ?? circ.braco_relaxado_cm],
          ["Braco contraido", circ.braco_contraido_esq_cm ?? circ.braco_contraido_cm, circ.braco_contraido_dir_cm ?? circ.braco_contraido_cm],
          ["Antebraco", circ.antebraco_esq_cm ?? circ.antebraco_cm, circ.antebraco_dir_cm ?? circ.antebraco_cm],
        ]}
      />
      <BilateralGroup
        title="Membros inferiores"
        items={[
          ["Coxa", circ.coxa_esq_cm ?? circ.coxa_cm, circ.coxa_dir_cm ?? circ.coxa_cm],
          ["Panturrilha", circ.panturrilha_esq_cm ?? circ.panturrilha_cm, circ.panturrilha_dir_cm ?? circ.panturrilha_cm],
        ]}
      />
      <MeasurementGroup
        title="Tronco"
        items={[
          ["Torax", circ.torax_cm, " cm"],
          ["Cintura", circ.cintura_cm, " cm"],
          ["Abdome", circ.abdome_cm, " cm"],
          ["Quadril", circ.quadril_cm, " cm"],
        ]}
      />
      <MeasurementGroup title="Outros" items={[["Pescoco", circ.pescoco_cm, " cm"]]} />
    </MeasurementPanel>
  );
}

function SkinfoldsPanel({ assessment }: { assessment: Assessment }) {
  const dobras = assessment.dobras;
  if (!dobras) return null;

  return (
    <MeasurementPanel title="Dobras cutaneas" subtitle="Medidas em milimetros">
      <MeasurementGroup
        title="Superiores"
        items={[
          ["Subescapular", dobras.subescapular_mm, " mm"],
          ["Triceps", dobras.triceps_mm, " mm"],
          ["Peitoral", dobras.peitoral_mm, " mm"],
          ["Axilar media", dobras.axilar_media_mm, " mm"],
          ["Supra iliaca", dobras.supra_iliaca_mm, " mm"],
          ["Abdominal", dobras.abdominal_mm, " mm"],
        ]}
      />
      <MeasurementGroup title="Inferiores" items={[["Coxa", dobras.coxa_mm, " mm"]]} />
      <MeasurementGroup title="Soma" items={[["7 dobras", dobras.soma_7_dobras, " mm"]]} />
    </MeasurementPanel>
  );
}

function BioimpedancePanel({ assessment }: { assessment: Assessment }) {
  const bio = assessment.bioimpedancia;
  if (!bio) return null;

  return (
    <MeasurementPanel title="Bioimpedancia" subtitle="Dados informados pelo equipamento">
      <MeasurementGroup
        title="Composicao"
        items={[
          ["Gordura", bio.percentual_gordura, "%"],
          ["Massa gorda", bio.massa_gorda_kg, " kg"],
          ["Massa magra", bio.massa_magra_kg, " kg"],
          ["Massa muscular", bio.massa_muscular_kg, " kg"],
          ["Agua corporal", bio.agua_corporal_percentual, "%"],
          ["Gordura visceral", bio.gordura_visceral, ""],
          ["Taxa metabolica basal", bio.taxa_metabolica_basal, ""],
        ]}
      />
    </MeasurementPanel>
  );
}

function FeedbackPanel({ feedback }: { feedback?: string | null }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <MessageSquareText className="size-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-foreground">Feedback do personal</h2>
      </div>
      <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
        {feedback || "Nenhum feedback registrado para esta avaliacao."}
      </p>
    </section>
  );
}

function DerivedFieldsPanel({ assessment }: { assessment: Assessment }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <ClipboardList className="size-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-foreground">Indicadores calculados</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <MetricCard label="Massa gorda" value={formatMetric(assessment.massa_gorda_kg, " kg")} />
        <MetricCard label="Massa magra" value={formatMetric(assessment.massa_magra_kg, " kg")} />
        <MetricCard label="Densidade corporal" value={formatMetric(assessment.densidade_corporal)} />
        <MetricCard label="RCQ" value={formatMetric(assessment.rcq)} />
      </div>
    </section>
  );
}

function MeasurementPanel({
  children,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-5">
        <div className="flex items-center gap-2">
          <Ruler className="size-4 text-primary" aria-hidden="true" />
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="divide-y divide-dashed divide-border p-5">{children}</div>
    </section>
  );
}

function BilateralGroup({
  items,
  title,
}: {
  items: Array<[string, string | number | null | undefined, string | number | null | undefined]>;
  title: string;
}) {
  const visibleItems = items.filter(([, left, right]) => Boolean(left || right));
  if (visibleItems.length === 0) return null;

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="mb-3 grid grid-cols-[1fr_90px_90px] gap-3 text-sm">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="text-right text-muted-foreground">Esquerdo</span>
        <span className="text-right text-muted-foreground">Direito</span>
      </div>
      <div className="space-y-2">
        {visibleItems.map(([label, left, right]) => (
          <div key={label} className="grid grid-cols-[1fr_90px_90px] gap-3 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-semibold text-foreground">{formatMetric(left, " cm")}</span>
            <span className="text-right font-semibold text-foreground">{formatMetric(right, " cm")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeasurementGroup({
  items,
  title,
}: {
  items: Array<[string, string | number | null | undefined, string]>;
  title: string;
}) {
  const visibleItems = items.filter(([, value]) => value !== null && value !== undefined && value !== "");
  if (visibleItems.length === 0) return null;

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-2">
        {visibleItems.map(([label, value, suffix]) => (
          <div key={label} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold text-foreground">{formatMetric(value, suffix)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function LegendDot({ color, label }: { color: "success" | "danger"; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className={cn("size-3 rounded-full", color === "success" ? "bg-[#16A34A]" : "bg-[#DC2626]")} />
      {label}
    </div>
  );
}

function assessmentClassifications(assessment: Assessment): AssessmentClassification[] {
  return [
    {
      id: "percentual_gordura",
      label: "Massa gorda",
      descricao: "Classificacao do percentual de gordura.",
      valor: assessment.percentual_gordura,
      unidade: "%",
      nivel: assessment.classificacao_percentual_gordura ?? undefined,
      cor: classificationColor(assessment.classificacao_percentual_gordura),
    },
    {
      id: "imc",
      label: "IMC",
      descricao: "Indice de Massa Corporal.",
      valor: assessment.imc,
      nivel: assessment.classificacao_imc ?? undefined,
      cor: classificationColor(assessment.classificacao_imc),
    },
    {
      id: "iac",
      label: "IAC",
      descricao: "Indice de Adiposidade Corporal.",
      valor: assessment.iac,
      unidade: "%",
      nivel: assessment.classificacao_iac ?? undefined,
      cor: classificationColor(assessment.classificacao_iac),
    },
    {
      id: "rcq",
      label: "RCQ",
      descricao: "Relacao Cintura x Quadril.",
      valor: assessment.rcq,
      nivel: assessment.classificacao_rcq ?? undefined,
      cor: classificationColor(assessment.classificacao_rcq),
    },
  ].filter((item) => item.valor !== null && item.valor !== undefined && item.valor !== "-");
}

function classificationColor(label?: string | null): AssessmentClassificationColor {
  const normalized = label?.toLowerCase() ?? "";
  if (normalized.includes("baixo") || normalized.includes("normal") || normalized.includes("adequado")) return "success";
  if (normalized.includes("sobrepeso") || normalized.includes("moderado") || normalized.includes("aten")) return "warning";
  if (normalized.includes("obes") || normalized.includes("alto") || normalized.includes("risco")) return "danger";
  return "neutral";
}

function levelClassName(color?: AssessmentClassificationColor) {
  if (color === "success") return "bg-[#22C55E]/10 text-[#15803D]";
  if (color === "warning") return "bg-[#F59E0B]/10 text-[#B45309]";
  if (color === "danger") return "bg-destructive/10 text-destructive";
  return "bg-muted text-muted-foreground";
}

function levelDotClassName(color?: AssessmentClassificationColor) {
  if (color === "success") return "bg-[#16A34A]";
  if (color === "warning") return "bg-[#F59E0B]";
  if (color === "danger") return "bg-destructive";
  return "bg-muted-foreground";
}
