import "server-only";

import { createClient } from "@/lib/supabase/server";

import type {
  FinanceAppointment,
  FinanceBarber,
  FinanceService,
  FinanceSummary,
  RankingItem,
} from "@/lib/finance-types";

function getRelation<T>(
  relation: T | T[] | null,
): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation)
    ? (relation[0] ?? null)
    : relation;
}

function getBrazilDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDays(date: string, amount: number) {
  const current =
    new Date(`${date}T12:00:00Z`);

  current.setUTCDate(
    current.getUTCDate() + amount,
  );

  return current
    .toISOString()
    .slice(0, 10);
}

function getStartOfWeek(date: string) {
  const current =
    new Date(`${date}T12:00:00Z`);

  const weekday = current.getUTCDay();

  /*
   * Semana começando na segunda-feira.
   * Domingo = 0.
   */
  const daysSinceMonday =
    weekday === 0
      ? 6
      : weekday - 1;

  return addDays(
    date,
    -daysSinceMonday,
  );
}

function getStartOfMonth(date: string) {
  return `${date.slice(0, 7)}-01`;
}

function getRevenue(
  appointments: FinanceAppointment[],
) {
  return appointments.reduce(
    (total, appointment) => {
      const service =
        getRelation<FinanceService>(
          appointment.selected_service,
        );

      return (
        total +
        Number(service?.price ?? 0)
      );
    },
    0,
  );
}

function createRanking(
  appointments: FinanceAppointment[],
  type: "service" | "barber",
): RankingItem | null {
  const map =
    new Map<
      string,
      RankingItem
    >();

  for (const appointment of appointments) {
    if (type === "service") {
      const service =
        getRelation<FinanceService>(
          appointment.selected_service,
        );

      if (!service) {
        continue;
      }

      const current =
        map.get(service.id) ?? {
          id: service.id,
          name: service.name,
          total: 0,
          quantity: 0,
        };

      current.total +=
        Number(service.price);

      current.quantity += 1;

      map.set(
        service.id,
        current,
      );
    } else {
      const barber =
        getRelation<FinanceBarber>(
          appointment.barber,
        );

      const service =
        getRelation<FinanceService>(
          appointment.selected_service,
        );

      if (
        !barber ||
        !service
      ) {
        continue;
      }

      const current =
        map.get(barber.id) ?? {
          id: barber.id,
          name: barber.name,
          total: 0,
          quantity: 0,
        };

      current.total +=
        Number(service.price);

      current.quantity += 1;

      map.set(
        barber.id,
        current,
      );
    }
  }

  const ranking =
    Array.from(
      map.values(),
    ).sort(
      (first, second) =>
        second.total -
        first.total,
    );

  return ranking[0] ?? null;
}

export async function getFinanceSummary(
  businessId: string,
): Promise<FinanceSummary> {
  const supabase =
    await createClient();

  const today =
    getBrazilDate();

  const startOfWeek =
    getStartOfWeek(today);

  const startOfMonth =
    getStartOfMonth(today);

  /*
   * Buscamos desde o início do mês.
   * Isso já cobre hoje e a semana atual.
   */
  const { data, error } =
    await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        start_time,
        status,

        selected_service:services (
          id,
          name,
          price
        ),

        barber:barbers (
          id,
          name
        )
      `)
      .eq(
        "business_id",
        businessId,
      )
      .eq(
        "status",
        "completed",
      )
      .gte(
        "appointment_date",
        startOfMonth,
      )
      .lte(
        "appointment_date",
        today,
      )
      .order(
        "appointment_date",
        {
          ascending: true,
        },
      );

  if (error) {
    console.error(
      "Erro ao carregar financeiro:",
      error,
    );

    throw new Error(
      "Não foi possível carregar os dados financeiros.",
    );
  }

  const appointments =
    (data ??
      []) as FinanceAppointment[];

  const todayAppointments =
    appointments.filter(
      (appointment) =>
        appointment.appointment_date ===
        today,
    );

  const weekAppointments =
    appointments.filter(
      (appointment) =>
        appointment.appointment_date >=
          startOfWeek &&
        appointment.appointment_date <=
          today,
    );

  const monthAppointments =
    appointments;

  const monthRevenue =
    getRevenue(
      monthAppointments,
    );

  return {
    todayRevenue:
      getRevenue(
        todayAppointments,
      ),

    weekRevenue:
      getRevenue(
        weekAppointments,
      ),

    monthRevenue,

    monthCompletedAppointments:
      monthAppointments.length,

    monthAverageTicket:
      monthAppointments.length >
      0
        ? monthRevenue /
          monthAppointments.length
        : 0,

    topService:
      createRanking(
        monthAppointments,
        "service",
      ),

    topBarber:
      createRanking(
        monthAppointments,
        "barber",
      ),
  };
}