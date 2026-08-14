"use client";

import {
  CheckCircle2,
  ImageIcon,
  Loader2,
  Save,
  Scissors,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import {
  updateBarberProfile,
  updateBarberProfilePhoto,
} from "@/lib/barber-profile-actions";

import {
  uploadBarberPhoto,
} from "@/lib/barber-photo-upload";

type Props = {
  businessId: string;
  name: string;
  specialty: string | null;
  email: string;
  photoUrl: string | null;
  active: boolean;
};

export default function BarberProfileForm({
  businessId,
  name,
  specialty,
  email,
  photoUrl,
  active,
}: Props) {
  const router =
    useRouter();

  const [formName, setFormName] =
    useState(name);

  const [
    formSpecialty,
    setFormSpecialty,
  ] = useState(
    specialty ?? "",
  );

  const [
    currentPhotoUrl,
    setCurrentPhotoUrl,
  ] = useState(
    photoUrl ?? "",
  );

  const [
    isSaving,
    startTransition,
  ] = useTransition();

  const [
    uploadingPhoto,
    setUploadingPhoto,
  ] = useState(false);

  const [
    photoMessage,
    setPhotoMessage,
  ] = useState<null | {
    success: boolean;
    text: string;
  }>(null);

  const [
    message,
    setMessage,
  ] = useState<null | {
    success: boolean;
    text: string;
  }>(null);

  function handleSave() {
    setMessage(null);

    startTransition(
      async () => {
        const result =
          await updateBarberProfile(
            {
              name: formName,
              specialty:
                formSpecialty,
            },
          );

        setMessage({
          success:
            result.success,
          text: result.message,
        });

        if (
          result.success
        ) {
          router.refresh();
        }
      },
    );
  }

  async function handlePhotoUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadingPhoto(true);
    setPhotoMessage(null);

    const uploadResult =
      await uploadBarberPhoto(
        businessId,
        file,
      );

    event.target.value = "";

    if (
      !uploadResult.success ||
      !uploadResult.url
    ) {
      setUploadingPhoto(false);

      setPhotoMessage({
        success: false,
        text:
          uploadResult.message,
      });

      return;
    }

    const updateResult =
      await updateBarberProfilePhoto(
        uploadResult.url,
      );

    setUploadingPhoto(false);

    setPhotoMessage({
      success:
        updateResult.success,
      text:
        updateResult.message,
    });

    if (
      updateResult.success
    ) {
      setCurrentPhotoUrl(
        uploadResult.url,
      );

      router.refresh();
    }
  }

  async function handleRemovePhoto() {
    setUploadingPhoto(true);
    setPhotoMessage(null);

    const result =
      await updateBarberProfilePhoto(
        "",
      );

    setUploadingPhoto(false);

    setPhotoMessage({
      success:
        result.success,
      text:
        result.message,
    });

    if (
      result.success
    ) {
      setCurrentPhotoUrl("");
      router.refresh();
    }
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="card-premium overflow-hidden">
        <div className="relative aspect-square bg-secondary">
          {currentPhotoUrl ? (
            <img
              src={currentPhotoUrl}
              alt={`Foto de ${name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center">
              <UserRound className="h-20 w-20 text-muted-foreground" />
            </div>
          )}

          <span
            className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur ${
              active
                ? "border-green-500/30 bg-green-500/20 text-green-200"
                : "border-zinc-500/30 bg-black/60 text-zinc-300"
            }`}
          >
            {active
              ? "Ativo"
              : "Inativo"}
          </span>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
              <Scissors className="h-5 w-5" />
            </span>

            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold">
                {name}
              </h2>

              <p className="mt-1 text-sm text-gold">
                {specialty ||
                  "Barbeiro profissional"}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Foto do perfil
            </p>

            <label
              htmlFor="profile-photo-upload"
              className={`mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gold/30 px-4 text-sm font-semibold text-gold transition-colors ${
                uploadingPhoto
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:bg-gold/10"
              }`}
            >
              {uploadingPhoto ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}

              {uploadingPhoto
                ? "Enviando..."
                : "Trocar foto"}
            </label>

            <input
              id="profile-photo-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={
                uploadingPhoto
              }
              onChange={
                handlePhotoUpload
              }
              className="sr-only"
            />

            {currentPhotoUrl && (
              <button
                type="button"
                disabled={
                  uploadingPhoto
                }
                onClick={
                  handleRemovePhoto
                }
                className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 px-4 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remover foto
              </button>
            )}

            {photoMessage && (
              <p
                className={`mt-3 text-sm ${
                  photoMessage.success
                    ? "text-green-300"
                    : "text-destructive"
                }`}
              >
                {photoMessage.text}
              </p>
            )}
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Conta de acesso
            </p>

            <p className="mt-2 break-all text-sm">
              {email}
            </p>
          </div>
        </div>
      </aside>

      <section className="card-premium p-6 sm:p-8">
        <div>
          <p className="eyebrow">
            Dados profissionais
          </p>

          <h2 className="mt-3 font-display text-2xl sm:text-3xl">
            Informações do perfil
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Essas informações também podem aparecer para os clientes no site da barbearia.
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="profile-name"
              className="text-sm text-muted-foreground"
            >
              Nome
            </label>

            <input
              id="profile-name"
              value={
                formName
              }
              disabled={
                isSaving
              }
              onChange={(
                event,
              ) =>
                setFormName(
                  event.target
                    .value,
                )
              }
              className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 outline-none transition-colors focus:border-gold disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="profile-specialty"
              className="text-sm text-muted-foreground"
            >
              Especialidade
            </label>

            <input
              id="profile-specialty"
              value={
                formSpecialty
              }
              disabled={
                isSaving
              }
              onChange={(
                event,
              ) =>
                setFormSpecialty(
                  event.target
                    .value,
                )
              }
              placeholder="Ex.: Degradê, barba e freestyle"
              className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 outline-none transition-colors focus:border-gold disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="profile-email"
              className="text-sm text-muted-foreground"
            >
              E-mail de acesso
            </label>

            <input
              id="profile-email"
              value={email}
              disabled
              className="mt-2 h-12 w-full cursor-not-allowed rounded-xl border border-input bg-secondary/30 px-4 text-muted-foreground opacity-70"
            />
          </div>

          <div className="rounded-xl border border-border p-4">
            <p className="font-semibold">
              Status profissional
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {active
                ? "Seu perfil está ativo e disponível para agendamentos."
                : "Seu perfil está desativado para novos agendamentos."}
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              A ativação e desativação é controlada pelo administrador da barbearia.
            </p>
          </div>
        </div>

        {message && (
          <p
            role="status"
            className={`mt-6 flex items-center gap-2 text-sm ${
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

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            disabled={
              isSaving
            }
            onClick={
              handleSave
            }
            className="btn-gold min-h-12 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}

            {isSaving
              ? "Salvando..."
              : "Salvar alterações"}
          </button>
        </div>
      </section>
    </div>
  );
}