import MapView, { Marker } from "react-native-maps";

export type PetLocationMapProps = {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
  title?: string;
};

export function PetLocationMap({
  latitude,
  longitude,
  latitudeDelta = 0.02,
  longitudeDelta = 0.02,
  title,
}: PetLocationMapProps) {
  return (
    <MapView
      initialRegion={{ latitude, longitude, latitudeDelta, longitudeDelta }}
      style={{ flex: 1 }}
    >
      <Marker coordinate={{ latitude, longitude }} title={title} />
    </MapView>
  );
}
