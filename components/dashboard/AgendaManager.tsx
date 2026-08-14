"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Coffee,
  Filter,
  LockKeyhole,
  Scissors,
  Search,
  UserRound,
} from "lucide-react";

import AppointmentActions from "@/components/dashboard/AppointmentActions";

import {
  generateAgendaSlots,
} from "@/lib/agenda-slots";

import type {
  AgendaAppointment,
  AgendaBarber,
  AgendaService,
} from "@/lib/agenda-types";

import type {
  BusinessHour,
} from "@/lib/business-hours-types";

type Props = {
  appointments: AgendaAppointment[];

  barbers: {
    id: string;
    name: string;
  }[];

  businessHour: BusinessHour | null;
};

function getRelation<T>(
  relation: T | T[] | null,
): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation)
    ? relation[0] ?? null
    : relation;
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Pendente",
    confirmed: "Confirmado",
    completed: "Concluído",
    cancelled: "Cancelado",
    no_show: "Não compareceu",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  const classes: Record<string, string> = {
    pending:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",

    confirmed:
      "border-blue-500/30 bg-blue-500/10 text-blue-300",

    completed:
      "border-green-500/30 bg-green-500/10 text-green-300",

    cancelled:
      "border-red-500/30 bg-red-500/10 text-red-300",

    no_show:
      "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  };

  return (
    classes[status] ??
    "border-border bg-secondary text-muted-foreground"
  );
}

