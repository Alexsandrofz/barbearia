"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type {
  ServiceActionResult,
  ServiceInput,
} from "@/lib/services-types";

function validateService(input: ServiceInput) {
  if (!input.name.trim()) {
    return "Informe o nome do serviço.";
  }

  if (!Number.isFinite(input.price) || input.price < 0) {
    return "Informe um preço válido.";
  }

  if (
    !Number.isInteger(input.duration_minutes) ||
    input.duration_minutes <= 0
  ) {
    return "Informe uma duração válida.";
  }

  return null;
}

async function getManagementAccess(businessId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      allowed: false,
      message: "Sua sessão expirou. Entre novamente.",
    };
  }

  const { data: membership, error } = await supabase
    .from("business_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("business_id", businessId)
    .eq("active", true)
    .single();

  if (
    error ||
    !membership ||
    !["owner", "manager"].includes(membership.role)
  ) {
    return {
      supabase,
      allowed: false,
      message: "Você não possui permissão para gerenciar serviços.",
    };
  }

  return {
    supabase,
    allowed: true,
    message: "",
  };
}

export async function saveService(
  businessId: string,
  input: ServiceInput,
): Promise<ServiceActionResult> {
  const validationError = validateService(input);

  if (validationError) {
    return {
      success: false,
      message: validationError,
    };
  }

  const access = await getManagementAccess(businessId);

  if (!access.allowed) {
    return {
      success: false,
      message: access.message,
    };
  }

  const payload = {
    business_id: businessId,
    name: input.name.trim(),
    description: input.description.trim() || null,
    price: input.price,
    duration_minutes: input.duration_minutes,
    active: input.active,
  };

  let error;

  if (input.id) {
    const result = await access.supabase
      .from("services")
      .update(payload)
      .eq("id", input.id)
      .eq("business_id", businessId);

    error = result.error;
  } else {
    const result = await access.supabase
      .from("services")
      .insert(payload);

    error = result.error;
  }

  if (error) {
    console.error("Erro ao salvar serviço:", error);

    if (error.code === "23505") {
      return {
        success: false,
        message: "Já existe um serviço com esse nome.",
      };
    }

    return {
      success: false,
      message: "Não foi possível salvar o serviço.",
    };
  }

  revalidatePath("/dashboard/servicos");
  revalidatePath("/");

  return {
    success: true,
    message: input.id
      ? "Serviço atualizado com sucesso."
      : "Serviço criado com sucesso.",
  };
}

export async function toggleServiceStatus(
  businessId: string,
  serviceId: string,
  active: boolean,
): Promise<ServiceActionResult> {
  const access = await getManagementAccess(businessId);

  if (!access.allowed) {
    return {
      success: false,
      message: access.message,
    };
  }

  const { error } = await access.supabase
    .from("services")
    .update({ active })
    .eq("id", serviceId)
    .eq("business_id", businessId);

  if (error) {
    console.error("Erro ao alterar status do serviço:", error);

    return {
      success: false,
      message: "Não foi possível alterar o status do serviço.",
    };
  }

  revalidatePath("/dashboard/servicos");
  revalidatePath("/");

  return {
    success: true,
    message: active
      ? "Serviço ativado com sucesso."
      : "Serviço desativado com sucesso.",
  };
}