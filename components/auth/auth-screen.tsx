import { ArrowLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppColors } from "@/constants/theme";

type AuthScreenProps = {
  title: ReactNode;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  onBack: () => void;
};

export function AuthScreen({
  title,
  description,
  children,
  footer,
  onBack,
}: AuthScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-blanco">
      <ScrollView
        bounces={false}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-5 pb-7 pt-2">
          <View className="min-h-10 items-start justify-center">
            <Pressable
              accessibilityLabel="Regresar"
              accessibilityRole="button"
              className="h-10 w-10 items-center justify-center"
              hitSlop={12}
              onPress={onBack}
            >
              <ArrowLeft
                color={AppColors.cobalto}
                size={24}
                strokeWidth={2.4}
              />
            </Pressable>
          </View>

          <View className="w-full max-w-[370px] flex-1 self-center justify-center gap-8">
            <View className="items-center gap-4">
              {typeof title === "string" ? (
                <Text className="text-center font-bold text-[32px] leading-[38px] text-cobalto">
                  {title}
                </Text>
              ) : (
                title
              )}
              <Text className="max-w-[330px] text-center font-montserrat-light text-[16px] leading-[24px] text-cobalto">
                {description}
              </Text>
            </View>

            <View className="w-full gap-4">{children}</View>

            {footer ? (
              <View className="items-center gap-4">{footer}</View>
            ) : null}
          </View>

          <Image
            className="mt-8 self-center"
            resizeMode="contain"
            source={require("@/assets/images/icon.png")}
            style={{ height: 120, width: 120 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function AuthTitle({
  children,
  accent,
}: {
  children: ReactNode;
  accent?: ReactNode;
}) {
  return (
    <View className="items-center">
      <Text className="text-center font-bold text-[32px] leading-[38px] text-cobalto">
        {children}
      </Text>
      {accent ? (
        <Text className="text-center font-bold text-[32px] leading-[38px] text-cobalto">
          {accent}
        </Text>
      ) : null}
    </View>
  );
}

export function AuthLinkLine({
  text,
  linkText,
  onPress,
}: {
  text: string;
  linkText: string;
  onPress: () => void;
}) {
  return (
    <Text className="text-center font-sans text-[14px] leading-[22px] text-cobalto">
      {text}{" "}
      <Text className="font-bold text-celeste" onPress={onPress}>
        {linkText}
      </Text>
    </Text>
  );
}
