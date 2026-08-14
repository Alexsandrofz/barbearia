import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { AgendaAppointment } from "@/lib/agenda-types";

export async function getAgendaByDate(
  businessId: string,
  date: string,
): Promise<AgendaAppointment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      name,
      phone,
      appointment_date,
      start_time,
      status,
      notes,

      barber:barbers (
        id,
        name
      ),

      selected_service:services (
        id,
        name,
        price,
        duration_minutes
      )
    `)
    .eq("business_id", businessId)
    .eq("appointment_date", date)
    .order("start_time", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Erro ao carregar agenda:",
      error,
    );

    throw new Error(
      "Não foi possível carregar a agenda.",
    );
  }

  return (data ?? []) as AgendaAppointment[];
}