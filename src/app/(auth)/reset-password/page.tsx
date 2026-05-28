import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-xl">
        <EmptyState
          icon={ClipboardList}
          title="Nova senha"
          description="Esta rota recebe uid e token enviados pelo backend no link de recuperacao."
        />
      </div>
    </main>
  );
}
