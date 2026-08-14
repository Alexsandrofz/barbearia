import "server-only";

import { createClient } from "@/lib/supabase/server";

type ServiceRelation = {
  name: string;
  price: number;
};

type BarberRelation = {
  name: string;
};

export type CustomerHistoryItem = {
  id: string;
  appointment_date: string | null;
  start_time: string | null;
  status: string;
  service: string;
  notes: string | null;

  selected_service:
    | ServiceRelation
    | ServiceRelation[]
    | null;

  barber:
    | BarberRelation
    | BarberRelation[]
    | null;
};

export type CustomerProfileData = {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email: string | null;
  active: boolean;
  created_at: string;

  appointments: CustomerHistoryItem[];
};

function getRelation<T>(relation: T | T[] | null): T | null {
  if (!relation) return null;
  return Array.isArray(relation) ? relation[0] ?? null : relation;
}

export async function getCustomerProfile(
  businessId: string,
  customerId: string,
): Promise<CustomerProfileData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .select(`
      id,
      business_id,
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
    .eq("id", customerId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao carregar perfil do cliente:", error);
    throw new Error("Não foi possível carregar o cliente.");
  }

  if (!data) {
    return null;
  }

  return data as CustomerProfileData;
}

export function getCustomerMetrics(
  customer: CustomerProfileData,
) {
  const completed = customer.appointments.filter(
    (appointment) => appointment.status === "completed",
  );

  const totalSpent = completed.reduce((total, appointment) => {
    const service = getRelation(appointment.selected_service);
    return total + Number(service?.price ?? 0);
  }, 0);

  const averageTicket =
    completed.length > 0 ? totalSpent / completed.length : 0;

  const favoriteService = getMostFrequent(
    completed.map((appointment) => {
      const service = getRelation(appointment.selected_service);
      return service?.name ?? appointment.service ?? null;
    }),
  );

  const favoriteBarber = getMostFrequent(
    completed.map((appointment) => {
      const barber = getRelation(appointment.barber);
      return barber?.name ?? null;
    }),
  );

  return {
    completedCount: completed.length,
    totalSpent,
    averageTicket,
    favoriteService,
    favoriteBarber,
  };
}

function getMostFrequent(values: Array<string | null>) {
  const counts = new Map<string, number>();

  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  let result: string | null = null;
  let highest = 0;

  for (const [value, count] of counts.entries()) {
    if (count > highest) {
      result = value;
      highest = count;
    }
  }

  return result;
}