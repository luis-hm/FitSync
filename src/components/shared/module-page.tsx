import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

type ModulePageProps = {
  title: string;
  description: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function ModulePage({
  title,
  description,
  emptyTitle = "Sem registros ainda",
  emptyDescription = "Os dados deste modulo aparecerao aqui assim que a integracao com a API for conectada.",
}: ModulePageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <EmptyState icon={ClipboardList} title={emptyTitle} description={emptyDescription} />
    </div>
  );
}
