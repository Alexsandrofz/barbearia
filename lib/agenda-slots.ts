import type { AgendaAppointment } from "@/lib/agenda-types";
import type { BusinessHour } from "@/lib/business-hours-types";

export type AgendaSlot = {
  time: string;
  type: "free" | "appointment" | "occupied" | "break";
  appointment?: AgendaAppointment;
};

function timeToMinutes(time: string) {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function getRelation<T>(relation: T | T[] | null): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation)
    ? relation[0] ?? null
    : relation;
}

export function generateAgendaSlots(
  businessHour: BusinessHour | null,
  appointments: AgendaAppointment[],
): AgendaSlot[] {
  if (
    !businessHour ||
    !businessHour.is_open ||
    !businessHour.open_time ||
    !businessHour.close_time
  ) {
    return [];
  }

  const opening = timeToMinutes(businessHour.open_time);
  const closing = timeToMinutes(businessHour.close_time);

  const interval = businessHour.slot_interval_minutes || 30;

  const breakStart = businessHour.break_start
    ? timeToMinutes(businessHour.break_start)
    : null;

  const breakEnd = businessHour.break_end
    ? timeToMinutes(businessHour.break_end)
    : null;

  const activeAppointments = appointments.filter(
    (appointment) =>
      appointment.status !== "cancelled" &&
      appointment.status !== "no_show",
  );

  const slots: AgendaSlot[] = [];

  for (
    let current = opening;
    current < closing;
    current += interval
  ) {
    const time = minutesToTime(current);

    if (
      breakStart !== null &&
      breakEnd !== null &&
      current >= breakStart &&
      current < breakEnd
    ) {
      slots.push({
        time,
        type: "break",
      });

      continue;
    }

    const startingAppointment = activeAppointments.find(
      (appointment) =>
        timeToMinutes(appointment.start_time) === current,
    );

    if (startingAppointment) {
      slots.push({
        time,
        type: "appointment",
        appointment: startingAppointment,
      });

      continue;
    }

    const occupyingAppointment = activeAppointments.find(
      (appointment) => {
        const start = timeToMinutes(appointment.start_time);

        const service = getRelation(
          appointment.selected_service,
        );

        const duration = service?.duration_minutes ?? interval;

        const end = start + duration;

        return current > start && current < end;
      },
    );

    if (occupyingAppointment) {
      slots.push({
        time,
        type: "occupied",
        appointment: occupyingAppointment,
      });

      continue;
    }

    slots.push({
      time,
      type: "free",
    });
  }

  return slots;
}