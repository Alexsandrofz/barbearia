import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";
import SectionHeading from "./SectionHeading";

const barbers = [
  {
    name: "Rafael Duarte",
    role: "Master barber · fundador",
    img: "/images/barber-1.jpg",
    tag: "Cortes clássicos & barba",
    handle: "@rafaduarte",
  },
  {
    name: "Caio Mendes",
    role: "Especialista em fade",
    img: "/images/barber-2.jpg",
    tag: "Degradê e freestyle",
    handle: "@caio.fade",
  },
  {
    name: "Lívia Braga",
    role: "Colorista sênior",
    img: "/images/barber-3.jpg",
    tag: "Platinado e coloração",
    handle: "@liviabraga",
  },
];

export default function Barbers() {
  return (
    <section
      id="barbeiros"
      className="scroll-mt-20 border-y border-border/60 bg-surface py-20 sm:py-24 lg:py-32"
    >
      <div className="section-shell">
        <SectionHeading
          eyebrow="Nosso time"
          title="Barbeiros que dominam o ofício"
          description="Profissionais em formação contínua, com agenda própria e estilo autoral."
          align="center"
        />

        <ul className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
          {barbers.map((b) => (
            <li key={b.name} className="card-premium group overflow-hidden">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src={b.img}
                  alt={`Retrato de ${b.name}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="text-lg font-semibold sm:text-xl">{b.name}</h3>
                <p className="mt-1 text-sm text-gold">{b.role}</p>
                <p className="mt-3 text-sm text-muted-foreground">{b.tag}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link href="#contato" className="btn-outline-gold text-sm">
                    Agendar
                  </Link>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Instagram className="h-4 w-4 shrink-0" />
                    {b.handle}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
