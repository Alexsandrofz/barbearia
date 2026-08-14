import "server-only";

import { createClient } from "@/lib/supabase/server";

export type LoyaltySettings = {
  id: string;
  business_id: string;
  enabled: boolean;
  target_visits: number;
  reward_name: string;
};

export async function getLoyaltySettings(
  businessId: string,
): Promise<LoyaltySettings | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("loyalty_settings")
    .select(`
      id,
      business_id,
      enabled,
      target_visits,
      reward_name
    `)
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao carregar fidelidade:", error);
    return null;
  }

  return data as LoyaltySettings | null;
}