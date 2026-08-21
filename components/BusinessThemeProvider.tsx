"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

const DEFAULT_COLOR = "#d4af37";

export default function BusinessThemeProvider() {
  useEffect(() => {
    let cancelled = false;

    async function loadTheme() {
      try {
        const supabase = createClient();

        const {
          data: business,
          error,
        } = await supabase
          .from("businesses")
          .select(`
            primary_color
          `)
          .eq("active", true)
          .limit(1)
          .maybeSingle();

        if (cancelled) {
          return;
        }

        if (
          error ||
          !business?.primary_color
        ) {
          document.documentElement.style.setProperty(
            "--business-primary",
            DEFAULT_COLOR,
          );

          return;
        }

        document.documentElement.style.setProperty(
          "--business-primary",
          business.primary_color,
        );
      } catch (error) {
        console.error(
          "Erro ao carregar tema da barbearia:",
          error,
        );

        document.documentElement.style.setProperty(
          "--business-primary",
          DEFAULT_COLOR,
        );
      }
    }

    loadTheme();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}