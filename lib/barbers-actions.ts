"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type {
  BarberActionResult,
  BarberInput,
} from "@/lib/barbers-types";

function validateBarber(input: BarberInput) {
  if (!input.name.trim()) {
    return "Informe o nome do barbeiro.";
  }

  if (input.name.trim().length < 2) {
    return "O nome do barbeiro deve possuir pelo menos 2 caracteres.";
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
      message: "Você não possui permissão para gerenciar barbeiros.",
    };
  }

  return {
    supabase,
    allowed: true,
    message: "",
  };
}

export async function saveBarber(
  businessId: string,
  input: BarberInput,
): Promise<BarberActionResult> {
  const validationError = validateBarber(input);

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
    specialty: input.specialty.trim() || null,
    photo_url: input.photo_url.trim() || null,
    active: input.active,
  };

  let error;

  if (input.id) {
    const result = await access.supabase
      .from("barbers")
      .update(payload)
      .eq("id", input.id)
      .eq("business_id", businessId);

    error = result.error;
  } else {
    const result = await access.supabase
      .from("barbers")
      .insert(payload);

    error = result.error;
  }

  if (error) {
    console.error("Erro ao salvar barbeiro:", error);

    if (error.code === "23505") {
      return {
        success: false,
        message: "Já existe um barbeiro com esse nome.",
      };
    }

    return {
      success: false,
      message: "Não foi possível salvar o barbeiro.",
    };
  }

  revalidatePath("/dashboard/barbeiros");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return {
    success: true,
    message: input.id
      ? "Barbeiro atualizado com sucesso."
      : "Barbeiro cadastrado com sucesso.",
  };
}

export async function toggleBarberStatus(
  businessId: string,
  barberId: string,
  active: boolean,
): Promise<BarberActionResult> {
  const access = await getManagementAccess(businessId);

  if (!access.allowed) {
    return {
      success: false,
      message: access.message,
    };
  }

  const { error } = await access.supabase
    .from("barbers")
    .update({ active })
    .eq("id", barberId)
    .eq("business_id", businessId);

  if (error) {
    console.error("Erro ao alterar status do barbeiro:", error);

    return {
      success: false,
      message: "Não foi possível alterar o status do barbeiro.",
    };
  }

  revalidatePath("/dashboard/barbeiros");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return {
    success: true,
    message: active
      ? "Barbeiro ativado com sucesso."
      : "Barbeiro desativado com sucesso.",
  };
}