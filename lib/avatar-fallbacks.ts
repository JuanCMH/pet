import type { ImageSourcePropType } from "react-native";

export const personAvatarFallback: ImageSourcePropType = require("@/assets/images/avatars/person-avatar.png");

export const petAvatarFallback: ImageSourcePropType = require("@/assets/images/avatars/pet-avatar.png");

export function resolveUserAvatar(
  url?: string | null,
): ImageSourcePropType | string {
  return url && url.length > 0 ? url : personAvatarFallback;
}

export function resolvePetAvatar(
  url?: string | null,
): ImageSourcePropType | string {
  return url && url.length > 0 ? url : petAvatarFallback;
}
