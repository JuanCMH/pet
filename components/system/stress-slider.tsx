import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

export type StressLevel = "rest" | "medium" | "high" | "excessive";

export type StressSliderProps = {

  value: number;
  className?: string;
  disabled?: boolean;
};

const STRESS_LABELS: { key: StressLevel; label: string }[] = [
  { key: "rest", label: "Reposo" },
  { key: "medium", label: "Mediano" },
  { key: "high", label: "Alto" },
  { key: "excessive", label: "Excesivo" },
];

const TRACK_HEIGHT = 12;
const KNOB_SIZE = 18;

export function StressSlider({
  value,
  className,
  disabled = false,
}: StressSliderProps) {
  const clampedValue = Math.min(1, Math.max(0, value));

  return (
    <View className={cn("w-full gap-2", disabled && "opacity-60", className)}>
      <View className="relative w-full justify-center">
        <LinearGradient
          colors={[
            AppColors.verde,
            AppColors.amarillo,
            AppColors.amarillo,
            AppColors.rojo,
          ]}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={{
            height: TRACK_HEIGHT,
            borderRadius: TRACK_HEIGHT / 2,
            width: "100%",
          }}
        />

        <View
          style={{
            position: "absolute",
            left: `${clampedValue * 100}%`,
            marginLeft: -KNOB_SIZE / 2,
            height: KNOB_SIZE,
            width: KNOB_SIZE,
            borderRadius: KNOB_SIZE / 2,
            backgroundColor: AppColors.blanco,
            borderWidth: 2,
            borderColor: AppColors.cobalto,
            shadowColor: AppColors.negro,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 2,
            elevation: 2,
          }}
        />
      </View>

      <View className="w-full flex-row justify-between">
        {STRESS_LABELS.map((entry) => (
          <Text
            className="font-semibold text-[12px] text-cobalto"
            key={entry.key}
          >
            {entry.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
