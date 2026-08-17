import { createClient } from "@/lib/supabase/client";

type BusyAppointment = {
  start_time: string;
  status: string;
  duration_minutes: number;
};

type BusinessHour = {
  weekday: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  break_start: string | null;
  break_end: string | null;
  slot_interval_minutes: number;
};

export type AvailableTimesResult = {
  availableTimes: string[];
  isOpen: boolean;
  message?: string;
};

function timeToMinutes(time: string) {
  const [hours, minutes] = time
    .slice(0, 5)
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0",
  )}`;
}

function getWeekday(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

function getBrazilToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getBrazilCurrentMinutes() {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hour = Number(
    parts.find((part) => part.type === "hour")?.value ?? 0,
  );

  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0,
  );

  return hour * 60 + minute;
}

function rangesOverlap(
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number,
) {
  return firstStart < secondEnd && firstEnd > secondStart;
}

export async function getAvailableTimes(
  businessId: string,
  barberId: string,
  date: string,
  serviceDurationMinutes: number,
): Promise<AvailableTimesResult> {
  const supabase = createClient();

  const weekday = getWeekday(date);

  /*
   * 1. Busca o horário de funcionamento.
   */
  const {
    data: hourData,
    error: hourError,
  } = await supabase
    .from("business_hours")
    .select(`
      weekday,
      is_open,
      open_time,
      close_time,
      break_start,
      break_end,
      slot_interval_minutes
    `)
    .eq("business_id", businessId)
    .eq("weekday", weekday)
    .maybeSingle();

  if (hourError) {
    console.error(
      "Erro ao buscar horário de funcionamento:",
      hourError,
    );

    return {
      availableTimes: [],
      isOpen: false,
      message: "Não foi possível carregar os horários.",
    };
  }

  const businessHour =
    hourData as BusinessHour | null;

  if (
    !businessHour ||
    !businessHour.is_open ||
    !businessHour.open_time ||
    !businessHour.close_time
  ) {
    return {
      availableTimes: [],
      isOpen: false,
      message: "A barbearia não funciona nesta data.",
    };
  }

  /*
   * 2. Busca apenas os horários ocupados.
   *
   * A RPC não expõe nome, telefone,
   * observações ou customer_id.
   */
  const {
    data: appointmentData,
    error: appointmentError,
  } = await supabase.rpc(
    "get_busy_appointments",
    {
      p_barber_id: barberId,
      p_date: date,
    },
  );

  if (appointmentError) {
    console.error(
      "Erro ao buscar horários ocupados:",
      appointmentError,
    );

    return {
      availableTimes: [],
      isOpen: true,
      message:
        "Não foi possível carregar a disponibilidade.",
    };
  }

  const busyAppointments =
    (appointmentData ?? []) as BusyAppointment[];

  /*
   * 3. Converte os horários para minutos.
   */
  const opening = timeToMinutes(
    businessHour.open_time,
  );

  const closing = timeToMinutes(
    businessHour.close_time,
  );

  const breakStart =
    businessHour.break_start
      ? timeToMinutes(
          businessHour.break_start,
        )
      : null;

  const breakEnd =
    businessHour.break_end
      ? timeToMinutes(
          businessHour.break_end,
        )
      : null;

  const slotInterval =
    businessHour.slot_interval_minutes || 30;

  const requestedDuration = Math.max(
    Number(serviceDurationMinutes) ||
      slotInterval,
    slotInterval,
  );

  /*
   * 4. Verifica o horário atual no Brasil.
   */
  const today = getBrazilToday();

  const currentMinutes =
    date === today
      ? getBrazilCurrentMinutes()
      : null;

  const availableTimes: string[] = [];

  /*
   * 5. Monta a grade de horários.
   */
  for (
    let start = opening;
    start < closing;
    start += slotInterval
  ) {
    const end =
      start + requestedDuration;

    /*
     * O atendimento precisa terminar
     * antes do fechamento.
     */
    if (end > closing) {
      continue;
    }

    /*
     * No dia atual, não exibe
     * horários que já passaram.
     */
    if (
      currentMinutes !== null &&
      start <= currentMinutes
    ) {
      continue;
    }

    /*
     * Não deixa o atendimento atravessar
     * o intervalo da barbearia.
     */
    if (
      breakStart !== null &&
      breakEnd !== null &&
      rangesOverlap(
        start,
        end,
        breakStart,
        breakEnd,
      )
    ) {
      continue;
    }

    /*
     * Verifica conflito com agendamentos
     * pendentes ou confirmados.
     */
    const conflictsWithAppointment =
      busyAppointments.some(
        (appointment) => {
          if (!appointment.start_time) {
            return false;
          }

          const appointmentStart =
            timeToMinutes(
              appointment.start_time,
            );

          const appointmentDuration =
            Number(
              appointment.duration_minutes,
            ) || slotInterval;

          const appointmentEnd =
            appointmentStart +
            appointmentDuration;

          return rangesOverlap(
            start,
            end,
            appointmentStart,
            appointmentEnd,
          );
        },
      );

    if (
      conflictsWithAppointment
    ) {
      continue;
    }

    availableTimes.push(
      minutesToTime(start),
    );
  }

  return {
    availableTimes,
    isOpen: true,
    message:
      availableTimes.length === 0
        ? "Não há horários disponíveis nesta data."
        : undefined,
  };
}