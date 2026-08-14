import { redirect } from "next/navigation";

import { getCurrentUserAccess } from "@/lib/auth-role";

export default async function AccessPage() {
  const access = await getCurrentUserAccess();

  if (!access) {
    redirect("/login");
  }

  if (access.role === "owner" || access.role === "manager") {
    redirect("/dashboard");
  }

  if (access.role === "barber") {
    redirect("/barbeiro/agenda");
  }

  if (access.role === "customer") {
    redirect("/minha-conta");
  }

  redirect("/");
}