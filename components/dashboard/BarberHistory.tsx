"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Search,
  Scissors,
  UserRound,
  XCircle,
} from "lucide-react";

type ServiceRelation = {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
};

export type BarberHistoryAppointment = {
  id: string;
  name: string;
  phone: string;
  appointment_date: string;
  start_time: string;
  status: string;
  notes: string | null;

  selected_service:
    | ServiceRelation
    | ServiceRelation[]
    | null;
};

type Props = {
  appointments: BarberHistoryAppointment[];
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(
    new Date(`${date}T12:00:00Z`),
  );
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    completed: "Concluído",
    cancelled: "Cancelado",
    no_show: "Não compareceu",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  const classes: Record<string, string> = {
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

function getBrazilToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function subtractDays(
  date: string,
  amount: number,
) {
  const parsed = new Date(
    `${date}T12:00:00Z`,
  );

  parsed.setUTCDate(
    parsed.getUTCDate() - amount,
  );

  return parsed
    .toISOString()
    .slice(0, 10);
}

export default function BarberHistory({
  appointments,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [periodFilter, setPeriodFilter] =
    useState("all");

  const today = getBrazilToday();

  const filteredAppointments =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return appointments.filter(
        (appointment) => {
          const matchesSearch =
            !normalizedSearch ||
            appointment.name
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            appointment.phone
              .replace(/\D/g, "")
              .includes(
                normalizedSearch.replace(
                  /\D/g,
                  "",
                ),
              );

          const matchesStatus =
            statusFilter === "all" ||
            appointment.status ===
              statusFilter;

          let matchesPeriod = true;

          if (
            periodFilter === "7"
          ) {
            const start =
              subtractDays(
                today,
                6,
              );

            matchesPeriod =
              appointment.appointment_date >=
                start &&
              appointment.appointment_date <=
                today;
          }

          if (
            periodFilter === "30"
          ) {
            const start =
              subtractDays(
                today,
                29,
              );

            matchesPeriod =
              appointment.appointment_date >=
                start &&
              appointment.appointment_date <=
                today;
          }

          if (
            periodFilter === "month"
          ) {
            matchesPeriod =
              appointment.appointment_date.slice(
                0,
                7,
              ) === today.slice(0, 7);
          }

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPeriod
          );
        },
      );
    }, [
      appointments,
      search,
      statusFilter,
      periodFilter,
      today,
    ]);

  const completedCount =
    appointments.filter(
      (appointment) =>
        appointment.status === "completed",
    ).length;

  const cancelledCount =
    appointments.filter(
      (appointment) =>
        appointment.status === "cancelled",
    ).length;

  const noShowCount =
    appointments.filter(
      (appointment) =>
        appointment.status === "no_show",
    ).length;

  const completedRevenue =
    appointments.reduce(
      (total, appointment) => {
        if (
          appointment.status !==
          "completed"
        ) {
          return total;
        }

        const service =
          getRelation<ServiceRelation>(
            appointment.selected_service,
          );

        return (
          total +
          Number(service?.price ?? 0)
        );
      },
      0,
    );

  return (
    <>
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="card-premium p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Histórico total
            </p>

            <CalendarDays className="h-5 w-5 text-gold" />
          </div>

          <p className="mt-4 font-display text-3xl text-gold">
            {appointments.length}
          </p>
        </article>

        <article className="card-premium p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Concluídos
            </p>

            <CheckCircle2 className="h-5 w-5 text-gold" />
          </div>

          <p className="mt-4 font-display text-3xl text-gold">
            {completedCount}
          </p>
        </article>

        <article className="card-premium p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Cancelados / faltas
            </p>

            <XCircle className="h-5 w-5 text-gold" />
          </div>

          <p className="mt-4 font-display text-3xl text-gold">
            {cancelledCount +
              noShowCount}
          </p>
        </article>

        <article className="card-premium p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Valor atendido
            </p>

            <Scissors className="h-5 w-5 text-gold" />
          </div>

          <p className="mt-4 font-display text-2xl text-gold">
            {formatCurrency(
              completedRevenue,
            )}
          </p>
        </article>
      </section>

      <section className="card-premium mt-8 p-5 sm:p-6">
        <h2 className="font-display text-xl">
          Filtros
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="history-search"
              className="text-sm text-muted-foreground"
            >
              Cliente
            </label>

            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                id="history-search"
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

          <div>
            <label
              htmlFor="history-status"
              className="text-sm text-muted-foreground"
            >
              Status
            </label>

            <select
              id="history-status"
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

              <option value="completed">
                Concluídos
              </option>

              <option value="cancelled">
                Cancelados
              </option>

              <option value="no_show">
                Não compareceu
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="history-period"
              className="text-sm text-muted-foreground"
            >
              Período
            </label>

            <select
              id="history-period"
              value={periodFilter}
              onChange={(event) =>
                setPeriodFilter(
                  event.target.value,
                )
              }
              className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 outline-none focus:border-gold"
            >
              <option value="all">
                Todo período
              </option>

              <option value="7">
                Últimos 7 dias
              </option>

              <option value="30">
                Últimos 30 dias
              </option>

              <option value="month">
                Este mês
              </option>
            </select>
          </div>
        </div>
      </section>

      <section className="card-premium mt-6 overflow-hidden">
        <div className="border-b border-border p-5 sm:p-6">
          <h2 className="font-display text-2xl">
            Histórico
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {
              filteredAppointments.length
            }{" "}
            atendimento(s) encontrado(s).
          </p>
        </div>

        {filteredAppointments.length ===
        0 ? (
          <div className="px-6 py-16 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-gold" />

            <h3 className="mt-4 text-lg font-semibold">
              Nenhum atendimento encontrado
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Tente alterar os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredAppointments.map(
              (appointment) => {
                const service =
                  getRelation<ServiceRelation>(
                    appointment.selected_service,
                  );

                return (
                  <article
                    key={appointment.id}
                    className="grid gap-5 p-5 transition-colors hover:bg-secondary/20 sm:p-6 lg:grid-cols-[150px_minmax(0,1fr)_minmax(0,1fr)_auto]"
                  >
                    <div>
                      <p className="font-semibold">
                        {formatDate(
                          appointment.appointment_date,
                        )}
                      </p>

                      <p className="mt-2 flex items-center gap-2 text-sm text-gold">
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

                      {service && (
                        <>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {
                              service.duration_minutes
                            }{" "}
                            min
                          </p>

                          <p className="mt-2 text-sm text-gold">
                            {formatCurrency(
                              Number(
                                service.price,
                              ),
                            )}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex items-start lg:justify-end">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                          appointment.status,
                        )}`}
                      >
                        {statusLabel(
                          appointment.status,
                        )}
                      </span>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>
    </>
  );
}