import { Suspense } from "react";
import { redirect } from "next/navigation";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

import { getCurrentUserAccess } from "@/lib/auth-role";
import { createClient } from "@/lib/supabase/server";

type Business = {
  id: string;
  name: string;
  primary_color: string | null;
};

async function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getCurrentUserAccess();

  if (!access) {
    redirect("/login");
  }

  if (
    access.role === "customer" ||
    access.role === "unauthorized"
  ) {
    redirect("/acesso");
  }

  if (!access.businessId) {
    redirect("/acesso");
  }

  const supabase = await createClient();

  const {
    data: business,
    error: businessError,
  } = await supabase
    .from("businesses")
    .select(`
      id,
      name,
      primary_color
    `)
    .eq("id", access.businessId)
    .maybeSingle();

  if (businessError || !business) {
    redirect("/acesso");
  }

  const currentBusiness =
    business as Business;

  const primaryColor =
    currentBusiness.primary_color ||
    "#d4af37";

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={
        {
          "--business-primary":
            primaryColor,
        } as React.CSSProperties
      }
    >
      <DashboardSidebar
        businessName={currentBusiness.name}
        role={access.role}
      />

      <div className="min-h-screen lg:pl-72">
        {children}
      </div>
    </div>
  );
}

function DashboardLayoutLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-72 lg:border-r lg:border-border lg:bg-surface" />

      <div className="min-h-screen lg:pl-72">
        <div className="animate-pulse p-6">
          <div className="h-8 w-60 rounded bg-surface-2" />
          <div className="mt-4 h-5 w-96 max-w-full rounded bg-surface-2" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <DashboardLayoutLoading />
      }
    >
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </Suspense>
  );
}