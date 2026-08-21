import { createClient } from "@/lib/supabase/server";

export type Business = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  logo_url: string | null;
  primary_color: string | null;
  whatsapp: string | null;
  instagram: string | null;
  description: string | null;
};

export type Barber = {
  id: string;
  name: string;
  specialty: string | null;
  photo_url: string | null;
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
};

export async function getActiveBusiness(): Promise<Business | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("businesses")
    .select(`
      id,
      name,
      slug,
      phone,
      email,
      address,
      logo_url,
      primary_color,
      whatsapp,
      instagram,
      description
    `)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Erro ao buscar barbearia ativa:",
      error.message,
    );

    return null;
  }

  return data;
}

export async function getBusinessBySlug(
  slug: string,
): Promise<Business | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("businesses")
    .select(`
      id,
      name,
      slug,
      phone,
      email,
      address,
      logo_url,
      primary_color,
      whatsapp,
      instagram,
      description
    `)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error(
      "Erro ao buscar barbearia:",
      error.message,
    );

    return null;
  }

  return data;
}

export async function getBarbers(
  businessId: string,
): Promise<Barber[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("barbers")
    .select(`
      id,
      name,
      specialty,
      photo_url
    `)
    .eq("business_id", businessId)
    .eq("active", true)
    .order("name");

  if (error) {
    console.error(
      "Erro ao buscar barbeiros:",
      error.message,
    );

    return [];
  }

  return data ?? [];
}

export async function getServices(
  businessId: string,
): Promise<Service[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select(`
      id,
      name,
      description,
      price,
      duration_minutes
    `)
    .eq("business_id", businessId)
    .eq("active", true)
    .order("name");

  if (error) {
    console.error(
      "Erro ao buscar serviços:",
      error.message,
    );

    return [];
  }

  return data ?? [];
}