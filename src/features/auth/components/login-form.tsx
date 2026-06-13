"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/features/auth/api/auth.api";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/auth.schemas";
import { getRoleHome } from "@/lib/auth/role-routes";
import { useAuthStore } from "@/stores/auth-store";

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { detail?: string } | undefined;
    return data?.detail || "Nao foi possivel entrar com esses dados.";
  }

  return "Nao foi possivel entrar agora.";
}

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setAuthError(null);

    try {
      const session = await login(values);
      queryClient.clear();
      setSession(session.access, session.user);
      router.replace(getRoleHome(session.user.tipo));
    } catch (error) {
      const message = getErrorMessage(error);
      setAuthError(message);
      toast.error(message);
    }
  }

  const isSubmitting = form.formState.isSubmitting;
  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;
  const emailField = form.register("email", {
    onChange: () => setAuthError(null),
  });
  const passwordField = form.register("password", {
    onChange: () => setAuthError(null),
  });

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[#f5f5f5]">Bem-vindo de volta</h1>
        <p className="text-sm text-[#888888]">Entre na sua conta FitSync</p>
      </div>

      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-[#f5f5f5]">
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            aria-invalid={Boolean(emailError || authError)}
            className="h-12 border-[#333333] bg-[#1e1e1e] px-4 text-[#f5f5f5] placeholder:text-[#888888] focus-visible:border-[#b8ff57] focus-visible:ring-[#b8ff57]/20 aria-invalid:border-[#ff4d4d] dark:bg-[#1e1e1e]"
            {...emailField}
          />
          {emailError ? <p className="text-xs text-[#ff4d4d]">{emailError}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-[#f5f5f5]">
            Senha
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="********"
              aria-invalid={Boolean(passwordError || authError)}
              className="h-12 border-[#333333] bg-[#1e1e1e] px-4 pr-12 text-[#f5f5f5] placeholder:text-[#888888] focus-visible:border-[#b8ff57] focus-visible:ring-[#b8ff57]/20 aria-invalid:border-[#ff4d4d] dark:bg-[#1e1e1e]"
              {...passwordField}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 size-8 -translate-y-1/2 text-[#888888] hover:bg-transparent hover:text-[#f5f5f5]"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeOff className="size-5" aria-hidden="true" />
              ) : (
                <Eye className="size-5" aria-hidden="true" />
              )}
            </Button>
          </div>
          {passwordError ? <p className="text-xs text-[#ff4d4d]">{passwordError}</p> : null}
          {authError ? <p className="text-xs text-[#ff4d4d]">{authError}</p> : null}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-12 w-full rounded-lg bg-[#b8ff57] font-bold text-[#0e0e0e] hover:bg-[#a5e84c] focus-visible:ring-[#b8ff57] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0e0e]"
        >
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          Entrar
        </Button>

        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-medium text-[#b8ff57] hover:underline">
            Esqueci minha senha
          </Link>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-[#2a2a2a]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[#0e0e0e] px-3 text-[#888888]">ou</span>
          </div>
        </div>

        <div className="text-center">
          <span className="text-sm text-[#888888]">Nao tem conta? </span>
          <Link href="/register" className="text-sm font-medium text-[#b8ff57] hover:underline">
            Criar conta
          </Link>
        </div>
      </form>
    </div>
  );
}
