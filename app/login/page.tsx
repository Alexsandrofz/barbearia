"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Scissors,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type UserRole =
  | "owner"
  | "manager"
  | "barber"
  | "customer";

type PublicBusiness = {
  name: string;
  logo_url: string | null;
};

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [business, setBusiness] =
    useState<PublicBusiness | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBusiness() {
      try {
        const supabase = createClient();

        const {
          data,
          error,
        } = await supabase
          .from("businesses")
          .select(`
            name,
            logo_url
          `)
          .eq("active", true)
          .limit(1)
          .maybeSingle();

        if (cancelled) {
          return;
        }

        if (error) {
          console.error(
            "Erro ao carregar identidade da barbearia:",
            error,
          );

          return;
        }

        if (data) {
          setBusiness(
            data as PublicBusiness,
          );
        }
      } catch (error) {
        console.error(
          "Erro ao carregar identidade da barbearia:",
          error,
        );
      }
    }

    loadBusiness();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formData =
      new FormData(event.currentTarget);

    const email = String(
      formData.get("email") ?? "",
    ).trim();

    const password = String(
      formData.get("password") ?? "",
    );

    setLoading(true);
    setErrorMessage("");

    const supabase = createClient();

    /*
     * 1. Faz login no Supabase.
     */
    const {
      data: authData,
      error: authError,
    } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (
      authError ||
      !authData.user
    ) {
      setLoading(false);

      setErrorMessage(
        "E-mail ou senha inválidos.",
      );

      return;
    }

    /*
     * 2. Descobre qual papel esse usuário
     * possui dentro da barbearia.
     */
    const {
      data: membership,
      error: membershipError,
    } = await supabase
      .from("business_members")
      .select(`
        role,
        business_id,
        active
      `)
      .eq(
        "user_id",
        authData.user.id,
      )
      .eq("active", true)
      .maybeSingle();

    if (
      membershipError ||
      !membership
    ) {
      await supabase.auth.signOut();

      setLoading(false);

      setErrorMessage(
        "Este usuário não possui acesso a nenhuma barbearia.",
      );

      return;
    }

    const role =
      membership.role as UserRole;

    /*
     * 3. Redireciona conforme o cargo.
     */
    if (
      role === "owner" ||
      role === "manager"
    ) {
      router.replace("/dashboard");
      router.refresh();

      return;
    }

    if (role === "barber") {
      router.replace(
        "/dashboard/barbeiro",
      );

      router.refresh();

      return;
    }

    if (role === "customer") {
      router.replace("/");

      router.refresh();

      return;
    }

    /*
     * Segurança para algum papel
     * desconhecido no banco.
     */
    await supabase.auth.signOut();

    setLoading(false);

    setErrorMessage(
      "Seu perfil não possui acesso ao painel.",
    );
  }

  const businessName =
    business?.name ||
    "Sua barbearia";

  const logoUrl =
    business?.logo_url ||
    null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12 text-foreground">
      <section className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" />

          Voltar para o site
        </Link>

        {/* IDENTIDADE */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex justify-center">
            {logoUrl ? (
              <div className="h-20 w-20 overflow-hidden rounded-2xl border border-gold/30 bg-secondary shadow-lg">
                <img
                  src={logoUrl}
                  alt={`Logo ${businessName}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
                <Scissors className="h-8 w-8" />
              </div>
            )}
          </div>

          <p className="eyebrow">
            Área administrativa
          </p>

          <h1 className="mt-3 font-display text-3xl sm:text-4xl">
            {businessName}
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            Entre com sua conta para acessar
            o painel de gerenciamento.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card-premium space-y-5 p-6 sm:p-8"
        >
          {/* E-MAIL */}
          <div>
            <label
              htmlFor="email"
              className="text-sm text-muted-foreground"
            >
              E-mail
            </label>

            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={loading}
                autoComplete="email"
                placeholder="seu@email.com"
                className="h-12 w-full rounded-lg border border-input bg-background pl-12 pr-4 outline-none transition-colors focus:border-gold disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          {/* SENHA */}
          <div>
            <label
              htmlFor="password"
              className="text-sm text-muted-foreground"
            >
              Senha
            </label>

            <div className="relative mt-2">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                required
                disabled={loading}
                autoComplete="current-password"
                placeholder="Sua senha"
                className="h-12 w-full rounded-lg border border-input bg-background pl-12 pr-14 outline-none transition-colors focus:border-gold disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setShowPassword(
                    (current) => !current,
                  )
                }
                aria-label={
                  showPassword
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
                title={
                  showPassword
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
                className="absolute right-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* BOTÃO ENTRAR */}
          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <Loader2 className="h-5 w-5 animate-spin" />
            )}

            {loading
              ? "Entrando..."
              : "Entrar"}
          </button>

          {/* ERRO */}
          {errorMessage && (
            <p
              role="alert"
              className="text-sm text-destructive"
            >
              {errorMessage}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}