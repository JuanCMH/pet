import { useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { type Href, useRouter } from "expo-router";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Hourglass,
  ListCheck,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, Text, View } from "react-native";
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
import { uploadImageToStorage } from "@/lib/upload-image";

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

export default function NewMedicationScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isAuthenticated } = useConvexAuth();
  const pets = useQuery(api.pets.listMine, isAuthenticated ? {} : "skip") as
    | PetWithUrl[]
    | undefined;
  const createMedication = useMutation(api.medications.create);
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);

  const medicationsRoute = "/(tabs)/medications" as Href;
  const goBackToMedications = () => router.replace(medicationsRoute);

  const [petId, setPetId] = useState<Id<"pets"> | undefined>(undefined);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [showPrescription, setShowPrescription] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, watch } = useForm<MedicationFormValues>(
    {
      defaultValues: {
        name: "",
        purpose: "",
        frequencyValue: "",
        repeatCount: "",
        notes: "",
      },
    },
  );

  const purposeValue = watch("purpose");

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
    setSubmitError(null);

    if (!petId) {
      setSubmitError("Selecciona una mascota.");
      return;
    }
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
        Math.max(0, doses - 1) * frequencyValue * 60 * 60 * 1000;
    }

    try {
      setIsSubmitting(true);

      if (photoUri) {
        await uploadImageToStorage(photoUri, generateUploadUrl).catch(() => {

        });
      }

      await createMedication({
        petId,
        name: values.name.trim(),
        purpose: values.purpose.trim(),
        dosage: "",
        frequencyValue,
        frequencyUnit: "hours",
        startDate: combinedStartTimestamp,
        endDate,
        notes: values.notes.trim() || undefined,
      });

      reset({
        name: "",
        purpose: "",
        frequencyValue: "",
        repeatCount: "",
        notes: "",
      });
      setPetId(undefined);
      setPhotoUri(undefined);
      setStartDate(undefined);
      setStartTime(undefined);
      setShowPrescription(true);
      setSubmitError(null);

      showToast({
        message: "Medicamento registrado con éxito.",
        variant: "success",
      });
      goBackToMedications();
    } catch (caughtError) {
      setSubmitError(getErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
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
              Nuevo medicamento
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
            {!showPrescription && purposeValue ? (
              <Text className="font-sans text-[11px] text-cobalto/60">
                Texto oculto
              </Text>
            ) : null}
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

          <Button
            block
            disabled={isSubmitting}
            loading={isSubmitting}
            onPress={onSubmit}
            variant="cobalto"
          >
            Registrar
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
