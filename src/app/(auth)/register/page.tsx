import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-xl">
        <EmptyState
          icon={ClipboardList}
          title="Cadastro"
          description="A interface de cadastro fica pronta para consumir /api/auth/register/ com os tipos vindos de /api/options/."
        />
      </div>
    </main>
  );
}
