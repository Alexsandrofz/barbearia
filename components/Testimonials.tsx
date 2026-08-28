"use client";

import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { createClient } from "@/lib/supabase/client";

type Review = {
  id: string;
  customer_name: string | null;
  rating: number;
  comment: string;
  created_at: string;
  barber_id: string | null;
};

type Barber = {
  id: string;
  name: string;
};

export default function Testimonials() {
  const supabase = createClient();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);

  const [name, setName] = useState("");
  const [barberId, setBarberId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function loadReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, customer_name, rating, comment, created_at, barber_id")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
  }

  async function loadBarbers() {
    const { data, error } = await supabase
      .from("barbers")
      .select("id, name")
      .eq("active", true)
      .order("name");

    if (!error && data) {
      setBarbers(data);
    }
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      await Promise.all([loadReviews(), loadBarbers()]);

      setLoading(false);
    }

    loadData();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setMessage("");

    if (!name.trim()) {
      setMessage("Digite seu nome.");
      return;
    }

    if (!barberId) {
      setMessage("Selecione o barbeiro que realizou seu atendimento.");
      return;
    }

    if (!comment.trim()) {
      setMessage("Escreva um comentário.");
      return;
    }

    setSending(true);

    const { error } = await supabase.from("reviews").insert({
      business_id: "6f034b0f-13b0-4877-8f29-388b1b43c129",
      customer_id: null,
      customer_name: name.trim(),
      barber_id: barberId,
      rating,
      comment: comment.trim(),
      approved: false,
    });

    setSending(false);

    if (error) {
      console.error("ERRO AO ENVIAR AVALIAÇÃO:", error);
      setMessage(`Erro: ${error.message}`);
      return;
    }

    setName("");
    setBarberId("");
    setRating(5);
    setComment("");

    setMessage("Avaliação enviada! Ela será publicada após a aprovação.");
  }

  return (
    <section
      id="avaliacoes"
      className="scroll-mt-20 border-y border-border/60 bg-surface py-20 sm:py-24 lg:py-32"
    >
      <div className="section-shell">
        <SectionHeading
          eyebrow="Avaliações"
          title="O que nossos clientes dizem"
          align="center"
        />

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border/60 bg-background p-6 sm:mt-14 sm:p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold">Avalie seu atendimento</h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Conte como foi sua experiência. Não é necessário criar uma conta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Seu nome</label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition focus:border-gold"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Barbeiro que realizou seu atendimento
              </label>

              <select
                value={barberId}
                onChange={(e) => setBarberId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition focus:border-gold"
              >
                <option value="">Selecione o barbeiro</option>

                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Sua avaliação
              </label>

              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      aria-label={`${value} estrelas`}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          value <= rating
                            ? "fill-gold text-gold"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Comentário
              </label>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte como foi sua experiência..."
                rows={4}
                className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 outline-none transition focus:border-gold"
              />
            </div>

            {message && (
              <p className="rounded-lg border border-border/60 bg-surface px-4 py-3 text-sm">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-lg bg-gold px-5 py-3 font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Enviando..." : "Enviar avaliação"}
            </button>
          </form>
        </div>

        <div className="mt-12 sm:mt-16">
          {loading ? (
            <p className="text-center text-muted-foreground">
              Carregando avaliações...
            </p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Ainda não temos avaliações publicadas.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <li key={review.id} className="card-premium flex flex-col p-6">
                  <Quote
                    className="h-6 w-6 shrink-0 text-gold"
                    strokeWidth={1.5}
                    aria-hidden
                  />

                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    “{review.comment}”
                  </p>

                  <div className="mt-6">
                    <div
                      className="flex gap-1"
                      aria-label={`${review.rating} de 5 estrelas`}
                    >
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${
                            index < review.rating
                              ? "fill-gold text-gold"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="mt-3 font-semibold">
                      {review.customer_name || "Cliente"}
                    </p>

                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Cliente da Barbearia
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
