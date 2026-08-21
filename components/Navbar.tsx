"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  LogIn,
  Menu,
  Scissors,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const links = [
  { label: "Serviços", href: "#servicos" },
  { label: "Barbeiros", href: "#barbeiros" },
  { label: "Galeria", href: "#galeria" },
  { label: "Avaliações", href: "#avaliacoes" },
  { label: "Contato", href: "#contato" },
];

type PublicBusiness = {
  name: string;
  logo_url: string | null;
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [business, setBusiness] =
    useState<PublicBusiness | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    let cancelled = false;

    async function loadBusiness() {
      const supabase = createClient();

      const {
        data,
        error,
      } = await supabase
        .from("businesses")
        .select(`
          name,
          logo_url
        `)
        .eq("active", true)
        .limit(1)
        .maybeSingle();

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Erro ao carregar identidade da barbearia:",
          error,
        );

        return;
      }

      if (data) {
        setBusiness(
          data as PublicBusiness,
        );
      }
    }

    loadBusiness();

    return () => {
      cancelled = true;
    };
  }, []);

  const businessName =
    business?.name || "Navalha Real";

  const logoUrl =
    business?.logo_url || null;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-border/70 bg-background/95 backdrop-blur"
          : "bg-transparent"
      }`}
    >
      <nav className="section-shell grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:h-20 lg:flex lg:justify-between">
        <Link
          href="#top"
          className="flex min-w-0 items-center gap-3"
        >
          {logoUrl ? (
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-gold/30 bg-secondary sm:h-11 sm:w-11">
              <img
                src={logoUrl}
                alt={`Logo ${businessName}`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold sm:h-11 sm:w-11">
              <Scissors
                className="h-5 w-5"
                strokeWidth={1.75}
                aria-hidden
              />
            </span>
          )}

          <span className="truncate font-display text-lg tracking-wide sm:text-xl">
            {businessName}
          </span>
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 justify-self-end">
          <Link
            href="/login"
            className="hidden min-h-11 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold lg:inline-flex"
          >
            <LogIn className="h-4 w-4" />
            Entrar
          </Link>

          <Link
            href="#contato"
            className="btn-gold hidden text-sm lg:inline-flex"
          >
            Agendar horário
          </Link>

          <button
            type="button"
            onClick={() =>
              setOpen(
                (current) => !current,
              )
            }
            aria-label={
              open
                ? "Fechar menu"
                : "Abrir menu"
            }
            aria-expanded={open}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-gold hover:text-gold lg:hidden"
          >
            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {open && (
        <div className="animate-fade-in border-t border-border/70 bg-background lg:hidden">
          <ul className="section-shell flex flex-col gap-1 py-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() =>
                    setOpen(false)
                  }
                  className="block rounded-lg px-3 py-4 text-base text-foreground transition-colors hover:bg-secondary hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li className="pt-2">
              <Link
                href="/login"
                onClick={() =>
                  setOpen(false)
                }
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold transition-colors hover:border-gold/50 hover:text-gold"
              >
                <LogIn className="h-4 w-4" />
                Área administrativa
              </Link>
            </li>

            <li className="pt-2">
              <Link
                href="#contato"
                onClick={() =>
                  setOpen(false)
                }
                className="btn-gold w-full"
              >
                Agendar horário
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
