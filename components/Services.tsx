import Link from "next/link";
import {
  Baby,
  Brush,
  Droplets,
  Scissors,
  Sparkles,
  Wind,
} from "lucide-react";
import SectionHeading from "./SectionHeading";
import type { Service } from "@/lib/data";

type Props = {
  services: Service[];
};

const icons = [Scissors, Brush, Sparkles, Droplets, Wind, Baby];

function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

export default function Services({ services }: Props) {
  return (
    <section
      id="servicos"
      className="scroll-mt-20 py-20 sm:py-24 lg:py-32"
    >
      <div className="section-shell">
        <SectionHeading
          eyebrow="Serviços"
          title="Cuidado sob medida para o seu estilo"
          description="Preços transparentes, duração estimada e atendimento profissional."
        />

        {services.length === 0 ? (
          <p className="mt-10 text-muted-foreground">
            Nenhum serviço disponível no momento.
          </p>
        ) : (
          <ul className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {services.map((service, index) => {
              const Icon = icons[index % icons.length];

              return (
                <li key={service.id} className="card-premium p-6">
                  <Icon
                    className="h-7 w-7 text-gold"
                    strokeWidth={1.5}
                    aria-hidden
                  />

                  <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="text-lg font-semibold sm:text-xl">
                      {service.name}
                    </h3>

                    <span className="font-display text-lg text-gold">
                      {formatPrice(Number(service.price))}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.description || "Serviço disponível para agendamento."}
                  </p>

                  <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
                    {service.duration_minutes} minutos
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-10 flex justify-center sm:mt-12">
          <Link href="#contato" className="btn-gold w-full sm:w-auto">
            Agendar horário
          </Link>
        </div>
      </div>
    </section>
  );
}
