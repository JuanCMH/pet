import type { VariantProps } from "class-variance-authority";
import { Hourglass, Pill, SquarePen } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

import { CardRow } from "./card-row";
import {
  medicationStatusLabelByVariant,
  medicationStatusTextVariants,
} from "./medication-status";

export type MedicationItemCardProps = VariantProps<
  typeof medicationStatusTextVariants
> & {
  petName: string;
  medicationName: string;
  time: string;
  statusLabel?: string;
  className?: string;
  disabled?: boolean;
  onEditPress?: () => void;
};

export function MedicationItemCard({
  petName,
  medicationName,
  time,
  status,
  statusLabel,
  className,
  disabled = false,
  onEditPress,
}: MedicationItemCardProps) {
  const resolvedStatus = status ?? "onTime";
  const resolvedStatusLabel =
    statusLabel ?? medicationStatusLabelByVariant[resolvedStatus];

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
          <Pressable
            accessibilityLabel="Editar medicamento"
            accessibilityRole="button"
            disabled={disabled || !onEditPress}
            hitSlop={10}
            onPress={onEditPress}
          >
            <SquarePen color={AppColors.cobalto} size={16} strokeWidth={2} />
          </Pressable>
        }
        primary={petName}
        primaryClassName="font-semibold"
        trailing={resolvedStatusLabel}
        trailingClassName={medicationStatusTextVariants({
          status: resolvedStatus,
        })}
      />

      <CardRow
        leading={<Pill color={AppColors.cobalto} size={16} strokeWidth={2} />}
        primary={medicationName}
        trailingLeading={
          <Hourglass color={AppColors.cobalto} size={16} strokeWidth={2} />
        }
        trailing={time}
      />
    </View>
  );
}
