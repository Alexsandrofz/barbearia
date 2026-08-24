import Link from "next/link";
import {
  Instagram,
  Scissors,
} from "lucide-react";
import type { Business } from "@/lib/data";

const nav = [
  { label: "Serviços", href: "#servicos" },
  { label: "Barbeiros", href: "#barbeiros" },
  { label: "Galeria", href: "#galeria" },
  { label: "Avaliações", href: "#avaliacoes" },
  { label: "Contato", href: "#contato" },
];

type Props = {
  business: Business;
};

function normalizeInstagram(
  value: string | null | undefined,
) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }

  const username =
    trimmed.startsWith("@")
      ? trimmed.slice(1)
      : trimmed;

  return `https://instagram.com/${username}`;
}

export default function Footer({
  business,
}: Props) {
  const instagramUrl =
    normalizeInstagram(
      business.instagram,
    );

  const currentYear =
    new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-surface">
      <div className="section-shell py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* MARCA */}
          <div className="sm:col-span-2">
            <div className="flex min-w-0 items-center gap-3">
              {business.logo_url ? (
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-gold/30 bg-secondary">
                  <img
                    src={business.logo_url}
                    alt={`Logo ${business.name}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                  <Scissors
                    className="h-5 w-5"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </span>
              )}

              <span className="truncate font-display text-lg">
                {business.name}
              </span>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {business.description ||
                "Cuidado, estilo e atendimento profissional em cada detalhe."}
            </p>

            {business.address && (
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                {business.address}
              </p>
            )}
          </div>

          {/* NAVEGAÇÃO */}
          <nav aria-label="Navegação do rodapé">
            <p className="text-xs uppercase tracking-widest text-gold">
              Navegação
            </p>

            <ul className="mt-4 space-y-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* REDES / CONTATO */}
          <div>
            <p className="text-xs uppercase tracking-widest text-gold">
              Contato
            </p>

            <div className="mt-4 space-y-3">
              {business.phone && (
                <p className="text-sm text-muted-foreground">
                  {business.phone}
                </p>
              )}

              {business.email && (
                <a
                  href={`mailto:${business.email}`}
                  className="block text-sm text-muted-foreground transition-colors hover:text-gold"
                >
                  {business.email}
                </a>
              )}
            </div>

            {instagramUrl && (
              <div className="mt-5 flex gap-3">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="grid h-12 w-12 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold hover:text-gold"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="gold-rule mt-10" />

        <p className="mt-6 text-xs text-muted-foreground">
          © {currentYear} {business.name}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
