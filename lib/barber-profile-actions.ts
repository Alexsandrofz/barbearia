"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUserAccess } from "@/lib/auth-role";
import { createAdminClient } from "@/lib/supabase/admin";

type UpdateBarberProfileInput = {
  name: string;
  specialty: string;
};

type ActionResult = {
  success: boolean;
  message: string;
};

export async function updateBarberProfile(
  input: UpdateBarberProfileInput,
): Promise<ActionResult> {
  const access =
    await getCurrentUserAccess();

  if (!access) {
    return {
      success: false,
      message:
        "Sua sessão expirou. Entre novamente.",
    };
  }

  if (
    access.role !== "barber" ||
    !access.barberId ||
    !access.businessId
  ) {
    return {
      success: false,
      message:
        "Você não possui permissão para alterar este perfil.",
    };
  }

  const name =
    input.name.trim();

  const specialty =
    input.specialty.trim();

  if (!name) {
    return {
      success: false,
      message:
        "Informe seu nome.",
    };
  }

  if (name.length < 2) {
    return {
      success: false,
      message:
        "O nome deve possuir pelo menos 2 caracteres.",
    };
  }

  const admin =
    createAdminClient();

  const { error } =
    await admin
      .from("barbers")
      .update({
        name,
        specialty:
          specialty || null,
      })
      .eq(
        "id",
        access.barberId,
      )
      .eq(
        "business_id",
        access.businessId,
      );

  if (error) {
    console.error(
      "Erro ao atualizar perfil do barbeiro:",
      error,
    );

    return {
      success: false,
      message:
        "Não foi possível atualizar seu perfil.",
    };
  }

  revalidatePath(
    "/dashboard/barbeiro",
  );

  revalidatePath(
    "/dashboard/barbeiro/perfil",
  );

  revalidatePath(
    "/dashboard/barbeiros",
  );

  revalidatePath("/");

  return {
    success: true,
    message:
      "Perfil atualizado com sucesso.",
  };
}
export async function updateBarberProfilePhoto(
  photoUrl: string,
): Promise<{
  success: boolean;
  message: string;
}> {
  const access =
    await getCurrentUserAccess();

  if (!access) {
    return {
      success: false,
      message:
        "Sua sessão expirou. Entre novamente.",
    };
  }

  if (
    access.role !== "barber" ||
    !access.barberId ||
    !access.businessId
  ) {
    return {
      success: false,
      message:
        "Você não possui permissão para alterar esta foto.",
    };
  }

  const admin =
    createAdminClient();

  const { error } =
    await admin
      .from("barbers")
      .update({
        photo_url:
          photoUrl.trim() || null,
      })
      .eq(
        "id",
        access.barberId,
      )
      .eq(
        "business_id",
        access.businessId,
      );

  if (error) {
    console.error(
      "Erro ao atualizar foto do barbeiro:",
      error,
    );

    return {
      success: false,
      message:
        "Não foi possível atualizar sua foto.",
    };
  }

  revalidatePath(
    "/dashboard/barbeiro",
  );

  revalidatePath(
    "/dashboard/barbeiro/perfil",
  );

  revalidatePath(
    "/dashboard/barbeiros",
  );

  revalidatePath("/");

  return {
    success: true,
    message:
      "Foto atualizada com sucesso.",
  };
}