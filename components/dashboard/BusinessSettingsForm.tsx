"use client";

import {
  Building2,
  CheckCircle2,
  Globe2,
  ImageIcon,
  Instagram,
  Loader2,
  Mail,
  MapPin,
  Palette,
  Phone,
  Save,
  Store,
  Trash2,
  Upload,
} from "lucide-react";

import {
  useState,
  useTransition,
} from "react";

import {
  saveBusinessSettings,
  type BusinessSettingsInput,
} from "@/lib/business-settings-actions";

import {
  uploadBusinessLogo,
} from "@/lib/business-logo-upload";

type BusinessSettings = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  instagram: string | null;
  description: string | null;
  logo_url: string | null;
  primary_color: string | null;
  active: boolean;
};

type Props = {
  business: BusinessSettings;
};

export default function BusinessSettingsForm({
  business,
}: Props) {
  const [
    form,
    setForm,
  ] = useState<BusinessSettingsInput>({
    name:
      business.name ?? "",

    slug:
      business.slug ?? "",

    phone:
      business.phone ?? "",

    whatsapp:
      business.whatsapp ?? "",

    email:
      business.email ?? "",

    address:
      business.address ?? "",

    instagram:
      business.instagram ?? "",

    description:
      business.description ?? "",

    logo_url:
      business.logo_url ?? "",

    primary_color:
      business.primary_color ??
      "#d4af37",

    active:
      business.active,
  });

  const [
    message,
    setMessage,
  ] = useState<null | {
    success: boolean;
    text: string;
  }>(null);

  const [
    logoMessage,
    setLogoMessage,
  ] = useState<null | {
    success: boolean;
    text: string;
  }>(null);

  const [
    isSaving,
    startSavingTransition,
  ] = useTransition();

  const [
    isUploadingLogo,
    setIsUploadingLogo,
  ] = useState(false);

  function updateField<
    K extends keyof BusinessSettingsInput,
  >(
    key: K,
    value: BusinessSettingsInput[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleLogoUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploadingLogo(true);
    setLogoMessage(null);

    const formData =
      new FormData();

    formData.append(
      "file",
      file,
    );

    const result =
      await uploadBusinessLogo(
        business.id,
        formData,
      );

    event.target.value = "";

    setIsUploadingLogo(false);

    if (
      !result.success ||
      !result.url
    ) {
      setLogoMessage({
        success: false,
        text:
          result.message,
      });

      return;
    }

    updateField(
      "logo_url",
      result.url,
    );

    setLogoMessage({
      success: true,
      text:
        "Logo enviada. Clique em Salvar configurações para confirmar.",
    });
  }

  function removeLogo() {
    if (
      isSaving ||
      isUploadingLogo
    ) {
      return;
    }

    updateField(
      "logo_url",
      "",
    );

    setLogoMessage({
      success: true,
      text:
        "Logo removida. Clique em Salvar configurações para confirmar.",
    });
  }

  function handleSave() {
    setMessage(null);

    startSavingTransition(
      async () => {
        const result =
          await saveBusinessSettings(
            form,
          );

        setMessage({
          success:
            result.success,
          text:
            result.message,
        });
      },
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      {/* PREVIEW */}
      <aside className="space-y-5">
        <section className="card-premium overflow-hidden">
          <div className="relative aspect-square bg-secondary">
            {form.logo_url ? (
              <img
                src={
                  form.logo_url
                }
                alt="Logo da barbearia"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center">
                <div className="text-center">
                  <Store className="mx-auto h-14 w-14 text-gold" />

                  <p className="mt-3 text-sm text-muted-foreground">
                    Sem logo
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Prévia
            </p>

            <h2 className="mt-2 font-display text-2xl">
              {form.name ||
                "Nome da barbearia"}
            </h2>

            <p className="mt-2 break-all text-xs text-muted-foreground">
              /{form.slug ||
                "sua-barbearia"}
            </p>

            {form.description && (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {
                  form.description
                }
              </p>
            )}
          </div>
        </section>

        <section className="card-premium p-5">
          <div className="flex items-center gap-3">
            <span
              className="grid h-12 w-12 place-items-center rounded-xl border"
              style={{
                borderColor:
                  form.primary_color ||
                  "#d4af37",

                color:
                  form.primary_color ||
                  "#d4af37",

                backgroundColor:
                  `${form.primary_color || "#d4af37"}18`,
              }}
            >
              <Palette className="h-5 w-5" />
            </span>

            <div>
              <p className="text-sm font-semibold">
                Cor principal
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {
                  form.primary_color
                }
              </p>
            </div>
          </div>

          <div
            className="mt-5 h-3 w-full rounded-full"
            style={{
              backgroundColor:
                form.primary_color ||
                "#d4af37",
            }}
          />
        </section>

        <section
          className={`rounded-2xl border p-5 ${
            form.active
              ? "border-green-500/20 bg-green-500/5"
              : "border-red-500/20 bg-red-500/5"
          }`}
        >
          <p
            className={`font-semibold ${
              form.active
                ? "text-green-300"
                : "text-red-300"
            }`}
          >
            {form.active
              ? "Barbearia ativa"
              : "Barbearia inativa"}
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            {form.active
              ? "O estabelecimento está marcado como ativo no sistema."
              : "O estabelecimento está marcado como inativo."}
          </p>
        </section>
      </aside>

      {/* FORMULÁRIO */}
      <section className="card-premium p-6 sm:p-8">
        <div>
          <p className="eyebrow">
            Informações comerciais
          </p>

          <h2 className="mt-3 font-display text-2xl sm:text-3xl">
            Perfil da barbearia
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Essas informações poderão ser usadas no site,
            painel e contato com os clientes.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* NOME */}
          <div>
            <label
              htmlFor="business-name"
              className="text-sm text-muted-foreground"
            >
              Nome da barbearia
            </label>

            <div className="relative mt-2">
              <Building2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                id="business-name"
                value={
                  form.name
                }
                disabled={
                  isSaving ||
                  isUploadingLogo
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "name",
                    event.target
                      .value,
                  )
                }
                placeholder="Ex.: Navalha Real"
                className="h-12 w-full rounded-lg border border-input bg-background pl-12 pr-4 outline-none transition-colors focus:border-gold disabled:opacity-60"
              />
            </div>
          </div>

          {/* SLUG */}
          <div>
            <label
              htmlFor="business-slug"
              className="text-sm text-muted-foreground"
            >
              Identificador / slug
            </label>

            <div className="relative mt-2">
              <Globe2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                id="business-slug"
                value={
                  form.slug
                }
                disabled={
                  isSaving ||
                  isUploadingLogo
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "slug",
                    event.target
                      .value,
                  )
                }
                placeholder="navalha-real"
                className="h-12 w-full rounded-lg border border-input bg-background pl-12 pr-4 outline-none transition-colors focus:border-gold disabled:opacity-60"
              />
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Utilize letras, números e hífens.
            </p>
          </div>

          {/* TELEFONE + WHATSAPP */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="business-phone"
                className="text-sm text-muted-foreground"
              >
                Telefone
              </label>

              <div className="relative mt-2">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="business-phone"
                  value={
                    form.phone
                  }
                  disabled={
                    isSaving ||
                    isUploadingLogo
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "phone",
                      event.target
                        .value,
                    )
                  }
                  placeholder="(79) 99999-9999"
                  className="h-12 w-full rounded-lg border border-input bg-background pl-12 pr-4 outline-none transition-colors focus:border-gold disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="business-whatsapp"
                className="text-sm text-muted-foreground"
              >
                WhatsApp
              </label>

              <div className="relative mt-2">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="business-whatsapp"
                  value={
                    form.whatsapp
                  }
                  disabled={
                    isSaving ||
                    isUploadingLogo
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "whatsapp",
                      event.target
                        .value,
                    )
                  }
                  placeholder="5579999999999"
                  className="h-12 w-full rounded-lg border border-input bg-background pl-12 pr-4 outline-none transition-colors focus:border-gold disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label
              htmlFor="business-email"
              className="text-sm text-muted-foreground"
            >
              E-mail comercial
            </label>

            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                id="business-email"
                type="email"
                value={
                  form.email
                }
                disabled={
                  isSaving ||
                  isUploadingLogo
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "email",
                    event.target
                      .value,
                  )
                }
                placeholder="contato@barbearia.com"
                className="h-12 w-full rounded-lg border border-input bg-background pl-12 pr-4 outline-none transition-colors focus:border-gold disabled:opacity-60"
              />
            </div>
          </div>

          {/* ENDEREÇO */}
          <div>
            <label
              htmlFor="business-address"
              className="text-sm text-muted-foreground"
            >
              Endereço
            </label>

            <div className="relative mt-2">
              <MapPin className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-muted-foreground" />

              <textarea
                id="business-address"
                value={
                  form.address
                }
                disabled={
                  isSaving ||
                  isUploadingLogo
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "address",
                    event.target
                      .value,
                  )
                }
                rows={3}
                placeholder="Rua, número, bairro, cidade..."
                className="w-full resize-none rounded-lg border border-input bg-background py-3 pl-12 pr-4 outline-none transition-colors focus:border-gold disabled:opacity-60"
              />
            </div>
          </div>

          {/* INSTAGRAM */}
          <div>
            <label
              htmlFor="business-instagram"
              className="text-sm text-muted-foreground"
            >
              Instagram
            </label>

            <div className="relative mt-2">
              <Instagram className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                id="business-instagram"
                value={
                  form.instagram
                }
                disabled={
                  isSaving ||
                  isUploadingLogo
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "instagram",
                    event.target
                      .value,
                  )
                }
                placeholder="@navalhareal"
                className="h-12 w-full rounded-lg border border-input bg-background pl-12 pr-4 outline-none transition-colors focus:border-gold disabled:opacity-60"
              />
            </div>
          </div>

          {/* DESCRIÇÃO */}
          <div>
            <label
              htmlFor="business-description"
              className="text-sm text-muted-foreground"
            >
              Descrição
            </label>

            <textarea
              id="business-description"
              value={
                form.description
              }
              disabled={
                isSaving ||
                isUploadingLogo
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "description",
                  event.target
                    .value,
                )
              }
              rows={5}
              maxLength={500}
              placeholder="Conte um pouco sobre a barbearia..."
              className="mt-2 w-full resize-none rounded-lg border border-input bg-background p-4 outline-none transition-colors focus:border-gold disabled:opacity-60"
            />

            <p className="mt-2 text-right text-xs text-muted-foreground">
              {
                form.description
                  .length
              }
              /500
            </p>
          </div>

          {/* LOGO */}
          <div>
            <p className="text-sm text-muted-foreground">
              Logo da barbearia
            </p>

            <label
              htmlFor="business-logo-upload"
              className={`mt-2 flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/20 px-5 text-center transition-colors ${
                isUploadingLogo ||
                isSaving
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:border-gold/50"
              }`}
            >
              {isUploadingLogo ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-gold" />

                  <span className="mt-3 text-sm font-semibold">
                    Enviando logo...
                  </span>

                  <span className="mt-1 text-xs text-muted-foreground">
                    Aguarde até o envio terminar.
                  </span>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gold" />

                  <span className="mt-3 text-sm font-semibold">
                    Selecionar logo
                  </span>

                  <span className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG ou WebP — máximo de 5 MB
                  </span>
                </>
              )}
            </label>

            <input
              id="business-logo-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={
                isUploadingLogo ||
                isSaving
              }
              onChange={
                handleLogoUpload
              }
              className="sr-only"
            />

            {logoMessage && (
              <p
                className={`mt-3 text-sm ${
                  logoMessage.success
                    ? "text-green-300"
                    : "text-destructive"
                }`}
              >
                {
                  logoMessage.text
                }
              </p>
            )}

            {form.logo_url && (
              <div className="mt-4 rounded-xl border border-border p-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-secondary">
                    <img
                      src={
                        form.logo_url
                      }
                      alt="Prévia da logo"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-gold" />

                      <p className="text-sm font-semibold">
                        Logo selecionada
                      </p>
                    </div>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {
                        form.logo_url
                      }
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={
                    isSaving ||
                    isUploadingLogo
                  }
                  onClick={
                    removeLogo
                  }
                  className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-500/30 px-4 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Remover logo
                </button>
              </div>
            )}
          </div>

          {/* COR */}
          <div>
            <label
              htmlFor="business-color"
              className="text-sm text-muted-foreground"
            >
              Cor principal
            </label>

            <div className="mt-2 flex gap-3">
              <input
                id="business-color"
                type="color"
                value={
                  form.primary_color ||
                  "#d4af37"
                }
                disabled={
                  isSaving ||
                  isUploadingLogo
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "primary_color",
                    event.target
                      .value,
                  )
                }
                className="h-12 w-16 cursor-pointer rounded-lg border border-input bg-background p-1 disabled:opacity-60"
              />

              <input
                value={
                  form.primary_color
                }
                disabled={
                  isSaving ||
                  isUploadingLogo
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "primary_color",
                    event.target
                      .value,
                  )
                }
                placeholder="#d4af37"
                className="h-12 min-w-0 flex-1 rounded-lg border border-input bg-background px-4 font-mono outline-none transition-colors focus:border-gold disabled:opacity-60"
              />
            </div>
          </div>

          {/* ATIVO */}
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border p-4">
            <span>
              <span className="block font-semibold">
                Barbearia ativa
              </span>

              <span className="mt-1 block text-sm text-muted-foreground">
                Define se o estabelecimento está ativo no sistema.
              </span>
            </span>

            <input
              type="checkbox"
              checked={
                form.active
              }
              disabled={
                isSaving ||
                isUploadingLogo
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "active",
                  event.target
                    .checked,
                )
              }
              className="h-5 w-5 accent-[#d4af37]"
            />
          </label>

          {/* MENSAGEM */}
          {message && (
            <div
              role="status"
              className={`rounded-xl border p-4 ${
                message.success
                  ? "border-green-500/20 bg-green-500/5 text-green-300"
                  : "border-red-500/20 bg-red-500/5 text-red-300"
              }`}
            >
              <div className="flex items-center gap-2 text-sm">
                {message.success && (
                  <CheckCircle2 className="h-4 w-4" />
                )}

                {
                  message.text
                }
              </div>
            </div>
          )}
        </div>

        {/* SALVAR */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={
              handleSave
            }
            disabled={
              isSaving ||
              isUploadingLogo
            }
            className="btn-gold min-h-12 w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}

            {isSaving
              ? "Salvando..."
              : isUploadingLogo
                ? "Enviando logo..."
                : "Salvar configurações"}
          </button>
        </div>
      </section>
    </div>
  );
}