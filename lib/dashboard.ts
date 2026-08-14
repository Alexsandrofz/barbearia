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
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId);

  if (error) {
    console.error("Erro ao atualizar agendamento:", error);
    throw new Error("Não foi possível atualizar o agendamento.");
  }

  revalidatePath("/dashboard");
}