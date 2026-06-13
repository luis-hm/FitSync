import type { ReactNode } from "react";
import { methodLabel, formatMetric } from "@/features/assessments/mappers/assessments.mappers";
import type { Assessment } from "@/features/assessments/types/assessments.types";
import { formatDate } from "@/features/accounts/mappers/accounts.mappers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AssessmentDetailDialog({
  assessment,
  onOpenChange,
}: {
  assessment: Assessment | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={Boolean(assessment)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{assessment?.aluno_nome ?? "Avaliacao"}</DialogTitle>
          <DialogDescription>
            {assessment ? `${methodLabel(assessment.metodo)} em ${formatDate(assessment.data_avaliacao)}` : "Detalhes da avaliacao"}
          </DialogDescription>
        </DialogHeader>
        {assessment ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Peso" value={formatMetric(assessment.peso_kg, " kg")} />
              <Metric label="Gordura" value={formatMetric(assessment.percentual_gordura, "%")} />
              <Metric label="Massa magra" value={formatMetric(assessment.massa_magra_kg, " kg")} />
              <Metric label="RCQ" value={formatMetric(assessment.rcq)} />
            </div>

            <Section title="Dobras">
              {assessment.dobras ? (
                <MetricGrid
                  items={[
                    ["Peitoral", assessment.dobras.peitoral_mm, " mm"],
                    ["Axilar", assessment.dobras.axilar_media_mm, " mm"],
                    ["Triceps", assessment.dobras.triceps_mm, " mm"],
                    ["Subescapular", assessment.dobras.subescapular_mm, " mm"],
                    ["Abdominal", assessment.dobras.abdominal_mm, " mm"],
                    ["Supra iliaca", assessment.dobras.supra_iliaca_mm, " mm"],
                    ["Coxa", assessment.dobras.coxa_mm, " mm"],
                  ]}
                />
              ) : null}
            </Section>

            <Section title="Bioimpedancia">
              {assessment.bioimpedancia ? (
                <MetricGrid
                  items={[
                    ["Gordura", assessment.bioimpedancia.percentual_gordura, "%"],
                    ["Massa gorda", assessment.bioimpedancia.massa_gorda_kg, " kg"],
                    ["Massa magra", assessment.bioimpedancia.massa_magra_kg, " kg"],
                    ["Massa muscular", assessment.bioimpedancia.massa_muscular_kg, " kg"],
                    ["Agua corporal", assessment.bioimpedancia.agua_corporal_percentual, "%"],
                    ["Gordura visceral", assessment.bioimpedancia.gordura_visceral, ""],
                  ]}
                />
              ) : null}
            </Section>

            <Section title="Circunferencias">
              {assessment.circunferencias ? (
                <MetricGrid
                  items={[
                    ["Pescoco", assessment.circunferencias.pescoco_cm, " cm"],
                    ["Torax", assessment.circunferencias.torax_cm, " cm"],
                    ["Cintura", assessment.circunferencias.cintura_cm, " cm"],
                    ["Abdome", assessment.circunferencias.abdome_cm, " cm"],
                    ["Quadril", assessment.circunferencias.quadril_cm, " cm"],
                    ["Braco relaxado", assessment.circunferencias.braco_relaxado_cm, " cm"],
                    ["Braco contraido", assessment.circunferencias.braco_contraido_cm, " cm"],
                    ["Antebraco", assessment.circunferencias.antebraco_cm, " cm"],
                    ["Coxa", assessment.circunferencias.coxa_cm, " cm"],
                    ["Panturrilha", assessment.circunferencias.panturrilha_cm, " cm"],
                  ]}
                />
              ) : null}
            </Section>

            {assessment.feedback_personal ? (
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="mb-1 text-sm font-semibold text-foreground">Feedback</div>
                <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">{assessment.feedback_personal}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  if (!children) return null;
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function MetricGrid({ items }: { items: Array<[string, string | number | null | undefined, string]> }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([label, value, suffix]) => (
        <Metric key={label} label={label} value={formatMetric(value, suffix)} />
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold text-foreground">{value}</div>
    </div>
  );
}
