import AppointmentActions from "@/components/dashboard/AppointmentActions";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Scissors,
  UserRound,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type Business = {
  id: string;
  name: string;
  slug: string;
};

type BarberRelation = {
  name: string;
};

type ServiceRelation = {
  name: string;
  price: number;
  duration_minutes: number;
};

type Appointment = {
  id: string;
  name: string;
  phone: string;
  appointment_date: string;
  start_time: string;
  status: string;
  notes: string | null;
  barber: BarberRelation | BarberRelation[] | null;
  selected_service: ServiceRelation | ServiceRelation[] | null;
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

function formatTime(time: string | null) {
  if (!time) {
    return "--:--";
  }

  return time.slice(0, 5);
}

function getRelatedItem<T>(relation: T | T[] | null): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}

function translateStatus(status: string) {
  const labels: Record<string, string> = {
    pending: "Pendente",
    confirmed: "Confirmado",
    completed: "Concluído",
    cancelled: "Cancelado",
    no_show: "Não compareceu",
  };

  return labels[status] ?? status;
}

function statusClasses(status: string) {
  const classes: Record<string, string> = {
    pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    confirmed: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    completed: "border-green-500/30 bg-green-500/10 text-green-300",
    cancelled: "border-red-500/30 bg-red-500/10 text-red-300",
    no_show: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  };

  return classes[status] ?? "border-border bg-secondary text-muted-foreground";
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
          <h1 className="font-display text-3xl">Acesso não autorizado</h1>

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
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
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
    console.error("Erro ao carregar agendamentos:", appointmentsError);
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
      appointment.status !== "cancelled" && appointment.status !== "no_show",
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
            <p className="eyebrow">Painel administrativo</p>

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
            <article key={label} className="card-premium p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">{label}</p>

                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/30 text-gold">
                  <Icon className="h-5 w-5" />
                </span>
              </div>

              <p className="mt-4 font-display text-3xl text-gold">{value}</p>
            </article>
          ))}
        </section>

        <section className="card-premium mt-8 overflow-hidden">
          <div className="border-b border-border px-5 py-5 sm:px-7">
            <h2 className="font-display text-2xl">Agenda do dia</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {appointments.length === 0
                ? "Nenhum agendamento registrado para hoje."
                : `${appointments.length} agendamento(s) encontrado(s).`}
            </p>
          </div>

          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <CalendarDays className="h-10 w-10 text-gold" />

              <h3 className="mt-4 text-lg font-semibold">Agenda livre</h3>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Quando um cliente agendar para hoje, o atendimento aparecerá
                aqui automaticamente.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {appointments.map((appointment) => {
                const barber = getRelatedItem(appointment.barber);
                const service = getRelatedItem(appointment.selected_service);

                return (
                  <li
                    key={appointment.id}
                    className="grid gap-5 px-5 py-5 transition-colors hover:bg-secondary/40 sm:px-7 lg:grid-cols-[100px_minmax(0,1fr)_minmax(0,1fr)_auto]"
                  >
                    <div>
                      <p className="flex items-center gap-2 font-display text-xl text-gold">
                        <Clock3 className="h-4 w-4" />
                        {formatTime(appointment.start_time)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-semibold">
                        <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{appointment.name}</span>
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {appointment.phone}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold">
                        {service?.name ?? appointment.name}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Profissional: {barber?.name ?? "Não informado"}
                      </p>

                      {service?.duration_minutes && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Duração: {service.duration_minutes} minutos
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-start gap-3 lg:items-end">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(
                          appointment.status,
                        )}`}
                      >
                        {translateStatus(appointment.status)}
                      </span>

                      <AppointmentActions
                        appointmentId={appointment.id}
                        currentStatus={appointment.status as any}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
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

        <div className="mt-10 h-72 rounded-2xl border border-border bg-surface" />
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
