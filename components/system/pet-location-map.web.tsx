import { createElement } from "react";
import { View } from "react-native";

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
  const left = longitude - longitudeDelta / 2;
  const right = longitude + longitudeDelta / 2;
  const top = latitude + latitudeDelta / 2;
  const bottom = latitude - latitudeDelta / 2;

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <View style={{ flex: 1 }}>
      {createElement("iframe", {
        title: title ?? "Mapa de la mascota",
        src,
        style: {
          border: 0,
          width: "100%",
          height: "100%",
        },
      })}
    </View>
  );
}
