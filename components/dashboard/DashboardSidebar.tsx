"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
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

type UserRole =
  | "owner"
  | "manager"
  | "barber"
  | "customer"
  | "unauthorized";

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  roles: UserRole[];
  exact?: boolean;
};

const navigation: NavigationItem[] = [
  {
    label: "Agenda",
    href: "/dashboard",
    icon: CalendarDays,
    roles: ["owner", "manager"],
    exact: true,
  },
  {
    label: "Clientes",
    href: "/dashboard/clientes",
    icon: UsersRound,
    roles: ["owner", "manager"],
  },
  {
    label: "Barbeiros",
    href: "/dashboard/barbeiros",
    icon: UserRound,
    roles: ["owner", "manager"],
  },
  {
    label: "Serviços",
    href: "/dashboard/servicos",
    icon: Scissors,
    roles: ["owner", "manager"],
  },
  {
    label: "Financeiro",
    href: "/dashboard/financeiro",
    icon: ChartNoAxesCombined,
    roles: ["owner"],
  },
  {
    label: "Configurações",
    href: "/dashboard/configuracoes/horarios",
    icon: Settings,
    roles: ["owner", "manager"],
  },
  {
    label: "Dados da barbearia",
    href: "/dashboard/configuracoes/barbearia",
    icon: Store,
    roles: ["owner"],
  },

  {
    label: "Minha agenda",
    href: "/dashboard/barbeiro",
    icon: CalendarDays,
    roles: ["barber"],
    exact: true,
  },
  {
    label: "Meus atendimentos",
    href: "/dashboard/barbeiro/atendimentos",
    icon: ClipboardList,
    roles: ["barber"],
  },
  {
    label: "Meu perfil",
    href: "/dashboard/barbeiro/perfil",
    icon: UserRound,
    roles: ["barber"],
  },
];

type Props = {
  businessName?: string;
  logoUrl?: string | null;
  role: UserRole;
};

export default function DashboardSidebar({
  businessName = "Minha barbearia",
  logoUrl = null,
  role,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [isLoggingOut, startLogoutTransition] =
    useTransition();

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  function handleLogout() {
    startLogoutTransition(async () => {
      const supabase = createClient();

      const { error } =
        await supabase.auth.signOut({
          scope: "local",
        });

      if (error) {
        console.error(
          "Erro ao sair:",
          error,
        );

        return;
      }

      router.replace("/login");
      router.refresh();
    });
  }

  const visibleNavigation =
    navigation.filter((item) =>
      item.roles.includes(role),
    );

  const homeHref =
    role === "barber"
      ? "/dashboard/barbeiro"
      : "/dashboard";

  function isItemActive(
    item: NavigationItem,
  ) {
    if (item.exact) {
      return pathname === item.href;
    }

    return pathname.startsWith(
      item.href,
    );
  }

  function BrandLogo({
    mobile = false,
  }: {
    mobile?: boolean;
  }) {
    const sizeClass = mobile
      ? "h-9 w-9 rounded-lg"
      : "h-10 w-10 rounded-xl";

    if (logoUrl) {
      return (
        <span
          className={`${sizeClass} shrink-0 overflow-hidden border border-gold/30 bg-secondary`}
        >
          <img
            src={logoUrl}
            alt={`Logo ${businessName}`}
            className="h-full w-full object-cover"
          />
        </span>
      );
    }

    return (
      <span
        className={`grid ${sizeClass} shrink-0 place-items-center border border-gold/30 bg-gold/10 text-gold`}
      >
        <Store
          className={
            mobile
              ? "h-4 w-4"
              : "h-5 w-5"
          }
        />
      </span>
    );
  }

  const sidebarContent = (
    <>
      {/* TOPO */}
      <div className="flex h-20 items-center justify-between border-b border-border px-5">
        <Link
          href={homeHref}
          onClick={closeMobileMenu}
          className="flex min-w-0 items-center gap-3"
        >
          <BrandLogo />

          <span className="min-w-0">
            <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {role === "barber"
                ? "Área do profissional"
                : "Painel"}
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

      {/* NAVEGAÇÃO */}
      <nav
        aria-label={
          role === "barber"
            ? "Navegação do profissional"
            : "Navegação administrativa"
        }
        className="flex-1 overflow-y-auto px-3 py-6"
      >
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {role === "barber"
            ? "Profissional"
            : "Gerenciamento"}
        </p>

        <ul className="space-y-1">
          {visibleNavigation.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                isItemActive(item);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={
                      closeMobileMenu
                    }
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
            },
          )}
        </ul>
      </nav>

      {/* RODAPÉ */}
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
          disabled={
            isLoggingOut
          }
          className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-5 w-5" />

          {isLoggingOut
            ? "Saindo..."
            : "Sair"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* CABEÇALHO MOBILE */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo mobile />

          <span className="truncate font-display">
            {businessName}
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            setMobileOpen(true)
          }
          aria-label="Abrir menu"
          aria-expanded={
            mobileOpen
          }
          className="grid h-11 w-11 place-items-center rounded-full border border-border"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* SIDEBAR DESKTOP */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-border bg-surface lg:flex">
        {sidebarContent}
      </aside>

      {/* SIDEBAR MOBILE */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={
              closeMobileMenu
            }
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
