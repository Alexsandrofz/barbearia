"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET_NAME = "barber-photos";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export type UploadBarberPhotoResult = {
  success: boolean;
  url?: string;
  message: string;
};

function getFileExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension || "jpg";
}

export async function uploadBarberPhoto(
  businessId: string,
  file: File,
): Promise<UploadBarberPhotoResult> {
  if (!file.type.startsWith("image/")) {
    return {
      success: false,
      message: "Selecione um arquivo de imagem.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      message: "A imagem deve possuir no máximo 5 MB.",
    };
  }

  const supabase = createClient();
  const extension = getFileExtension(file);
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const filePath = `${businessId}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Erro no upload da foto:", error);

    return {
      success: false,
      message: "Não foi possível enviar a foto.",
    };
  }

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    success: true,
    url: data.publicUrl,
    message: "Foto enviada com sucesso.",
  };
}