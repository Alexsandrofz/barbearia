"use server";

import { createClient } from "@/lib/supabase/server";

export type AppointmentInput = {
  businessId: string;
  barberId: string;
  serviceId: string;
  serviceName: string;
  name: string;
  phone: string;
  appointmentDate: string;
  startTime: string;
  notes?: string;
};

type AppointmentError = {
  code: string;
  message: string;
};

type CreateAppointmentResult = {
  error: AppointmentError | null;
};

function mapAppointmentError(
  message: string,
): AppointmentError {
  if (message.includes("INVALID_SERVICE")) {
    return {
      code: "INVALID_SERVICE",
      message:
        "O serviço selecionado não está disponível.",
    };
  }

  if (message.includes("INVALID_BARBER")) {
    return {
      code: "INVALID_BARBER",
      message:
        "O profissional selecionado não está disponível.",
    };
  }

  if (message.includes("BUSINESS_CLOSED")) {
    return {
      code: "BUSINESS_CLOSED",
      message:
        "A barbearia não funciona nesta data.",
    };
  }

  if (
    message.includes(
      "OUTSIDE_BUSINESS_HOURS",
    )
  ) {
    return {
      code: "OUTSIDE_BUSINESS_HOURS",
      message:
        "O horário selecionado está fora do expediente.",
    };
  }

  if (message.includes("BREAK_CONFLICT")) {
    return {
      code: "BREAK_CONFLICT",
      message:
        "Esse horário entra no intervalo da barbearia.",
    };
  }

  if (message.includes("SLOT_CONFLICT")) {
    return {
      code: "23505",
      message:
        "Esse horário acabou de ser ocupado. Escolha outro horário.",
    };
  }

  return {
    code: "CREATE_ERROR",
    message:
      "Não foi possível realizar o agendamento. Tente novamente.",
  };
}

export async function createAppointment(
  input: AppointmentInput,
): Promise<CreateAppointmentResult> {
  const supabase =
    await createClient();

  /*
   * Normaliza os dados recebidos.
   */
  const name =
    input.name.trim();

  const phone =
    input.phone.trim();

  const notes =
    input.notes?.trim() || null;

  const serviceName =
    input.serviceName.trim();

  /*
   * Validações básicas antes
   * de chamar o banco.
   */
  if (!name) {
    return {
      error: {
        code: "INVALID_NAME",
        message:
          "Informe o nome do cliente.",
      },
    };
  }

  if (!phone) {
    return {
      error: {
        code: "INVALID_PHONE",
        message:
          "Informe o telefone do cliente.",
      },
    };
  }

  if (
    !input.businessId ||
    !input.barberId ||
    !input.serviceId ||
    !input.appointmentDate ||
    !input.startTime
  ) {
    return {
      error: {
        code: "INVALID_APPOINTMENT",
        message:
          "Dados do agendamento incompletos.",
      },
    };
  }

  /*
   * Toda a validação crítica é feita
   * dentro da função do Supabase:
   *
   * - serviço ativo
   * - barbeiro ativo
   * - horário de funcionamento
   * - intervalo
   * - conflito de agenda
   * - criação do agendamento
   *
   * Assim não precisamos liberar
   * INSERT ou SELECT público direto
   * na tabela appointments.
   */
  const {
    data,
    error,
  } = await supabase.rpc(
    "create_public_appointment",
    {
      p_business_id:
        input.businessId,

      p_barber_id:
        input.barberId,

      p_service_id:
        input.serviceId,

      p_service_name:
        serviceName,

      p_name:
        name,

      p_phone:
        phone,

      p_appointment_date:
        input.appointmentDate,

      p_start_time:
        input.startTime,

      p_notes:
        notes,
    },
  );

  if (error) {
    console.error(
      "Erro ao criar agendamento:",
      error,
    );

    return {
      error:
        mapAppointmentError(
          error.message ?? "",
        ),
    };
  }

  /*
   * A função RPC retorna o UUID
   * do agendamento criado.
   *
   * Por enquanto não precisamos
   * utilizar esse ID no formulário.
   */
  if (!data) {
    return {
      error: {
        code: "CREATE_ERROR",
        message:
          "Não foi possível confirmar o agendamento.",
      },
    };
  }

  return {
    error: null,
  };
}
