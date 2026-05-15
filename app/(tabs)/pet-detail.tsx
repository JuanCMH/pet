import {
  ActivityChart,
  Button,
  FloatingCard,
  MOBILE_SHELL_MAX_WIDTH,
  PetItemCard,
  PetLocationMap,
  StatusItem,
  StressSlider,
} from "@/components/system";
import { AppColors } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
  DEMO_PET_LOCATION,
  generateActivitySeries,
  generatePetHealthStats,
  resolveDemoPetAvatar,
} from "@/lib/pet-fake-data";
import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Footprints,
  Heart,
  Thermometer,
  Wind,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PetWithUrl = Doc<"pets"> & { photoUrl: string | null };

type TabValue = "actividad" | "ubicacion";

export default function PetDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ petId?: string }>();
  const petId = params.petId as Id<"pets"> | undefined;

  const pet = useQuery(api.pets.getById, petId ? { petId } : "skip") as
    | PetWithUrl
    | null
    | undefined;

  const [activeTab, setActiveTab] = useState<TabValue>("actividad");

  const healthStats = useMemo(
    () => (pet ? generatePetHealthStats() : null),
    [pet?._id],
  );
  const activityData = useMemo(
    () => (pet ? generateActivitySeries() : []),
    [pet?._id],
  );

  if (pet === undefined) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-blanco">
        <ActivityIndicator color={AppColors.cobalto} size="large" />
      </SafeAreaView>
    );
  }

  if (pet === null) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-blanco">
        <Text className="font-semibold text-cobalto">
          No se encontró la mascota.
        </Text>
      </SafeAreaView>
    );
  }

  const hasDevice = !!pet.collarId && pet.collarId.length > 0;
  const avatar = resolveDemoPetAvatar(pet.photoUrl, pet.name);

  const goToInfo = () => {
    router.push({
      pathname: "/pet-info",
      params: { petId: pet._id },
    });
  };

  const goToLinkDevice = () => {
    goToInfo();
  };

  return (
    <SafeAreaView className="flex-1 bg-blanco" edges={["top"]}>
      <View className="flex-1 gap-4 px-5 pb-2 pt-2">

        <View className="h-10 flex-row items-center justify-center">
          <Pressable
            accessibilityLabel="Regresar"
            accessibilityRole="button"
            className="absolute left-0 h-10 w-10 items-center justify-center"
            hitSlop={12}
            onPress={() => router.back()}
          >
            <ArrowLeft color={AppColors.cobalto} size={24} strokeWidth={2.4} />
          </Pressable>
          <Text className="text-center font-bold text-[24px] leading-[28px] text-cobalto">
            Estadísticas
          </Text>
        </View>

        <Pressable accessibilityRole="button" onPress={goToInfo}>
          <PetItemCard
            avatar={avatar}
            deviceName={
              hasDevice ? (pet.collarId as string) : "Sin dispositivo"
            }
            name={pet.name}
            onDevicePress={goToInfo}
          />
        </Pressable>

        {hasDevice && healthStats ? (
          <ScrollView
            bounces={false}
            className="flex-1"
            contentContainerStyle={{ gap: 16, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >

            <View className="gap-2">
              <StatusItem
                icon={Heart}
                title="Frecuencia cardíaca"
                value={`${healthStats.heartRate} bpm`}
              />
              <StatusItem
                icon={Thermometer}
                title="Temperatura"
                value={`${healthStats.temperature} °C`}
              />
              <StatusItem
                icon={Wind}
                title="Frecuencia respiratoria"
                value={`${healthStats.respiratoryRate} rpm`}
              />
              <StatusItem
                icon={Footprints}
                title="Pasos"
                value={`${healthStats.steps} pasos`}
              />
            </View>

            <View className="gap-2">
              <Text className="font-semibold text-[14px] text-cobalto">
                Nivel de estrés
              </Text>
              <StressSlider value={healthStats.stress} />
            </View>

            <View className="flex-row rounded-component border border-gris bg-blanco p-1">
              <TabButton
                active={activeTab === "actividad"}
                label="Actividad"
                onPress={() => setActiveTab("actividad")}
              />
              <TabButton
                active={activeTab === "ubicacion"}
                label="Ubicación"
                onPress={() => setActiveTab("ubicacion")}
              />
            </View>

            {activeTab === "actividad" ? (
              <View className="gap-2">
                <Text className="font-semibold text-[14px] text-cobalto">
                  Actividad diaria
                </Text>
                <ActivityChart
                  currentHour={new Date().getHours()}
                  data={activityData}
                />
              </View>
            ) : (
              <View className="overflow-hidden rounded-component border border-gris">
                <View style={{ height: 280, width: "100%" }}>
                  <PetLocationMap
                    latitude={DEMO_PET_LOCATION.latitude}
                    latitudeDelta={DEMO_PET_LOCATION.latitudeDelta}
                    longitude={DEMO_PET_LOCATION.longitude}
                    longitudeDelta={DEMO_PET_LOCATION.longitudeDelta}
                    title={pet.name}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center gap-4">
            <FloatingCard
              description={
                "Vive la experiencia completa en solo dos pasos:\n1. Haz clic para vincular un nuevo dispositivo.\n2. Selecciona el dispositivo de la lista."
              }
              title="Vincular dispositivo"
            />
            <Button
              className="w-full max-w-[338px]"
              onPress={goToLinkDevice}
              variant="cyan"
            >
              Vincular dispositivo
            </Button>
          </View>
        )}
      </View>

      <View
        pointerEvents="none"
        style={{ maxWidth: MOBILE_SHELL_MAX_WIDTH, width: "100%" }}
      />
    </SafeAreaView>
  );
}

type TabButtonProps = {
  active: boolean;
  label: string;
  onPress: () => void;
};

function TabButton({ active, label, onPress }: TabButtonProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      className={`flex-1 items-center justify-center rounded-component py-2 ${
        active ? "bg-cobalto" : "bg-transparent"
      }`}
      onPress={onPress}
    >
      <Text
        className={`font-semibold text-[14px] ${
          active ? "text-blanco" : "text-cobalto"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
