import { getBusinessHours } from "@/lib/business-hours";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Scissors,
} from "lucide-react";

import AgendaManager from "@/components/dashboard/AgendaManager";

import { createClient } from "@/lib/supabase/server";
import { getAgendaByDate } from "@/lib/agenda";
import { getBarbersByBusiness } from "@/lib/barbers";

type Business = {
  id: string;
  name: string;
  slug: string;
};

type DashboardPageProps = {
  searchParams: Promise<{
    date?: string;
  }>;
};

function getBrazilDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDays(date: string, amount: number) {
  const current = new Date(`${date}T12:00:00Z`);

  current.setUTCDate(current.getUTCDate() + amount);

  return current.toISOString().slice(0, 10);
}

function isValidDate(date: string | undefined) {
  if (!date) {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T12:00:00Z`);

  return !Number.isNaN(parsed.getTime());
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

async function DashboardContent({ selectedDate }: { selectedDate: string }) {
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

  if (membership.role !== "owner" && membership.role !== "manager") {
    redirect("/acesso");
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

  const previousDate = addDays(selectedDate, -1);
  const nextDate = addDays(selectedDate, 1);

  const isToday = selectedDate === today;

  const [appointments, allBarbers, businessHours] = await Promise.all([
    getAgendaByDate(business.id, selectedDate),

    getBarbersByBusiness(business.id),

    getBusinessHours(business.id),
  ]);
  const selectedWeekday = new Date(
  `${selectedDate}T12:00:00Z`,
).getUTCDay();

  const businessHour =
  businessHours.find(
    (hour) =>
      hour.weekday === selectedWeekday,
  ) ?? null;

  const barbers = allBarbers
    .filter((barber) => barber.active)
    .map((barber) => ({
      id: barber.id,
      name: barber.name,
    }));

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
      label: isToday ? "Agendamentos hoje" : "Agendamentos do dia",
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
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Painel administrativo</p>

            <h1 className="mt-3 font-display text-3xl sm:text-4xl">
              {business.name}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Acesso como {membership.role}.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Data da agenda
            </p>

            <p className="mt-1 text-sm font-semibold capitalize">
              {formatDisplayDate(selectedDate)}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                href={`/dashboard?date=${previousDate}`}
                aria-label="Ver dia anterior"
                title="Dia anterior"
                className="grid h-10 w-10 place-items-center rounded-lg border border-border transition-colors hover:border-gold/50 hover:text-gold"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>

              {!isToday && (
                <Link
                  href={`/dashboard?date=${today}`}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-gold/30 px-4 text-xs font-semibold text-gold transition-colors hover:bg-gold/10"
                >
                  Hoje
                </Link>
              )}

              <Link
                href={`/dashboard?date=${nextDate}`}
                aria-label="Ver próximo dia"
                title="Próximo dia"
                className="grid h-10 w-10 place-items-center rounded-lg border border-border transition-colors hover:border-gold/50 hover:text-gold"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>

              <form
                action="/dashboard"
                method="get"
                className="flex items-center"
              >
                <input
                  type="date"
                  name="date"
                  defaultValue={selectedDate}
                  aria-label="Selecionar data da agenda"
                  className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none transition-colors focus:border-gold"
                />

                <button
                  type="submit"
                  className="ml-2 inline-flex h-10 items-center justify-center rounded-lg border border-gold/30 px-3 text-xs font-semibold text-gold transition-colors hover:bg-gold/10"
                >
                  Ir
                </button>
              </form>
            </div>
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

        <AgendaManager
          appointments={appointments}
          barbers={barbers}
          businessHour={businessHour}
        />
      </div>
    </main>
  );
}

function DashboardLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl animate-pulse">
        <div className="h-4 w-36 rounded bg-surface-2" />

        <div className="mt-4 h-10 w-72 max-w-full rounded bg-surface-2" />

        <div className="mt-3 h-5 w-48 rounded bg-surface-2" />

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-2xl border border-border bg-surface"
            />
          ))}
        </section>

        <div className="mt-8 h-40 rounded-2xl border border-border bg-surface" />

        <div className="mt-6 h-96 rounded-2xl border border-border bg-surface" />
      </div>
    </main>
  );
}

async function DashboardWithDate({ searchParams }: DashboardPageProps) {
  const params = await searchParams;

  const today = getBrazilDate();

  const selectedDate = isValidDate(params.date) ? params.date! : today;

  return <DashboardContent selectedDate={selectedDate} />;
}

export default function DashboardPage(props: DashboardPageProps) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardWithDate searchParams={props.searchParams} />
    </Suspense>
  );
}
