"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Save,
  Scissors,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  saveBarber,
  toggleBarberStatus,
} from "@/lib/barbers-actions";

import { uploadBarberPhoto } from "@/lib/barber-photo-upload";

import type {
  Barber,
  BarberInput,
} from "@/lib/barbers-types";

type Props = {
  businessId: string;
  barbers: Barber[];
};

const emptyForm: BarberInput = {
  name: "",
  specialty: "",
  photo_url: "",
  active: true,
};

export default function BarbersManager({
  businessId,
  barbers,
}: Props) {
  const router = useRouter();

  const [form, setForm] = useState<BarberInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const [message, setMessage] = useState<null | {
    success: boolean;
    text: string;
  }>(null);

  const [photoError, setPhotoError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [isSaving, startSavingTransition] = useTransition();
  const [changingId, setChangingId] = useState<string | null>(
    null,
  );

  const activeCount = useMemo(
    () => barbers.filter((barber) => barber.active).length,
    [barbers],
  );

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage(null);
    setPhotoError("");
    setFormOpen(true);
  }

  function openEditForm(barber: Barber) {
    setEditingId(barber.id);

    setForm({
      id: barber.id,
      name: barber.name,
      specialty: barber.specialty ?? "",
      photo_url: barber.photo_url ?? "",
      active: barber.active,
    });

    setMessage(null);
    setPhotoError("");
    setFormOpen(true);
  }

  function closeForm() {
    if (isSaving || uploadingPhoto) {
      return;
    }

    setEditingId(null);
    setForm(emptyForm);
    setPhotoError("");
    setFormOpen(false);
  }

  async function handlePhotoUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadingPhoto(true);
    setPhotoError("");

    const result = await uploadBarberPhoto(
      businessId,
      file,
    );

    setUploadingPhoto(false);
    event.target.value = "";

    if (!result.success || !result.url) {
      setPhotoError(result.message);
      return;
    }

    setForm((current) => ({
      ...current,
      photo_url: result.url ?? "",
    }));
  }

  function removeSelectedPhoto() {
    if (uploadingPhoto || isSaving) {
      return;
    }

    setForm((current) => ({
      ...current,
      photo_url: "",
    }));

    setPhotoError("");
  }

  function handleSave() {
    setMessage(null);

    startSavingTransition(async () => {
      const result = await saveBarber(
        businessId,
        form,
      );

      setMessage({
        success: result.success,
        text: result.message,
      });

      if (result.success) {
        setEditingId(null);
        setForm(emptyForm);
        setPhotoError("");
        setFormOpen(false);
        router.refresh();
      }
    });
  }

  async function handleToggle(barber: Barber) {
    setChangingId(barber.id);
    setMessage(null);

    const result = await toggleBarberStatus(
      businessId,
      barber.id,
      !barber.active,
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
            Total de barbeiros
          </p>

          <p className="mt-3 font-display text-3xl text-gold">
            {barbers.length}
          </p>
        </article>

        <article className="card-premium p-5">
          <p className="text-sm text-muted-foreground">
            Profissionais ativos
          </p>

          <p className="mt-3 font-display text-3xl text-gold">
            {activeCount}
          </p>
        </article>

        <article className="card-premium p-5">
          <p className="text-sm text-muted-foreground">
            Profissionais inativos
          </p>

          <p className="mt-3 font-display text-3xl text-gold">
            {barbers.length - activeCount}
          </p>
        </article>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl">
            Equipe cadastrada
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Os profissionais ativos aparecem no site e no
            formulário de agendamento.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="btn-gold w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          Novo barbeiro
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

      {barbers.length === 0 ? (
        <section className="card-premium mt-6 flex flex-col items-center justify-center px-6 py-16 text-center">
          <UserRound className="h-10 w-10 text-gold" />

          <h3 className="mt-4 text-lg font-semibold">
            Nenhum barbeiro cadastrado
          </h3>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Cadastre o primeiro profissional da equipe.
          </p>
        </section>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {barbers.map((barber) => (
            <article
              key={barber.id}
              className={`card-premium overflow-hidden ${
                !barber.active ? "opacity-65" : ""
              }`}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
                {barber.photo_url ? (
                  <img
                    src={barber.photo_url}
                    alt={`Foto de ${barber.name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                <span
                  className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur ${
                    barber.active
                      ? "border-green-500/30 bg-green-500/20 text-green-200"
                      : "border-zinc-500/30 bg-black/60 text-zinc-300"
                  }`}
                >
                  {barber.active ? "Ativo" : "Inativo"}
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                    <Scissors className="h-5 w-5" />
                  </span>

                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-semibold">
                      {barber.name}
                    </h3>

                    <p className="mt-1 text-sm text-gold">
                      {barber.specialty ||
                        "Barbeiro profissional"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => openEditForm(barber)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold transition-colors hover:border-gold/50 hover:text-gold"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>

                  <button
                    type="button"
                    disabled={changingId === barber.id}
                    onClick={() => handleToggle(barber)}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      barber.active
                        ? "border-red-500/30 text-red-300 hover:bg-red-500/10"
                        : "border-green-500/30 text-green-300 hover:bg-green-500/10"
                    }`}
                  >
                    {changingId === barber.id && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {barber.active
                      ? "Desativar"
                      : "Ativar"}
                  </button>
                </div>
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
                  {editingId
                    ? "Editar barbeiro"
                    : "Novo barbeiro"}
                </p>

                <h2 className="mt-3 font-display text-3xl">
                  {editingId
                    ? "Atualizar profissional"
                    : "Cadastrar profissional"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={isSaving || uploadingPhoto}
                aria-label="Fechar"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="barber-name"
                  className="text-sm text-muted-foreground"
                >
                  Nome
                </label>

                <input
                  id="barber-name"
                  value={form.name}
                  disabled={isSaving || uploadingPhoto}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Ex.: Rafael Duarte"
                  className="mt-2 h-12 w-full rounded-lg border border-input bg-background px-4 outline-none transition-colors focus:border-gold disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="barber-specialty"
                  className="text-sm text-muted-foreground"
                >
                  Especialidade
                </label>

                <input
                  id="barber-specialty"
                  value={form.specialty}
                  disabled={isSaving || uploadingPhoto}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      specialty: event.target.value,
                    }))
                  }
                  placeholder="Ex.: Degradê e freestyle"
                  className="mt-2 h-12 w-full rounded-lg border border-input bg-background px-4 outline-none transition-colors focus:border-gold disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Foto do profissional
                </p>

                <label
                  htmlFor="barber-photo-upload"
                  className={`mt-2 flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 px-5 text-center transition-colors ${
                    uploadingPhoto || isSaving
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:border-gold/50"
                  }`}
                >
                  {uploadingPhoto ? (
                    <>
                      <Loader2 className="h-7 w-7 animate-spin text-gold" />

                      <span className="mt-3 text-sm font-semibold">
                        Enviando foto...
                      </span>

                      <span className="mt-1 text-xs text-muted-foreground">
                        Aguarde até o envio terminar.
                      </span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 text-gold" />

                      <span className="mt-3 text-sm font-semibold">
                        Selecionar imagem
                      </span>

                      <span className="mt-1 text-xs text-muted-foreground">
                        JPG, PNG ou WebP — máximo de 5 MB
                      </span>
                    </>
                  )}
                </label>

                <input
                  id="barber-photo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={isSaving || uploadingPhoto}
                  onChange={handlePhotoUpload}
                  className="sr-only"
                />

                {photoError && (
                  <p className="mt-2 text-sm text-destructive">
                    {photoError}
                  </p>
                )}
              </div>

              {form.photo_url && (
                <div>
                  <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border bg-secondary">
                    <img
                      src={form.photo_url}
                      alt="Prévia da foto do barbeiro"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isSaving || uploadingPhoto}
                    onClick={removeSelectedPhoto}
                    className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-500/30 px-4 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover foto
                  </button>
                </div>
              )}

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border p-4">
                <span>
                  <span className="block font-semibold">
                    Profissional ativo
                  </span>

                  <span className="mt-1 block text-sm text-muted-foreground">
                    Profissionais ativos ficam disponíveis
                    para agendamento.
                  </span>
                </span>

                <input
                  type="checkbox"
                  checked={form.active}
                  disabled={isSaving || uploadingPhoto}
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
                disabled={isSaving || uploadingPhoto}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || uploadingPhoto}
                className="btn-gold min-h-12 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}

                {isSaving
                  ? "Salvando..."
                  : uploadingPhoto
                    ? "Enviando foto..."
                    : "Salvar barbeiro"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}