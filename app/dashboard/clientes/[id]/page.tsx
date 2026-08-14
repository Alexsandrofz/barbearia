import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";

import CustomerProfile from "@/components/dashboard/CustomerProfile";

import { getCurrentUserAccess } from "@/lib/auth-role";

import {
  getCustomerMetrics,
  getCustomerProfile,
} from "@/lib/customer-profile";

import { getLoyaltySettings } from "@/lib/loyalty";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function CustomerProfileContent({
  customerId,
}: {
  customerId: string;
}) {
  const access =
    await getCurrentUserAccess();

  if (!access) {
    redirect("/login");
  }

  if (
    access.role !== "owner" &&
    access.role !== "manager"
  ) {
    redirect("/acesso");
  }

  if (!access.businessId) {
    redirect("/dashboard");
  }

  const [customer, loyaltySettings] =
    await Promise.all([
      getCustomerProfile(
        access.businessId,
        customerId,
      ),
      getLoyaltySettings(
        access.businessId,
      ),
    ]);

  if (!customer) {
    notFound();
  }

  const metrics =
    getCustomerMetrics(customer);

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <CustomerProfile
          customer={customer}
          metrics={metrics}
          loyaltySettings={
            loyaltySettings
          }
        />
      </div>
    </main>
  );
}

function CustomerProfileLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-6xl animate-pulse">
        <div className="h-5 w-40 rounded bg-surface-2" />

        <div className="mt-6 h-72 rounded-2xl border border-border bg-surface" />

        <div className="mt-6 h-64 rounded-2xl border border-border bg-surface" />

        <div className="mt-6 h-96 rounded-2xl border border-border bg-surface" />
      </div>
    </main>
  );
}

export default async function CustomerPage({
  params,
}: Props) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <CustomerProfileLoading />
      }
    >
      <CustomerProfileContent
        customerId={id}
      />
    </Suspense>
  );
}