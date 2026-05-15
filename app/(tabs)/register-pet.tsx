import { useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { type Href, useRouter } from "expo-router";
import { ArrowLeft, Info, Link2, X as XIcon } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Button,
  ControlledTextInputField,
  DeviceField,
  type DeviceFieldStatus,
  EmptyState,
  ImageUpload,
  MOBILE_SHELL_MAX_WIDTH,
  SelectField,
  useToast,
} from "@/components/system";
import { AppColors } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/get-error-message";
import { uploadImageToStorage } from "@/lib/upload-image";

type PetSpecies = "dog" | "cat" | "bird" | "rabbit" | "other";
type PetSex = "male" | "female";

type RegisterPetFormValues = {
  name: string;
  species: PetSpecies | "";
  sex: PetSex | "";
  condition: string;
};

const speciesOptions = [
  { label: "Perro", value: "dog" },
  { label: "Gato", value: "cat" },
  { label: "Ave", value: "bird" },
  { label: "Conejo", value: "rabbit" },
  { label: "Otro", value: "other" },
];

const sexOptions = [
  { label: "Macho", value: "male" },
  { label: "Hembra", value: "female" },
];

const conditionOptions = [
  { label: "Ninguna", value: "none" },
  { label: "Diabetes", value: "Diabetes" },
  { label: "Epilepsia", value: "Epilepsia" },
  { label: "Artritis", value: "Artritis" },
  { label: "Insuficiencia renal", value: "Insuficiencia renal" },
  { label: "Cardiopatía", value: "Cardiopatía" },
  { label: "Hipotiroidismo", value: "Hipotiroidismo" },
];

const NO_DEVICE_VALUE = "__none__";

const fakeDevices: { name: string; label?: string; willFail?: boolean }[] = [
  { name: NO_DEVICE_VALUE, label: "Ninguno" },
  { name: "VHG-2186865", willFail: true },
  { name: "VHG-2182920" },
  { name: "VHG-2187946" },
];

