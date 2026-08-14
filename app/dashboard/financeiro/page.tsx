import { Suspense } from "react";

import FinanceDashboard from "@/components/dashboard/FinanceDashboard";

import { getFinanceSummary } from "@/lib/finance";
import { requireOwner } from "@/lib/route-access";

async function FinanceContent() {
  const access = await requireOwner();

  const businessId = access.businessId;

  if (!businessId) {
    throw new Error(
      "Barbearia não encontrada para o usuário atual.",
    );
  }

  const summary =
    await getFinanceSummary(
      businessId,
    );

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <p className="eyebrow">
          Gestão financeira
        </p>

        <h1 className="mt-3 font-display text-3xl sm:text-4xl">
          Financeiro
        </h1>

        <p className="mt-2 max-w-2xl text-muted-foreground">
          Acompanhe o faturamento dos atendimentos concluídos e os principais indicadores da barbearia.
        </p>

        <FinanceDashboard
          summary={summary}
        />
      </div>
    </main>
  );
}

function FinanceLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl animate-pulse">
        <div className="h-4 w-36 rounded bg-surface-2" />

        <div className="mt-4 h-10 w-56 rounded bg-surface-2" />

        <div className="mt-3 h-5 w-96 max-w-full rounded bg-surface-2" />

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-2xl border border-border bg-surface"
            />
          ))}
        </section>

        <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="h-60 rounded-2xl border border-border bg-surface"
            />
          ))}
        </section>
      </div>
    </main>
  );
}

export default function FinancePage() {
  return (
    <Suspense
      fallback={
        <FinanceLoading />
      }
    >
      <FinanceContent />
    </Suspense>
  );
}
