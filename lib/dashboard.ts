"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

type UpdateAppointmentResult = {
  business_id: string;
  customer_id: string | null;
};

function mapUpdateError(
  message: string,
) {
  if (
    message.includes(
      "UNAUTHENTICATED",
    )
  ) {
    return "Usuário não autenticado.";
  }

  if (
    message.includes(
      "APPOINTMENT_NOT_FOUND",
    )
  ) {
    return "Agendamento não encontrado.";
  }

  if (
    message.includes(
      "NO_PERMISSION",
    )
  ) {
    return "Você não possui permissão para alterar este agendamento.";
  }

  if (
    message.includes(
      "INVALID_STATUS_TRANSITION",
    )
  ) {
    return "Essa alteração de status não é permitida.";
  }

  if (
    message.includes(
      "INVALID_STATUS",
    )
  ) {
    return "Status de agendamento inválido.";
  }

  return "Não foi possível atualizar o agendamento.";
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
) {
  const supabase =
    await createClient();

  /*
   * Confirma que existe uma sessão.
   */
  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    throw new Error(
      "Usuário não autenticado.",
    );
  }

  /*
   * A função do banco faz toda
   * a validação de segurança:
   *
   * owner:
   *   agenda da barbearia
   *
   * manager:
   *   agenda da barbearia
   *
   * barber:
   *   somente os próprios
   *   atendimentos
   */
  const {
    data,
    error,
  } = await supabase.rpc(
    "update_appointment_status_secure",
    {
      p_appointment_id:
        appointmentId,

      p_status:
        status,
    },
  );

  if (error) {
    console.error(
      "Erro ao atualizar agendamento:",
      error,
    );

    throw new Error(
      mapUpdateError(
        error.message ?? "",
      ),
    );
  }

  const result =
    (
      data?.[0] ??
      null
    ) as UpdateAppointmentResult | null;

  if (!result) {
    throw new Error(
      "Não foi possível atualizar o agendamento.",
    );
  }

  /*
   * Painel administrativo.
   */
  revalidatePath(
    "/dashboard",
  );

  /*
   * Agenda do barbeiro.
   */
  revalidatePath(
    "/dashboard/barbeiro",
  );

  /*
   * Histórico do barbeiro.
   */
  revalidatePath(
    "/dashboard/barbeiro/atendimentos",
  );

  /*
   * Clientes.
   */
  revalidatePath(
    "/dashboard/clientes",
  );

  /*
   * Perfil específico do cliente.
   */
  if (
    result.customer_id
  ) {
    revalidatePath(
      `/dashboard/clientes/${result.customer_id}`,
    );
  }

  /*
   * Financeiro também depende
   * dos atendimentos concluídos.
   */
  revalidatePath(
    "/dashboard/financeiro",
  );

  return {
    success: true,
  };
}