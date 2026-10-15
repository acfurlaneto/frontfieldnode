"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { BRAND_TAGLINE, FieldNodeLogo } from "@/components/FieldNodeLogo";
import { login, isAuthenticated, isAuthAvailable, type AuthError } from "@/services/authService";

/* ──────────────────────────────────────────────────────────────────────────
   Login — FieldNode
   Integrado ao endpoint POST /api/auth/login/ via authService.

   O formulário é habilitado conforme a autenticação estar alcançável. Por
   padrão ela está: as rotas /api/* são reescritas pelo Next para o Django
   (ver next.config.ts), então a chamada sai na mesma origem, sem CORS.

   Não existe mais o aviso de "NEXT_PUBLIC_API_URL ausente": a ausência dessa
   variável não é um defeito, é o caminho de mesma origem. Se o servidor não
   responder, aí sim aparece o erro real, no envio.
   ────────────────────────────────────────────────────────────────────────── */

const HAS_BACKEND = isAuthAvailable();

type FormState = "idle" | "loading" | "error" | "success";

export default function LoginPage() {
  const router = useRouter();
  const fieldRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [error, setError] = useState<AuthError | null>(null);

  /* redireciona se já autenticado */
  useEffect(() => {
    if (isAuthenticated()) router.replace("/dashboard");
  }, [router]);

  /* foco automático */
  useEffect(() => {
    fieldRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formState === "loading") return;

    setError(null);

    if (!username.trim()) {
      setError({ field: "username", message: "Informe seu nome de usuário." });
      return;
    }
    if (!password) {
      setError({ field: "password", message: "Informe sua senha." });
      return;
    }

    setFormState("loading");

    try {
      await login(username.trim(), password);
      setFormState("success");
      router.push("/dashboard");
    } catch (err) {
      setFormState("error");
      setError(err as AuthError);
    }
  }

  const isLoading = formState === "loading" || formState === "success";

  return (
    <AuthLayout>
      <div className="auth-card">
        {/* ── Cabeçalho do card ──
            Sem o selo de conexão: o estado do servidor é assunto do envio do
            formulário, não de um indicador que promete "Online" para o cliente
            sem ter falado com ninguém. */}
        <header className="flex flex-col items-center gap-4 text-center">
          {/* Lockup horizontal COM a assinatura: aqui é a tela de entrada, o
              único lugar em que a linha de contexto da marca cabe sem competir
              com o cabeçalho do app. */}
          <FieldNodeLogo variant="horizontal" tagline={BRAND_TAGLINE} className="mx-auto" />

          <div>
            <h1 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[var(--text-1)]">
              Entrar na operação
            </h1>
            <p className="mt-1 text-xs text-[var(--text-3)]">
              Monitoramento de telemetria agrícola
            </p>
          </div>
        </header>

        {/* ── Formulário ── */}
        <form onSubmit={handleSubmit} noValidate aria-label="Formulário de login" className="mt-5 flex flex-col gap-4">
          {error?.field === "general" && (
            <div className="auth-error-block" role="alert">
              {error.message}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="fn-username">Nome de usuário</label>
            <input
              ref={fieldRef}
              id="fn-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              disabled={isLoading || !HAS_BACKEND}
              aria-describedby={error?.field === "username" ? "fn-username-err" : undefined}
              aria-invalid={error?.field === "username"}
              className="auth-input"
              placeholder="seu_usuario"
            />
            {error?.field === "username" && (
              <span id="fn-username-err" className="auth-field-error" role="alert">
                {error.message}
              </span>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="fn-password">Senha</label>
            <div className="relative flex">
              <input
                id="fn-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                disabled={isLoading || !HAS_BACKEND}
                aria-describedby={error?.field === "password" ? "fn-password-err" : undefined}
                aria-invalid={error?.field === "password"}
                className="auth-input pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1.5 text-[var(--text-3)] transition-colors duration-150 hover:text-[var(--text-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
              </button>
            </div>
            {error?.field === "password" && (
              <span id="fn-password-err" className="auth-field-error" role="alert">
                {error.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !HAS_BACKEND}
            aria-busy={formState === "loading"}
            className="auth-submit mt-1"
          >
            {formState === "loading" ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Entrando…
              </>
            ) : formState === "success" ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Redirecionando…
              </>
            ) : (
              <>
                Entrar <ArrowRight size={16} aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {/* ── Rodapé ── */}
        <footer className="mt-5 text-center text-[13px] text-[var(--text-3)]">
          Não tem conta?{" "}
          <Link href="/register" className="auth-link">
            Criar conta
          </Link>
        </footer>
      </div>
    </AuthLayout>
  );
}
