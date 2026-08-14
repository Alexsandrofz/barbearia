import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";
import SectionHeading from "./SectionHeading";
import type { Barber } from "@/lib/data";

type Props = {
  barbers: Barber[];
};

export default function Barbers({ barbers }: Props) {
  return (
    <section
      id="barbeiros"
      className="scroll-mt-20 border-y border-border/60 bg-surface py-20 sm:py-24 lg:py-32"
    >
      <div className="section-shell">
        <SectionHeading
          eyebrow="Nosso time"
          title="Barbeiros que dominam o ofício"
          description="Profissionais com estilos e especialidades diferentes."
          align="center"
        />

        {barbers.length === 0 ? (
          <p className="mt-10 text-center text-muted-foreground">
            Nenhum barbeiro disponível no momento.
          </p>
        ) : (
          <ul className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
            {barbers.map((barber) => (
              <li
                key={barber.id}
                className="card-premium group overflow-hidden"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={barber.photo_url || "/images/barber.jpg"}
                    alt={`Retrato de ${barber.name}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-5 sm:p-6">
                  <h3 className="text-lg font-semibold sm:text-xl">
                    {barber.name}
                  </h3>

                  <p className="mt-1 text-sm text-gold">
                    {barber.specialty || "Barbeiro profissional"}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      href="#contato"
                      className="btn-outline-gold text-sm"
                    >
                      Agendar
                    </Link>

                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Instagram className="h-4 w-4" />
                      Profissional da equipe
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
