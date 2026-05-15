import type { ImageSourcePropType } from "react-native";

import type { ActivityChartPoint } from "@/components/system";
import { petAvatarFallback } from "./avatar-fallbacks";

const dogAvatar = require("@/assets/images/avatars/pet-avatar.png");

export const DEMO_PET_AVATARS: Record<string, ImageSourcePropType> = {
  Basurín: dogAvatar,
  Paris: dogAvatar,
  Milo: dogAvatar,
};

export function resolveDemoPetAvatar(
  photoUrl: string | null | undefined,
  petName: string | null | undefined,
): ImageSourcePropType | string {
  if (photoUrl && photoUrl.length > 0) {
    return photoUrl;
  }
  if (petName && DEMO_PET_AVATARS[petName]) {
    return DEMO_PET_AVATARS[petName] as ImageSourcePropType;
  }
  return petAvatarFallback;
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number, decimals = 1) {
  const value = Math.random() * (max - min) + min;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export type PetHealthStats = {
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  steps: number;
  stress: number;
};

export function generatePetHealthStats(): PetHealthStats {
  return {
    heartRate: randomInt(60, 120),
    temperature: randomFloat(37.5, 39.5, 1),
    respiratoryRate: randomInt(15, 30),
    steps: randomInt(800, 3000),
    stress: Math.random(),
  };
}

export function generateActivitySeries(): ActivityChartPoint[] {
  const hours = [6, 8, 10, 12, 14, 16, 18];
  return hours.map((hour) => ({
    hour,
    level: randomInt(0, 3),
  }));
}

export const DEMO_PET_LOCATION = {
  latitude: 4.711,
  longitude: -74.0721,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};
