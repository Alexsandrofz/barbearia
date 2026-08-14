import { Suspense } from "react";
import { redirect } from "next/navigation";

import CustomersManager from "@/components/dashboard/CustomersManager";

import { getCurrentUserAccess } from "@/lib/auth-role";
import { getCustomersByBusiness } from "@/lib/customers";

async function CustomersContent() {
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

  const customers = await getCustomersByBusiness(
    access.businessId,
  );

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <p className="eyebrow">Relacionamento</p>

        <h1 className="mt-3 font-display text-3xl sm:text-4xl">
          Clientes
        </h1>

        <p className="mt-2 max-w-2xl text-muted-foreground">
          Acompanhe o histórico, a frequência e o valor gerado
          por cada cliente da barbearia.
        </p>

        <CustomersManager customers={customers} />
      </div>
    </main>
  );
}

function CustomersLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl animate-pulse">
        <div className="h-4 w-32 rounded bg-surface-2" />
        <div className="mt-4 h-10 w-56 rounded bg-surface-2" />
        <div className="mt-3 h-5 w-96 max-w-full rounded bg-surface-2" />

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 rounded-2xl border border-border bg-surface"
            />
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-96 rounded-2xl border border-border bg-surface"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<CustomersLoading />}>
      <CustomersContent />
    </Suspense>
  );
}