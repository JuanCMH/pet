import { forwardRef } from "react";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type VetMarker = {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  selected?: boolean;
};

export type VetsMapHandle = {
  animateToRegion: (region: Region, durationMs?: number) => void;
};

export type VetsMapProps = {
  initialLatitude: number;
  initialLongitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
  markers: VetMarker[];
  onMarkerPress?: (id: string) => void;
};

export const VetsMap = forwardRef<VetsMapHandle, VetsMapProps>(
  function VetsMap() {
    throw new Error(
      "VetsMap requires a platform-specific build (.web o .native).",
    );
  },
);
