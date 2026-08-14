import { Suspense } from "react";
import { notFound } from "next/navigation";

import CustomerProfile from "@/components/dashboard/CustomerProfile";

import { requireManagement } from "@/lib/route-access";

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
  /*
   * Somente owner e manager podem
   * acessar os dados dos clientes.
   *
   * requireManagement também verifica:
   * - se existe usuário logado;
   * - se ele pertence à barbearia;
   * - se possui businessId.
   */
  const access = await requireManagement();

  const businessId = access.businessId;

  /*
   * Essa verificação também ajuda o
   * TypeScript a entender que businessId
   * definitivamente é uma string.
   */
  if (!businessId) {
    throw new Error(
      "Barbearia não encontrada para o usuário atual.",
    );
  }

  const [customer, loyaltySettings] =
    await Promise.all([
      getCustomerProfile(
        businessId,
        customerId,
      ),

      getLoyaltySettings(
        businessId,
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