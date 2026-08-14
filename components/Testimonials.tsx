import { Quote, Star } from "lucide-react";
import SectionHeading from "./SectionHeading";

const reviews = [
  {
    name: "Bruno Almeida",
    since: "Cliente há 3 anos",
    text: "Melhor degradê da cidade. Ambiente impecável, horário sempre respeitado e resultado consistente.",
  },
  {
    name: "Diego Farias",
    since: "Cliente há 1 ano",
    text: "A barba na navalha com toalha quente virou meu ritual de sexta. Atendimento de altíssimo nível.",
  },
  {
    name: "Marcelo Reis",
    since: "Cliente há 5 anos",
    text: "Levo meu filho e os dois saem satisfeitos. Profissionais atenciosos e muito técnicos.",
  },
];

export default function Testimonials() {
  return (
    <section
      id="avaliacoes"
      className="scroll-mt-20 border-y border-border/60 bg-surface py-20 sm:py-24 lg:py-32"
    >
      <div className="section-shell">
        <SectionHeading
          eyebrow="Avaliações"
          title="4,9 de média em mais de 1.200 avaliações"
          align="center"
        />

        <ul className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <li key={r.name} className="card-premium flex flex-col p-6">
              <Quote className="h-6 w-6 shrink-0 text-gold" strokeWidth={1.5} aria-hidden />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                “{r.text}”
              </p>
              <div className="mt-6">
                <div className="flex gap-1" aria-label="5 de 5 estrelas">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="mt-3 font-semibold">{r.name}</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {r.since}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
