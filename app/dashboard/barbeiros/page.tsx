import { Suspense } from "react";
import { redirect } from "next/navigation";

import BarbersManager from "@/components/dashboard/BarbersManager";
import { getCurrentUserAccess } from "@/lib/auth-role";
import { getBarbersByBusiness } from "@/lib/barbers";

async function BarbersContent() {
  const access = await getCurrentUserAccess();

  if (!access) {
    redirect("/login");
  }

  if (
    access.role !== "owner" &&
    access.role !== "manager"
  ) {
    redirect("/acesso");
  }

  if (!access.businessId) {
    redirect("/dashboard");
  }

  const barbers = await getBarbersByBusiness(access.businessId);

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <p className="eyebrow">Gerenciamento</p>

        <h1 className="mt-3 font-display text-3xl sm:text-4xl">
          Barbeiros
        </h1>

        <p className="mt-2 max-w-2xl text-muted-foreground">
          Cadastre os profissionais da equipe, atualize suas
          especialidades e escolha quem fica disponível para
          agendamento.
        </p>

        <BarbersManager
          businessId={access.businessId}
          barbers={barbers}
        />
      </div>
    </main>
  );
}

function BarbersLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl animate-pulse">
        <div className="h-4 w-32 rounded bg-surface-2" />
        <div className="mt-4 h-10 w-56 rounded bg-surface-2" />
        <div className="mt-3 h-5 w-96 max-w-full rounded bg-surface-2" />

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-28 rounded-2xl border border-border bg-surface"
            />
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-80 rounded-2xl border border-border bg-surface"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function BarbersPage() {
  return (
    <Suspense fallback={<BarbersLoading />}>
      <BarbersContent />
    </Suspense>
  );
}