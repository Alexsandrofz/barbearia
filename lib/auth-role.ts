import "server-only";

import { createClient } from "@/lib/supabase/server";

export type UserRole =
  | "owner"
  | "manager"
  | "barber"
  | "customer"
  | "unauthorized";

export type CurrentUserAccess = {
  userId: string;
  role: UserRole;
  businessId: string | null;
  barberId: string | null;
  customerId: string | null;
};

export async function getCurrentUserAccess(): Promise<CurrentUserAccess | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: membership } = await supabase
    .from("business_members")
    .select("business_id, role")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (membership) {
    if (
      membership.role === "owner" ||
      membership.role === "manager"
    ) {
      return {
        userId: user.id,
        role: membership.role,
        businessId: membership.business_id,
        barberId: null,
        customerId: null,
      };
    }

    if (membership.role === "barber") {
      const { data: barber } = await supabase
        .from("barbers")
        .select("id")
        .eq("user_id", user.id)
        .eq("active", true)
        .maybeSingle();

      return {
        userId: user.id,
        role: "barber",
        businessId: membership.business_id,
        barberId: barber?.id ?? null,
        customerId: null,
      };
    }
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("id, business_id")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (customer) {
    return {
      userId: user.id,
      role: "customer",
      businessId: customer.business_id,
      barberId: null,
      customerId: customer.id,
    };
  }

  return {
    userId: user.id,
    role: "unauthorized",
    businessId: null,
    barberId: null,
    customerId: null,
  };
}