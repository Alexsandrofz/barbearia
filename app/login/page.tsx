"use client";

import { useState } from "react";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setLoading(true);
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("E-mail ou senha inválidos.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="eyebrow">Área administrativa</p>

          <h1 className="mt-3 font-display text-3xl sm:text-4xl">
            Acesse sua barbearia
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            Entre para visualizar e gerenciar os agendamentos.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card-premium space-y-5 p-6 sm:p-8"
        >
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
                autoComplete="email"
                placeholder="admin@barbearia.com"
                className="h-12 w-full rounded-lg border border-input bg-background pl-12 pr-4 outline-none transition-colors focus:border-gold"
              />
            </div>
          </div>

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
                type="password"
                required
                autoComplete="current-password"
                placeholder="Sua senha"
                className="h-12 w-full rounded-lg border border-input bg-background pl-12 pr-4 outline-none transition-colors focus:border-gold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {errorMessage && (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}