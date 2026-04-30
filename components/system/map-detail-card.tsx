import { Clock, MapPinHouse, Phone } from "lucide-react-native";
import { Text, View } from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

import { Button } from "./button";
import { CardRow } from "./card-row";
import { StarRating } from "./star-rating";

export type MapDetailCardProps = {
  name: string;
  schedule: string;
  phone: string;
  address: string;
  stars: number;
  buttonLabel?: string;
  className?: string;
  disabled?: boolean;
  onMapsPress?: () => void;
};

export function MapDetailCard({
  name,
  schedule,
  phone,
  address,
  stars,
  buttonLabel = "Google maps",
  className,
  disabled = false,
  onMapsPress,
}: MapDetailCardProps) {
  return (
    <View
      className={cn(
        "w-full gap-2 rounded-component border border-gris bg-blanco px-4 py-3 shadow-sm",
        disabled && "opacity-60",
        className,
      )}
    >
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
          <Phone color={AppColors.cobalto} size={16} strokeWidth={2} />
        }
        trailing={phone}
      />

      <Text className="font-light text-[16px] leading-[22px] text-cobalto">
        {address}
      </Text>

      <Button
        className="self-end"
        disabled={disabled}
        onPress={onMapsPress}
        variant="cyan"
      >
        {buttonLabel}
      </Button>
    </View>
  );
}
