import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import {
  AuthLinkLine,
  AuthScreen,
  AuthTitle,
} from "@/components/auth/auth-screen";
import { Button } from "@/components/system/button";
import { TextInputField } from "@/components/system/text-input";
import { api } from "@/convex/_generated/api";
import { getErrorMessage } from "@/lib/get-error-message";
import { PASSWORD_HELPER_TEXT, validatePassword } from "@/lib/password";

const homeRoute = "/" as Href;
const loginRoute = "/login" as Href;
const appRoute = "/(tabs)" as Href;

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const updateProfile = useMutation(api.users.updateProfile);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const goBack = () => {
    router.replace(homeRoute);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Completa todos los campos para registrarte.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setPending(true);
    try {
      const trimmedName = name.trim();
      await signIn("password", {
        name: trimmedName,
        email: email.trim().toLowerCase(),
        password,
        flow: "signUp",
      });
      await updateProfile({ name: trimmedName });
      router.replace(appRoute);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthScreen
      description="Llena tus datos para empezar"
      footer={
        <AuthLinkLine
          linkText="Inicia sesión"
          onPress={() => router.push(loginRoute)}
          text="¿Ya tienes una cuenta?"
        />
      }
      onBack={goBack}
      title={<AuthTitle accent="petWell">Bienvenido(a) a</AuthTitle>}
    >
      <TextInputField
        autoCapitalize="words"
        label="Nombre completo"
        onChangeText={setName}
        placeholder="Ej: Juan Camilo Pérez Gómez"
        textContentType="name"
        value={name}
      />
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
        helperText={PASSWORD_HELPER_TEXT}
        label="Contraseña"
        onChangeText={setPassword}
        secureTextEntry
        textContentType="newPassword"
        value={password}
      />
      <TextInputField
        label="Repetir contraseña"
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
        Regístrate
      </Button>
    </AuthScreen>
  );
}
