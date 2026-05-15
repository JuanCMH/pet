import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import * as ImagePicker from "expo-image-picker";
import { type Href, useRouter } from "expo-router";
import { ChevronRight, LogOut } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileHeader } from "@/components/auth/profile-header";
import {
  Button,
  ControlledTextInputField,
  SelectField,
  useToast,
} from "@/components/system";
import { AppColors } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { resolveUserAvatar } from "@/lib/avatar-fallbacks";
import { getErrorMessage } from "@/lib/get-error-message";
import { uploadImageToStorage } from "@/lib/upload-image";

const passwordRoute = "/(tabs)/profile-password" as Href;

type DocumentType = "cc" | "ti" | "ce";

type ProfileFormValues = {
  fullName: string;
  documentNumber: string;
  documentType: DocumentType;
  email: string;
  phone: string;
  address: string;
};

const documentTypeOptions = [
  { label: "CC", value: "cc" },
  { label: "TI", value: "ti" },
  { label: "CE", value: "ce" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const currentUser = useQuery(
    api.users.getCurrent,
    isAuthenticated ? {} : "skip",
  );
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const { control, handleSubmit, reset, watch, setValue, formState } =
    useForm<ProfileFormValues>({
      defaultValues: {
        fullName: "",
        documentNumber: "",
        documentType: "cc",
        email: "",
        phone: "",
        address: "",
      },
    });

  const documentType = watch("documentType");

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    reset({
      fullName: currentUser.name ?? "",
      documentNumber: currentUser.documentNumber ?? "",
      documentType:
        (currentUser.documentType as DocumentType | undefined) ?? "cc",
      email: currentUser.email ?? "",
      phone: currentUser.phone ?? "",
      address: currentUser.address ?? "",
    });
  }, [currentUser, reset]);

  const handleEditAvatar = async () => {
    setSubmitError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setSubmitError(
        "Debes permitir el acceso a tus fotos para cambiar tu avatar.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ["images"],
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    if (!asset?.uri) {
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const storageId = await uploadImageToStorage(
        asset.uri,
        generateUploadUrl,
      );
      await updateProfile({ avatar: storageId });
    } catch (caughtError) {
      setSubmitError(getErrorMessage(caughtError));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSignOut = () => {
    void signOut();
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await updateProfile({
        name: values.fullName.trim(),
        phone: values.phone.trim() || undefined,
        documentType: values.documentType,
        documentNumber: values.documentNumber.trim() || undefined,
        address: values.address.trim() || undefined,
      });
      reset(values);
      showToast({ message: "Perfil actualizado.", variant: "success" });
    } catch (caughtError) {
      setSubmitError(getErrorMessage(caughtError));
    }
  });

  const avatar = resolveUserAvatar(
    currentUser?.avatarUrl ?? currentUser?.image ?? undefined,
  );
  const avatarAlt = currentUser?.name
    ? `Avatar de ${currentUser.name}`
    : "Avatar del usuario";

  if (isAuthenticated && currentUser === undefined) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-blanco"
        edges={["top"]}
      >
        <ActivityIndicator color={AppColors.cobalto} size="large" />
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
        <View className="flex-1 gap-6 px-5 pt-2 pb-8">
          <ProfileHeader
            avatar={avatar}
            avatarAlt={avatarAlt}
            isAvatarUploading={isUploadingAvatar}
            onBack={() => router.back()}
            onEditAvatarPress={() => {
              void handleEditAvatar();
            }}
          />

          <Button
            block
            className="justify-between px-4"
            onPress={() => router.push(passwordRoute)}
            rightIcon={
              <ChevronRight
                color={AppColors.blanco}
                size={18}
                strokeWidth={2}
              />
            }
            variant="cyan"
          >
            Contraseña
          </Button>

          <View className="gap-4">
            <ControlledTextInputField
              control={control}
              label="Nombre completo *"
              name="fullName"
              placeholder="Juan Camilo Pérez Gómez"
              rules={{ required: "Ingresa tu nombre completo." }}
            />

            <View className="flex-row items-end gap-2">
              <ControlledTextInputField
                className="flex-1"
                control={control}
                keyboardType="number-pad"
                label="Documento de identidad *"
                name="documentNumber"
                placeholder="10208467590"
                rules={{ required: "Ingresa tu documento." }}
              />

              <SelectField
                className="w-20"
                label={"\u00A0"}
                onValueChange={(value) =>
                  setValue("documentType", value as DocumentType, {
                    shouldDirty: true,
                  })
                }
                options={documentTypeOptions}
                value={documentType}
              />
            </View>

            <ControlledTextInputField
              autoCapitalize="none"
              autoCorrect={false}
              control={control}
              editable={false}
              keyboardType="email-address"
              label="Correo electrónico *"
              name="email"
              placeholder="juan.perez@email.com"
              rules={{
                required: "Ingresa tu correo.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Correo no válido.",
                },
              }}
            />

            <ControlledTextInputField
              control={control}
              keyboardType="phone-pad"
              label="Teléfono"
              name="phone"
              placeholder="3115983867"
            />

            <ControlledTextInputField
              control={control}
              label="Dirección"
              name="address"
              placeholder="Cl. 166 #8d - 44"
            />

            {submitError ? (
              <Text className="text-center font-sans text-[12px] text-rojo">
                {submitError}
              </Text>
            ) : null}
          </View>

          <Button
            block
            className="mt-4"
            disabled={!formState.isDirty}
            loading={formState.isSubmitting}
            onPress={onSubmit}
          >
            Actualizar información
          </Button>

          <Button
            block
            className="mt-2 border-rojo"
            leftIcon={
              <LogOut color={AppColors.rojo} size={16} strokeWidth={2.4} />
            }
            onPress={handleSignOut}
            textClassName="text-rojo"
            variant="outline"
          >
            Cerrar sesión
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
