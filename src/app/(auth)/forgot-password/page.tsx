import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-xl">
        <EmptyState
          icon={ClipboardList}
          title="Recuperar senha"
          description="Tela reservada para solicitar o envio do link de recuperacao por e-mail."
        />
      </div>
    </main>
  );
}
