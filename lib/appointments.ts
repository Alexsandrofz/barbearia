"use server";

import { createClient } from "@/lib/supabase/server";

export type AppointmentInput = {
  businessId: string;
  barberId: string;
  serviceId: string;
  serviceName: string;
  name: string;
  phone: string;
  appointmentDate: string;
  startTime: string;
  notes?: string;
};

type AppointmentError = {
  code: string;
  message: string;
};

type CreateAppointmentResult = {
  error: AppointmentError | null;
};

type ServiceRow = {
  id: string;
  business_id: string;
  duration_minutes: number;
  active: boolean;
};

type BusinessHourRow = {
  weekday: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  break_start: string | null;
  break_end: string | null;
};

type ExistingAppointment = {
  id: string;
  start_time: string;
  selected_service:
    | {
        duration_minutes: number;
      }
    | {
        duration_minutes: number;
      }[]
    | null;
};

function getRelation<T>(relation: T | T[] | null): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);

  return hours * 60 + minutes;
}

function rangesOverlap(
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number,
) {
  return firstStart < secondEnd && firstEnd > secondStart;
}

function getWeekday(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

export async function createAppointment(
  input: AppointmentInput,
): Promise<CreateAppointmentResult> {
  const supabase = await createClient();

  const name = input.name.trim();
  const phone = input.phone.trim();

  if (!name) {
    return {
      error: {
        code: "INVALID_NAME",
        message: "Informe o nome do cliente.",
      },
    };
  }

  if (!phone) {
    return {
      error: {
        code: "INVALID_PHONE",
        message: "Informe o telefone do cliente.",
      },
    };
  }

  if (
    !input.businessId ||
    !input.barberId ||
    !input.serviceId ||
    !input.appointmentDate ||
    !input.startTime
  ) {
    return {
      error: {
        code: "INVALID_APPOINTMENT",
        message: "Dados do agendamento incompletos.",
      },
    };
  }

  /*
   * 1. Confirma se o serviço realmente existe,
   * pertence à barbearia e está ativo.
   */
  const { data: serviceData, error: serviceError } = await supabase
    .from("services")
    .select(
      `
      id,
      business_id,
      duration_minutes,
      active
    `,
    )
    .eq("id", input.serviceId)
    .eq("business_id", input.businessId)
    .eq("active", true)
    .maybeSingle();

  if (serviceError || !serviceData) {
    return {
      error: {
        code: "INVALID_SERVICE",
        message: "O serviço selecionado não está disponível.",
      },
    };
  }

  const service = serviceData as ServiceRow;

  /*
   * 2. Confirma se o barbeiro pertence à empresa
   * e está ativo.
   */
  const { data: barberData, error: barberError } = await supabase
    .from("barbers")
    .select("id")
    .eq("id", input.barberId)
    .eq("business_id", input.businessId)
    .eq("active", true)
    .maybeSingle();

  if (barberError || !barberData) {
    return {
      error: {
        code: "INVALID_BARBER",
        message: "O profissional selecionado não está disponível.",
      },
    };
  }

  /*
   * 3. Confirma o horário de funcionamento.
   */
  const weekday = getWeekday(input.appointmentDate);

  const { data: businessHourData, error: businessHourError } = await supabase
    .from("business_hours")
    .select(
      `
      weekday,
      is_open,
      open_time,
      close_time,
      break_start,
      break_end
    `,
    )
    .eq("business_id", input.businessId)
    .eq("weekday", weekday)
    .maybeSingle();

  if (businessHourError || !businessHourData) {
    return {
      error: {
        code: "BUSINESS_HOURS_ERROR",
        message: "Não foi possível validar o horário de funcionamento.",
      },
    };
  }

  const businessHour = businessHourData as BusinessHourRow;

  if (
    !businessHour.is_open ||
    !businessHour.open_time ||
    !businessHour.close_time
  ) {
    return {
      error: {
        code: "BUSINESS_CLOSED",
        message: "A barbearia não funciona nesta data.",
      },
    };
  }

  const requestedStart = timeToMinutes(input.startTime);

  const requestedEnd = requestedStart + service.duration_minutes;

  const opening = timeToMinutes(businessHour.open_time);

  const closing = timeToMinutes(businessHour.close_time);

  if (requestedStart < opening || requestedEnd > closing) {
    return {
      error: {
        code: "OUTSIDE_BUSINESS_HOURS",
        message: "O horário selecionado está fora do expediente.",
      },
    };
  }

  /*
   * 4. Impede atendimento durante o intervalo.
   */
  if (businessHour.break_start && businessHour.break_end) {
    const breakStart = timeToMinutes(businessHour.break_start);

    const breakEnd = timeToMinutes(businessHour.break_end);

    if (rangesOverlap(requestedStart, requestedEnd, breakStart, breakEnd)) {
      return {
        error: {
          code: "BREAK_CONFLICT",
          message: "Esse horário entra no intervalo da barbearia.",
        },
      };
    }
  }

  /*
   * 5. Busca todos os atendimentos ativos
   * daquele barbeiro naquele dia.
   */
  const { data: existingAppointmentsData, error: existingAppointmentsError } =
    await supabase
      .from("appointments")
      .select(
        `
      id,
      start_time,
      selected_service:services (
        duration_minutes
      )
    `,
      )
      .eq("business_id", input.businessId)
      .eq("barber_id", input.barberId)
      .eq("appointment_date", input.appointmentDate)
      .in("status", ["pending", "confirmed"]);

  if (existingAppointmentsError) {
    console.error("Erro ao verificar conflitos:", existingAppointmentsError);

    return {
      error: {
        code: "AVAILABILITY_ERROR",
        message: "Não foi possível validar a disponibilidade.",
      },
    };
  }

  const existingAppointments = (existingAppointmentsData ??
    []) as ExistingAppointment[];

  /*
   * 6. Valida sobreposição considerando
   * a duração real de cada serviço existente.
   */
  const conflict = existingAppointments.some((appointment) => {
    const existingStart = timeToMinutes(appointment.start_time);

    const existingService = getRelation(appointment.selected_service);

    const existingDuration = existingService?.duration_minutes ?? 30;

    const existingEnd = existingStart + existingDuration;

    return rangesOverlap(
      requestedStart,
      requestedEnd,
      existingStart,
      existingEnd,
    );
  });

  if (conflict) {
    return {
      error: {
        code: "23505",
        message: "Esse horário acabou de ser ocupado.",
      },
    };
  }

  /*
   * 7. Somente agora cria o agendamento.
   */
  const { error } = await supabase.from("appointments").insert({
    business_id: input.businessId,

    barber_id: input.barberId,

    service_id: input.serviceId,

    /*
     * Mantemos a coluna antiga porque
     * ela ainda existe no seu banco.
     */
    service: input.serviceName,

    duration_minutes_snapshot: service.duration_minutes,

    name,
    phone,

    appointment_date: input.appointmentDate,

    start_time: input.startTime,

    notes: input.notes?.trim() || null,

    status: "pending",
  });

  if (error) {
    console.error("Erro ao criar agendamento:", error);

    return {
      error: {
        code: error.code ?? "CREATE_ERROR",

        message: error.message ?? "Não foi possível criar o agendamento.",
      },
    };
  }

  return {
    error: null,
  };
}
