import { ArrowRight, Clock, MapPinHouse } from "lucide-react-native";
import { Pressable, View, type PressableProps } from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

import { CardRow } from "./card-row";
import { StarRating } from "./star-rating";

export type MapItemCardProps = {
  name: string;
  schedule: string;
  stars: number;
  className?: string;
  disabled?: boolean;
  onPress?: PressableProps["onPress"];
};

export function MapItemCard({
  name,
  schedule,
  stars,
  className,
  disabled = false,
  onPress,
}: MapItemCardProps) {
  const cardClassName = cn(
    "w-full gap-2 rounded-component border border-gris bg-blanco px-4 py-3 shadow-sm",
    disabled && "opacity-60",
    className,
  );

  const content = (
    <>
      <CardRow
        leading={
          <MapPinHouse color={AppColors.cobalto} size={16} strokeWidth={2} />
        }
        primary={name}
        primaryClassName="font-semibold"
        trailing={<StarRating value={stars} />}
      />

      <CardRow
        leading={<Clock color={AppColors.cobalto} size={16} strokeWidth={2} />}
        primary={schedule}
        trailingLeading={
          <ArrowRight color={AppColors.cobalto} size={16} strokeWidth={2} />
        }
      />
    </>
  );

  if (!onPress) {
    return <View className={cardClassName}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      className={cardClassName}
      disabled={disabled}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}
