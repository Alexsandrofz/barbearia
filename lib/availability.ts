import { createClient } from "@/lib/supabase/client";

export async function getBusyTimes(
  barberId: string,
  date: string,
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("appointments")
    .select("start_time")
    .eq("barber_id", barberId)
    .eq("appointment_date", date)
    .in("status", ["pending", "confirmed"]);

  if (error) {
    console.error("Erro ao buscar horários ocupados:", error);
    return [];
  }

  return (data ?? [])
    .map((item) => item.start_time)
    .filter((time): time is string => Boolean(time));
}