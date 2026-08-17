"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireOwner } from "@/lib/route-access";

type UploadBusinessLogoResult = {
  success: boolean;
  message: string;
  url?: string;
};

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function uploadBusinessLogo(
  businessId: string,
  formData: FormData,
): Promise<UploadBusinessLogoResult> {
  const access = await requireOwner();

  if (
    !access.businessId ||
    access.businessId !== businessId
  ) {
    return {
      success: false,
      message: "Você não possui permissão para alterar esta barbearia.",
    };
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return {
      success: false,
      message: "Selecione uma imagem.",
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      message: "Use uma imagem JPG, PNG ou WebP.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      message: "A imagem deve possuir no máximo 5 MB.",
    };
  }

  const extension =
    file.name.split(".").pop()?.toLowerCase() ||
    "webp";

  const path = `${businessId}/logo-${Date.now()}.${extension}`;

  const admin = createAdminClient();

  const { error: uploadError } =
    await admin.storage
      .from("business-logos")
      .upload(path, file, {
        contentType: file.type,
        upsert: true,
      });

  if (uploadError) {
    console.error(
      "Erro ao enviar logo:",
      uploadError,
    );

    return {
      success: false,
      message: "Não foi possível enviar a logo.",
    };
  }

  const {
    data: publicUrlData,
  } = admin.storage
    .from("business-logos")
    .getPublicUrl(path);

  const url =
    publicUrlData.publicUrl;

  if (!url) {
    return {
      success: false,
      message: "Não foi possível gerar a URL da logo.",
    };
  }

  return {
    success: true,
    message: "Logo enviada com sucesso.",
    url,
  };
}