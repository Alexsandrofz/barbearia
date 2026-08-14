import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Scissors,
} from "lucide-react";


import DailySchedule, {
  type ScheduleAppointment,
} from "@/components/dashboard/DailySchedule";

import { createClient } from "@/lib/supabase/server";

type Business = {
  id: string;
  name: string;
  slug: string;
};

type Appointment = ScheduleAppointment & {
  appointment_date: string;

};

function getBrazilDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatDisplayDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00Z`));
}

async function DashboardContent() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("business_members")
    .select(
      `
      role,
      business:businesses (
        id,
        name,
        slug
      )
    `,
    )
    .eq("user_id", user.id)
    .eq("active", true)
    .single();

  if (membershipError || !membership) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <section className="card-premium w-full max-w-lg p-8 text-center">
          <h1 className="font-display text-3xl">
            Acesso não autorizado
          </h1>

          <p className="mt-4 text-muted-foreground">
            Este usuário não está vinculado a nenhuma barbearia.
          </p>
        </section>
      </main>
    );
  }

  const business = (
    Array.isArray(membership.business)
      ? membership.business[0]
      : membership.business
  ) as Business | null;

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <p className="text-muted-foreground">
          Não foi possível carregar a barbearia.
        </p>
      </main>
    );
  }

  const today = getBrazilDate();

  const { data, error: appointmentsError } = await supabase
    .from("appointments")
    .select(
      `
      id,
      name,
      phone,
      appointment_date,
      start_time,
      status,
      notes,
      barber:barbers (
        name
      ),
      selected_service:services (
        name,
        price,
        duration_minutes
      )
    `,
    )
    .eq("business_id", business.id)
    .eq("appointment_date", today)
    .order("start_time", { ascending: true });

  if (appointmentsError) {
    console.error(
      "Erro ao carregar agendamentos:",
      appointmentsError,
    );
  }

  const appointments = (data ?? []) as Appointment[];

  const pendingCount = appointments.filter(
    (appointment) => appointment.status === "pending",
  ).length;

  const confirmedCount = appointments.filter(
    (appointment) => appointment.status === "confirmed",
  ).length;

  const completedCount = appointments.filter(
    (appointment) => appointment.status === "completed",
  ).length;

  const activeAppointments = appointments.filter(
    (appointment) =>
      appointment.status !== "cancelled" &&
      appointment.status !== "no_show",
  );

  const cards = [
    {
      label: "Agendamentos hoje",
      value: activeAppointments.length,
      icon: CalendarDays,
    },
    {
      label: "Pendentes",
      value: pendingCount,
      icon: CircleDashed,
    },
    {
      label: "Confirmados",
      value: confirmedCount,
      icon: CheckCircle2,
    },
    {
      label: "Concluídos",
      value: completedCount,
      icon: Scissors,
    },
  ];

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">
              Painel administrativo
            </p>

            <h1 className="mt-3 font-display text-3xl sm:text-4xl">
              {business.name}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Acesso como {membership.role}.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Data da agenda
            </p>

            <p className="mt-1 text-sm font-semibold capitalize">
              {formatDisplayDate(today)}
            </p>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ label, value, icon: Icon }) => (
            <article
              key={label}
              className="card-premium p-5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  {label}
                </p>

                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/30 text-gold">
                  <Icon className="h-5 w-5" />
                </span>
              </div>

              <p className="mt-4 font-display text-3xl text-gold">
                {value}
              </p>
            </article>
          ))}
        </section>

        <section className="card-premium mt-8 overflow-hidden">
          <div className="border-b border-border px-5 py-5 sm:px-7">
            <h2 className="font-display text-2xl">
              Agenda do dia
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {activeAppointments.length === 0
                ? "Nenhum agendamento ativo registrado para hoje."
                : `${activeAppointments.length} agendamento(s) ativo(s) encontrado(s).`}
            </p>
          </div>

          <DailySchedule appointments={appointments} />
        </section>
      </div>
    </main>
  );
}

function DashboardLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground">
      <div className="mx-auto w-full max-w-7xl animate-pulse">
        <div className="h-4 w-36 rounded bg-surface-2" />

        <div className="mt-4 h-10 w-72 max-w-full rounded bg-surface-2" />

        <section className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-2xl border border-border bg-surface"
            />
          ))}
        </section>

        <div className="mt-10 h-96 rounded-2xl border border-border bg-surface" />
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
