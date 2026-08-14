import { Suspense } from "react";
import { redirect } from "next/navigation";

import BarberHistory from "@/components/dashboard/BarberHistory";

import { getCurrentUserAccess } from "@/lib/auth-role";
import { createClient } from "@/lib/supabase/server";

async function BarberAppointmentsContent() {
  const access =
    await getCurrentUserAccess();

  if (!access) {
    redirect("/login");
  }

  if (access.role !== "barber") {
    redirect("/dashboard");
  }

  if (
    !access.businessId ||
    !access.barberId
  ) {
    redirect("/acesso");
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("appointments")
    .select(`
      id,
      name,
      phone,
      appointment_date,
      start_time,
      status,
      notes,

      selected_service:services (
        id,
        name,
        price,
        duration_minutes
      )
    `)
    .eq(
      "business_id",
      access.businessId,
    )
    .eq(
      "barber_id",
      access.barberId,
    )

    /*
     * Histórico = somente o que já terminou.
     *
     * Pendente e confirmado continuam
     * exclusivamente na Minha agenda.
     */
    .in("status", [
      "completed",
      "cancelled",
      "no_show",
    ])

    .order(
      "appointment_date",
      {
        ascending: false,
      },
    )
    .order(
      "start_time",
      {
        ascending: false,
      },
    );

  if (error) {
    console.error(
      "Erro ao carregar histórico do barbeiro:",
      error,
    );

    throw new Error(
      "Não foi possível carregar seus atendimentos.",
    );
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <div>
          <p className="eyebrow">
            Área do profissional
          </p>

          <h1 className="mt-3 font-display text-3xl sm:text-4xl">
            Meus atendimentos
          </h1>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Consulte seu histórico de atendimentos concluídos, cancelados e não comparecimentos.
          </p>
        </div>

        <BarberHistory
          appointments={data ?? []}
        />
      </div>
    </main>
  );
}

function BarberAppointmentsLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl animate-pulse">
        <div className="h-4 w-40 rounded bg-surface-2" />

        <div className="mt-4 h-10 w-72 rounded bg-surface-2" />

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl border border-border bg-surface"
              />
            ),
          )}
        </section>

        <div className="mt-8 h-40 rounded-2xl border border-border bg-surface" />

        <div className="mt-6 h-96 rounded-2xl border border-border bg-surface" />
      </div>
    </main>
  );
}

export default function BarberAppointmentsPage() {
  return (
    <Suspense
      fallback={
        <BarberAppointmentsLoading />
      }
    >
      <BarberAppointmentsContent />
    </Suspense>
  );
}