export default function AgendaManager({
  appointments,
  barbers,
  businessHour,
}: Props) {
  const [barberFilter, setBarberFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const filteredAppointments =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return appointments.filter(
        (appointment) => {
          const barber =
            getRelation<AgendaBarber>(
              appointment.barber,
            );

          const matchesBarber =
            barberFilter === "all" ||
            barber?.id === barberFilter;

          const matchesStatus =
            statusFilter === "all" ||
            appointment.status ===
              statusFilter;

          const matchesSearch =
            !normalizedSearch ||
            appointment.name
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            appointment.phone.includes(
              normalizedSearch,
            );

          return (
            matchesBarber &&
            matchesStatus &&
            matchesSearch
          );
        },
      );
    }, [
      appointments,
      barberFilter,
      statusFilter,
      search,
    ]);

  const agendaSlots = useMemo(
    () =>
      generateAgendaSlots(
        businessHour,
        filteredAppointments,
      ),
    [
      businessHour,
      filteredAppointments,
    ],
  );

  const totals = useMemo(() => {
    return {
      pending:
        appointments.filter(
          (item) =>
            item.status === "pending",
        ).length,

      confirmed:
        appointments.filter(
          (item) =>
            item.status === "confirmed",
        ).length,

      completed:
        appointments.filter(
          (item) =>
            item.status === "completed",
        ).length,
    };
  }, [appointments]);

  return (
    <div className="mt-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="card-premium p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Pendentes
            </p>

            <CircleDashed className="h-5 w-5 text-gold" />
          </div>

          <p className="mt-4 font-display text-3xl text-gold">
            {totals.pending}
          </p>
        </article>

        <article className="card-premium p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Confirmados
            </p>

            <CheckCircle2 className="h-5 w-5 text-gold" />
          </div>

          <p className="mt-4 font-display text-3xl text-gold">
            {totals.confirmed}
          </p>
        </article>

        <article className="card-premium p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Concluídos
            </p>

            <Scissors className="h-5 w-5 text-gold" />
          </div>

          <p className="mt-4 font-display text-3xl text-gold">
            {totals.completed}
          </p>
        </article>
      </section>

      <section className="card-premium mt-8 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gold" />

          <h2 className="font-display text-xl">
            Filtros
          </h2>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm text-muted-foreground">
              Barbeiro
            </label>

            <select
              value={barberFilter}
              onChange={(event) =>
                setBarberFilter(
                  event.target.value,
                )
              }
              className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 outline-none focus:border-gold"
            >
              <option value="all">
                Todos os barbeiros
              </option>

              {barbers.map((barber) => (
                <option
                  key={barber.id}
                  value={barber.id}
                >
                  {barber.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
              className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 outline-none focus:border-gold"
            >
              <option value="all">
                Todos
              </option>

              <option value="pending">
                Pendente
              </option>

              <option value="confirmed">
                Confirmado
              </option>

              <option value="completed">
                Concluído
              </option>

              <option value="cancelled">
                Cancelado
              </option>

              <option value="no_show">
                Não compareceu
              </option>
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">
              Cliente
            </label>

            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Nome ou telefone"
                className="h-12 w-full rounded-xl border border-input bg-background pl-12 pr-4 outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="card-premium mt-6 overflow-hidden">
        <div className="border-b border-border p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-gold" />

            <div>
              <h2 className="font-display text-2xl">
                Agenda do dia
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {filteredAppointments.length} atendimento(s)
              </p>
            </div>
          </div>
        </div>

        {!businessHour ||
        !businessHour.is_open ? (
          <div className="px-6 py-16 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-gold" />

            <h3 className="mt-4 text-lg font-semibold">
              Barbearia fechada
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Não existe expediente configurado para este dia.
            </p>
          </div>
        ) : agendaSlots.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-gold" />

            <h3 className="mt-4 text-lg font-semibold">
              Nenhum horário disponível
            </h3>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {agendaSlots.map((slot) => {
              if (slot.type === "free") {
                return (
                  <div
                    key={slot.time}
                    className="grid min-h-20 items-center gap-4 px-5 py-4 sm:px-6 lg:grid-cols-[100px_1fr]"
                  >
                    <p className="flex items-center gap-2 font-display text-lg text-gold">
                      <Clock3 className="h-4 w-4" />
                      {slot.time}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-green-300">
                      <CheckCircle2 className="h-4 w-4" />
                      Horário livre
                    </div>
                  </div>
                );
              }

              if (slot.type === "break") {
                return (
                  <div
                    key={slot.time}
                    className="grid min-h-20 items-center gap-4 bg-secondary/20 px-5 py-4 sm:px-6 lg:grid-cols-[100px_1fr]"
                  >
                    <p className="flex items-center gap-2 font-display text-lg text-muted-foreground">
                      <Clock3 className="h-4 w-4" />
                      {slot.time}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Coffee className="h-4 w-4" />
                      Intervalo
                    </div>
                  </div>
                );
              }

              const appointment =
                slot.appointment;

              if (!appointment) {
                return null;
              }

              const barber =
                getRelation<AgendaBarber>(
                  appointment.barber,
                );

              const service =
                getRelation<AgendaService>(
                  appointment.selected_service,
                );

              if (slot.type === "occupied") {
                return (
                  <div
                    key={`${slot.time}-${appointment.id}`}
                    className="grid min-h-20 items-center gap-4 bg-secondary/10 px-5 py-4 sm:px-6 lg:grid-cols-[100px_1fr]"
                  >
                    <p className="flex items-center gap-2 font-display text-lg text-muted-foreground">
                      <Clock3 className="h-4 w-4" />
                      {slot.time}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <LockKeyhole className="h-4 w-4" />

                      <span>
                        Ocupado pelo atendimento de{" "}
                        <span className="font-semibold text-foreground">
                          {appointment.name}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <article
                  key={appointment.id}
                  className="grid gap-5 bg-gold/[0.025] p-5 transition-colors hover:bg-secondary/25 sm:p-6 lg:grid-cols-[100px_minmax(0,1fr)_minmax(0,1fr)_auto]"
                >
                  <div>
                    <p className="flex items-center gap-2 font-display text-xl text-gold">
                      <Clock3 className="h-4 w-4" />

                      {formatTime(
                        appointment.start_time,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="flex items-center gap-2 font-semibold">
                      <UserRound className="h-4 w-4 text-muted-foreground" />

                      {appointment.name}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {appointment.phone}
                    </p>

                    {appointment.notes && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {appointment.notes}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="font-semibold">
                      {service?.name ??
                        "Serviço não informado"}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {barber?.name ??
                        "Profissional não informado"}
                    </p>

                    {service && (
                      <p className="mt-2 text-xs text-gold">
                        {formatCurrency(
                          Number(
                            service.price,
                          ),
                        )}{" "}
                        ·{" "}
                        {
                          service.duration_minutes
                        }{" "}
                        min
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                        appointment.status,
                      )}`}
                    >
                      {statusLabel(
                        appointment.status,
                      )}
                    </span>

                    <AppointmentActions
                      appointmentId={
                        appointment.id
                      }
                      currentStatus={
                        appointment.status
                      }
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}