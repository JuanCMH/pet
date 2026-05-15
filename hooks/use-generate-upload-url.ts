import { api } from "@/convex/_generated/api";
import { useMutate } from "./use-mutate";

export const useGenerateUploadUrl = () =>
  useMutate(api.upload.generateUploadUrl);
