import { ConvexProvider, ConvexReactClient } from "convex/react";
import { type PropsWithChildren, useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

export function AppProviders({ children }: PropsWithChildren) {
  const convexClient = useMemo(() => {
    if (!convexUrl) {
      return null;
    }

    return new ConvexReactClient(convexUrl, {
      unsavedChangesWarning: false,
    });
  }, []);

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </GestureHandlerRootView>
  );

  if (!convexClient) {
    return content;
  }

  return <ConvexProvider client={convexClient}>{content}</ConvexProvider>;
}
