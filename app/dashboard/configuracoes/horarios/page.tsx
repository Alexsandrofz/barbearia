import { Suspense } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getBusinessHours } from "@/lib/business-hours";
import BusinessHoursForm from "@/components/dashboard/BusinessHoursForm";

type Business = {
  id: string;
  name: string;
};

async function BusinessHoursContent() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("business_members")
    .select(
      `
      role,
      business:businesses (
        id,
        name
      )
    `,
    )
    .eq("user_id", user.id)
    .eq("active", true)
    .single();

  if (membershipError || !membership) {
    redirect("/dashboard");
  }

  const business = (
    Array.isArray(membership.business)
      ? membership.business[0]
      : membership.business
  ) as Business | null;

  if (!business) {
    redirect("/dashboard");
  }

  const hours = await getBusinessHours(business.id);

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <p className="eyebrow">Configurações</p>

        <h1 className="mt-3 font-display text-3xl sm:text-4xl">
          Horários de funcionamento
        </h1>

        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Configure os dias e horários da {business.name}.
        </p>

        <BusinessHoursForm
          business={business}
          hours={hours}
        />
      </div>
    </main>
  );
}

function BusinessHoursLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-5xl animate-pulse">
        <div className="h-4 w-32 rounded bg-surface-2" />

        <div className="mt-4 h-10 w-96 max-w-full rounded bg-surface-2" />

        <div className="mt-3 h-5 w-80 max-w-full rounded bg-surface-2" />

        <div className="mt-10 space-y-5">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="h-40 rounded-2xl border border-border bg-surface"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function BusinessHoursPage() {
  return (
    <Suspense fallback={<BusinessHoursLoading />}>
      <BusinessHoursContent />
    </Suspense>
  );
}