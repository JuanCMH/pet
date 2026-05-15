import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ProjectScreenPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon?: ReactNode;
};

export function ProjectScreenPlaceholder({
  eyebrow,
  title,
  description,
  icon,
}: ProjectScreenPlaceholderProps) {
  return (
    <SafeAreaView className="flex-1 bg-blanco">
      <View className="flex-1 items-center justify-center px-5">
        <View className="w-full max-w-[370px] items-center gap-6 rounded-component border border-gris bg-blanco px-5 py-8 shadow-sm">
          {icon ? (
            <View className="h-16 w-16 items-center justify-center rounded-full bg-cobalto">
              {icon}
            </View>
          ) : null}

          <View className="items-center gap-2">
            <Text className="text-center font-bold text-[12px] uppercase tracking-[2px] text-celeste">
              {eyebrow}
            </Text>
            <Text className="text-center font-bold text-[28px] leading-[34px] text-cobalto">
              {title}
            </Text>
          </View>

          <Text className="max-w-[300px] text-center font-montserrat-light text-[16px] leading-[24px] text-cobalto">
            {description}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
