import type { ImageSourcePropType } from "react-native";
import { View } from "react-native";

import { cn } from "@/lib/utils";

import { Avatar } from "./avatar";
import { DeviceField } from "./device-field";

export type PetItemCardProps = {
  avatar: ImageSourcePropType | string;
  name: string;
  deviceName: string;
  className?: string;
  disabled?: boolean;
  onDevicePress?: () => void;
};

export function PetItemCard({
  avatar,
  name,
  deviceName,
  className,
  disabled = false,
  onDevicePress,
}: PetItemCardProps) {
  return (
    <View
      className={cn(
        "w-full flex-row items-start gap-3 rounded-component border border-gris bg-blanco px-4 py-3 shadow-sm",
        disabled && "opacity-60",
        className,
      )}
    >
      <Avatar alt={`Avatar de ${name}`} size="md" source={avatar} />

      <View className="flex-1">
        <DeviceField
          className="gap-1"
          disabled={disabled}
          label={name}
          onPress={onDevicePress}
          status="connected"
          value={deviceName}
        />
      </View>
    </View>
  );
}
