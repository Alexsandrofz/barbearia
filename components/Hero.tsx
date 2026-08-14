import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, MapPin, Star } from "lucide-react";

const stats = [
  { k: "14 anos", v: "de tradição" },
  { k: "+38 mil", v: "cortes feitos" },
  { k: "4,9", v: "nota média", icon: true },
  { k: "Centro", v: "fácil acesso", pin: true },
];

export default function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden">
      <Image
        src="/images/hero.jpg"
        alt="Interior elegante da barbearia com iluminação dourada"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "var(--gradient-veil)" }}
        aria-hidden
      />

      <div className="section-shell relative flex min-h-[100svh] flex-col justify-center py-28 sm:py-32">
        <span className="eyebrow animate-fade-in">Barbearia premium desde 2011</span>

        <h1 className="animate-fade-in mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-5xl md:text-6xl xl:text-7xl">
          Estilo afiado, <span className="text-gold-gradient">precisão artesanal</span>
        </h1>

        <p className="animate-fade-in mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Cortes clássicos e modernos, barba desenhada na navalha e um atendimento pensado
          nos detalhes. Reserve seu horário em menos de um minuto.
        </p>

        <div className="animate-fade-in mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="#contato" className="btn-gold w-full sm:w-auto">
            <CalendarCheck className="h-5 w-5" />
            Agendar horário
          </Link>
          <Link href="#servicos" className="btn-outline-gold w-full sm:w-auto">
            Ver serviços
          </Link>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 sm:mt-16 sm:max-w-2xl sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.k}>
              <dt className="flex items-center gap-1.5 font-display text-2xl text-gold sm:text-3xl">
                {s.icon && <Star className="h-4 w-4 fill-gold" />}
                {s.pin && <MapPin className="h-4 w-4" />}
                {s.k}
              </dt>
              <dd className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                {s.v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
