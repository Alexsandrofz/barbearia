"use client";

import { BOOKING_TIME_SLOTS } from "@/lib/time-slots";
import { useEffect, useMemo, useState } from "react";
import { Clock, Loader2, MapPin, Phone } from "lucide-react";

import SectionHeading from "./SectionHeading";
import { createAppointment } from "@/lib/appointments";
import { getBusyTimes } from "@/lib/availability";
import type { Barber, Business, Service } from "@/lib/data";

type Props = {
  business: Business;
  barbers: Barber[];
  services: Service[];
};



const inputClass =
  "mt-2 h-12 w-full rounded-lg border border-input bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-gold disabled:cursor-not-allowed disabled:opacity-60";

export default function Contact({
  business,
  barbers,
  services,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState(false);

  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [busyTimes, setBusyTimes] = useState<string[]>([]);

  const [status, setStatus] = useState<null | {
    ok: boolean;
    msg: string;
  }>(null);

  const freeTimes = useMemo(() => {
    return BOOKING_TIME_SLOTS.filter(
      (time) => !busyTimes.some((busyTime) => busyTime.startsWith(time)),
    );
  }, [busyTimes]);

  useEffect(() => {
    async function loadBusyTimes() {
      if (!selectedBarberId || !selectedDate) {
        setBusyTimes([]);
        setSelectedTime("");
        return;
      }

      setLoadingTimes(true);
      setSelectedTime("");
      setStatus(null);

      const times = await getBusyTimes(selectedBarberId, selectedDate);

      setBusyTimes(times);
      setLoadingTimes(false);
    }

    loadBusyTimes();
  }, [selectedBarberId, selectedDate]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const serviceId = String(formData.get("serviceId") ?? "");
    const selectedService = services.find(
      (service) => service.id === serviceId,
    );

    if (!selectedService) {
      setStatus({
        ok: false,
        msg: "Selecione um serviço válido.",
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

    setLoading(true);
    setStatus(null);

    const { error } = await createAppointment({
      businessId: business.id,
      barberId: selectedBarberId,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      appointmentDate: selectedDate,
      startTime: selectedTime,
      notes: String(formData.get("notes") ?? ""),
    });

    setLoading(false);

    if (error) {
      console.error("Erro ao criar agendamento:", error);

      if (error.code === "23505") {
        setBusyTimes((current) => [...current, `${selectedTime}:00`]);
        setSelectedTime("");

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
    setSelectedDate("");
    setSelectedTime("");
    setBusyTimes([]);
  }

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
                  <p className="font-semibold">Endereço</p>

                  <p className="text-sm text-muted-foreground">
                    {business.address || "Endereço não informado"}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/40 text-gold">
                  <Phone className="h-5 w-5" />
                </span>

                <div>
                  <p className="font-semibold">Contato</p>

                  <p className="text-sm text-muted-foreground">
                    {business.phone || "Telefone não informado"}
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
                  <p className="font-semibold">Atendimento</p>

                  <p className="text-sm text-muted-foreground">
                    Os horários ocupados são removidos automaticamente.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <form
            className="card-premium space-y-5 p-6 sm:p-8"
            onSubmit={onSubmit}
          >
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
                placeholder="Seu nome completo"
                className={inputClass}
              />
            </div>

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
                placeholder="(79) 99999-9999"
                className={inputClass}
              />
            </div>

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
                onChange={(event) => {
                  setSelectedBarberId(event.target.value);
                  setSelectedTime("");
                }}
                className={inputClass}
              >
                <option value="" disabled>
                  Selecione um barbeiro
                </option>

                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}
                  </option>
                ))}
              </select>
            </div>

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
                defaultValue=""
                className={inputClass}
              >
                <option value="" disabled>
                  Selecione um serviço
                </option>

                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} — {service.duration_minutes} min
                  </option>
                ))}
              </select>
            </div>

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
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    setSelectedTime("");
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
                  onChange={(event) => setSelectedTime(event.target.value)}
                  disabled={
                    !selectedBarberId ||
                    !selectedDate ||
                    loadingTimes ||
                    freeTimes.length === 0
                  }
                  className={inputClass}
                >
                  <option value="" disabled>
                    {loadingTimes
                      ? "Carregando..."
                      : !selectedBarberId || !selectedDate
                        ? "Escolha barbeiro e data"
                        : freeTimes.length === 0
                          ? "Sem horários disponíveis"
                          : "Selecione um horário"}
                  </option>

                  {freeTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedBarberId &&
              selectedDate &&
              !loadingTimes &&
              freeTimes.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {freeTimes.length} horário(s) disponível(is) nesta data.
                </p>
              )}

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
                placeholder="Alguma preferência ou informação adicional?"
                className="mt-2 w-full rounded-lg border border-input bg-background p-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-gold"
              />
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                loadingTimes ||
                barbers.length === 0 ||
                services.length === 0 ||
                freeTimes.length === 0
              }
              className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}

              {loading ? "Agendando..." : "Confirmar agendamento"}
            </button>

            {status && (
              <p
                role="status"
                className={`text-sm ${
                  status.ok ? "text-gold" : "text-destructive"
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
