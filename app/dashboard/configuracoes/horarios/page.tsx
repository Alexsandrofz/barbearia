import { Suspense } from "react";

import BusinessHoursForm from "@/components/dashboard/BusinessHoursForm";

import { getBusinessHours } from "@/lib/business-hours";
import { requireManagement } from "@/lib/route-access";
import { createClient } from "@/lib/supabase/server";

type Business = {
  id: string;
  name: string;
};

async function BusinessHoursContent() {
  const access = await requireManagement();

  const businessId = access.businessId;

  if (!businessId) {
    throw new Error(
      "Barbearia não encontrada para o usuário atual.",
    );
  }

  const supabase = await createClient();

  const {
    data: business,
    error: businessError,
  } = await supabase
    .from("businesses")
    .select(`
      id,
      name
    `)
    .eq("id", businessId)
    .maybeSingle();

  if (businessError || !business) {
    console.error(
      "Erro ao carregar barbearia:",
      businessError,
    );

    throw new Error(
      "Não foi possível carregar a barbearia.",
    );
  }

  const currentBusiness =
    business as Business;

  const hours =
    await getBusinessHours(
      businessId,
    );

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <p className="eyebrow">
          Configurações
        </p>

        <h1 className="mt-3 font-display text-3xl sm:text-4xl">
          Horários de funcionamento
        </h1>

        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Configure os dias e horários da{" "}
          {currentBusiness.name}.
        </p>

        <BusinessHoursForm
          business={currentBusiness}
          hours={hours}
        />
      </div>
    </main>
  );
}

function BusinessHoursLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-5xl animate-pulse">
        <div className="h-4 w-32 rounded bg-surface-2" />

        <div className="mt-4 h-10 w-96 max-w-full rounded bg-surface-2" />

        <div className="mt-3 h-5 w-80 max-w-full rounded bg-surface-2" />

        <div className="mt-10 space-y-5">
          {Array.from({
            length: 7,
          }).map((_, index) => (
            <div
              key={index}
              className="h-40 rounded-2xl border border-border bg-surface"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function BusinessHoursPage() {
  return (
    <Suspense
      fallback={
        <BusinessHoursLoading />
      }
    >
      <BusinessHoursContent />
    </Suspense>
  );
}