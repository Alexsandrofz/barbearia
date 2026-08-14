import "server-only";

import { redirect } from "next/navigation";

import {
  getCurrentUserAccess,
  type CurrentUserAccess,
} from "@/lib/auth-role";

export async function requireOwner(): Promise<CurrentUserAccess> {
  const access = await getCurrentUserAccess();

  if (!access) {
    redirect("/login");
  }

  if (access.role !== "owner") {
    if (access.role === "barber") {
      redirect("/dashboard/barbeiro");
    }

    redirect("/dashboard");
  }

  if (!access.businessId) {
    redirect("/acesso");
  }

  return access;
}

export async function requireManagement(): Promise<CurrentUserAccess> {
  const access = await getCurrentUserAccess();

  if (!access) {
    redirect("/login");
  }

  if (
    access.role !== "owner" &&
    access.role !== "manager"
  ) {
    if (access.role === "barber") {
      redirect("/dashboard/barbeiro");
    }

    redirect("/acesso");
  }

  if (!access.businessId) {
    redirect("/acesso");
  }

  return access;
}

export async function requireBarber(): Promise<CurrentUserAccess> {
  const access = await getCurrentUserAccess();

  if (!access) {
    redirect("/login");
  }

  if (access.role !== "barber") {
    redirect("/dashboard");
  }

  if (
    !access.businessId ||
    !access.barberId
  ) {
    redirect("/acesso");
  }

  return access;
}