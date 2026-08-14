"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coffee,
  Filter,
  LockKeyhole,
  Search,
  UserRound,
} from "lucide-react";

import AppointmentActions from "@/components/dashboard/AppointmentActions";

import { generateAgendaSlots } from "@/lib/agenda-slots";

import type {
  AgendaAppointment,
  AgendaBarber,
  AgendaService,
} from "@/lib/agenda-types";

import type { BusinessHour } from "@/lib/business-hours-types";

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
    ? (relation[0] ?? null)
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

  const isAllBarbers =
    barberFilter === "all";

  const filteredAppointments =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      const normalizedPhoneSearch =
        search.replace(/\D/g, "");

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

          const customerName =
            appointment.name.toLowerCase();

          const customerPhone =
            appointment.phone.replace(
              /\D/g,
              "",
            );

          const matchesSearch =
            !normalizedSearch ||
            customerName.includes(
              normalizedSearch,
            ) ||
            (
              normalizedPhoneSearch.length >
                0 &&
              customerPhone.includes(
                normalizedPhoneSearch,
              )
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

  const appointmentsForSlots =
    useMemo(() => {
      if (isAllBarbers) {
        return [];
      }

      return appointments.filter(
        (appointment) => {
          const barber =
            getRelation<AgendaBarber>(
              appointment.barber,
            );

          return (
            barber?.id ===
            barberFilter
          );
        },
      );
    }, [
      appointments,
      barberFilter,
      isAllBarbers,
    ]);

  const agendaSlots = useMemo(
    () =>
      generateAgendaSlots(
        businessHour,
        appointmentsForSlots,
      ),
    [
      businessHour,
      appointmentsForSlots,
    ],
  );

  const hasContentFilter =
    statusFilter !== "all" ||
    search.trim().length > 0;

  const visibleAppointmentIds =
    useMemo(
      () =>
        new Set(
          filteredAppointments.map(
            (appointment) =>
              appointment.id,
          ),
        ),
      [filteredAppointments],
    );

  const groupedAppointments =
    useMemo(() => {
      const groups = new Map<
        string,
        AgendaAppointment[]
      >();

      const ordered = [
        ...filteredAppointments,
      ].sort((a, b) =>
        a.start_time.localeCompare(
          b.start_time,
        ),
      );

      for (const appointment of ordered) {
        const time =
          formatTime(
            appointment.start_time,
          );

        const current =
          groups.get(time) ?? [];

        current.push(appointment);

        groups.set(time, current);
      }

      return Array.from(
        groups.entries(),
      );
    }, [filteredAppointments]);

  return (
    <div className="mt-8">
      <section className="card-premium p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gold" />

          <h2 className="font-display text-xl">
            Filtros
          </h2>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="agenda-barber-filter"
              className="text-sm text-muted-foreground"
            >
              Barbeiro
            </label>

            <select
              id="agenda-barber-filter"
              value={barberFilter}
              onChange={(event) =>
                setBarberFilter(
                  event.target.value,
                )
              }
              className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 outline-none transition-colors focus:border-gold"
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
            <label
              htmlFor="agenda-status-filter"
              className="text-sm text-muted-foreground"
            >
              Status
            </label>

            <select
              id="agenda-status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
              className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 outline-none transition-colors focus:border-gold"
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
            <label
              htmlFor="agenda-search"
              className="text-sm text-muted-foreground"
            >
              Cliente
            </label>

            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                id="agenda-search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Nome ou telefone"
                className="h-12 w-full rounded-xl border border-input bg-background pl-12 pr-4 outline-none transition-colors focus:border-gold"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="card-premium mt-6 overflow-hidden">
        <div className="border-b border-border p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-gold" />

              <div>
                <h2 className="font-display text-2xl">
                  Agenda do dia
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {
                    filteredAppointments.length
                  }{" "}
                  atendimento(s)
                  encontrado(s)
                </p>
              </div>
            </div>

            {!isAllBarbers && (
              <span className="w-fit rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                Agenda individual
              </span>
            )}
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
              Não existe expediente
              configurado para este dia.
            </p>
          </div>
        ) : isAllBarbers ? (
          /*
           * ============================
           * VISÃO GERAL
           * TODOS OS BARBEIROS
           * ============================
           */
          filteredAppointments.length ===
          0 ? (
            <div className="px-6 py-16 text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-gold" />

              <h3 className="mt-4 text-lg font-semibold">
                Nenhum atendimento
                encontrado
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Não existem
                agendamentos com os
                filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {groupedAppointments.map(
                ([
                  time,
                  appointmentsAtTime,
                ]) => (
                  <section
                    key={time}
                    className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[90px_minmax(0,1fr)]"
                  >
                    <div>
                      <p className="flex items-center gap-2 font-display text-xl text-gold">
                        <Clock3 className="h-4 w-4" />

                        {time}
                      </p>

                      {appointmentsAtTime.length >
                        1 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {
                            appointmentsAtTime.length
                          }{" "}
                          atendimentos
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4">
                      {appointmentsAtTime.map(
                        (
                          appointment,
                        ) => {
                          const barber =
                            getRelation<AgendaBarber>(
                              appointment.barber,
                            );

                          const service =
                            getRelation<AgendaService>(
                              appointment.selected_service,
                            );

                          return (
                            <article
                              key={
                                appointment.id
                              }
                              className="rounded-xl border border-border bg-secondary/15 p-4 sm:p-5"
                            >
                              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                                <div className="min-w-0">
                                  <p className="flex items-center gap-2 font-semibold">
                                    <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />

                                    <span className="truncate">
                                      {
                                        appointment.name
                                      }
                                    </span>
                                  </p>

                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {
                                      appointment.phone
                                    }
                                  </p>

                                  {appointment.notes && (
                                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                      {
                                        appointment.notes
                                      }
                                    </p>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="font-semibold">
                                    {service?.name ??
                                      "Serviço não informado"}
                                  </p>

                                  <p className="mt-1 text-sm text-muted-foreground">
                                    Profissional:{" "}
                                    <span className="font-medium text-foreground">
                                      {barber?.name ??
                                        "Não informado"}
                                    </span>
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
                              </div>
                            </article>
                          );
                        },
                      )}
                    </div>
                  </section>
                ),
              )}
            </div>
          )
        ) : agendaSlots.length ===
          0 ? (
          /*
           * ============================
           * BARBEIRO ESPECÍFICO
           * SEM HORÁRIOS
           * ============================
           */
          <div className="px-6 py-16 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-gold" />

            <h3 className="mt-4 text-lg font-semibold">
              Nenhum horário disponível
            </h3>
          </div>
        ) : (
          /*
           * ============================
           * AGENDA INDIVIDUAL
           * BARBEIRO ESPECÍFICO
           * ============================
           */
          <div className="divide-y divide-border">
            {agendaSlots.map(
              (slot) => {
                if (
                  slot.type ===
                  "free"
                ) {
                  if (
                    hasContentFilter
                  ) {
                    return null;
                  }

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

                if (
                  slot.type ===
                  "break"
                ) {
                  if (
                    hasContentFilter
                  ) {
                    return null;
                  }

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

                if (
                  hasContentFilter &&
                  !visibleAppointmentIds.has(
                    appointment.id,
                  )
                ) {
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

                if (
                  slot.type ===
                  "occupied"
                ) {
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
                          Ocupado pelo
                          atendimento de{" "}
                          <span className="font-semibold text-foreground">
                            {
                              appointment.name
                            }
                          </span>

                          {service && (
                            <>
                              {" "}
                              ·{" "}
                              {
                                service.name
                              }
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <article
                    key={
                      appointment.id
                    }
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

                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-semibold">
                        <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />

                        <span className="truncate">
                          {
                            appointment.name
                          }
                        </span>
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {
                          appointment.phone
                        }
                      </p>

                      {appointment.notes && (
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          {
                            appointment.notes
                          }
                        </p>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold">
                        {service?.name ??
                          "Serviço não informado"}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Profissional:{" "}
                        {barber?.name ??
                          "Não informado"}
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
              },
            )}

            {hasContentFilter &&
              filteredAppointments.length ===
                0 && (
                <div className="px-6 py-16 text-center">
                  <Search className="mx-auto h-9 w-9 text-gold" />

                  <h3 className="mt-4 text-lg font-semibold">
                    Nenhum atendimento
                    encontrado
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Tente alterar o
                    cliente ou status
                    pesquisado.
                  </p>
                </div>
              )}
          </div>
        )}
      </section>
    </div>
  );
}