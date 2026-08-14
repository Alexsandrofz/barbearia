import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { BusinessHour } from "@/lib/business-hours-types";

export async function getBusinessHours(
  businessId: string,
): Promise<BusinessHour[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("business_hours")
    .select(`
      id,
      business_id,
      weekday,
      is_open,
      open_time,
      close_time,
      break_start,
      break_end,
      slot_interval_minutes
    `)
    .eq("business_id", businessId)
    .order("weekday", { ascending: true });

  if (error) {
    console.error("Erro ao buscar horários:", error);
    throw new Error("Não foi possível carregar os horários.");
  }

  return (data ?? []) as BusinessHour[];
}