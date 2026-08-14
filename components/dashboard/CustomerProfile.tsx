import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Scissors,
  UserRound,
  WalletCards,
} from "lucide-react";

import LoyaltyCard from "@/components/dashboard/LoyaltyCard";

import type {
  CustomerHistoryItem,
  CustomerProfileData,
} from "@/lib/customer-profile";

import type { LoyaltySettings } from "@/lib/loyalty";

type Metrics = {
  completedCount: number;
  totalSpent: number;
  averageTicket: number;
  favoriteService: string | null;
  favoriteBarber: string | null;
};

type Props = {
  customer: CustomerProfileData;
  metrics: Metrics;
  loyaltySettings: LoyaltySettings | null;
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Data não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(
    new Date(`${value}T12:00:00Z`),
  );
}

function formatTime(value: string | null) {
  return value?.slice(0, 5) ?? "--:--";
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

function sortHistory(
  appointments: CustomerHistoryItem[],
) {
  return [...appointments].sort(
    (first, second) => {
      const firstValue =
        `${first.appointment_date ?? ""}T${first.start_time ?? "00:00"}`;

      const secondValue =
        `${second.appointment_date ?? ""}T${second.start_time ?? "00:00"}`;

      return secondValue.localeCompare(
        firstValue,
      );
    },
  );
}

export default function CustomerProfile({
  customer,
  metrics,
  loyaltySettings,
}: Props) {
  const history = sortHistory(
    customer.appointments,
  );

  return (
    <div>
      <Link
        href="/dashboard/clientes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para clientes
      </Link>

      <section className="card-premium mt-6 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold">
              <UserRound className="h-7 w-7" />
            </span>

            <div className="min-w-0">
              <p className="eyebrow">
                Perfil do cliente
              </p>

              <h1 className="mt-2 truncate font-display text-3xl sm:text-4xl">
                {customer.name}
              </h1>

              <p className="mt-2 text-muted-foreground">
                {customer.phone}
              </p>

              {customer.email && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {customer.email}
                </p>
              )}
            </div>
          </div>

          <span
            className={`w-fit rounded-full border px-4 py-2 text-xs font-semibold ${
              customer.active
                ? "border-green-500/30 bg-green-500/10 text-green-300"
                : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"
            }`}
          >
            {customer.active
              ? "Cliente ativo"
              : "Cliente inativo"}
          </span>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <article className="rounded-xl border border-border bg-secondary/25 p-4">
            <p className="text-xs text-muted-foreground">
              Visitas concluídas
            </p>

            <p className="mt-2 font-display text-2xl text-gold">
              {metrics.completedCount}
            </p>
          </article>

          <article className="rounded-xl border border-border bg-secondary/25 p-4">
            <p className="text-xs text-muted-foreground">
              Total gasto
            </p>

            <p className="mt-2 text-lg font-semibold text-gold">
              {formatCurrency(
                metrics.totalSpent,
              )}
            </p>
          </article>

          <article className="rounded-xl border border-border bg-secondary/25 p-4">
            <p className="text-xs text-muted-foreground">
              Ticket médio
            </p>

            <p className="mt-2 text-lg font-semibold">
              {formatCurrency(
                metrics.averageTicket,
              )}
            </p>
          </article>

          <article className="rounded-xl border border-border bg-secondary/25 p-4">
            <p className="text-xs text-muted-foreground">
              Cliente desde
            </p>

            <p className="mt-2 text-sm font-semibold">
              {new Intl.DateTimeFormat(
                "pt-BR",
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                },
              ).format(
                new Date(
                  customer.created_at,
                ),
              )}
            </p>
          </article>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Scissors className="mt-0.5 h-5 w-5 text-gold" />

            <div>
              <p className="text-xs text-muted-foreground">
                Serviço favorito
              </p>

              <p className="mt-1 font-semibold">
                {metrics.favoriteService ??
                  "Ainda não definido"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <WalletCards className="mt-0.5 h-5 w-5 text-gold" />

            <div>
              <p className="text-xs text-muted-foreground">
                Barbeiro favorito
              </p>

              <p className="mt-1 font-semibold">
                {metrics.favoriteBarber ??
                  "Ainda não definido"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <LoyaltyCard
          completedCount={
            metrics.completedCount
          }
          settings={loyaltySettings}
        />
      </div>

      <section className="card-premium mt-6 overflow-hidden">
        <div className="border-b border-border p-6 sm:p-7">
          <p className="eyebrow">
            Histórico
          </p>

          <h2 className="mt-2 font-display text-2xl">
            Atendimentos
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {history.length === 0
              ? "Nenhum atendimento registrado."
              : `${history.length} registro(s) encontrado(s).`}
          </p>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <CalendarDays className="h-10 w-10 text-gold" />

            <p className="mt-4 text-sm text-muted-foreground">
              O histórico aparecerá após o primeiro agendamento.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {history.map(
              (appointment) => {
                const service =
                  getRelation(
                    appointment.selected_service,
                  );

                const barber =
                  getRelation(
                    appointment.barber,
                  );

                const price =
                  Number(
                    service?.price ?? 0,
                  );

                return (
                  <article
                    key={appointment.id}
                    className="grid gap-5 p-5 transition-colors hover:bg-secondary/25 sm:p-6 lg:grid-cols-[130px_minmax(0,1fr)_minmax(0,1fr)_auto]"
                  >
                    <div>
                      <p className="flex items-center gap-2 font-semibold">
                        <CalendarDays className="h-4 w-4 text-gold" />
                        {formatDate(
                          appointment.appointment_date,
                        )}
                      </p>

                      <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock3 className="h-4 w-4" />
                        {formatTime(
                          appointment.start_time,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold">
                        {service?.name ??
                          appointment.service}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Profissional:{" "}
                        {barber?.name ??
                          "Não informado"}
                      </p>

                      {appointment.notes && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Observação:{" "}
                          {appointment.notes}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Valor
                      </p>

                      <p className="mt-1 font-display text-lg text-gold">
                        {formatCurrency(
                          price,
                        )}
                      </p>
                    </div>

                    <div className="lg:text-right">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
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
    </div>
  );
}