"use client";

import { useMemo, useState, useTransition } from "react";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Pencil,
  Plus,
  Save,
  Scissors,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  saveService,
  toggleServiceStatus,
} from "@/lib/services-actions";
import type {
  Service,
  ServiceInput,
} from "@/lib/services-types";

type Props = {
  businessId: string;
  services: Service[];
};

const emptyForm: ServiceInput = {
  name: "",
  description: "",
  price: 0,
  duration_minutes: 30,
  active: true,
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

export default function ServicesManager({
  businessId,
  services,
}: Props) {
  const router = useRouter();

  const [form, setForm] = useState<ServiceInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const [message, setMessage] = useState<null | {
    success: boolean;
    text: string;
  }>(null);

  const [isSaving, startSavingTransition] = useTransition();
  const [changingId, setChangingId] = useState<string | null>(null);

  const activeCount = useMemo(
    () => services.filter((service) => service.active).length,
    [services],
  );

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage(null);
    setFormOpen(true);
  }

  function openEditForm(service: Service) {
    setEditingId(service.id);

    setForm({
      id: service.id,
      name: service.name,
      description: service.description ?? "",
      price: Number(service.price),
      duration_minutes: service.duration_minutes,
      active: service.active,
    });

    setMessage(null);
    setFormOpen(true);
  }

  function closeForm() {
    if (isSaving) {
      return;
    }

    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(false);
  }

  function handleSave() {
    setMessage(null);

    startSavingTransition(async () => {
      const result = await saveService(businessId, form);

      setMessage({
        success: result.success,
        text: result.message,
      });

      if (result.success) {
        setEditingId(null);
        setForm(emptyForm);
        setFormOpen(false);
        router.refresh();
      }
    });
  }

  async function handleToggle(service: Service) {
    setChangingId(service.id);
    setMessage(null);

    const result = await toggleServiceStatus(
      businessId,
      service.id,
      !service.active,
    );

    setChangingId(null);

    setMessage({
      success: result.success,
      text: result.message,
    });

    if (result.success) {
      router.refresh();
    }
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="card-premium p-5">
          <p className="text-sm text-muted-foreground">
            Total de serviços
          </p>

          <p className="mt-3 font-display text-3xl text-gold">
            {services.length}
          </p>
        </article>

        <article className="card-premium p-5">
          <p className="text-sm text-muted-foreground">
            Serviços ativos
          </p>

          <p className="mt-3 font-display text-3xl text-gold">
            {activeCount}
          </p>
        </article>

        <article className="card-premium p-5">
          <p className="text-sm text-muted-foreground">
            Serviços inativos
          </p>

          <p className="mt-3 font-display text-3xl text-gold">
            {services.length - activeCount}
          </p>
        </article>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl">
            Serviços cadastrados
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Os serviços ativos aparecem automaticamente no site público.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="btn-gold w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          Novo serviço
        </button>
      </div>

      {message && (
        <p
          role="status"
          className={`mt-5 inline-flex items-center gap-2 text-sm ${
            message.success
              ? "text-green-300"
              : "text-destructive"
          }`}
        >
          {message.success && (
            <CheckCircle2 className="h-4 w-4" />
          )}

          {message.text}
        </p>
      )}

      {services.length === 0 ? (
        <section className="card-premium mt-6 flex flex-col items-center justify-center px-6 py-16 text-center">
          <Scissors className="h-10 w-10 text-gold" />

          <h3 className="mt-4 text-lg font-semibold">
            Nenhum serviço cadastrado
          </h3>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Cadastre o primeiro serviço oferecido pela barbearia.
          </p>
        </section>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.id}
              className={`card-premium flex flex-col p-6 ${
                !service.active ? "opacity-65" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                  <Scissors className="h-5 w-5" />
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    service.active
                      ? "border-green-500/30 bg-green-500/10 text-green-300"
                      : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"
                  }`}
                >
                  {service.active ? "Ativo" : "Inativo"}
                </span>
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                {service.name}
              </h3>

              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {service.description ||
                  "Nenhuma descrição informada."}
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
                <p className="font-display text-xl text-gold">
                  {formatPrice(Number(service.price))}
                </p>

                <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  {service.duration_minutes} min
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => openEditForm(service)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold transition-colors hover:border-gold/50 hover:text-gold"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>

                <button
                  type="button"
                  disabled={changingId === service.id}
                  onClick={() => handleToggle(service)}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    service.active
                      ? "border-red-500/30 text-red-300 hover:bg-red-500/10"
                      : "border-green-500/30 text-green-300 hover:bg-green-500/10"
                  }`}
                >
                  {changingId === service.id && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {service.active ? "Desativar" : "Ativar"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fechar formulário"
            onClick={closeForm}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <section className="card-premium relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">
                  {editingId ? "Editar serviço" : "Novo serviço"}
                </p>

                <h2 className="mt-3 font-display text-3xl">
                  {editingId
                    ? "Atualizar serviço"
                    : "Cadastrar serviço"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={isSaving}
                aria-label="Fechar"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="service-name"
                  className="text-sm text-muted-foreground"
                >
                  Nome
                </label>

                <input
                  id="service-name"
                  value={form.name}
                  disabled={isSaving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Ex.: Corte clássico"
                  className="mt-2 h-12 w-full rounded-lg border border-input bg-background px-4 outline-none transition-colors focus:border-gold"
                />
              </div>

              <div>
                <label
                  htmlFor="service-description"
                  className="text-sm text-muted-foreground"
                >
                  Descrição
                </label>

                <textarea
                  id="service-description"
                  rows={4}
                  value={form.description}
                  disabled={isSaving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Descreva o que está incluído no serviço."
                  className="mt-2 w-full rounded-lg border border-input bg-background p-4 outline-none transition-colors focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="service-price"
                    className="text-sm text-muted-foreground"
                  >
                    Preço
                  </label>

                  <input
                    id="service-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    disabled={isSaving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        price: Number(event.target.value),
                      }))
                    }
                    className="mt-2 h-12 w-full rounded-lg border border-input bg-background px-4 outline-none transition-colors focus:border-gold"
                  />
                </div>

                <div>
                  <label
                    htmlFor="service-duration"
                    className="text-sm text-muted-foreground"
                  >
                    Duração em minutos
                  </label>

                  <input
                    id="service-duration"
                    type="number"
                    min="5"
                    step="5"
                    value={form.duration_minutes}
                    disabled={isSaving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        duration_minutes: Number(
                          event.target.value,
                        ),
                      }))
                    }
                    className="mt-2 h-12 w-full rounded-lg border border-input bg-background px-4 outline-none transition-colors focus:border-gold"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border p-4">
                <span>
                  <span className="block font-semibold">
                    Serviço ativo
                  </span>

                  <span className="mt-1 block text-sm text-muted-foreground">
                    Serviços ativos ficam disponíveis para agendamento.
                  </span>
                </span>

                <input
                  type="checkbox"
                  checked={form.active}
                  disabled={isSaving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      active: event.target.checked,
                    }))
                  }
                  className="h-5 w-5 accent-[#d4af37]"
                />
              </label>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={isSaving}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="btn-gold min-h-12 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}

                {isSaving ? "Salvando..." : "Salvar serviço"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}