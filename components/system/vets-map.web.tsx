import {
  createElement,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { View } from "react-native";

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

export const VetsMap = forwardRef<VetsMapHandle, VetsMapProps>(function VetsMap(
  {
    initialLatitude,
    initialLongitude,
    latitudeDelta = 0.03,
    longitudeDelta = 0.03,
  },
  ref,
) {
  const [region, setRegion] = useState<Region>({
    latitude: initialLatitude,
    longitude: initialLongitude,
    latitudeDelta,
    longitudeDelta,
  });

  useImperativeHandle(ref, () => ({
    animateToRegion: (next) => {
      setRegion(next);
    },
  }));

  const left = region.longitude - region.longitudeDelta / 2;
  const right = region.longitude + region.longitudeDelta / 2;
  const top = region.latitude + region.latitudeDelta / 2;
  const bottom = region.latitude - region.latitudeDelta / 2;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${region.latitude}%2C${region.longitude}`;

  return (
    <View style={{ flex: 1 }}>
      {createElement("iframe", {
        title: "Mapa de veterinarias",
        src,
        style: { border: 0, width: "100%", height: "100%" },
      })}
    </View>
  );
});
