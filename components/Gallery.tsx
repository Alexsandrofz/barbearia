import Image from "next/image";
import SectionHeading from "./SectionHeading";

const shots = [
  { src: "/images/gallery-1.jpg", alt: "Barbeiro finalizando o corte com máquina" },
  { src: "/images/gallery-2.jpg", alt: "Barba sendo aparada na navalha com toalha quente" },
  { src: "/images/gallery-3.jpg", alt: "Ferramentas douradas de barbearia sobre mármore preto" },
  { src: "/images/gallery-4.jpg", alt: "Cliente sorrindo com corte e barba finalizados" },
];

export default function Gallery() {
  return (
    <section id="galeria" className="scroll-mt-20 py-20 sm:py-24 lg:py-32">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Galeria"
          title="Resultados que falam por si"
          description="Um recorte do trabalho feito na cadeira todos os dias."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {shots.map((s, i) => (
            <figure
              key={s.src}
              className={`group relative overflow-hidden rounded-xl border border-border/70 ${
                i === 0 ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : ""
              }`}
            >
              <Image
                src={s.src}
                alt={s.alt}
                width={900}
                height={900}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-72 lg:h-full lg:min-h-64"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
