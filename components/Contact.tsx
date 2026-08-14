"use client";

import { useState } from "react";
import { Clock, Loader2, MapPin, Phone } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { createAppointment } from "@/lib/appointments";

const info = [
  {
    icon: MapPin,
    title: "Endereço",
    lines: ["Rua das Palmeiras, 128", "Centro · São Paulo, SP"],
  },
  {
    icon: Phone,
    title: "Contato",
    lines: ["(11) 99876-5432", "contato@navalhareal.com"],
  },
  {
    icon: Clock,
    title: "Horários",
    lines: ["Seg a sex · 09h às 20h", "Sáb · 09h às 18h"],
  },
];

const servicos = [
  "Corte clássico",
  "Barba na navalha",
  "Combo premium",
  "Hidratação capilar",
  "Platinado / cor",
  "Corte infantil",
];

const inputClass =
  "mt-2 h-12 w-full rounded-lg border border-input bg-background px-4 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-gold";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setLoading(true);
    setStatus(null);

    const { error } = await createAppointment({
      name: String(data.get("nome") ?? ""),
      phone: String(data.get("tel") ?? ""),
      service: String(data.get("servico") ?? ""),
      notes: String(data.get("obs") ?? ""),
    });

    setLoading(false);
    if (error) {
      setStatus({ ok: false, msg: "Não foi possível enviar. Tente novamente." });
      return;
    }
    setStatus({ ok: true, msg: "Recebemos seu pedido! Confirmamos pelo WhatsApp." });
    form.reset();
  }

  return (
    <section id="contato" className="scroll-mt-20 py-20 sm:py-24 lg:py-32">
      <div className="section-shell">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Contato"
              title="Reserve sua cadeira"
              description="Envie seus dados e confirmamos o horário pelo WhatsApp em poucos minutos."
            />
            <ul className="mt-8 space-y-6">
              {info.map((i) => (
                <li key={i.title} className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/40 text-gold">
                    <i.icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">{i.title}</p>
                    {i.lines.map((l) => (
                      <p key={l} className="text-sm text-muted-foreground">
                        {l}
                      </p>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <form className="card-premium space-y-4 p-6 sm:p-8" onSubmit={onSubmit}>
            <div>
              <label htmlFor="nome" className="text-sm text-muted-foreground">
                Nome
              </label>
              <input
                id="nome"
                name="nome"
                required
                placeholder="Seu nome completo"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="tel" className="text-sm text-muted-foreground">
                  WhatsApp
                </label>
                <input
                  id="tel"
                  name="tel"
                  type="tel"
                  required
                  placeholder="(11) 90000-0000"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="servico" className="text-sm text-muted-foreground">
                  Serviço
                </label>
                <select id="servico" name="servico" className={inputClass}>
                  {servicos.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="obs" className="text-sm text-muted-foreground">
                Observações
              </label>
              <textarea
                id="obs"
                name="obs"
                rows={4}
                placeholder="Dia e horário de preferência"
                className="mt-2 w-full rounded-lg border border-input bg-background p-4 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-gold"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-70">
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {loading ? "Enviando..." : "Agendar horário"}
            </button>

            {status && (
              <p
                role="status"
                className={`text-sm ${status.ok ? "text-gold" : "text-destructive"}`}
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
