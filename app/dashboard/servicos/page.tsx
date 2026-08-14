import { Suspense } from "react";
import { redirect } from "next/navigation";

import ServicesManager from "@/components/dashboard/ServicesManager";
import { getCurrentUserAccess } from "@/lib/auth-role";
import { getServicesByBusiness } from "@/lib/services";

async function ServicesContent() {
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

  const services = await getServicesByBusiness(
    access.businessId,
  );

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <p className="eyebrow">Gerenciamento</p>

        <h1 className="mt-3 font-display text-3xl sm:text-4xl">
          Serviços
        </h1>

        <p className="mt-2 max-w-2xl text-muted-foreground">
          Cadastre os serviços oferecidos, defina preços,
          durações e escolha quais ficam disponíveis para
          agendamento.
        </p>

        <ServicesManager
          businessId={access.businessId}
          services={services}
        />
      </div>
    </main>
  );
}

function ServicesLoading() {
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
              className="h-72 rounded-2xl border border-border bg-surface"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesLoading />}>
      <ServicesContent />
    </Suspense>
  );
}