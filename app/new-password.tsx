import { useAuthActions } from "@convex-dev/auth/react";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { AuthScreen } from "@/components/auth/auth-screen";
import { Button } from "@/components/system/button";
import { TextInputField } from "@/components/system/text-input";
import { getErrorMessage } from "@/lib/get-error-message";
import { PASSWORD_HELPER_TEXT, validatePassword } from "@/lib/password";

const homeRoute = "/" as Href;
const loginRoute = "/login" as Href;

export default function NewPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { signIn } = useAuthActions();
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const goBack = () => {
    router.replace(homeRoute);
  };

  const handleSubmit = async () => {
    setError(null);

    const email = params.email?.trim().toLowerCase();
    if (!email) {
      setError("Vuelve a solicitar el código con tu correo electrónico.");
      return;
    }

    if (!code.trim() || !newPassword || !confirmPassword) {
      setError("Completa el código y la nueva contraseña.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setPending(true);
    try {
      await signIn("password", {
        email,
        code: code.trim(),
        newPassword,
        flow: "reset-verification",
      });
      router.replace(loginRoute);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthScreen
      description="Ingresa el código y actualiza tu contraseña."
      onBack={goBack}
      title="Recuperación de contraseña"
    >
      <TextInputField
        inputMode="numeric"
        keyboardType="number-pad"
        label="Código"
        onChangeText={setCode}
        value={code}
      />
      <TextInputField
        helperText={PASSWORD_HELPER_TEXT}
        label="Nueva contraseña"
        onChangeText={setNewPassword}
        secureTextEntry
        textContentType="newPassword"
        value={newPassword}
      />
      <TextInputField
        label="Repetir nueva contraseña"
        onChangeText={setConfirmPassword}
        secureTextEntry
        textContentType="newPassword"
        value={confirmPassword}
      />
      {error ? (
        <Text className="text-center text-[13px] leading-[20px] text-rojo">
          {error}
        </Text>
      ) : null}
      <Button block loading={pending} onPress={handleSubmit} variant="cobalto">
        Enviar código
      </Button>
    </AuthScreen>
  );
}
