import {
  Check,
  Gift,
  Sparkles,
} from "lucide-react";

import type { LoyaltySettings } from "@/lib/loyalty";

type Props = {
  completedCount: number;
  settings: LoyaltySettings | null;
};

export default function LoyaltyCard({
  completedCount,
  settings,
}: Props) {
  if (!settings || !settings.enabled) {
    return (
      <section className="card-premium p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-border text-muted-foreground">
            <Gift className="h-5 w-5" />
          </span>

          <div>
            <h2 className="font-display text-2xl">
              Cartão fidelidade
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              O programa de fidelidade está desativado.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const target = Math.max(settings.target_visits, 1);

  const currentCycleVisits =
    completedCount % target;

  const earnedRewards =
    Math.floor(completedCount / target);

  const hasAvailableReward =
    completedCount > 0 &&
    completedCount % target === 0;

  const displayedVisits =
    hasAvailableReward
      ? target
      : currentCycleVisits;

  const remaining =
    hasAvailableReward
      ? 0
      : target - currentCycleVisits;

  const progress =
    Math.min(
      (displayedVisits / target) * 100,
      100,
    );

  return (
    <section className="card-premium overflow-hidden">
      <div className="border-b border-border bg-gold/5 p-6 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
              <Gift className="h-6 w-6" />
            </span>

            <div>
              <p className="eyebrow">
                Programa de fidelidade
              </p>

              <h2 className="mt-2 font-display text-2xl">
                Cartão fidelidade
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Recompensa:{" "}
                <span className="font-semibold text-foreground">
                  {settings.reward_name}
                </span>
              </p>
            </div>
          </div>

          {hasAvailableReward ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300">
              <Sparkles className="h-4 w-4" />
              Recompensa disponível
            </span>
          ) : (
            <span className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold">
              {displayedVisits} de {target}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns:
              target <= 5
                ? `repeat(${target}, minmax(0, 1fr))`
                : "repeat(5, minmax(0, 1fr))",
          }}
        >
          {Array.from({ length: target }).map(
            (_, index) => {
              const filled =
                index < displayedVisits;

              return (
                <div
                  key={index}
                  className={`grid aspect-square min-h-12 place-items-center rounded-xl border transition-colors ${
                    filled
                      ? "border-gold/50 bg-gold/15 text-gold"
                      : "border-border bg-secondary/30 text-muted-foreground"
                  }`}
                >
                  {filled ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-xs font-semibold">
                      {index + 1}
                    </span>
                  )}
                </div>
              );
            },
          )}
        </div>

        <div className="mt-6">
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="mt-3 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
            {hasAvailableReward ? (
              <p className="font-semibold text-green-300">
                Meta atingida. O cliente já pode receber a recompensa.
              </p>
            ) : (
              <p className="text-muted-foreground">
                Faltam{" "}
                <span className="font-semibold text-foreground">
                  {remaining}
                </span>{" "}
                atendimento(s) para a próxima recompensa.
              </p>
            )}

            {earnedRewards > 0 && (
              <p className="text-xs text-muted-foreground">
                Metas alcançadas: {earnedRewards}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}