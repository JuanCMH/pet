import { AppColors } from "@/constants/theme";
import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

export const MOBILE_SHELL_MAX_WIDTH = 430;

export function MobileShell({ children }: PropsWithChildren) {
  return (
    <View style={styles.backdrop}>
      <View style={styles.shell}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    backgroundColor: AppColors.cobalto,
  },
  shell: {
    flex: 1,
    width: "100%",
    maxWidth: MOBILE_SHELL_MAX_WIDTH,
    overflow: "hidden",
    backgroundColor: AppColors.blanco,
    shadowColor: AppColors.negro,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 36,
    elevation: 12,
  },
});
