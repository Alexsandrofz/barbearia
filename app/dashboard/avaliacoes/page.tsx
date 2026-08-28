import { Suspense } from "react";
import { Star } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireManagement } from "@/lib/route-access";
import ReviewsManager from "@/components/dashboard/ReviewsManager";

type Review = {
  id: string;
  customer_name: string | null;
  rating: number;
  comment: string;
  approved: boolean;
  created_at: string;
  barber_id: string | null;
  barber_name: string | null;
};

async function ReviewsContent() {
  const access = await requireManagement();

  if (!access.businessId) {
    throw new Error("Barbearia não encontrada.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      customer_name,
      rating,
      comment,
      approved,
      created_at,
      barber_id,
      barbers (
        name
      )
    `)
    .eq("business_id", access.businessId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "Erro ao carregar avaliações:",
      error,
    );

    return (
      <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
        <div className="mx-auto w-full max-w-7xl">
          <p className="eyebrow">
            Relacionamento
          </p>

          <h1 className="mt-3 font-display text-3xl sm:text-4xl">
            Avaliações
          </h1>

          <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            Não foi possível carregar as avaliações.
          </p>
        </div>
      </main>
    );
  }

  const reviews: Review[] = (data ?? []).map(
    (review: any) => ({
      id: review.id,
      customer_name: review.customer_name,
      rating: review.rating,
      comment: review.comment,
      approved: review.approved,
      created_at: review.created_at,
      barber_id: review.barber_id,
      barber_name:
        review.barbers?.name ?? null,
    }),
  );

  const average =
    reviews.length > 0
      ? reviews.reduce(
          (sum, review) =>
            sum + review.rating,
          0,
        ) / reviews.length
      : 0;

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <p className="eyebrow">
          Relacionamento
        </p>

        <h1 className="mt-3 font-display text-3xl sm:text-4xl">
          Avaliações
        </h1>

        <p className="mt-2 max-w-2xl text-muted-foreground">
          Gerencie as avaliações enviadas pelos
          clientes da barbearia.
        </p>

        {/* RESUMO */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-sm text-muted-foreground">
              Total de avaliações
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {reviews.length}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-sm text-muted-foreground">
              Pendentes
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {
                reviews.filter(
                  (review) =>
                    !review.approved,
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-sm text-muted-foreground">
              Média
            </p>

            <div className="mt-2 flex items-center gap-2">
              <p className="text-3xl font-semibold">
                {average.toFixed(1)}
              </p>

              <Star className="h-6 w-6 fill-gold text-gold" />
            </div>
          </div>
        </div>

        {/* GERENCIAMENTO */}
        <ReviewsManager
          initialReviews={reviews}
        />
      </div>
    </main>
  );
}

function ReviewsLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl animate-pulse">
        <div className="h-4 w-32 rounded bg-surface-2" />

        <div className="mt-4 h-10 w-56 rounded bg-surface-2" />

        <div className="mt-3 h-5 w-96 max-w-full rounded bg-surface-2" />

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-28 rounded-2xl border border-border bg-surface"
              />
            ),
          )}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {Array.from({ length: 2 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-64 rounded-2xl border border-border bg-surface"
              />
            ),
          )}
        </div>
      </div>
    </main>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense
      fallback={
        <ReviewsLoading />
      }
    >
      <ReviewsContent />
    </Suspense>
  );
}