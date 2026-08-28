"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  Check,
  Star,
  Trash2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

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

type Props = {
  initialReviews: Review[];
};

export default function ReviewsManager({
  initialReviews,
}: Props) {
  const supabase = createClient();

  const [reviews, setReviews] =
    useState<Review[]>(
      initialReviews,
    );

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [message, setMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  function approveReview(id: string) {
    setMessage("");
    setErrorMessage("");

    startTransition(async () => {
      const { error } =
        await supabase
          .from("reviews")
          .update({
            approved: true,
          })
          .eq("id", id);

      if (error) {
        console.error(
          "Erro ao aprovar avaliação:",
          error,
        );

        setErrorMessage(
          `Não foi possível aprovar a avaliação: ${error.message}`,
        );

        return;
      }

      setReviews((current) =>
        current.map((review) =>
          review.id === id
            ? {
                ...review,
                approved: true,
              }
            : review,
        ),
      );

      setMessage(
        "Avaliação aprovada com sucesso.",
      );
    });
  }

  function deleteReview(id: string) {
    const confirmed =
      window.confirm(
        "Tem certeza que deseja excluir esta avaliação?",
      );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setErrorMessage("");

    startTransition(async () => {
      const { error } =
        await supabase
          .from("reviews")
          .delete()
          .eq("id", id);

      if (error) {
        console.error(
          "Erro ao excluir avaliação:",
          error,
        );

        setErrorMessage(
          `Não foi possível excluir a avaliação: ${error.message}`,
        );

        return;
      }

      setReviews((current) =>
        current.filter(
          (review) =>
            review.id !== id,
        ),
      );

      setMessage(
        "Avaliação excluída com sucesso.",
      );
    });
  }

  const pending =
    reviews.filter(
      (review) =>
        !review.approved,
    );

  const approved =
    reviews.filter(
      (review) =>
        review.approved,
    );

  return (
    <div className="mt-10">
      {message && (
        <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {/* PENDENTES */}
      <section>
        <h2 className="text-xl font-semibold">
          Aguardando aprovação
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Avaliações novas que ainda não
          aparecem no site.
        </p>

        {pending.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-border bg-surface p-8 text-center">
            <p className="text-muted-foreground">
              Não há avaliações pendentes.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {pending.map(
              (review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isPending={isPending}
                  onApprove={() =>
                    approveReview(
                      review.id,
                    )
                  }
                  onDelete={() =>
                    deleteReview(
                      review.id,
                    )
                  }
                />
              ),
            )}
          </div>
        )}
      </section>

      {/* PUBLICADAS */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold">
          Avaliações publicadas
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Avaliações que já aparecem para
          os visitantes do site.
        </p>

        {approved.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-border bg-surface p-8 text-center">
            <p className="text-muted-foreground">
              Ainda não existem avaliações
              publicadas.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {approved.map(
              (review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isPending={isPending}
                  onDelete={() =>
                    deleteReview(
                      review.id,
                    )
                  }
                />
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function ReviewCard({
  review,
  isPending,
  onApprove,
  onDelete,
}: {
  review: Review;
  isPending: boolean;
  onApprove?: () => void;
  onDelete: () => void;
}) {
  const date =
    new Date(
      review.created_at,
    ).toLocaleDateString(
      "pt-BR",
    );

  return (
    <article className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">
            {review.customer_name ||
              "Cliente"}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Barbeiro:{" "}
            {review.barber_name ||
              "Não informado"}
          </p>
        </div>

        <div
          className="flex gap-1"
          aria-label={`${review.rating} de 5 estrelas`}
        >
          {Array.from({
            length: 5,
          }).map(
            (_, index) => (
              <Star
                key={index}
                className={`h-4 w-4 ${
                  index <
                  review.rating
                    ? "fill-gold text-gold"
                    : "text-muted-foreground"
                }`}
              />
            ),
          )}
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        “{review.comment}”
      </p>

      <p className="mt-5 text-xs uppercase tracking-widest text-muted-foreground">
        {date}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {!review.approved &&
          onApprove && (
            <button
              type="button"
              onClick={onApprove}
              disabled={
                isPending
              }
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-4 w-4" />

              Aprovar
            </button>
          )}

        <button
          type="button"
          onClick={onDelete}
          disabled={
            isPending
          }
          className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />

          {review.approved
            ? "Excluir"
            : "Recusar"}
        </button>
      </div>
    </article>
  );
}