import { forwardRef, useImperativeHandle, useRef } from "react";
import MapView, { Marker, type Region } from "react-native-maps";

import { AppColors } from "@/constants/theme";

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
    markers,
    onMarkerPress,
  },
  ref,
) {
  const mapRef = useRef<MapView>(null);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region, durationMs = 400) => {
      mapRef.current?.animateToRegion(region, durationMs);
    },
  }));

  return (
    <MapView
      initialRegion={{
        latitude: initialLatitude,
        longitude: initialLongitude,
        latitudeDelta,
        longitudeDelta,
      }}
      ref={mapRef}
      showsUserLocation
      style={{ flex: 1 }}
    >
      {markers.map((marker) => (
        <Marker
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          key={marker.id}
          onPress={() => onMarkerPress?.(marker.id)}
          pinColor={marker.selected ? AppColors.celeste : AppColors.rojo}
          title={marker.name}
        />
      ))}
    </MapView>
  );
});