export default function RegisterPetScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isAuthenticated } = useConvexAuth();
  const createPet = useMutation(api.pets.create);
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
  const linkedCollarIds = useQuery(api.pets.listLinkedCollarIds, {});

  const availableDevices = useMemo(() => {
    const linked = new Set(linkedCollarIds ?? []);
    return fakeDevices.filter(
      (device) => device.name === NO_DEVICE_VALUE || !linked.has(device.name),
    );
  }, [linkedCollarIds]);

  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [deviceStatus, setDeviceStatus] = useState<DeviceFieldStatus>("idle");
  const [deviceValue, setDeviceValue] = useState<string | undefined>(undefined);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [showDeviceInfo, setShowDeviceInfo] = useState(false);
  const [showConditionInfo, setShowConditionInfo] = useState(false);
  const [showDevicePicker, setShowDevicePicker] = useState(false);

  const { control, handleSubmit, formState, reset } =
    useForm<RegisterPetFormValues>({
      defaultValues: {
        name: "",
        species: "",
        sex: "",
        condition: "none",
      },
    });

  const openDevicePicker = () => {
    if (deviceStatus === "connecting") {
      return;
    }
    setShowDevicePicker(true);
  };

  const handleSelectDevice = (device: { name: string; willFail?: boolean }) => {
    setShowDevicePicker(false);
    setDeviceError(null);

    if (device.name === NO_DEVICE_VALUE) {
      setDeviceStatus("idle");
      setDeviceValue(undefined);
      return;
    }

    setDeviceStatus("connecting");
    setDeviceValue(device.name);

    setTimeout(() => {
      if (device.willFail) {
        setDeviceStatus("disconnected");
        setDeviceError(
          "No se pudo vincular con el dispositivo. Inténtalo de nuevo o selecciona otro.",
        );
        return;
      }
      setDeviceStatus("connected");
    }, 2000);
  };

  const uploadPhotoIfNeeded = async (): Promise<Id<"_storage"> | undefined> => {
    if (!photoUri) {
      return undefined;
    }
    return uploadImageToStorage(photoUri, generateUploadUrl);
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    if (!isAuthenticated) {
      setSubmitError("Debes iniciar sesión para registrar una mascota.");
      return;
    }

    if (!values.species) {
      setSubmitError("Selecciona la especie de tu mascota.");
      return;
    }

    if (!values.sex) {
      setSubmitError("Selecciona el sexo de tu mascota.");
      return;
    }

    try {
      const photoStorageId = await uploadPhotoIfNeeded();

      await createPet({
        name: values.name.trim(),
        species: values.species,
        sex: values.sex,
        photo: photoStorageId,
        condition:
          values.condition && values.condition !== "none"
            ? values.condition
            : undefined,
        collarId: deviceStatus === "connected" ? deviceValue : undefined,
      });

      reset({
        name: "",
        species: "",
        sex: "",
        condition: "none",
      });
      setPhotoUri(undefined);
      setDeviceStatus("idle");
      setDeviceValue(undefined);
      setDeviceError(null);
      setSubmitError(null);
      showToast({
        message: "Mascota registrada con éxito.",
        variant: "success",
      });
      router.replace("/(tabs)" as Href);
    } catch (caughtError) {
      setSubmitError(getErrorMessage(caughtError));
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-blanco" edges={["top"]}>
      <ScrollView
        bounces={false}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 gap-6 px-5 pt-2 pb-8">

          <View className="h-10 flex-row items-center justify-center">
            <Pressable
              accessibilityLabel="Regresar"
              accessibilityRole="button"
              className="absolute left-0 h-10 w-10 items-center justify-center"
              hitSlop={12}
              onPress={() => router.back()}
            >
              <ArrowLeft
                color={AppColors.cobalto}
                size={24}
                strokeWidth={2.4}
              />
            </Pressable>
            <Text className="text-center font-bold text-[24px] leading-[28px] text-cobalto">
              Registrar nueva mascota
            </Text>
          </View>

          <View className="items-center">
            <ImageUpload
              onChange={setPhotoUri}
              shape="circle"
              title="Subir foto"
              value={photoUri}
            />
          </View>

          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="font-semibold text-[14px] text-cobalto">
                Vincular dispositivo
              </Text>
              <Pressable
                accessibilityLabel="Más información sobre dispositivos"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setShowDeviceInfo(true)}
              >
                <Info color={AppColors.gris} size={18} strokeWidth={2} />
              </Pressable>
            </View>

            <DeviceField
              disabled={deviceStatus === "connecting"}
              label=""
              onPress={openDevicePicker}
              placeholder="Vincular un nuevo dispositivo"
              status={deviceStatus}
              value={deviceValue}
            />

            {deviceError ? (
              <Text className="font-sans text-[12px] text-rojo">
                {deviceError}
              </Text>
            ) : null}
          </View>

          <View className="gap-4">
            <ControlledTextInputField
              control={control}
              label="Nombre de la mascota *"
              name="name"
              placeholder="Milo"
              rules={{ required: "Ingresa el nombre de tu mascota." }}
            />

            <Controller
              control={control}
              name="species"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Especie *"
                  onValueChange={onChange}
                  options={speciesOptions}
                  placeholder="Perro"
                  value={value || undefined}
                />
              )}
              rules={{ required: true }}
            />

            <Controller
              control={control}
              name="sex"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Sexo *"
                  onValueChange={onChange}
                  options={sexOptions}
                  placeholder="Macho"
                  value={value || undefined}
                />
              )}
              rules={{ required: true }}
            />

            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-[14px] text-cobalto">
                  Condiciones especiales
                </Text>
                <Pressable
                  accessibilityLabel="Más información sobre condiciones especiales"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => setShowConditionInfo(true)}
                >
                  <Info color={AppColors.gris} size={18} strokeWidth={2} />
                </Pressable>
              </View>

              <Controller
                control={control}
                name="condition"
                render={({ field: { onChange, value } }) => (
                  <SelectField
                    label=""
                    onValueChange={onChange}
                    options={conditionOptions}
                    placeholder="Ninguna"
                    value={value}
                  />
                )}
              />
            </View>

            {submitError ? (
              <Text className="text-center font-sans text-[12px] text-rojo">
                {submitError}
              </Text>
            ) : null}
          </View>

          <Button
            block
            className="mt-2"
            loading={formState.isSubmitting}
            onPress={onSubmit}
            variant="cobalto"
          >
            Crear mascota
          </Button>
        </View>
      </ScrollView>

      <InfoModal
        onClose={() => setShowDeviceInfo(false)}
        visible={showDeviceInfo}
      >
        <Text className="text-center font-bold text-[24px] leading-[28px] text-cobalto">
          Dispositivos
        </Text>
        <Text className="text-center font-sans text-[14px] leading-[20px] text-cobalto">
          Vive la experiencia completa en solo dos pasos:
          {"\n"}1. Haz clic para vincular un nuevo dispositivo.
          {"\n"}2. Selecciona el dispositivo de la lista.
        </Text>
        <Button
          block
          className="mt-2"
          onPress={() => {
            setShowDeviceInfo(false);
            setTimeout(() => openDevicePicker(), 200);
          }}
          variant="cyan"
        >
          Vincular dispositivo
        </Button>
      </InfoModal>

      <InfoModal
        onClose={() => setShowConditionInfo(false)}
        visible={showConditionInfo}
      >
        <Text className="text-center font-bold text-[24px] leading-[28px] text-cobalto">
          Condiciones especiales
        </Text>
        <Text className="text-center font-sans text-[14px] leading-[20px] text-cobalto">
          Una condición especial es cualquier situación que puede afectar la
          salud o el bienestar de tu mascota, como la vejez o alguna enfermedad.
          Puedes seleccionar una o varias según corresponda.
        </Text>
      </InfoModal>

      <DevicePickerSheet
        devices={fakeDevices}
        onClose={() => setShowDevicePicker(false)}
        onSelect={handleSelectDevice}
        selectedDevice={deviceStatus === "connected" ? deviceValue : undefined}
        visible={showDevicePicker}
      />
    </SafeAreaView>
  );
}

type InfoModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

function InfoModal({ visible, onClose, children }: InfoModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View className="flex-1 items-center justify-center px-6">
        <View
          className="w-full flex-1 items-center justify-center"
          style={{ maxWidth: MOBILE_SHELL_MAX_WIDTH }}
        >
          <Pressable
            accessibilityLabel="Cerrar"
            accessibilityRole="button"
            className="absolute inset-0 bg-cobalto/40"
            onPress={onClose}
          />
          <View className="w-full max-w-[338px] gap-3 rounded-component border border-gris bg-blanco p-5 shadow-sm">
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
}

type DevicePickerDevice = {
  name: string;
  label?: string;
  willFail?: boolean;
};

type DevicePickerSheetProps = {
  visible: boolean;
  devices: DevicePickerDevice[];
  onSelect: (device: DevicePickerDevice) => void;
  onClose: () => void;
  selectedDevice?: string;
};

function DevicePickerSheet({
  visible,
  devices,
  onSelect,
  onClose,
  selectedDevice,
}: DevicePickerSheetProps) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View className="flex-1 items-center justify-end">
        <View
          className="w-full flex-1 justify-end"
          style={{ maxWidth: MOBILE_SHELL_MAX_WIDTH }}
        >
          <Pressable
            accessibilityLabel="Cerrar"
            accessibilityRole="button"
            className="absolute inset-0 bg-cobalto/40"
            onPress={onClose}
          />
          <View className="h-[80%] rounded-t-component border border-gris bg-blanco px-5 pt-5 pb-6 shadow-sm">

            <View className="mb-4 flex-row items-center justify-between">
              <Text className="font-bold text-[24px] leading-[28px] text-cobalto">
                Vincular un dispositivo
              </Text>
              <Pressable
                accessibilityLabel="Cerrar"
                accessibilityRole="button"
                hitSlop={8}
                onPress={onClose}
              >
                <XIcon color={AppColors.cobalto} size={24} strokeWidth={2} />
              </Pressable>
            </View>

            {devices.length === 0 ? (
              <EmptyState title="No se encontraron dispositivos para vincular." />
            ) : (
              <ScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 12 }}
              >
                {devices.map((device, index) => {
                  const isSelected = device.name === selectedDevice;
                  const isNone = device.name === NO_DEVICE_VALUE;
                  const displayLabel = device.label ?? device.name;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      className={`flex-row items-center justify-between py-3 ${
                        index !== devices.length - 1
                          ? "border-b border-gris"
                          : ""
                      }`}
                      key={device.name}
                      onPress={() => onSelect(device)}
                    >
                      <View className="flex-row items-center gap-3">
                        {isNone ? null : (
                          <Link2
                            color={AppColors.cobalto}
                            size={20}
                            strokeWidth={2}
                          />
                        )}
                        <Text
                          className={`font-semibold text-[14px] ${
                            isNone ? "text-cobalto/70" : "text-cobalto"
                          }`}
                        >
                          {displayLabel}
                        </Text>
                      </View>
                      <View
                        className={`h-5 w-5 rounded-full border ${
                          isSelected
                            ? "border-cobalto bg-cobalto"
                            : "border-gris"
                        }`}
                      />
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

void ActivityIndicator;
