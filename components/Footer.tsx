import Link from "next/link";
import { Facebook, Instagram, Scissors } from "lucide-react";

const nav = [
  { label: "Serviços", href: "#servicos" },
  { label: "Barbeiros", href: "#barbeiros" },
  { label: "Galeria", href: "#galeria" },
  { label: "Avaliações", href: "#avaliacoes" },
  { label: "Contato", href: "#contato" },
];

const socials = [
  { Icon: Instagram, label: "Instagram", href: "#top" },
  { Icon: Facebook, label: "Facebook", href: "#top" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface">
      <div className="section-shell py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="flex min-w-0 items-center gap-2">
              <Scissors className="h-5 w-5 shrink-0 text-gold" strokeWidth={1.75} aria-hidden />
              <span className="truncate font-display text-lg">
                Navalha<span className="text-gold">&nbsp;Real</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Barbearia premium no centro de São Paulo. Tradição, técnica e um ambiente
              feito para você relaxar.
            </p>
          </div>

          <nav aria-label="Navegação do rodapé">
            <p className="text-xs uppercase tracking-widest text-gold">Navegação</p>
            <ul className="mt-4 space-y-3">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-gold"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-xs uppercase tracking-widest text-gold">Siga a gente</p>
            <div className="mt-4 flex gap-3">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid h-12 w-12 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="gold-rule mt-10" />
        <p className="mt-6 text-xs text-muted-foreground">
          © 2026 Navalha Real. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
