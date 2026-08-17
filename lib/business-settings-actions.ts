"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/route-access";
import { createClient } from "@/lib/supabase/server";

export type BusinessSettingsInput = {
  name: string;
  slug: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram: string;
  description: string;
  logo_url: string;
  primary_color: string;
  active: boolean;
};

export type BusinessSettingsResult = {
  success: boolean;
  message: string;
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function saveBusinessSettings(
  input: BusinessSettingsInput,
): Promise<BusinessSettingsResult> {
  const access = await requireOwner();

  if (!access.businessId) {
    return {
      success: false,
      message:
        "Barbearia não encontrada.",
    };
  }

  const name =
    input.name.trim();

  if (name.length < 2) {
    return {
      success: false,
      message:
        "Informe o nome da barbearia.",
    };
  }

  const slug =
    normalizeSlug(input.slug || name);

  if (!slug) {
    return {
      success: false,
      message:
        "Informe um endereço válido para a barbearia.",
    };
  }

  const supabase =
    await createClient();

  /*
   * Verifica se o slug já está sendo
   * utilizado por outra barbearia.
   */
  const {
    data: existingBusiness,
    error: existingError,
  } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", slug)
    .neq(
      "id",
      access.businessId,
    )
    .maybeSingle();

  if (existingError) {
    console.error(
      "Erro ao verificar slug:",
      existingError,
    );

    return {
      success: false,
      message:
        "Não foi possível validar o endereço da barbearia.",
    };
  }

  if (existingBusiness) {
    return {
      success: false,
      message:
        "Esse endereço já está sendo utilizado por outra barbearia.",
    };
  }

  const payload = {
    name,
    slug,

    phone:
      input.phone.trim() ||
      null,

    whatsapp:
      input.whatsapp.trim() ||
      null,

    email:
      input.email.trim() ||
      null,

    address:
      input.address.trim() ||
      null,

    instagram:
      input.instagram.trim() ||
      null,

    description:
      input.description.trim() ||
      null,

    logo_url:
      input.logo_url.trim() ||
      null,

    primary_color:
      input.primary_color.trim() ||
      null,

    active:
      input.active,
  };

  const { error } =
    await supabase
      .from("businesses")
      .update(payload)
      .eq(
        "id",
        access.businessId,
      );

  if (error) {
    console.error(
      "Erro ao atualizar barbearia:",
      error,
    );

    if (error.code === "23505") {
      return {
        success: false,
        message:
          "Esse endereço já está sendo utilizado.",
      };
    }

    return {
      success: false,
      message:
        "Não foi possível salvar as configurações.",
    };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(
    "/dashboard/configuracoes/barbearia",
  );

  return {
    success: true,
    message:
      "Configurações atualizadas com sucesso.",
  };
}