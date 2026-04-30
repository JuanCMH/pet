import { Text, View } from "react-native";

import { cn } from "@/lib/utils";

export type FloatingCardProps = {
  title?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
};

export function FloatingCard({
  title = "Vincular dispositivo",
  description = "Vive la experiencia completa en solo dos pasos:\n1. Haz clic para vincular un nuevo dispositivo.\n2. Selecciona el dispositivo de la lista.",
  className,
  disabled = false,
}: FloatingCardProps) {
  return (
    <View
      className={cn(
        "w-full max-w-[338px] items-center gap-3 rounded-component border border-gris bg-blanco p-4 shadow-sm",
        disabled && "opacity-60",
        className,
      )}
    >
      <Text className="text-center font-medium text-[24px] leading-[28px] text-cobalto">
        {title}
      </Text>

      <Text className="text-center font-light text-[16px] leading-[22px] text-cobalto">
        {description}
      </Text>
    </View>
  );
}
