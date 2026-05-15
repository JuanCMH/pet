import { EmptyState, PetItemCard, UserBanner } from "@/components/system";
import { AppColors } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { resolveUserAvatar } from "@/lib/avatar-fallbacks";
import { resolveDemoPetAvatar } from "@/lib/pet-fake-data";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { type Href, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const profileRoute = "/(tabs)/profile" as Href;
const registerPetRoute = "/(tabs)/register-pet" as Href;

type PetWithUrl = Doc<"pets"> & {
  photoUrl: string | null;
  role: "primary" | "secondary";
};

export default function HomeTabScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(
    api.users.getCurrent,
    isAuthenticated ? {} : "skip",
  );
  const pets = useQuery(api.pets.listMine, isAuthenticated ? {} : "skip") as
    | PetWithUrl[]
    | undefined;

  const userName =
    isLoading || currentUser === undefined
      ? "..."
      : currentUser?.name?.trim() || currentUser?.email?.trim() || "PetWell";
  const userAvatar = resolveUserAvatar(
    currentUser?.avatarUrl ?? currentUser?.image ?? undefined,
  );

  const hasPets = !!pets && pets.length > 0;
  const isLoadingData = isAuthenticated && pets === undefined;

  const goToPetDetail = (petId: string) => {
    router.push({
      pathname: "/pet-detail",
      params: { petId },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-blanco">
      <View className="flex-1 gap-4 px-5 pb-4 pt-3">
        <UserBanner
          avatar={userAvatar}
          name={userName}
          onSettingsPress={() => router.push(profileRoute)}
        />

        {isLoadingData ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={AppColors.cobalto} size="large" />
          </View>
        ) : hasPets ? (
          <View className="flex-1 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-[24px] leading-[28px] text-cobalto">
                Mascotas
              </Text>
              <Pressable
                accessibilityLabel="Registrar nueva mascota"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => router.push(registerPetRoute)}
              >
                <Plus color={AppColors.cobalto} size={24} strokeWidth={2.4} />
              </Pressable>
            </View>

            <ScrollView
              bounces={false}
              className="flex-1"
              contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {pets.map((pet) => (
                <Pressable
                  accessibilityRole="button"
                  key={pet._id}
                  onPress={() => goToPetDetail(pet._id)}
                >
                  <PetItemCard
                    avatar={resolveDemoPetAvatar(pet.photoUrl, pet.name)}
                    deviceName={pet.collarId ?? "Sin dispositivo"}
                    name={pet.name}
                    onDevicePress={() => goToPetDetail(pet._id)}
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : (
          <EmptyState
            actionLabel="Registrar mascota"
            className="min-h-0 flex-1"
            onActionPress={() => router.push(registerPetRoute)}
            title="No tienes ninguna mascota registrada"
          />
        )}
      </View>
    </SafeAreaView>
  );
}
