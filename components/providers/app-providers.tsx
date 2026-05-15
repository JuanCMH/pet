import { MobileShell } from "@/components/system/mobile-shell";
import { ToastProvider } from "@/components/system/toast";
import { ConvexAuthProvider, type TokenStorage } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { usePathname } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { type PropsWithChildren, useMemo } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { EmergencyAlertProvider } from "./emergency-alert-provider";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

const secureStorage: TokenStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

export function AppProviders({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const convexClient = useMemo(() => {
    if (!convexUrl) {
      return null;
    }

    return new ConvexReactClient(convexUrl, {
      unsavedChangesWarning: false,
    });
  }, []);

  const appContent =
    pathname === "/components" ? (
      children
    ) : (
      <MobileShell>{children}</MobileShell>
    );

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>{appContent}</ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );

  if (!convexClient) {
    return content;
  }

  return (
    <ConvexAuthProvider
      client={convexClient}
      storage={Platform.OS === "web" ? undefined : secureStorage}
    >
      <EmergencyAlertProvider>{content}</EmergencyAlertProvider>
    </ConvexAuthProvider>
  );
}
