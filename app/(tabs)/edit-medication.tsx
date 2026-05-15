import { useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Hourglass,
  ListCheck,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Button,
  DateTimeField,
  ImageUpload,
  PetPicker,
  type PetPickerOption,
  TextAreaField,
  TextInputField,
  useToast,
} from "@/components/system";
import { AppColors } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/get-error-message";
import { resolveDemoPetAvatar } from "@/lib/pet-fake-data";

type PetWithUrl = Doc<"pets"> & {
  photoUrl: string | null;
  role: "primary" | "secondary";
};

type MedicationFormValues = {
  name: string;
  purpose: string;
  frequencyValue: string;
  repeatCount: string;
  notes: string;
};

const onlyDigits = (text: string) => text.replace(/[^0-9]/g, "");

const HOUR_MS = 60 * 60 * 1000;

export default function EditMedicationScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isAuthenticated } = useConvexAuth();
  const params = useLocalSearchParams<{ medicationId?: string }>();
  const medicationId = params.medicationId as Id<"medications"> | undefined;

  const medication = useQuery(
    api.medications.getById,
    medicationId ? { medicationId } : "skip",
  );
  const pets = useQuery(api.pets.listMine, isAuthenticated ? {} : "skip") as
    | PetWithUrl[]
    | undefined;
  const updateMedication = useMutation(api.medications.update);
  const removeMedication = useMutation(api.medications.remove);

  const medicationsRoute = "/(tabs)/medications" as Href;
  const goBackToMedications = () => router.replace(medicationsRoute);

  const [petId, setPetId] = useState<Id<"pets"> | undefined>(undefined);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [showPrescription, setShowPrescription] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm<MedicationFormValues>({
    defaultValues: {
      name: "",
      purpose: "",
      frequencyValue: "",
      repeatCount: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!medication) return;

    let frequencyHours = medication.frequencyValue;
    if (medication.frequencyUnit === "days") frequencyHours *= 24;
    else if (medication.frequencyUnit === "weeks") frequencyHours *= 24 * 7;
    else if (medication.frequencyUnit === "months") frequencyHours *= 24 * 30;

    let repeatCount = "";
    if (medication.endDate && frequencyHours > 0) {
      const span = medication.endDate - medication.startDate;
      const doses = Math.round(span / (frequencyHours * HOUR_MS)) + 1;
      if (doses > 0) repeatCount = String(doses);
    }

    reset({
      name: medication.name ?? "",
      purpose: medication.purpose ?? "",
      frequencyValue: String(frequencyHours),
      repeatCount,
      notes: medication.notes ?? "",
    });
    setPetId(medication.petId);

    const start = new Date(medication.startDate);
    setStartDate(start);
    setStartTime(start);
  }, [medication, reset]);

  const petOptions = useMemo<PetPickerOption[]>(() => {
    if (!pets) return [];
    return pets.map((pet) => ({
      label: pet.name,
      value: pet._id,
      image: resolveDemoPetAvatar(pet.photoUrl, pet.name),
      alt: pet.name,
    }));
  }, [pets]);

  const combinedStartTimestamp = useMemo(() => {
    if (!startDate) return null;
    const merged = new Date(startDate);
    if (startTime) {
      merged.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
    } else {
      merged.setHours(0, 0, 0, 0);
    }
    return merged.getTime();
  }, [startDate, startTime]);

  const onSubmit = handleSubmit(async (values) => {
    if (!medicationId) return;
    setSubmitError(null);

    const frequencyValue = Number(values.frequencyValue);
    if (!Number.isFinite(frequencyValue) || frequencyValue <= 0) {
      setSubmitError("Ingresa una frecuencia válida (mayor a 0).");
      return;
    }
    if (combinedStartTimestamp === null) {
      setSubmitError("Selecciona la fecha de inicio.");
      return;
    }

    let endDate: number | undefined;
    if (values.repeatCount.trim().length > 0) {
      const doses = Number(values.repeatCount);
      if (!Number.isFinite(doses) || doses <= 0) {
        setSubmitError("Repetir debe ser un número mayor a 0.");
        return;
      }
      endDate =
        combinedStartTimestamp +
        Math.max(0, doses - 1) * frequencyValue * HOUR_MS;
    }

    try {
      setIsSubmitting(true);
      await updateMedication({
        medicationId,
        name: values.name.trim(),
        purpose: values.purpose.trim(),
        frequencyValue,
        frequencyUnit: "hours",
        startDate: combinedStartTimestamp,
        ...(endDate !== undefined ? { endDate } : {}),
        notes: values.notes.trim(),
      });

      showToast({
        message: "Medicamento actualizado.",
        variant: "success",
      });
      goBackToMedications();
    } catch (caughtError) {
      setSubmitError(getErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleDelete = () => {
    if (!medicationId) return;
    Alert.alert(
      "Eliminar medicamento",
      "¿Seguro que quieres eliminar este medicamento? Se borrarán también todos los registros de administración.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await removeMedication({ medicationId });
              showToast({
                message: "Medicamento eliminado.",
                variant: "success",
              });
              goBackToMedications();
            } catch (caughtError) {
              Alert.alert("No se pudo eliminar", getErrorMessage(caughtError));
            }
          },
        },
      ],
    );
  };

  if (medication === undefined) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-blanco">
        <ActivityIndicator color={AppColors.cobalto} size="large" />
      </SafeAreaView>
    );
  }

  if (medication === null) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-blanco">
        <Text className="font-semibold text-cobalto">
          No se encontró el medicamento.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-blanco" edges={["top"]}>
      <ScrollView
        bounces={false}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 gap-5 px-5 pt-2 pb-8">
          <View className="h-10 flex-row items-center justify-center">
            <Pressable
              accessibilityLabel="Regresar"
              accessibilityRole="button"
              className="absolute left-0 h-10 w-10 items-center justify-center"
              hitSlop={12}
              onPress={goBackToMedications}
            >
              <ArrowLeft
                color={AppColors.cobalto}
                size={24}
                strokeWidth={2.4}
              />
            </Pressable>
            <Text className="text-center font-bold text-[24px] leading-[28px] text-cobalto">
              Editar medicamento
            </Text>
          </View>

          <PetPicker
            label="Mascota *"
            onValueChange={(value) => setPetId(value as Id<"pets">)}
            options={petOptions}
            placeholder="Selecciona una mascota"
            value={petId}
          />

          <ImageUpload
            className="h-48 w-full"
            onChange={setPhotoUri}
            shape="square"
            title="Imagen del medicamento"
            value={photoUri}
          />

          <Controller
            control={control}
            name="name"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <TextInputField
                error={error?.message}
                label="Nombre del medicamento *"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Amoxicilina 250mg"
                value={value ?? ""}
              />
            )}
            rules={{ required: "Ingresa el nombre del medicamento." }}
          />

          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="font-semibold text-[14px] text-cobalto">
                Prescripción médica
              </Text>
              <Pressable
                accessibilityLabel={
                  showPrescription
                    ? "Ocultar prescripción"
                    : "Mostrar prescripción"
                }
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setShowPrescription((prev) => !prev)}
              >
                {showPrescription ? (
                  <Eye color={AppColors.gris} size={18} strokeWidth={2} />
                ) : (
                  <EyeOff color={AppColors.gris} size={18} strokeWidth={2} />
                )}
              </Pressable>
            </View>
            <Controller
              control={control}
              name="purpose"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextAreaField
                  label=""
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Antibiótico recetado por el veterinario..."
                  rows={4}
                  secureTextEntry={!showPrescription}
                  value={value ?? ""}
                />
              )}
            />
          </View>

          <View className="flex-row gap-2">
            <DateTimeField
              className="flex-1"
              label="Fecha de inicio *"
              mode="date"
              onChange={setStartDate}
              value={startDate}
            />
            <DateTimeField
              className="flex-1"
              label="Hora de inicio"
              mode="time"
              onChange={setStartTime}
              value={startTime}
            />
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1 gap-2">
              <View className="flex-row items-center gap-1">
                <Hourglass
                  color={AppColors.cobalto}
                  size={14}
                  strokeWidth={2}
                />
                <Text className="font-semibold text-[14px] text-cobalto">
                  Frecuencia (horas) *
                </Text>
              </View>
              <Controller
                control={control}
                name="frequencyValue"
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <TextInputField
                    error={error?.message}
                    keyboardType="number-pad"
                    label=""
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(onlyDigits(text))}
                    placeholder="8"
                    value={value}
                  />
                )}
                rules={{ required: "Ingresa la frecuencia." }}
              />
            </View>

            <View className="flex-1 gap-2">
              <View className="flex-row items-center gap-1">
                <ListCheck
                  color={AppColors.cobalto}
                  size={14}
                  strokeWidth={2}
                />
                <Text className="font-semibold text-[14px] text-cobalto">
                  Repetir (dosis)
                </Text>
              </View>
              <Controller
                control={control}
                name="repeatCount"
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <TextInputField
                    error={error?.message}
                    helperText="Vacío = indefinido"
                    keyboardType="number-pad"
                    label=""
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(onlyDigits(text))}
                    placeholder="10"
                    value={value}
                  />
                )}
              />
            </View>
          </View>

          {submitError ? (
            <Text className="font-sans text-[12px] text-rojo">
              {submitError}
            </Text>
          ) : null}

          <View className="flex-row gap-2 pt-2">
            <Button
              className="flex-1 border-rojo"
              disabled={isSubmitting}
              onPress={handleDelete}
              textClassName="text-rojo"
              variant="outline"
            >
              Eliminar
            </Button>
            <Button
              className="flex-1"
              disabled={isSubmitting}
              loading={isSubmitting}
              onPress={onSubmit}
              variant="cobalto"
            >
              Actualizar
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
