import { useAuthActions } from "@convex-dev/auth/react";
import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { AuthScreen } from "@/components/auth/auth-screen";
import { Button } from "@/components/system/button";
import { TextInputField } from "@/components/system/text-input";
import { getErrorMessage } from "@/lib/get-error-message";

const newPasswordRoute = "/new-password" as Href;

export default function RecoverPasswordScreen() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/" as Href);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    setPending(true);
    try {
      await signIn("password", { email: normalizedEmail, flow: "reset" });
      router.push({
        pathname: newPasswordRoute,
        params: { email: normalizedEmail },
      } as Href);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthScreen
      description="No te preocupes, enviaremos un código al correo."
      onBack={goBack}
      title="Recuperación de contraseña"
    >
      <TextInputField
        autoCapitalize="none"
        inputMode="email"
        keyboardType="email-address"
        label="Correo electrónico"
        onChangeText={setEmail}
        placeholder="Ej: juan.perez@email.com"
        textContentType="emailAddress"
        value={email}
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
