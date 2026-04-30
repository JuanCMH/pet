import { Star } from "lucide-react-native";
import { View } from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

export type StarRatingProps = {
  value: number;
  max?: number;
  size?: number;
  className?: string;
};

export function StarRating({
  value,
  max = 5,
  size = 16,
  className,
}: StarRatingProps) {
  const safeMax = Math.max(1, Math.floor(max));
  const activeCount = Math.min(safeMax, Math.max(0, Math.floor(value)));

  return (
    <View className={cn("flex-row items-center gap-1", className)}>
      {Array.from({ length: safeMax }, (_, index) => {
        const isActive = index < activeCount;
        const color = isActive ? AppColors.amarillo : AppColors.gris;

        return (
          <Star
            color={color}
            fill={color}
            key={index}
            size={size}
            strokeWidth={1.75}
          />
        );
      })}
    </View>
  );
}
