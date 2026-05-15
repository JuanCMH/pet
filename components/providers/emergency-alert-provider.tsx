import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { AlertTriangle } from "lucide-react-native";
import { type PropsWithChildren, useEffect, useMemo, useState } from "react";
import { Linking, Modal, Pressable, Text, View } from "react-native";

import { Avatar, Button, MOBILE_SHELL_MAX_WIDTH } from "@/components/system";
import { AppColors } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { resolveDemoPetAvatar } from "@/lib/pet-fake-data";

const EMERGENCY_INTERVAL_MS = 4 * 60 * 1000;
const EMERGENCY_PHONE = "+5715551234";

type PetWithUrl = Doc<"pets"> & {
  photoUrl: string | null;
  role: "primary" | "secondary";
};

export function EmergencyAlertProvider({ children }: PropsWithChildren) {
  const { isAuthenticated } = useConvexAuth();
  const pets = useQuery(api.pets.listMine, isAuthenticated ? {} : "skip") as
    | PetWithUrl[]
    | undefined;

  const [isVisible, setIsVisible] = useState(false);
  const [targetPet, setTargetPet] = useState<PetWithUrl | null>(null);

  useEffect(() => {
    if (!pets || pets.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      const randomPet = pets[Math.floor(Math.random() * pets.length)];
      if (!randomPet) return;
      setTargetPet(randomPet);
      setIsVisible(true);
    }, EMERGENCY_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [pets]);

  return (
    <>
      {children}
      {targetPet ? (
        <EmergencyAlertModal
          onClose={() => setIsVisible(false)}
          pet={targetPet}
          visible={isVisible}
        />
      ) : null}
    </>
  );
}

type EmergencyAlertModalProps = {
  visible: boolean;
  onClose: () => void;
  pet: PetWithUrl;
};

function EmergencyAlertModal({
  visible,
  onClose,
  pet,
}: EmergencyAlertModalProps) {
  const avatar = resolveDemoPetAvatar(pet.photoUrl, pet.name);

  const alertTime = useMemo(() => {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
  }, [visible]);

  const handleCall = async () => {
    const url = `tel:${EMERGENCY_PHONE}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch {

    } finally {
      onClose();
    }
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/60 px-6"
        onPress={onClose}
      >
        <View
          className="w-full items-center px-5"
          style={{ maxWidth: MOBILE_SHELL_MAX_WIDTH }}
        >
          <Pressable
            className="w-full gap-4 rounded-2xl bg-blanco p-6 shadow-sm"
            onPress={(event) => event.stopPropagation()}
          >
            <View className="items-center">
              <AlertTriangle
                color={AppColors.amarillo}
                size={32}
                strokeWidth={2}
              />
            </View>

            <Text className="text-center font-bold text-[22px] leading-[26px] text-cobalto">
              Emergencia
            </Text>

            <View className="w-full flex-row items-start gap-3 rounded-component border border-gris bg-blanco px-4 py-3 shadow-sm">
              <Avatar alt={`Avatar de ${pet.name}`} size="md" source={avatar} />

              <View className="flex-1 gap-1">

                <View className="flex-row items-center justify-between gap-2">
                  <Text
                    className="flex-1 font-bold text-[14px] text-cobalto"
                    numberOfLines={1}
                  >
                    {pet.name}
                  </Text>
                  <Text className="font-semibold text-[12px] text-cobalto/70">
                    {alertTime}
                  </Text>
                </View>

                <View className="min-h-9 flex-row items-center gap-2 rounded-component bg-amarillo px-2 py-2 shadow-sm">
                  <AlertTriangle
                    color={AppColors.blanco}
                    size={16}
                    strokeWidth={2.4}
                  />
                  <Text className="flex-1 font-semibold text-sm text-blanco">
                    Alerta
                  </Text>
                </View>
              </View>
            </View>

            <Text className="text-[14px] leading-[20px] text-cobalto">
              Tu mascota presenta síntomas compatibles con un posible problema
              cardíaco:
              {"\n\n"}1. Mantén a tu mascota en reposo y evita que se agite.
              {"\n"}2. Observa su respiración y si presenta jadeo o debilidad.
              {"\n"}3. No administres medicamentos sin indicación profesional.
              {"\n"}4. Contacta a un veterinario o acude a una clínica lo antes
              posible.
            </Text>

            <Button
              block
              onPress={() => {
                void handleCall();
              }}
              variant="cyan"
            >
              Llamar al veterinario
            </Button>

            <Pressable accessibilityRole="button" onPress={onClose}>
              <Text className="text-center font-semibold text-[14px] text-cobalto">
                Cerrar
              </Text>
            </Pressable>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
