import { Activity, Dumbbell, TrendingUp } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";

const features = [
  { icon: Dumbbell, text: "Treinos personalizados" },
  { icon: Activity, text: "Avaliacoes fisicas completas" },
  { icon: TrendingUp, text: "Evolucao em tempo real" },
];

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0e0e0e] text-[#f5f5f5] lg:grid lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#0d0d0d] px-12 py-14 lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="absolute inset-0 opacity-35" aria-hidden="true">
          <div className="absolute left-20 top-20 size-64 rounded-full border border-[#1a1a1a]" />
          <div className="absolute bottom-32 right-14 size-96 rounded-full border border-[#1a1a1a]" />
          <div className="absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#1a1a1a]" />
          <div className="absolute left-1/2 top-1/2 size-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#151515]" />
        </div>

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-[#b8ff57] text-[#0e0e0e]">
              <Dumbbell className="size-9" aria-hidden="true" />
            </span>
            <span className="text-4xl font-bold tracking-tight text-[#f5f5f5]">FitSync</span>
          </div>
          <p className="mt-8 text-2xl font-medium text-[#9a9a9a]">
            Acompanhe. Evolua. Supere.
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#777777]">
            Plataforma para personais e alunos manterem treinos, avaliacoes e progresso no mesmo
            lugar.
          </p>
        </div>

        <div className="absolute bottom-14 left-1/2 z-10 grid w-full max-w-xl -translate-x-1/2 grid-cols-3 gap-8 px-10">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div key={feature.text} className="flex min-w-0 flex-col items-center gap-3 text-center">
                <span className="flex size-12 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] text-[#b8ff57]">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span className="text-sm leading-5 text-[#888888]">{feature.text}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-16">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <span className="flex size-12 items-center justify-center rounded-xl bg-[#b8ff57] text-[#0e0e0e]">
              <Dumbbell className="size-7" aria-hidden="true" />
            </span>
            <span className="text-3xl font-bold tracking-tight text-[#f5f5f5]">FitSync</span>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
