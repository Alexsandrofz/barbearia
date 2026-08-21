import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";

import BusinessThemeProvider from "@/components/BusinessThemeProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Barbearia | Agendamento Online",
  description:
    "Agende seu horário de forma rápida e prática na nossa barbearia.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <BusinessThemeProvider />

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
