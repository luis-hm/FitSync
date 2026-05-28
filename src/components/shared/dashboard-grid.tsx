import { Activity, BarChart3, Dumbbell, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";

type DashboardGridProps = {
  title: string;
  description: string;
  cards: Array<{
    title: string;
    value: string;
    description: string;
    icon: "users" | "dumbbell" | "activity" | "chart";
  }>;
};

const icons = {
  users: Users,
  dumbbell: Dumbbell,
  activity: Activity,
  chart: BarChart3,
};

export function DashboardGrid({ title, description, cards }: DashboardGridProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} icon={icons[card.icon]} />
        ))}
      </div>
    </div>
  );
}
