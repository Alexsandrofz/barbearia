import Link from "next/link";
import { Baby, Brush, Droplets, Scissors, Sparkles, Wind } from "lucide-react";
import SectionHeading from "./SectionHeading";

const services = [
  {
    icon: Scissors,
    name: "Corte clássico",
    price: "R$ 60",
    time: "45 min",
    desc: "Tesoura e máquina com acabamento na navalha e finalização a seu gosto.",
  },
  {
    icon: Brush,
    name: "Barba na navalha",
    price: "R$ 45",
    time: "30 min",
    desc: "Toalha quente, óleos essenciais e desenho preciso do contorno.",
  },
  {
    icon: Sparkles,
    name: "Combo premium",
    price: "R$ 95",
    time: "1h15",
    desc: "Corte, barba, sobrancelha e hidratação em uma única sessão.",
  },
  {
    icon: Droplets,
    name: "Hidratação capilar",
    price: "R$ 55",
    time: "30 min",
    desc: "Tratamento profundo para devolver brilho, força e maciez.",
  },
  {
    icon: Wind,
    name: "Platinado / cor",
    price: "R$ 180",
    time: "2h",
    desc: "Descoloração segura e matização feita por especialistas.",
  },
  {
    icon: Baby,
    name: "Corte infantil",
    price: "R$ 45",
    time: "30 min",
    desc: "Atendimento paciente e divertido para os pequenos clientes.",
  },
];

export default function Services() {
  return (
    <section id="servicos" className="scroll-mt-20 py-20 sm:py-24 lg:py-32">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Serviços"
          title="Cuidado sob medida para o seu estilo"
          description="Preços transparentes, tempo estimado por serviço e produtos profissionais em todos os atendimentos."
        />

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.name} className="card-premium p-6">
              <s.icon className="h-7 w-7 text-gold" strokeWidth={1.5} aria-hidden />
              <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="text-lg font-semibold sm:text-xl">{s.name}</h3>
                <span className="font-display text-lg text-gold">{s.price}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
                {s.time}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex justify-center sm:mt-12">
          <Link href="#contato" className="btn-gold w-full sm:w-auto">
            Agendar horário
          </Link>
        </div>
      </div>
    </section>
  );
}
