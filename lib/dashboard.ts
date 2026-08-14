"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Usuário não autenticado.");
  }

  /*
   * Buscamos primeiro o agendamento para:
   * - confirmar que ele pertence a uma empresa do usuário;
   * - descobrir o customer_id;
   * - conseguir revalidar o perfil do cliente.
   */
  const {
    data: appointment,
    error: appointmentError,
  } = await supabase
    .from("appointments")
    .select(`
      id,
      business_id,
      customer_id,
      status
    `)
    .eq("id", appointmentId)
    .maybeSingle();

  if (appointmentError || !appointment) {
    console.error(
      "Erro ao buscar agendamento:",
      appointmentError,
    );

    throw new Error(
      "Agendamento não encontrado.",
    );
  }

  /*
   * Verifica se o usuário realmente pode alterar
   * agendamentos dessa barbearia.
   */
  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("business_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("business_id", appointment.business_id)
    .eq("active", true)
    .maybeSingle();

  if (
    membershipError ||
    !membership ||
    !["owner", "manager"].includes(membership.role)
  ) {
    throw new Error(
      "Você não possui permissão para alterar este agendamento.",
    );
  }

  const { error } = await supabase
    .from("appointments")
    .update({
      status,
    })
    .eq("id", appointmentId)
    .eq("business_id", appointment.business_id);

  if (error) {
    console.error(
      "Erro ao atualizar agendamento:",
      error,
    );

    throw new Error(
      "Não foi possível atualizar o agendamento.",
    );
  }

  /*
   * Atualiza todas as telas que dependem
   * diretamente do status do atendimento.
   */
  revalidatePath("/dashboard");

  revalidatePath(
    "/dashboard/clientes",
  );

  if (appointment.customer_id) {
    revalidatePath(
      `/dashboard/clientes/${appointment.customer_id}`,
    );
  }

  return {
    success: true,
  };
}