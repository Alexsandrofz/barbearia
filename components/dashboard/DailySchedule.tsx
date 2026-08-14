import {
  CheckCircle2,
  CircleDashed,
  Clock3,
  Scissors,
  UserRound,
  XCircle,
} from "lucide-react";

import AppointmentActions from "./AppointmentActions";
import { BOOKING_TIME_SLOTS } from "@/lib/time-slots";
import type { AppointmentStatus } from "@/lib/dashboard";

type BarberRelation = {
  name: string;
};

type ServiceRelation = {
  name: string;
  price: number;
  duration_minutes: number;
};

export type ScheduleAppointment = {
  id: string;
  name: string;
  phone: string;
  start_time: string;
  status: AppointmentStatus;
  notes: string | null;
  barber: BarberRelation | BarberRelation[] | null;
  selected_service: ServiceRelation | ServiceRelation[] | null;
};

type Props = {
  appointments: ScheduleAppointment[];
};

function getRelatedItem<T>(relation: T | T[] | null): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation) ? relation[0] ?? null : relation;
}

function normalizeTime(time: string | null) {
  return time?.slice(0, 5) ?? "";
}

function statusLabel(status: AppointmentStatus) {
  const labels: Record<AppointmentStatus, string> = {
    pending: "Pendente",
    confirmed: "Confirmado",
    completed: "Concluído",
    cancelled: "Cancelado",
    no_show: "Não compareceu",
  };

  return labels[status];
}

function statusStyle(status: AppointmentStatus) {
  const styles: Record<AppointmentStatus, string> = {
    pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    confirmed: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    completed: "border-green-500/30 bg-green-500/10 text-green-300",
    cancelled: "border-red-500/30 bg-red-500/10 text-red-300",
    no_show: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  };

  return styles[status];
}

function StatusIcon({ status }: { status: AppointmentStatus }) {
  if (status === "pending") {
    return <CircleDashed className="h-4 w-4" />;
  }

  if (status === "confirmed") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (status === "completed") {
    return <Scissors className="h-4 w-4" />;
  }

  return <XCircle className="h-4 w-4" />;
}

export default function DailySchedule({ appointments }: Props) {
  const visibleAppointments = appointments.filter(
    (appointment) =>
      appointment.status !== "cancelled" &&
      appointment.status !== "no_show",
  );

  return (
    <div className="divide-y divide-border">
      {BOOKING_TIME_SLOTS.map((time) => {
        const appointment = visibleAppointments.find(
          (item) => normalizeTime(item.start_time) === time,
        );

        if (!appointment) {
          return (
            <div
              key={time}
              className="grid min-h-20 grid-cols-[72px_minmax(0,1fr)] items-center gap-4 px-5 py-4 sm:grid-cols-[90px_minmax(0,1fr)] sm:px-7"
            >
              <p className="flex items-center gap-2 font-display text-lg text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                {time}
              </p>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-border px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Horário livre
                </p>

                <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300">
                  Disponível
                </span>
              </div>
            </div>
          );
        }

        const barber = getRelatedItem(appointment.barber);
        const service = getRelatedItem(
          appointment.selected_service,
        );

        return (
          <article
            key={appointment.id}
            className="grid gap-4 bg-secondary/20 px-5 py-5 sm:px-7 lg:grid-cols-[90px_minmax(0,1fr)_minmax(0,1fr)_auto]"
          >
            <p className="flex items-center gap-2 font-display text-xl text-gold">
              <Clock3 className="h-4 w-4" />
              {time}
            </p>

            <div className="min-w-0">
              <p className="flex items-center gap-2 font-semibold">
                <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />

                <span className="truncate">
                  {appointment.name}
                </span>
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {appointment.phone}
              </p>

              {appointment.notes && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Observação: {appointment.notes}
                </p>
              )}
            </div>

            <div className="min-w-0">
              <p className="font-semibold">
                {service?.name ?? "Serviço não informado"}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Profissional: {barber?.name ?? "Não informado"}
              </p>

              {service?.duration_minutes && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Duração: {service.duration_minutes} minutos
                </p>
              )}
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle(
                  appointment.status,
                )}`}
              >
                <StatusIcon status={appointment.status} />
                {statusLabel(appointment.status)}
              </span>

              <AppointmentActions
                appointmentId={appointment.id}
                currentStatus={appointment.status}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}