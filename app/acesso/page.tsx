import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getCurrentUserAccess } from "@/lib/auth-role";

async function AccessContent(): Promise<React.ReactNode> {
  const access = await getCurrentUserAccess();

  if (!access) {
    redirect("/login");
  }

  if (
    access.role === "owner" ||
    access.role === "manager"
  ) {
    redirect("/dashboard");
  }

  if (access.role === "barber") {
    redirect("/dashboard/barbeiro");
  }

  if (access.role === "customer") {
    redirect("/");
  }

  redirect("/");

  return null;
}

function AccessLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />

        <p className="mt-4 text-sm text-muted-foreground">
          Verificando seu acesso...
        </p>
      </div>
    </main>
  );
}

export default function AccessPage() {
  return (
    <Suspense fallback={<AccessLoading />}>
      <AccessContent />
    </Suspense>
  );
}