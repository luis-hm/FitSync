import { DashboardGrid } from "@/components/shared/dashboard-grid";

export default function AdminDashboardPage() {
  return (
    <DashboardGrid
      title="Painel administrativo"
      description="Visao inicial para acompanhar usuarios, personais, alunos e cadastros base."
      cards={[
        { title: "Usuarios", value: "--", description: "Contas cadastradas", icon: "users" },
        { title: "Personais", value: "--", description: "Profissionais ativos", icon: "activity" },
        { title: "Alunos", value: "--", description: "Alunos vinculados", icon: "users" },
        { title: "Exercicios", value: "--", description: "Base de exercicios", icon: "dumbbell" },
      ]}
    />
  );
}
