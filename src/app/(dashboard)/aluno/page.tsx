import { DashboardGrid } from "@/components/shared/dashboard-grid";

export default function StudentDashboardPage() {
  return (
    <DashboardGrid
      title="Area do aluno"
      description="Resumo do treino atual, avaliacoes fisicas e indicadores de evolucao."
      cards={[
        { title: "Treino atual", value: "--", description: "Rotina em andamento", icon: "dumbbell" },
        { title: "Avaliacoes", value: "--", description: "Historico fisico", icon: "activity" },
        { title: "Evolucao", value: "--", description: "Progresso recente", icon: "chart" },
        { title: "Perfil", value: "--", description: "Dados cadastrais", icon: "users" },
      ]}
    />
  );
}
