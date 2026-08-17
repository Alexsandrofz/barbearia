import { Suspense } from "react";

import BusinessSettingsForm from "@/components/dashboard/BusinessSettingsForm";

import { requireOwner } from "@/lib/route-access";
import { createClient } from "@/lib/supabase/server";

type BusinessSettings = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  instagram: string | null;
  description: string | null;
  logo_url: string | null;
  primary_color: string | null;
  active: boolean;
};

async function BusinessSettingsContent() {
  const access = await requireOwner();

  const supabase = await createClient();

  const {
    data: business,
    error,
  } = await supabase
    .from("businesses")
    .select(`
      id,
      name,
      slug,
      phone,
      whatsapp,
      email,
      address,
      instagram,
      description,
      logo_url,
      primary_color,
      active
    `)
    .eq("id", access.businessId)
    .maybeSingle();

  if (error || !business) {
    console.error(
      "Erro ao carregar configurações da barbearia:",
      error,
    );

    throw new Error(
      "Não foi possível carregar as configurações da barbearia.",
    );
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <p className="eyebrow">
          Configurações
        </p>

        <h1 className="mt-3 font-display text-3xl sm:text-4xl">
          Dados da barbearia
        </h1>

        <p className="mt-2 max-w-2xl text-muted-foreground">
          Atualize as informações comerciais, identidade visual
          e dados exibidos no site.
        </p>

        <BusinessSettingsForm
          business={
            business as BusinessSettings
          }
        />
      </div>
    </main>
  );
}

function BusinessSettingsLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-5xl animate-pulse">
        <div className="h-4 w-36 rounded bg-surface-2" />

        <div className="mt-4 h-10 w-72 rounded bg-surface-2" />

        <div className="mt-3 h-5 w-96 max-w-full rounded bg-surface-2" />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="h-[460px] rounded-2xl border border-border bg-surface" />

          <div className="h-[680px] rounded-2xl border border-border bg-surface" />
        </div>
      </div>
    </main>
  );
}

export default function BusinessSettingsPage() {
  return (
    <Suspense
      fallback={
        <BusinessSettingsLoading />
      }
    >
      <BusinessSettingsContent />
    </Suspense>
  );
}