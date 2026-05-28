import { DashboardGrid } from "@/components/shared/dashboard-grid";

export default function PersonalDashboardPage() {
  return (
    <DashboardGrid
      title="Painel do personal"
      description="Resumo de alunos, treinos aplicados, avaliacoes e evolucao acompanhada."
      cards={[
        { title: "Alunos", value: "--", description: "Alunos sob acompanhamento", icon: "users" },
        { title: "Treinos", value: "--", description: "Treinos ativos", icon: "dumbbell" },
        { title: "Avaliacoes", value: "--", description: "Avaliacoes registradas", icon: "activity" },
        { title: "Evolucao", value: "--", description: "Indicadores recentes", icon: "chart" },
      ]}
    />
  );
}
