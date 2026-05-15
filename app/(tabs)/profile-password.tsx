import { useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthLinkLine } from "@/components/auth/auth-screen";
import { ProfileHeader } from "@/components/auth/profile-header";
import { Button, ControlledTextInputField } from "@/components/system";
import { api } from "@/convex/_generated/api";
import { resolveUserAvatar } from "@/lib/avatar-fallbacks";
import { getErrorMessage } from "@/lib/get-error-message";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { type Href, useRouter } from "expo-router";
import { Alert } from "react-native";

const recoverRoute = "/recover-password" as Href;

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  repeatPassword: string;
};

export default function ProfilePasswordScreen() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const currentUser = useQuery(
    api.users.getCurrent,
    isAuthenticated ? {} : "skip",
  );

  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, watch, formState, reset } =
    useForm<PasswordFormValues>({
      defaultValues: {
        currentPassword: "",
        newPassword: "",
        repeatPassword: "",
      },
    });

  const newPasswordValue = watch("newPassword");

  const onSubmit = handleSubmit(async (values) => {
    setError(null);

    if (!currentUser?.email) {
      setError("No pudimos identificar tu cuenta. Vuelve a iniciar sesión.");
      return;
    }

    if (values.newPassword !== values.repeatPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (values.newPassword === values.currentPassword) {
      setError("La nueva contraseña debe ser distinta a la actual.");
      return;
    }

    try {

      await signIn("password", {
        email: currentUser.email,
        password: values.currentPassword,
        flow: "signIn",
      });

      await signIn("password", {
        email: currentUser.email,
        flow: "reset",
      });

      Alert.alert(
        "Código enviado",
        "Te enviamos un código a tu correo para confirmar el cambio.",
        [
          {
            text: "Continuar",
            onPress: () => {
              reset();
              router.push({
                pathname: "/new-password",
                params: { email: currentUser.email ?? "" },
              } as Href);
            },
          },
        ],
      );
    } catch (caughtError) {
      setError(
        getErrorMessage(caughtError) || "La contraseña actual no es válida.",
      );
    }
  });

  const avatar = resolveUserAvatar(
    currentUser?.avatarUrl ?? currentUser?.image ?? undefined,
  );
  const avatarAlt = currentUser?.name
    ? `Avatar de ${currentUser.name}`
    : "Avatar del usuario";

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
            onBack={() => router.back()}
          />

          <View className="gap-4">
            <ControlledTextInputField
              autoCapitalize="none"
              autoCorrect={false}
              control={control}
              label="Contraseña actual"
              name="currentPassword"
              rules={{ required: "Ingresa tu contraseña actual." }}
              secureTextEntry
            />

            <ControlledTextInputField
              autoCapitalize="none"
              autoCorrect={false}
              control={control}
              label="Nueva contraseña"
              name="newPassword"
              rules={{
                required: "Ingresa una nueva contraseña.",
                minLength: {
                  value: 8,
                  message: "Debe tener al menos 8 caracteres.",
                },
              }}
              secureTextEntry
            />

            <ControlledTextInputField
              autoCapitalize="none"
              autoCorrect={false}
              control={control}
              label="Repetir nueva contraseña"
              name="repeatPassword"
              rules={{
                required: "Repite la nueva contraseña.",
                validate: (value) =>
                  value === newPasswordValue || "Las contraseñas no coinciden.",
              }}
              secureTextEntry
            />

            {error ? (
              <Text className="text-center font-sans text-[12px] text-rojo">
                {error}
              </Text>
            ) : null}
          </View>

          <View className="mt-2">
            <AuthLinkLine
              linkText="Recuperar"
              onPress={() => router.push(recoverRoute)}
              text="¿Olvidaste tu contraseña?"
            />
          </View>

          <Button
            className="mt-4 self-end"
            loading={formState.isSubmitting}
            onPress={onSubmit}
            variant="cyan"
          >
            Actualizar contraseña
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
