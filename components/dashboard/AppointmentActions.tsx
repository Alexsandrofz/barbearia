"use client";

import { useState, useTransition } from "react";
import {
  Ban,
  Check,
  CheckCheck,
  Loader2,
  UserX,
} from "lucide-react";

import {
  type AppointmentStatus,
  updateAppointmentStatus,
} from "@/lib/dashboard";

type Props = {
  appointmentId: string;
  currentStatus: AppointmentStatus;
};

type ActionButtonProps = {
  label: string;
  status: AppointmentStatus;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
};

export default function AppointmentActions({
  appointmentId,
  currentStatus,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");

  function handleUpdate(status: AppointmentStatus) {
    setErrorMessage("");

    startTransition(async () => {
      try {
        await updateAppointmentStatus(appointmentId, status);
      } catch (error) {
        console.error(error);
        setErrorMessage("Não foi possível atualizar o agendamento.");
      }
    });
  }

  const actions: ActionButtonProps[] = [];

  if (currentStatus === "pending") {
    actions.push(
      {
        label: "Confirmar",
        status: "confirmed",
        icon: Check,
        className:
          "border-blue-500/40 text-blue-300 hover:bg-blue-500/10",
      },
      {
        label: "Cancelar",
        status: "cancelled",
        icon: Ban,
        className:
          "border-red-500/40 text-red-300 hover:bg-red-500/10",
      },
    );
  }

  if (currentStatus === "confirmed") {
    actions.push(
      {
        label: "Concluir",
        status: "completed",
        icon: CheckCheck,
        className:
          "border-green-500/40 text-green-300 hover:bg-green-500/10",
      },
      {
        label: "Não compareceu",
        status: "no_show",
        icon: UserX,
        className:
          "border-zinc-500/40 text-zinc-300 hover:bg-zinc-500/10",
      },
      {
        label: "Cancelar",
        status: "cancelled",
        icon: Ban,
        className:
          "border-red-500/40 text-red-300 hover:bg-red-500/10",
      },
    );
  }

  if (
    currentStatus === "completed" ||
    currentStatus === "cancelled" ||
    currentStatus === "no_show"
  ) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {actions.map(({ label, status, icon: Icon, className }) => (
          <button
            key={status}
            type="button"
            disabled={isPending}
            onClick={() => handleUpdate(status)}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Icon className="h-4 w-4" />
            )}

            {label}
          </button>
        ))}
      </div>

      {errorMessage && (
        <p className="mt-2 text-xs text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}