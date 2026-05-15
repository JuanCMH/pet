import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  MapDetailCard,
  MapItemCard,
  VetsMap,
  type VetsMapHandle,
} from "@/components/system";
import { AppColors } from "@/constants/theme";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  fetchNearbyVeterinaries,
  formatDistance,
  type NearbyVet,
} from "@/lib/nearby-vets";

const DEFAULT_LATITUDE = 4.711;
const DEFAULT_LONGITUDE = -74.0721;
const SEARCH_RADIUS_METERS = 2000;

type UserCoords = { latitude: number; longitude: number };

export default function MapTabScreen() {
  const mapRef = useRef<VetsMapHandle>(null);

  const [origin, setOrigin] = useState<UserCoords>({
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
  });
  const [hasLocationPermission, setHasLocationPermission] = useState<
    boolean | null
  >(null);
  const [vets, setVets] = useState<NearbyVet[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadVets = useCallback(async (coords: UserCoords) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const results = await fetchNearbyVeterinaries(
        coords.latitude,
        coords.longitude,
        SEARCH_RADIUS_METERS,
      );
      setVets(results);
    } catch (caughtError) {
      setErrorMessage(getErrorMessage(caughtError));
      setVets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (status !== "granted") {
          setHasLocationPermission(false);
          await loadVets({
            latitude: DEFAULT_LATITUDE,
            longitude: DEFAULT_LONGITUDE,
          });
          return;
        }
        setHasLocationPermission(true);
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setOrigin(next);
        await loadVets(next);
      } catch (caughtError) {
        if (cancelled) return;
        setHasLocationPermission(false);
        setErrorMessage(getErrorMessage(caughtError));
        await loadVets({
          latitude: DEFAULT_LATITUDE,
          longitude: DEFAULT_LONGITUDE,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadVets]);

  const markers = useMemo(
    () =>
      vets.map((vet) => ({
        id: vet.id,
        latitude: vet.latitude,
        longitude: vet.longitude,
        name: vet.name,
        selected: vet.id === selectedId,
      })),
    [vets, selectedId],
  );

  const selectedVet = useMemo(
    () => vets.find((vet) => vet.id === selectedId) ?? null,
    [vets, selectedId],
  );

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      const vet = vets.find((entry) => entry.id === id);
      if (!vet) return;
      mapRef.current?.animateToRegion(
        {
          latitude: vet.latitude,
          longitude: vet.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        400,
      );
    },
    [vets],
  );

  const handleOpenInGoogleMaps = useCallback((vet: NearbyVet) => {
    const isGooglePlaceId = !vet.id.includes("/");
    const url = isGooglePlaceId
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vet.name)}&query_place_id=${vet.id}`
      : `https://www.google.com/maps/search/?api=1&query=${vet.latitude},${vet.longitude}`;
    Linking.openURL(url).catch(() => {});
  }, []);

  const showEmpty =
    !isLoading && vets.length === 0 && hasLocationPermission !== null;

  return (
    <SafeAreaView className="flex-1 bg-blanco" edges={["top"]}>
      <View className="gap-3 px-5 pt-3 pb-2">
        <Text className="font-bold text-[24px] leading-[28px] text-cobalto">
          Mapa
        </Text>
      </View>

      <View
        className="overflow-hidden border-gris border-y bg-gris"
        style={{ height: "35%" }}
      >
        <VetsMap
          initialLatitude={origin.latitude}
          initialLongitude={origin.longitude}
          markers={markers}
          onMarkerPress={handleSelect}
          ref={mapRef}
        />
      </View>

      <View className="flex-1 gap-3 px-5 pt-4 pb-4">
        <Text className="font-semibold text-[18px] leading-[22px] text-cobalto">
          {selectedVet ? "Veterinaria seleccionada" : "Veterinarias cercanas"}
        </Text>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={AppColors.cobalto} />
          </View>
        ) : selectedVet ? (
          <ScrollView
            bounces={false}
            className="flex-1"
            contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <MapDetailCard
              address={selectedVet.address || "Dirección no disponible"}
              name={selectedVet.name}
              onMapsPress={() => handleOpenInGoogleMaps(selectedVet)}
              phone={selectedVet.phone || "Sin teléfono"}
              schedule={selectedVet.schedule}
              stars={selectedVet.rating}
            />
            <Pressable
              accessibilityRole="button"
              className="self-start rounded-component border border-gris bg-blanco px-4 py-2"
              hitSlop={6}
              onPress={() => setSelectedId(null)}
            >
              <Text className="font-semibold text-[14px] text-cobalto">
                Ver toda la lista
              </Text>
            </Pressable>
          </ScrollView>
        ) : showEmpty ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-center font-light text-[16px] leading-[22px] text-cobalto">
              {hasLocationPermission === false
                ? "Activa los permisos de ubicación para ver veterinarias cerca de ti."
                : "No encontramos veterinarias en un radio de 2 km."}
            </Text>
            {errorMessage ? (
              <Text className="mt-2 text-center font-light text-[12px] text-rojo">
                {errorMessage}
              </Text>
            ) : null}
          </View>
        ) : (
          <ScrollView
            bounces={false}
            className="flex-1"
            contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {vets.map((vet) => (
              <MapItemCard
                key={vet.id}
                name={vet.name}
                onPress={() => handleSelect(vet.id)}
                schedule={`${vet.schedule} · ${formatDistance(vet.distanceMeters)}`}
                stars={vet.rating}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
