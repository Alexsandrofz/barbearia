import { createClient } from "@/lib/supabase/server";

export default async function TesteAuthPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-background p-10 text-foreground">
      <h1 className="text-2xl font-bold">
        Teste de autenticação
      </h1>

      <div className="mt-6 rounded-xl border border-border bg-surface p-6">
        <p>
          <strong>User ID:</strong>{" "}
          {user?.id ?? "NENHUM USUÁRIO"}
        </p>

        <p className="mt-2">
          <strong>Email:</strong>{" "}
          {user?.email ?? "NENHUM EMAIL"}
        </p>

        {error && (
          <p className="mt-4 text-red-400">
            {error.message}
          </p>
        )}
      </div>
    </main>
  );
}