import {
  Circle,
  CircleCheck,
  CircleX,
  Link2,
  LoaderCircle,
} from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

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
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (status === "connecting") {
      rotation.value = 0;
      rotation.value = withRepeat(
        withTiming(360, { duration: 900, easing: Easing.linear }),
        -1,
        false,
      );
      return () => {
        cancelAnimation(rotation);
      };
    }

    cancelAnimation(rotation);
    rotation.value = 0;
  }, [rotation, status]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  switch (status) {
    case "connecting":
      return (
        <Animated.View style={animatedStyle}>
          <LoaderCircle color={AppColors.cobalto} size={16} strokeWidth={2} />
        </Animated.View>
      );
    case "available":
      return <Circle color={AppColors.cobalto} size={16} strokeWidth={2} />;
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
    <View className={cn("gap-1", className)}>
      <Text className="font-semibold text-[14px] text-cobalto">{label}</Text>

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
