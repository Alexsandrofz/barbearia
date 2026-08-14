"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  CircleDollarSign,
  Scissors,
  Search,
  Star,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";

import type { CustomerSummary } from "@/lib/customers-types";

type Props = {
  customers: CustomerSummary[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Nenhuma";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00Z`));
}

function formatTime(value: string | null) {
  return value?.slice(0, 5) ?? "";
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export default function CustomersManager({
  customers,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    if (!normalizedSearch) {
      return customers;
    }

    const phoneSearch = normalizedSearch.replace(/\D/g, "");

    return customers.filter((customer) => {
      const normalizedName = normalizeSearch(customer.name);
      const normalizedPhone = customer.phone.replace(/\D/g, "");

      return (
        normalizedName.includes(normalizedSearch) ||
        (phoneSearch.length > 0 &&
          normalizedPhone.includes(phoneSearch))
      );
    });
  }, [customers, search]);

  const totals = useMemo(() => {
    const completedAppointments = customers.reduce(
      (total, customer) =>
        total + customer.completedAppointments,
      0,
    );

    const totalRevenue = customers.reduce(
      (total, customer) => total + customer.totalSpent,
      0,
    );

    const recurringCustomers = customers.filter(
      (customer) => customer.completedAppointments >= 2,
    ).length;

    return {
      completedAppointments,
      totalRevenue,
      recurringCustomers,
    };
  }, [customers]);

  return (
    <div className="mt-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="card-premium p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Total de clientes
            </p>

            <UsersRound className="h-5 w-5 text-gold" />
          </div>

          <p className="mt-4 font-display text-3xl text-gold">
            {customers.length}
          </p>
        </article>

        <article className="card-premium p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Clientes recorrentes
            </p>

            <Star className="h-5 w-5 text-gold" />
          </div>

          <p className="mt-4 font-display text-3xl text-gold">
            {totals.recurringCustomers}
          </p>
        </article>

        <article className="card-premium p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Atendimentos concluídos
            </p>

            <Scissors className="h-5 w-5 text-gold" />
          </div>

          <p className="mt-4 font-display text-3xl text-gold">
            {totals.completedAppointments}
          </p>
        </article>

        <article className="card-premium p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Receita dos clientes
            </p>

            <CircleDollarSign className="h-5 w-5 text-gold" />
          </div>

          <p className="mt-4 font-display text-2xl text-gold">
            {formatCurrency(totals.totalRevenue)}
          </p>
        </article>
      </section>

      <section className="mt-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-2xl">
              Clientes cadastrados
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Os clientes são criados automaticamente quando
              realizam um agendamento.
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Pesquisar nome ou telefone"
              className="h-12 w-full rounded-xl border border-input bg-background pl-12 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-gold"
            />
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="card-premium mt-6 flex flex-col items-center justify-center px-6 py-16 text-center">
            <UsersRound className="h-11 w-11 text-gold" />

            <h3 className="mt-4 text-lg font-semibold">
              Nenhum cliente cadastrado
            </h3>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Quando alguém realizar um agendamento, o cliente
              aparecerá automaticamente nesta área.
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="card-premium mt-6 px-6 py-12 text-center">
            <Search className="mx-auto h-9 w-9 text-gold" />

            <h3 className="mt-4 text-lg font-semibold">
              Nenhum cliente encontrado
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Tente pesquisar por outro nome ou telefone.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
            {filteredCustomers.map((customer) => (
              <Link
                key={customer.id}
                href={`/dashboard/clientes/${customer.id}`}
                className="card-premium block p-5 transition-all hover:-translate-y-0.5 hover:border-gold/40 sm:p-6"

              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                      <UserRound className="h-6 w-6" />
                    </span>

                    <div className="min-w-0">
                      <h3 className="truncate text-xl font-semibold">
                        {customer.name}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {customer.phone}
                      </p>

                      {customer.email && (
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {customer.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                      customer.active
                        ? "border-green-500/30 bg-green-500/10 text-green-300"
                        : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"
                    }`}
                  >
                    {customer.active ? "Ativo" : "Inativo"}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-border bg-secondary/25 p-3">
                    <p className="text-xs text-muted-foreground">
                      Visitas
                    </p>

                    <p className="mt-2 font-display text-xl text-gold">
                      {customer.completedAppointments}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/25 p-3">
                    <p className="text-xs text-muted-foreground">
                      Total gasto
                    </p>

                    <p className="mt-2 text-sm font-semibold text-gold">
                      {formatCurrency(customer.totalSpent)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/25 p-3">
                    <p className="text-xs text-muted-foreground">
                      Ticket médio
                    </p>

                    <p className="mt-2 text-sm font-semibold">
                      {formatCurrency(customer.averageTicket)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/25 p-3">
                    <p className="text-xs text-muted-foreground">
                      Agendados
                    </p>

                    <p className="mt-2 font-display text-xl">
                      {customer.pendingAppointments}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gold" />

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Última visita
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {formatDate(customer.lastVisit)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Próximo agendamento
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {customer.nextAppointment
                          ? `${formatDate(
                              customer.nextAppointment,
                            )}${
                              customer.nextAppointmentTime
                                ? ` às ${formatTime(
                                    customer.nextAppointmentTime,
                                  )}`
                                : ""
                            }`
                          : "Nenhum"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Scissors className="mt-0.5 h-4 w-4 shrink-0 text-gold" />

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Serviço favorito
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {customer.favoriteService ??
                          "Ainda não definido"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <WalletCards className="mt-0.5 h-4 w-4 shrink-0 text-gold" />

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Barbeiro favorito
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {customer.favoriteBarber ??
                          "Ainda não definido"}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}