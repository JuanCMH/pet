
import type { ComponentType } from "react";

export type PetLocationMapProps = {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
  title?: string;
};

export const PetLocationMap: ComponentType<PetLocationMapProps> = () => {
  throw new Error(
    "PetLocationMap requiere un build con plataforma específica (.web o .native).",
  );
};
