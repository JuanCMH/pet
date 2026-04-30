import {
  Circle,
  CircleCheck,
  CircleX,
  Link2,
  LoaderCircle,
} from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

export type DeviceFieldStatus =
  | "idle"
  | "connecting"
  | "available"
  | "connected"
  | "disconnected";

export type DeviceFieldProps = {
  label: string;
  value?: string;
  placeholder?: string;
  status?: DeviceFieldStatus;
  onPress?: () => void;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
};

function DeviceStatusIcon({ status }: { status: DeviceFieldStatus }) {
  switch (status) {
    case "connecting":
      return (
        <LoaderCircle color={AppColors.cobalto} size={16} strokeWidth={2} />
      );
    case "available":
      return <Circle size={16} strokeWidth={2} />;
    case "connected":
      return <CircleCheck color={AppColors.verde} size={16} strokeWidth={2} />;
    case "disconnected":
      return <CircleX color={AppColors.rojo} size={16} strokeWidth={2} />;
    default:
      return null;
  }
}

export function DeviceField({
  label,
  value,
  placeholder = "Dispositivo",
  status = "idle",
  onPress,
  className,
  triggerClassName,
  disabled = false,
}: DeviceFieldProps) {
  return (
    <View className={cn("gap-2", className)}>
      <Text className="font-bold text-[14px] text-cobalto">{label}</Text>

      <Pressable
        accessibilityRole="button"
        className={cn(
          "min-h-9 flex-row items-center justify-between rounded-component border border-gris bg-blanco px-2 py-2 shadow-sm",
          disabled && "opacity-60",
          triggerClassName,
        )}
        disabled={disabled}
        onPress={onPress}
      >
        <View className="flex-1 flex-row items-center gap-2 pr-2">
          <Link2 color={AppColors.cobalto} size={16} strokeWidth={2} />

          <Text
            className={cn(
              "flex-1 font-semibold text-sm",
              value ? "text-cobalto" : "text-cobalto/50",
            )}
            numberOfLines={1}
          >
            {value ?? placeholder.trim()}
          </Text>
        </View>

        <DeviceStatusIcon status={status} />
      </Pressable>
    </View>
  );
}
