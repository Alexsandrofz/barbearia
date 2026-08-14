"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ChartNoAxesCombined,
  LogOut,
  Menu,
  Scissors,
  Settings,
  Store,
  UsersRound,
  UserRound,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const navigation = [
  {
    label: "Agenda",
    href: "/dashboard",
    icon: CalendarDays,
    available: true,
  },
  {
    label: "Clientes",
    href: "/dashboard/clientes",
    icon: UsersRound,
    available: true,
  },
  {
    label: "Barbeiros",
    href: "/dashboard/barbeiros",
    icon: UserRound,
    available: true,
  },
  {
    label: "Serviços",
    href: "/dashboard/servicos",
    icon: Scissors,
    available: true,
  },
  {
    label: "Financeiro",
    href: "/dashboard/financeiro",
    icon: ChartNoAxesCombined,
    available: true,
  },
  {
    label: "Configurações",
    href: "/dashboard/configuracoes/horarios",
    icon: Settings,
    available: true,
  },
];

type Props = {
  businessName?: string;
};

export default function DashboardSidebar({
  businessName = "Minha barbearia",
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, startLogoutTransition] = useTransition();

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  function handleLogout() {
    startLogoutTransition(async () => {
      const supabase = createClient();

      const { error } = await supabase.auth.signOut({
        scope: "local",
      });

      if (error) {
        console.error("Erro ao sair:", error);
        return;
      }

      router.replace("/login");
      router.refresh();
    });
  }

  const sidebarContent = (
    <>
      <div className="flex h-20 items-center justify-between border-b border-border px-5">
        <Link
          href="/dashboard"
          onClick={closeMobileMenu}
          className="flex min-w-0 items-center gap-3"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
            <Store className="h-5 w-5" />
          </span>

          <span className="min-w-0">
            <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Painel
            </span>

            <span className="block truncate font-display text-lg">
              {businessName}
            </span>
          </span>
        </Link>

        <button
          type="button"
          onClick={closeMobileMenu}
          aria-label="Fechar menu"
          className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav
        aria-label="Navegação administrativa"
        className="flex-1 overflow-y-auto px-3 py-6"
      >
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Gerenciamento
        </p>

        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            if (!item.available) {
              return (
                <li key={item.href}>
                  <div className="flex min-h-12 cursor-not-allowed items-center gap-3 rounded-xl px-3 text-muted-foreground/55">
                    <Icon className="h-5 w-5 shrink-0" />

                    <span className="flex-1 text-sm font-medium">
                      {item.label}
                    </span>

                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide">
                      Em breve
                    </span>
                  </div>
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-gold/12 text-gold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Store className="h-5 w-5" />
          Ver site público
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-5 w-5" />
          {isLoggingOut ? "Saindo..." : "Sair"}
        </button>
      </div>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gold/30 text-gold">
            <Scissors className="h-4 w-4" />
          </span>

          <span className="truncate font-display">
            {businessName}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
          className="grid h-11 w-11 place-items-center rounded-full border border-border"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-border bg-surface lg:flex">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <aside className="relative flex h-full w-[min(88vw,320px)] flex-col border-r border-border bg-surface shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}