import type { FunctionReference } from "convex/server";

import type { Id } from "@/convex/_generated/dataModel";

type GenerateUploadUrlMutation = FunctionReference<
  "mutation",
  "public",
  Record<string, never>,
  string
>;

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

export async function uploadImageToStorage(
  uri: string,
  generateUploadUrl: (args: Record<string, never>) => Promise<string>,
): Promise<Id<"_storage">> {
  const extension = uri.split(".").pop()?.toLowerCase();
  const fallbackMime = (extension && MIME_BY_EXT[extension]) || "image/jpeg";

  const uploadUrl = await generateUploadUrl({});

  const fileResponse = await fetch(uri);
  const blob = await fileResponse.blob();
  const contentType = blob.type || fallbackMime;

  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: blob,
  });

  if (!result.ok) {
    throw new Error("No se pudo subir la imagen.");
  }

  const { storageId } = (await result.json()) as {
    storageId: Id<"_storage">;
  };
  return storageId;
}

export type { GenerateUploadUrlMutation };
