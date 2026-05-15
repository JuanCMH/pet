import { ArrowLeft, SquarePen } from "lucide-react-native";
import type { ImageSourcePropType } from "react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/system";
import { AppColors } from "@/constants/theme";

export type ProfileHeaderProps = {
  avatar: ImageSourcePropType | string;
  avatarAlt: string;
  onBack: () => void;
  onEditAvatarPress?: () => void;
  isAvatarUploading?: boolean;
};

export function ProfileHeader({
  avatar,
  avatarAlt,
  onBack,
  onEditAvatarPress,
  isAvatarUploading = false,
}: ProfileHeaderProps) {
  return (
    <View className="gap-6">
      <View className="h-10 flex-row items-center justify-center">
        <Pressable
          accessibilityLabel="Regresar"
          accessibilityRole="button"
          className="absolute left-0 h-10 w-10 items-center justify-center"
          hitSlop={12}
          onPress={onBack}
        >
          <ArrowLeft color={AppColors.cobalto} size={24} strokeWidth={2.4} />
        </Pressable>

        <Text className="font-bold text-[20px] leading-[24px] text-cobalto">
          Perfil
        </Text>
      </View>

      <View className="items-center">
        <View className="relative">
          <Avatar alt={avatarAlt} size="lg" source={avatar} />

          <Pressable
            accessibilityLabel="Editar avatar"
            accessibilityRole="button"
            className="absolute right-2 bottom-2 h-9 w-9 items-center justify-center rounded-full border border-cobalto bg-blanco shadow-sm"
            disabled={isAvatarUploading}
            hitSlop={6}
            onPress={onEditAvatarPress}
          >
            {isAvatarUploading ? (
              <ActivityIndicator color={AppColors.cobalto} size="small" />
            ) : (
              <SquarePen color={AppColors.cobalto} size={24} strokeWidth={2} />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
