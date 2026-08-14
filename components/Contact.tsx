"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Loader2,
  MapPin,
  Phone,
} from "lucide-react";

import SectionHeading from "./SectionHeading";

import { createAppointment } from "@/lib/appointments";
import { getAvailableTimes } from "@/lib/availability";

import type {
  Barber,
  Business,
  Service,
} from "@/lib/data";

type Props = {
  business: Business;
  barbers: Barber[];
  services: Service[];
};

const inputClass =
  "mt-2 h-12 w-full rounded-lg border border-input bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-gold disabled:cursor-not-allowed disabled:opacity-60";

function getBrazilToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function Contact({
  business,
  barbers,
  services,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [loadingTimes, setLoadingTimes] =
    useState(false);

  const [
    selectedBarberId,
    setSelectedBarberId,
  ] = useState("");

  const [
    selectedServiceId,
    setSelectedServiceId,
  ] = useState("");

  const [
    selectedDate,
    setSelectedDate,
  ] = useState("");

  const [
    selectedTime,
    setSelectedTime,
  ] = useState("");

  const [
    availableTimes,
    setAvailableTimes,
  ] = useState<string[]>([]);

  const [
    availabilityMessage,
    setAvailabilityMessage,
  ] = useState("");

  const [status, setStatus] =
    useState<null | {
      ok: boolean;
      msg: string;
    }>(null);

  const today = getBrazilToday();

  const selectedService =
    services.find(
      (service) =>
        service.id === selectedServiceId,
    ) ?? null;

  /*
   * Carrega os horários sempre que:
   *
   * - barbeiro muda;
   * - serviço muda;
   * - data muda.
   *
   * A duração do serviço é usada para
   * verificar se ele cabe antes do próximo
   * atendimento, intervalo ou fechamento.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadAvailableTimes() {
      if (
        !selectedBarberId ||
        !selectedService ||
        !selectedDate
      ) {
        setAvailableTimes([]);
        setSelectedTime("");
        setAvailabilityMessage("");
        return;
      }

      setLoadingTimes(true);
      setSelectedTime("");
      setStatus(null);
      setAvailabilityMessage("");

      const result =
        await getAvailableTimes(
          business.id,
          selectedBarberId,
          selectedDate,
          selectedService.duration_minutes,
        );

      if (cancelled) {
        return;
      }

      setAvailableTimes(
        result.availableTimes,
      );

      setAvailabilityMessage(
        result.message ?? "",
      );

      setLoadingTimes(false);
    }

    loadAvailableTimes();

    return () => {
      cancelled = true;
    };
  }, [
    business.id,
    selectedBarberId,
    selectedService,
    selectedDate,
  ]);

  async function refreshAvailableTimes() {
    if (
      !selectedBarberId ||
      !selectedService ||
      !selectedDate
    ) {
      return;
    }

    setLoadingTimes(true);

    const result =
      await getAvailableTimes(
        business.id,
        selectedBarberId,
        selectedDate,
        selectedService.duration_minutes,
      );

    setAvailableTimes(
      result.availableTimes,
    );

    setAvailabilityMessage(
      result.message ?? "",
    );

    setLoadingTimes(false);
  }

  async function onSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(
      formData.get("name") ?? "",
    ).trim();

    const phone = String(
      formData.get("phone") ?? "",
    ).trim();

    const notes = String(
      formData.get("notes") ?? "",
    ).trim();

    if (!name) {
      setStatus({
        ok: false,
        msg: "Informe seu nome.",
      });

      return;
    }

    if (!phone) {
      setStatus({
        ok: false,
        msg: "Informe seu WhatsApp.",
      });

      return;
    }

    if (!selectedBarberId) {
      setStatus({
        ok: false,
        msg: "Selecione um barbeiro.",
      });

      return;
    }

    if (!selectedService) {
      setStatus({
        ok: false,
        msg: "Selecione um serviço válido.",
      });

      return;
    }

    if (!selectedDate) {
      setStatus({
        ok: false,
        msg: "Selecione uma data.",
      });

      return;
    }

    if (!selectedTime) {
      setStatus({
        ok: false,
        msg: "Selecione um horário disponível.",
      });

      return;
    }

    /*
     * Segurança adicional no frontend:
     * só envia um horário que continua
     * presente na disponibilidade atual.
     */
    if (
      !availableTimes.includes(
        selectedTime,
      )
    ) {
      setSelectedTime("");

      setStatus({
        ok: false,
        msg: "Esse horário não está mais disponível. Escolha outro.",
      });

      await refreshAvailableTimes();

      return;
    }

    setLoading(true);
    setStatus(null);

    const { error } =
      await createAppointment({
        businessId: business.id,
        barberId: selectedBarberId,

        serviceId:
          selectedService.id,

        serviceName:
          selectedService.name,

        name,
        phone,

        appointmentDate:
          selectedDate,

        startTime:
          selectedTime,

        notes,
      });

    setLoading(false);

    if (error) {
      console.error(
        "Erro ao criar agendamento:",
        error,
      );

      /*
       * Conflito de horário.
       *
       * Recarregamos toda a disponibilidade
       * em vez de apenas remover manualmente
       * o horário selecionado, porque um
       * atendimento mais longo pode bloquear
       * mais de um slot.
       */
      if (error.code === "23505") {
        setSelectedTime("");

        await refreshAvailableTimes();

        setStatus({
          ok: false,
          msg: "Esse horário acabou de ser ocupado. Escolha outro horário.",
        });

        return;
      }

      setStatus({
        ok: false,
        msg: "Não foi possível realizar o agendamento. Tente novamente.",
      });

      return;
    }

    setStatus({
      ok: true,
      msg: "Agendamento solicitado! A barbearia fará a confirmação.",
    });

    form.reset();

    setSelectedBarberId("");
    setSelectedServiceId("");
    setSelectedDate("");
    setSelectedTime("");
    setAvailableTimes([]);
    setAvailabilityMessage("");
  }

  const canChooseTime =
    Boolean(selectedBarberId) &&
    Boolean(selectedServiceId) &&
    Boolean(selectedDate);

  return (
    <section
      id="contato"
      className="scroll-mt-20 py-20 sm:py-24 lg:py-32"
    >
      <div className="section-shell">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Agendamento"
              title="Reserve sua cadeira"
              description="Escolha o profissional, serviço, data e horário desejados."
            />

            <ul className="mt-8 space-y-6">
              <li className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/40 text-gold">
                  <MapPin className="h-5 w-5" />
                </span>

                <div>
                  <p className="font-semibold">
                    Endereço
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {business.address ||
                      "Endereço não informado"}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/40 text-gold">
                  <Phone className="h-5 w-5" />
                </span>

                <div>
                  <p className="font-semibold">
                    Contato
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {business.phone ||
                      "Telefone não informado"}
                  </p>

                  {business.email && (
                    <p className="text-sm text-muted-foreground">
                      {business.email}
                    </p>
                  )}
                </div>
              </li>

              <li className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/40 text-gold">
                  <Clock className="h-5 w-5" />
                </span>

                <div>
                  <p className="font-semibold">
                    Atendimento
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Os horários são calculados
                    automaticamente de acordo
                    com o profissional e o
                    serviço escolhido.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <form
            className="card-premium space-y-5 p-6 sm:p-8"
            onSubmit={onSubmit}
          >
            {/* NOME */}
            <div>
              <label
                htmlFor="name"
                className="text-sm text-muted-foreground"
              >
                Nome
              </label>

              <input
                id="name"
                name="name"
                required
                disabled={loading}
                placeholder="Seu nome completo"
                className={inputClass}
              />
            </div>

            {/* WHATSAPP */}
            <div>
              <label
                htmlFor="phone"
                className="text-sm text-muted-foreground"
              >
                WhatsApp
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                required
                disabled={loading}
                placeholder="(79) 99999-9999"
                className={inputClass}
              />
            </div>

            {/* BARBEIRO */}
            <div>
              <label
                htmlFor="barberId"
                className="text-sm text-muted-foreground"
              >
                Barbeiro
              </label>

              <select
                id="barberId"
                name="barberId"
                required
                value={selectedBarberId}
                disabled={loading}
                onChange={(event) => {
                  setSelectedBarberId(
                    event.target.value,
                  );

                  setSelectedTime("");
                  setAvailableTimes([]);
                  setAvailabilityMessage("");
                }}
                className={inputClass}
              >
                <option value="" disabled>
                  Selecione um barbeiro
                </option>

                {barbers.map(
                  (barber) => (
                    <option
                      key={barber.id}
                      value={barber.id}
                    >
                      {barber.name}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* SERVIÇO */}
            <div>
              <label
                htmlFor="serviceId"
                className="text-sm text-muted-foreground"
              >
                Serviço
              </label>

              <select
                id="serviceId"
                name="serviceId"
                required
                value={selectedServiceId}
                disabled={loading}
                onChange={(event) => {
                  setSelectedServiceId(
                    event.target.value,
                  );

                  setSelectedTime("");
                  setAvailableTimes([]);
                  setAvailabilityMessage("");
                }}
                className={inputClass}
              >
                <option value="" disabled>
                  Selecione um serviço
                </option>

                {services.map(
                  (service) => (
                    <option
                      key={service.id}
                      value={service.id}
                    >
                      {service.name} —{" "}
                      {
                        service.duration_minutes
                      }{" "}
                      min
                    </option>
                  ),
                )}
              </select>

              {selectedService && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Duração estimada:{" "}
                  <span className="font-semibold text-foreground">
                    {
                      selectedService.duration_minutes
                    }{" "}
                    minutos
                  </span>
                </p>
              )}
            </div>

            {/* DATA + HORÁRIO */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="appointmentDate"
                  className="text-sm text-muted-foreground"
                >
                  Data
                </label>

                <input
                  id="appointmentDate"
                  name="appointmentDate"
                  type="date"
                  required
                  min={today}
                  value={selectedDate}
                  disabled={loading}
                  onChange={(event) => {
                    setSelectedDate(
                      event.target.value,
                    );

                    setSelectedTime("");
                    setAvailableTimes([]);
                    setAvailabilityMessage("");
                  }}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="startTime"
                  className="text-sm text-muted-foreground"
                >
                  Horário
                </label>

                <select
                  id="startTime"
                  name="startTime"
                  required
                  value={selectedTime}
                  onChange={(event) =>
                    setSelectedTime(
                      event.target.value,
                    )
                  }
                  disabled={
                    loading ||
                    !canChooseTime ||
                    loadingTimes ||
                    availableTimes.length ===
                      0
                  }
                  className={inputClass}
                >
                  <option
                    value=""
                    disabled
                  >
                    {loadingTimes
                      ? "Carregando..."
                      : !selectedBarberId
                        ? "Escolha o barbeiro"
                        : !selectedServiceId
                          ? "Escolha o serviço"
                          : !selectedDate
                            ? "Escolha a data"
                            : availableTimes.length ===
                                0
                              ? "Sem horários disponíveis"
                              : "Selecione um horário"}
                  </option>

                  {availableTimes.map(
                    (time) => (
                      <option
                        key={time}
                        value={time}
                      >
                        {time}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            {/* INFORMAÇÃO DA DISPONIBILIDADE */}
            {loadingTimes && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-gold" />

                Consultando disponibilidade...
              </p>
            )}

            {!loadingTimes &&
              canChooseTime &&
              availableTimes.length >
                0 && (
                <p className="text-xs text-muted-foreground">
                  {
                    availableTimes.length
                  }{" "}
                  horário(s)
                  disponível(is) para este
                  profissional.
                </p>
              )}

            {!loadingTimes &&
              canChooseTime &&
              availabilityMessage && (
                <p className="text-sm text-destructive">
                  {availabilityMessage}
                </p>
              )}

            {/* OBSERVAÇÕES */}
            <div>
              <label
                htmlFor="notes"
                className="text-sm text-muted-foreground"
              >
                Observações
              </label>

              <textarea
                id="notes"
                name="notes"
                rows={4}
                disabled={loading}
                placeholder="Alguma preferência ou informação adicional?"
                className="mt-2 w-full rounded-lg border border-input bg-background p-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-gold disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* BOTÃO */}
            <button
              type="submit"
              disabled={
                loading ||
                loadingTimes ||
                !selectedBarberId ||
                !selectedServiceId ||
                !selectedDate ||
                !selectedTime ||
                barbers.length === 0 ||
                services.length === 0
              }
              className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <Loader2 className="h-5 w-5 animate-spin" />
              )}

              {loading
                ? "Agendando..."
                : "Confirmar agendamento"}
            </button>

            {/* RESULTADO */}
            {status && (
              <p
                role="status"
                className={`text-sm ${
                  status.ok
                    ? "text-gold"
                    : "text-destructive"
                }`}
              >
                {status.msg}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}