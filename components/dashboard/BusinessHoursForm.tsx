"use client";

import { useMemo, useState, useTransition } from "react";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Save,
  Store,
} from "lucide-react";
import { useRouter } from "next/navigation";

import type {
  BusinessHour,
  BusinessHourInput,
} from "@/lib/business-hours-types";

import { updateBusinessHours } from "@/lib/business-hours-actions";

type Props = {
  business: {
    id: string;
    name: string;
  };
  hours: BusinessHour[];
};

const weekdays = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const intervalOptions = [15, 20, 30, 45, 60];

function normalizeTime(time: string | null) {
  return time?.slice(0, 5) ?? "";
}

function createInitialHours(hours: BusinessHour[]): BusinessHourInput[] {
  return Array.from({ length: 7 }, (_, weekday) => {
    const existing = hours.find((hour) => hour.weekday === weekday);

    return {
      weekday,
      is_open: existing?.is_open ?? false,
      open_time: normalizeTime(existing?.open_time ?? null),
      close_time: normalizeTime(existing?.close_time ?? null),
      break_start: normalizeTime(existing?.break_start ?? null),
      break_end: normalizeTime(existing?.break_end ?? null),
      slot_interval_minutes: existing?.slot_interval_minutes ?? 30,
    };
  });
}

const inputClass =
  "mt-2 h-12 w-full rounded-lg border border-input bg-background px-3 text-foreground outline-none transition-colors focus:border-gold disabled:cursor-not-allowed disabled:opacity-50";

export default function BusinessHoursForm({
  business,
  hours,
}: Props) {
  const router = useRouter();

  const initialHours = useMemo(
    () => createInitialHours(hours),
    [hours],
  );

  const [schedule, setSchedule] =
    useState<BusinessHourInput[]>(initialHours);

  const [message, setMessage] = useState<null | {
    success: boolean;
    text: string;
  }>(null);

  const [isSaving, startSavingTransition] = useTransition();

  function updateDay(
    weekday: number,
    changes: Partial<BusinessHourInput>,
  ) {
    setMessage(null);

    setSchedule((current) =>
      current.map((day) =>
        day.weekday === weekday
          ? {
              ...day,
              ...changes,
            }
          : day,
      ),
    );
  }

  function toggleDay(weekday: number, isOpen: boolean) {
    const day = schedule.find((item) => item.weekday === weekday);

    updateDay(weekday, {
      is_open: isOpen,
      open_time: isOpen
        ? day?.open_time || "09:00"
        : day?.open_time || "",
      close_time: isOpen
        ? day?.close_time || "18:00"
        : day?.close_time || "",
    });
  }

  function handleSave() {
    setMessage(null);

    startSavingTransition(async () => {
      const result = await updateBusinessHours(
        business.id,
        schedule,
      );

      setMessage({
        success: result.success,
        text: result.message,
      });

      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div className="mt-10">
      <div className="mb-6 flex items-start gap-4 rounded-2xl border border-gold/20 bg-gold/5 p-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold/30 text-gold">
          <Store className="h-5 w-5" />
        </span>

        <div>
          <h2 className="font-semibold">{business.name}</h2>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Estes horários serão usados para definir quando os clientes
            poderão solicitar agendamentos.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {schedule.map((day) => {
          const fieldsDisabled = !day.is_open || isSaving;

          return (
            <article
              key={day.weekday}
              className={`card-premium p-5 sm:p-6 ${
                !day.is_open ? "opacity-75" : ""
              }`}
            >
              <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-display text-xl">
                    {weekdays[day.weekday]}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {day.is_open
                      ? "A barbearia aceita agendamentos neste dia."
                      : "A barbearia permanece fechada neste dia."}
                  </p>
                </div>

                <label className="inline-flex cursor-pointer items-center gap-3">
                  <span
                    className={`text-sm font-semibold ${
                      day.is_open
                        ? "text-green-300"
                        : "text-muted-foreground"
                    }`}
                  >
                    {day.is_open ? "Aberto" : "Fechado"}
                  </span>

                  <input
                    type="checkbox"
                    checked={day.is_open}
                    disabled={isSaving}
                    onChange={(event) =>
                      toggleDay(
                        day.weekday,
                        event.target.checked,
                      )
                    }
                    className="peer sr-only"
                  />

                  <span className="relative h-7 w-12 rounded-full border border-border bg-secondary transition-colors peer-checked:border-gold/50 peer-checked:bg-gold/25 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                    <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-muted-foreground transition-transform peer-checked:translate-x-5 peer-checked:bg-gold" />
                  </span>
                </label>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <div>
                  <label
                    htmlFor={`open-${day.weekday}`}
                    className="text-sm text-muted-foreground"
                  >
                    Abertura
                  </label>

                  <input
                    id={`open-${day.weekday}`}
                    type="time"
                    value={day.open_time ?? ""}
                    disabled={fieldsDisabled}
                    onChange={(event) =>
                      updateDay(day.weekday, {
                        open_time: event.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor={`close-${day.weekday}`}
                    className="text-sm text-muted-foreground"
                  >
                    Fechamento
                  </label>

                  <input
                    id={`close-${day.weekday}`}
                    type="time"
                    value={day.close_time ?? ""}
                    disabled={fieldsDisabled}
                    onChange={(event) =>
                      updateDay(day.weekday, {
                        close_time: event.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor={`break-start-${day.weekday}`}
                    className="text-sm text-muted-foreground"
                  >
                    Início do intervalo
                  </label>

                  <input
                    id={`break-start-${day.weekday}`}
                    type="time"
                    value={day.break_start ?? ""}
                    disabled={fieldsDisabled}
                    onChange={(event) =>
                      updateDay(day.weekday, {
                        break_start: event.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor={`break-end-${day.weekday}`}
                    className="text-sm text-muted-foreground"
                  >
                    Fim do intervalo
                  </label>

                  <input
                    id={`break-end-${day.weekday}`}
                    type="time"
                    value={day.break_end ?? ""}
                    disabled={fieldsDisabled}
                    onChange={(event) =>
                      updateDay(day.weekday, {
                        break_end: event.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor={`interval-${day.weekday}`}
                    className="text-sm text-muted-foreground"
                  >
                    Intervalo da agenda
                  </label>

                  <select
                    id={`interval-${day.weekday}`}
                    value={day.slot_interval_minutes}
                    disabled={fieldsDisabled}
                    onChange={(event) =>
                      updateDay(day.weekday, {
                        slot_interval_minutes: Number(
                          event.target.value,
                        ),
                      })
                    }
                    className={inputClass}
                  >
                    {intervalOptions.map((interval) => (
                      <option key={interval} value={interval}>
                        {interval} minutos
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {day.is_open && (
                <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock3 className="h-4 w-4 text-gold" />

                  {day.open_time && day.close_time ? (
                    <span>
                      Funcionamento de {day.open_time} até{" "}
                      {day.close_time}.
                    </span>
                  ) : (
                    <span>
                      Informe a abertura e o fechamento.
                    </span>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="sticky bottom-4 z-20 mt-8 rounded-2xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur sm:flex sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          {message ? (
            <p
              role="status"
              className={`inline-flex items-center gap-2 text-sm ${
                message.success
                  ? "text-green-300"
                  : "text-destructive"
              }`}
            >
              {message.success && (
                <CheckCircle2 className="h-4 w-4" />
              )}

              {message.text}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Revise os horários antes de salvar.
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSaving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}

          {isSaving
            ? "Salvando..."
            : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}