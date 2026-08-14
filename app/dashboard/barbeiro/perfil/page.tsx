import { Suspense } from "react";
import { redirect } from "next/navigation";

import BarberProfileForm from "@/components/dashboard/BarberProfileForm";

import { requireBarber } from "@/lib/route-access";
import { createClient } from "@/lib/supabase/server";

async function BarberProfileContent() {
  const access =
    await requireBarber();

  const businessId =
    access.businessId;

  const barberId =
    access.barberId;

  if (
    !businessId ||
    !barberId
  ) {
    redirect("/acesso");
  }

  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    redirect("/login");
  }

  const {
    data: barber,
    error,
  } = await supabase
    .from("barbers")
    .select(`
      id,
      name,
      specialty,
      photo_url,
      active
    `)
    .eq(
      "id",
      barberId,
    )
    .eq(
      "business_id",
      businessId,
    )
    .maybeSingle();

  if (
    error ||
    !barber
  ) {
    console.error(
      "Erro ao carregar perfil do barbeiro:",
      error,
    );

    redirect("/acesso");
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <div>
          <p className="eyebrow">
            Área do profissional
          </p>

          <h1 className="mt-3 font-display text-3xl sm:text-4xl">
            Meu perfil
          </h1>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Consulte e atualize suas informações profissionais.
          </p>
        </div>

        <BarberProfileForm
          businessId={
            businessId
          }
          name={
            barber.name
          }
          specialty={
            barber.specialty
          }
          email={
            user.email ??
            "E-mail não informado"
          }
          photoUrl={
            barber.photo_url
          }
          active={
            barber.active
          }
        />
      </div>
    </main>
  );
}

function BarberProfileLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl animate-pulse">
        <div className="h-4 w-40 rounded bg-surface-2" />

        <div className="mt-4 h-10 w-56 rounded bg-surface-2" />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="h-[480px] rounded-2xl border border-border bg-surface" />

          <div className="h-[480px] rounded-2xl border border-border bg-surface" />
        </div>
      </div>
    </main>
  );
}

export default function BarberProfilePage() {
  return (
    <Suspense
      fallback={
        <BarberProfileLoading />
      }
    >
      <BarberProfileContent />
    </Suspense>
  );
}
