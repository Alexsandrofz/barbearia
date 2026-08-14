import "server-only";

import { createClient } from "@/lib/supabase/server";

import type {
  Customer,
  CustomerAppointment,
  CustomerAppointmentBarber,
  CustomerAppointmentService,
  CustomerSummary,
} from "@/lib/customers-types";

function getRelation<T>(relation: T | T[] | null): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation)
    ? relation[0] ?? null
    : relation;
}

function getMostFrequent(values: Array<string | null>) {
  const counts = new Map<string, number>();

  for (const value of values) {
    if (!value) {
      continue;
    }

    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  let selected: string | null = null;
  let highestCount = 0;

  for (const [value, count] of counts.entries()) {
    if (count > highestCount) {
      selected = value;
      highestCount = count;
    }
  }

  return selected;
}

function sortDatesAscending(
  first: CustomerAppointment,
  second: CustomerAppointment,
) {
  const firstDate = `${first.appointment_date ?? ""}T${
    first.start_time ?? "00:00"
  }`;

  const secondDate = `${second.appointment_date ?? ""}T${
    second.start_time ?? "00:00"
  }`;

  return firstDate.localeCompare(secondDate);
}

function createCustomerSummary(
  customer: Customer,
  today: string,
): CustomerSummary {
  const completedAppointments = customer.appointments.filter(
    (appointment) => appointment.status === "completed",
  );

  const pendingAppointments = customer.appointments.filter(
    (appointment) =>
      appointment.status === "pending" ||
      appointment.status === "confirmed",
  );

  const totalSpent = completedAppointments.reduce(
    (total, appointment) => {
      const service =
        getRelation<CustomerAppointmentService>(
          appointment.selected_service,
        );

      return total + Number(service?.price ?? 0);
    },
    0,
  );

  const averageTicket =
    completedAppointments.length > 0
      ? totalSpent / completedAppointments.length
      : 0;

  const completedWithDate = completedAppointments
    .filter((appointment) => appointment.appointment_date)
    .sort(sortDatesAscending);

  const lastVisit =
    completedWithDate.at(-1)?.appointment_date ?? null;

  const futureAppointments = pendingAppointments
    .filter(
      (appointment) =>
        appointment.appointment_date &&
        appointment.appointment_date >= today,
    )
    .sort(sortDatesAscending);

  const nextAppointment = futureAppointments[0] ?? null;

  const favoriteService = getMostFrequent(
    completedAppointments.map((appointment) => {
      const service =
        getRelation<CustomerAppointmentService>(
          appointment.selected_service,
        );

      return service?.name ?? appointment.service ?? null;
    }),
  );

  const favoriteBarber = getMostFrequent(
    completedAppointments.map((appointment) => {
      const barber =
        getRelation<CustomerAppointmentBarber>(
          appointment.barber,
        );

      return barber?.name ?? null;
    }),
  );

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    active: customer.active,
    createdAt: customer.created_at,

    completedAppointments: completedAppointments.length,
    pendingAppointments: pendingAppointments.length,

    totalSpent,
    averageTicket,

    lastVisit,
    nextAppointment: nextAppointment?.appointment_date ?? null,
    nextAppointmentTime: nextAppointment?.start_time ?? null,

    favoriteService,
    favoriteBarber,
  };
}

export async function getCustomersByBusiness(
  businessId: string,
): Promise<CustomerSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .select(`
      id,
      business_id,
      user_id,
      name,
      phone,
      email,
      active,
      created_at,
      appointments (
        id,
        appointment_date,
        start_time,
        status,
        service,
        notes,
        selected_service:services (
          name,
          price
        ),
        barber:barbers (
          name
        )
      )
    `)
    .eq("business_id", businessId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao carregar clientes:", error);
    throw new Error("Não foi possível carregar os clientes.");
  }

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return ((data ?? []) as Customer[]).map((customer) =>
    createCustomerSummary(customer, today),
  );
}