import { Settings } from "lucide-react-native";
import type { ImageSourcePropType } from "react-native";
import { Pressable, Text, View } from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

import { Avatar } from "./avatar";

export type UserBannerProps = {
  avatar: ImageSourcePropType | string;
  name: string;
  className?: string;
  disabled?: boolean;
  onSettingsPress?: () => void;
};

export function UserBanner({
  avatar,
  name,
  className,
  disabled = false,
  onSettingsPress,
}: UserBannerProps) {
  return (
    <View
      className={cn(
        "w-full flex-row items-center gap-3 rounded-component border border-gris bg-blanco px-4 py-3 shadow-sm",
        disabled && "opacity-60",
        className,
      )}
    >
      <Avatar alt={`Avatar de ${name}`} size="md" source={avatar} />

      <View className="flex-1 justify-center">
        <Text className="font-extralight text-[24px] leading-[28px] text-cobalto">
          ¡Hola!
        </Text>
        <Text
          className="font-medium text-[24px] leading-[28px] text-cobalto"
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>

      <Pressable
        accessibilityLabel="Abrir configuración"
        accessibilityRole="button"
        className="items-center justify-center"
        disabled={disabled || !onSettingsPress}
        hitSlop={8}
        onPress={onSettingsPress}
      >
        <Settings color={AppColors.cobalto} size={24} strokeWidth={2} />
      </Pressable>
    </View>
  );
}
