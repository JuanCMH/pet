import { cva, type VariantProps } from "class-variance-authority";
import { ChartSpline } from "lucide-react-native";
import type { ImageSourcePropType } from "react-native";
import { Text, View } from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

import { Avatar } from "./avatar";

const petStatusVariants = cva(
  "min-h-9 flex-row items-center gap-2 rounded-component border px-2 shadow-sm",
  {
    variants: {
      status: {
        healthy: "border-verde bg-verde/15",
        attention: "border-amarillo bg-amarillo/15",
        critical: "border-rojo bg-rojo/15",
      },
    },
    defaultVariants: {
      status: "healthy",
    },
  },
);

const petStatusTextByVariant = {
  healthy: "Buen estado general",
  attention: "Requiere seguimiento",
  critical: "Atención inmediata",
} as const;

const petStatusColorByVariant = {
  healthy: AppColors.verde,
  attention: AppColors.amarillo,
  critical: AppColors.rojo,
} as const;

export type PetStatusCardProps = VariantProps<typeof petStatusVariants> & {
  petAvatar: ImageSourcePropType | string;
  petName: string;
  userAvatar: ImageSourcePropType | string;
  statusLabel?: string;
  className?: string;
  disabled?: boolean;
};

export function PetStatusCard({
  petAvatar,
  petName,
  userAvatar,
  status,
  statusLabel,
  className,
  disabled = false,
}: PetStatusCardProps) {
  const resolvedStatus = status ?? "healthy";
  const resolvedStatusLabel =
    statusLabel ?? petStatusTextByVariant[resolvedStatus];
  const statusColor = petStatusColorByVariant[resolvedStatus];

  return (
    <View
      className={cn(
        "w-full flex-row items-start gap-3 rounded-component border border-gris bg-blanco px-4 py-3 shadow-sm",
        disabled && "opacity-60",
        className,
      )}
    >
      <Avatar alt={`Avatar de ${petName}`} size="md" source={petAvatar} />

      <View className="flex-1 gap-2">
        <View className="flex-row items-start justify-between gap-2">
          <Text
            className="flex-1 font-semibold text-[14px] text-cobalto"
            numberOfLines={1}
          >
            {petName}
          </Text>

          <Avatar alt="Avatar del usuario" size="sm" source={userAvatar} />
        </View>

        <View className={petStatusVariants({ status: resolvedStatus })}>
          <Text
            className="flex-1 font-medium text-sm text-cobalto"
            numberOfLines={1}
          >
            {resolvedStatusLabel}
          </Text>

          <ChartSpline color={statusColor} size={16} strokeWidth={2} />
        </View>
      </View>
    </View>
  );
}

export { petStatusVariants };
