"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Scissors, X } from "lucide-react";

const links = [
  { label: "Serviços", href: "#servicos" },
  { label: "Barbeiros", href: "#barbeiros" },
  { label: "Galeria", href: "#galeria" },
  { label: "Avaliações", href: "#avaliacoes" },
  { label: "Contato", href: "#contato" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-border/70 bg-background/95 backdrop-blur"
          : "bg-transparent"
      }`}
    >
      <nav className="section-shell grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:h-20 lg:flex lg:justify-between">
        <Link href="#top" className="flex min-w-0 items-center gap-2">
          <Scissors className="h-5 w-5 shrink-0 text-gold" strokeWidth={1.75} aria-hidden />
          <span className="truncate font-display text-lg tracking-wide sm:text-xl">
            Navalha<span className="text-gold">&nbsp;Real</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-gold"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 justify-self-end">
          <Link href="#contato" className="btn-gold hidden text-sm lg:inline-flex">
            Agendar horário
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-gold hover:text-gold lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="animate-fade-in border-t border-border/70 bg-background lg:hidden">
          <ul className="section-shell flex flex-col gap-1 py-4">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-4 text-base text-foreground transition-colors hover:bg-secondary hover:text-gold"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link href="#contato" onClick={() => setOpen(false)} className="btn-gold w-full">
                Agendar horário
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
