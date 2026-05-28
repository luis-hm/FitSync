import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
      <section className="hidden border-r border-border bg-muted/30 px-12 py-10 lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-lg font-semibold tracking-tight text-foreground">FitSync</p>
        </div>
        <div className="max-w-xl">
          <p className="text-4xl font-semibold leading-tight tracking-tight text-foreground">
            Treinos, avaliacoes e evolucao em uma rotina clara para personal e aluno.
          </p>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Plataforma operacional para acompanhar progresso, aplicar treinos e manter a gestao de
            alunos sempre organizada.
          </p>
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-4 py-10">
        <LoginForm />
      </section>
    </main>
  );
}
