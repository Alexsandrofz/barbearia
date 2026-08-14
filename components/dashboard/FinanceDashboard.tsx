import {
  BadgeDollarSign,
  CalendarDays,
  CircleDollarSign,
  Scissors,
  Trophy,
  UserRound,
  WalletCards,
} from "lucide-react";

import type {
  FinanceSummary,
} from "@/lib/finance-types";

type Props = {
  summary: FinanceSummary;
};

function formatCurrency(
  value: number,
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  ).format(value);
}

export default function FinanceDashboard({
  summary,
}: Props) {
  const cards = [
    {
      label:
        "Faturamento hoje",
      value:
        formatCurrency(
          summary.todayRevenue,
        ),
      icon:
        CircleDollarSign,
    },
    {
      label:
        "Faturamento na semana",
      value:
        formatCurrency(
          summary.weekRevenue,
        ),
      icon:
        CalendarDays,
    },
    {
      label:
        "Faturamento no mês",
      value:
        formatCurrency(
          summary.monthRevenue,
        ),
      icon:
        WalletCards,
    },
    {
      label:
        "Ticket médio do mês",
      value:
        formatCurrency(
          summary.monthAverageTicket,
        ),
      icon:
        BadgeDollarSign,
    },
  ];

  return (
    <div className="mt-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(
          ({
            label,
            value,
            icon: Icon,
          }) => (
            <article
              key={label}
              className="card-premium p-5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  {label}
                </p>

                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/30 text-gold">
                  <Icon className="h-5 w-5" />
                </span>
              </div>

              <p className="mt-4 font-display text-2xl text-gold sm:text-3xl">
                {value}
              </p>
            </article>
          ),
        )}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <article className="card-premium p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
              <Scissors className="h-5 w-5" />
            </span>

            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Atendimentos
              </p>

              <h2 className="mt-1 font-display text-xl">
                Concluídos no mês
              </h2>
            </div>
          </div>

          <p className="mt-6 font-display text-4xl text-gold">
            {
              summary.monthCompletedAppointments
            }
          </p>
        </article>

        <article className="card-premium p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
              <Trophy className="h-5 w-5" />
            </span>

            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Destaque
              </p>

              <h2 className="mt-1 font-display text-xl">
                Serviço que mais faturou
              </h2>
            </div>
          </div>

          {summary.topService ? (
            <>
              <p className="mt-6 text-lg font-semibold">
                {
                  summary.topService
                    .name
                }
              </p>

              <p className="mt-2 font-display text-2xl text-gold">
                {formatCurrency(
                  summary.topService
                    .total,
                )}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {
                  summary.topService
                    .quantity
                }{" "}
                atendimento(s)
              </p>
            </>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Ainda não há dados suficientes.
            </p>
          )}
        </article>

        <article className="card-premium p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
              <UserRound className="h-5 w-5" />
            </span>

            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Destaque
              </p>

              <h2 className="mt-1 font-display text-xl">
                Barbeiro que mais faturou
              </h2>
            </div>
          </div>

          {summary.topBarber ? (
            <>
              <p className="mt-6 text-lg font-semibold">
                {
                  summary.topBarber
                    .name
                }
              </p>

              <p className="mt-2 font-display text-2xl text-gold">
                {formatCurrency(
                  summary.topBarber
                    .total,
                )}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {
                  summary.topBarber
                    .quantity
                }{" "}
                atendimento(s)
              </p>
            </>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Ainda não há dados suficientes.
            </p>
          )}
        </article>
      </section>
    </div>
  );
}