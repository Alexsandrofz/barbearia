import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Barber } from "@/lib/barbers-types";

export async function getBarbersByBusiness(
  businessId: string,
): Promise<Barber[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("barbers")
    .select(`
      id,
      business_id,
      user_id,
      name,
      specialty,
      photo_url,
      active,
      created_at
    `)
    .eq("business_id", businessId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar barbeiros:", error);
    throw new Error("Não foi possível carregar os barbeiros.");
  }

  return (data ?? []) as Barber[];
}