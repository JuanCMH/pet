import type { LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

export type StatusItemProps = {
  icon: LucideIcon;
  title: string;
  value: string;
  className?: string;
  disabled?: boolean;
};

export function StatusItem({
  icon: Icon,
  title,
  value,
  className,
  disabled = false,
}: StatusItemProps) {
  return (
    <View
      className={cn(
        "h-8 w-full flex-row items-center gap-2 rounded-component bg-celeste px-2",
        disabled && "opacity-60",
        className,
      )}
    >
      <Icon color={AppColors.blanco} size={16} strokeWidth={2} />

      <Text
        className="flex-1 font-semibold text-[14px] text-blanco"
        numberOfLines={1}
      >
        {title}
      </Text>

      <Text className="text-[14px] text-blanco" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
