"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { BarberActionResult, BarberInput } from "@/lib/barbers-types";

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

  if (error || !membership || !["owner", "manager"].includes(membership.role)) {
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
    const result = await access.supabase.from("barbers").insert(payload);

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

export type CreateBarberAccessInput = {
  barberId: string;
  email: string;
  password: string;
};

export async function createBarberAccess(
  businessId: string,
  input: CreateBarberAccessInput,
): Promise<BarberActionResult> {
  const access = await getManagementAccess(businessId);

  if (!access.allowed) {
    return {
      success: false,
      message: access.message,
    };
  }

  const email = input.email.trim().toLowerCase();

  const password = input.password.trim();

  if (!email) {
    return {
      success: false,
      message: "Informe o e-mail do barbeiro.",
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      message: "A senha deve possuir pelo menos 6 caracteres.",
    };
  }

  /*
   * Confirma que o barbeiro realmente
   * pertence à barbearia.
   */
  const { data: barber, error: barberError } = await access.supabase
    .from("barbers")
    .select(
      `
      id,
      name,
      user_id,
      active
    `,
    )
    .eq("id", input.barberId)
    .eq("business_id", businessId)
    .maybeSingle();

  if (barberError || !barber) {
    return {
      success: false,
      message: "Barbeiro não encontrado.",
    };
  }

  if (!barber.active) {
    return {
      success: false,
      message: "Ative o barbeiro antes de criar o acesso.",
    };
  }

  if (barber.user_id) {
    return {
      success: false,
      message: "Este barbeiro já possui acesso ao sistema.",
    };
  }

  const admin = createAdminClient();

  /*
   * Cria a conta no Supabase Auth.
   */
  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email,
      password,

      /*
       * Como o dono está criando o acesso
       * diretamente, confirmamos o e-mail
       * automaticamente.
       */
      email_confirm: true,

      user_metadata: {
        name: barber.name,
        role: "barber",
      },
    });

  if (authError || !authData.user) {
    console.error("Erro ao criar usuário do barbeiro:", authError);

    return {
      success: false,
      message: authError?.message?.includes("already")
        ? "Já existe uma conta cadastrada com este e-mail."
        : "Não foi possível criar o acesso do barbeiro.",
    };
  }

  const userId = authData.user.id;

  /*
   * Vincula o usuário Auth ao barbeiro.
   */
  const { error: barberUpdateError } = await admin
    .from("barbers")
    .update({
      user_id: userId,
    })
    .eq("id", barber.id)
    .eq("business_id", businessId);

  if (barberUpdateError) {
    console.error("Erro ao vincular usuário ao barbeiro:", barberUpdateError);

    /*
     * Evita deixar uma conta órfã
     * no Auth caso o vínculo falhe.
     */
    await admin.auth.admin.deleteUser(userId);

    return {
      success: false,
      message:
        "O usuário foi criado, mas não foi possível vinculá-lo ao barbeiro.",
    };
  }

  /*
   * Cria o vínculo de acesso à barbearia.
   */
  const { error: membershipError } = await admin
    .from("business_members")
    .insert({
      business_id: businessId,
      user_id: userId,
      role: "barber",
      active: true,
    });

  if (membershipError) {
    console.error("Erro ao criar vínculo do barbeiro:", membershipError);

    await admin
      .from("barbers")
      .update({
        user_id: null,
      })
      .eq("id", barber.id)
      .eq("business_id", businessId);

    await admin.auth.admin.deleteUser(userId);

    return {
      success: false,
      message: "Não foi possível liberar o acesso do barbeiro.",
    };
  }

  revalidatePath("/dashboard/barbeiros");

  revalidatePath("/dashboard/barbeiro");

  return {
    success: true,
    message: "Acesso do barbeiro criado com sucesso.",
  };
}
