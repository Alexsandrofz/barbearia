"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type {
  BusinessHourInput,
  UpdateBusinessHoursResult,
} from "@/lib/business-hours-types";

function normalizeOptionalTime(value: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function validateHours(hours: BusinessHourInput[]) {
  if (hours.length !== 7) {
    return "É necessário configurar os sete dias da semana.";
  }

  const weekdays = new Set(hours.map((hour) => hour.weekday));

  if (weekdays.size !== 7) {
    return "Existem dias repetidos ou ausentes na configuração.";
  }

  for (const hour of hours) {
    if (hour.weekday < 0 || hour.weekday > 6) {
      return "Foi encontrado um dia da semana inválido.";
    }

    if (![15, 20, 30, 45, 60].includes(hour.slot_interval_minutes)) {
      return "Selecione um intervalo válido entre os atendimentos.";
    }

    if (!hour.is_open) {
      continue;
    }

    if (!hour.open_time || !hour.close_time) {
      return "Informe a abertura e o fechamento dos dias abertos.";
    }

    if (hour.open_time >= hour.close_time) {
      return "O fechamento deve ser posterior à abertura.";
    }

    const hasBreakStart = Boolean(hour.break_start);
    const hasBreakEnd = Boolean(hour.break_end);

    if (hasBreakStart !== hasBreakEnd) {
      return "Informe o início e o fim do intervalo ou deixe ambos vazios.";
    }

    if (hour.break_start && hour.break_end) {
      if (hour.break_start >= hour.break_end) {
        return "O fim do intervalo deve ser posterior ao início.";
      }

      if (
        hour.break_start < hour.open_time ||
        hour.break_end > hour.close_time
      ) {
        return "O intervalo precisa estar dentro do horário de funcionamento.";
      }
    }
  }

  return null;
}

export async function updateBusinessHours(
  businessId: string,
  hours: BusinessHourInput[],
): Promise<UpdateBusinessHoursResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: "Sua sessão expirou. Entre novamente.",
    };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("business_members")
    .select("business_id, role")
    .eq("user_id", user.id)
    .eq("business_id", businessId)
    .eq("active", true)
    .single();

  if (
    membershipError ||
    !membership ||
    !["owner", "manager"].includes(membership.role)
  ) {
    return {
      success: false,
      message: "Você não possui permissão para alterar esses horários.",
    };
  }

  const validationError = validateHours(hours);

  if (validationError) {
    return {
      success: false,
      message: validationError,
    };
  }

  const rows = hours.map((hour) => ({
    business_id: businessId,
    weekday: hour.weekday,
    is_open: hour.is_open,
    open_time: hour.is_open
      ? normalizeOptionalTime(hour.open_time)
      : null,
    close_time: hour.is_open
      ? normalizeOptionalTime(hour.close_time)
      : null,
    break_start: hour.is_open
      ? normalizeOptionalTime(hour.break_start)
      : null,
    break_end: hour.is_open
      ? normalizeOptionalTime(hour.break_end)
      : null,
    slot_interval_minutes: hour.slot_interval_minutes,
  }));

  const { error } = await supabase
    .from("business_hours")
    .upsert(rows, {
      onConflict: "business_id,weekday",
    });

  if (error) {
    console.error("Erro ao atualizar horários:", error);

    return {
      success: false,
      message: "Não foi possível salvar os horários. Tente novamente.",
    };
  }

  revalidatePath("/dashboard/configuracoes/horarios");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return {
    success: true,
    message: "Horários atualizados com sucesso.",
  };
}