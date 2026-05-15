import { useAuthActions } from "@convex-dev/auth/react";
import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { AuthLinkLine, AuthScreen } from "@/components/auth/auth-screen";
import { Button } from "@/components/system/button";
import { TextInputField } from "@/components/system/text-input";
import { getErrorMessage } from "@/lib/get-error-message";

const homeRoute = "/" as Href;
const registerRoute = "/register" as Href;
const recoverPasswordRoute = "/recover-password" as Href;
const appRoute = "/(tabs)" as Href;

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const goBack = () => {
    router.replace(homeRoute);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim() || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    setPending(true);
    try {
      await signIn("password", {
        email: email.trim().toLowerCase(),
        password,
        flow: "signIn",
      });
      router.replace(appRoute);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthScreen
      description="Estamos emocionados de verte otra vez"
      footer={
        <AuthLinkLine
          linkText="Crea una cuenta"
          onPress={() => router.push(registerRoute)}
          text="¿Aún no te has registrado?"
        />
      }
      onBack={goBack}
      title="Bienvenido(a) de nuevo"
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
      <TextInputField
        label="Contraseña"
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
        value={password}
      />
      <AuthLinkLine
        linkText="Recuperar"
        onPress={() => router.push(recoverPasswordRoute)}
        text="¿Olvidaste tu contraseña?"
      />
      {error ? (
        <Text className="text-center text-[13px] leading-[20px] text-rojo">
          {error}
        </Text>
      ) : null}
      <Button block loading={pending} onPress={handleSubmit} variant="cobalto">
        Iniciar sesión
      </Button>
    </AuthScreen>
  );
}
