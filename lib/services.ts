import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/lib/services-types";

export async function getServicesByBusiness(
  businessId: string,
): Promise<Service[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select(`
      id,
      business_id,
      name,
      description,
      price,
      duration_minutes,
      active,
      created_at
    `)
    .eq("business_id", businessId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar serviços:", error);
    throw new Error("Não foi possível carregar os serviços.");
  }

  return (data ?? []) as Service[];
}