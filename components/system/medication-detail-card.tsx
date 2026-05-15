import type { VariantProps } from "class-variance-authority";
import {
  Hourglass,
  ListChecks,
  Pill,
  SquarePen,
  Timer,
} from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

import { Button } from "./button";
import { CardRow } from "./card-row";
import {
  medicationStatusLabelByVariant,
  medicationStatusTextVariants,
} from "./medication-status";

export type MedicationDetailCardProps = VariantProps<
  typeof medicationStatusTextVariants
> & {
  petName: string;
  medicationName: string;
  time: string;
  interval: string;
  appliedDoses: string;
  description: string;
  statusLabel?: string;
  buttonLabel?: string;
  className?: string;
  disabled?: boolean;
  onAdministeredPress?: () => void;
  onEditPress?: () => void;
};

export function MedicationDetailCard({
  petName,
  medicationName,
  time,
  interval,
  appliedDoses,
  description,
  status,
  statusLabel,
  buttonLabel = "Administrado",
  className,
  disabled = false,
  onAdministeredPress,
  onEditPress,
}: MedicationDetailCardProps) {
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

      <CardRow
        leading={<Timer color={AppColors.cobalto} size={16} strokeWidth={2} />}
        primary={interval}
        trailingLeading={
          <ListChecks color={AppColors.cobalto} size={16} strokeWidth={2} />
        }
        trailing={appliedDoses}
      />

      <Text className="font-light text-[16px] leading-[22px] text-cobalto">
        {description}
      </Text>

      <Button
        className="self-end"
        disabled={disabled}
        onPress={onAdministeredPress}
        variant="cyan"
      >
        {buttonLabel}
      </Button>
    </View>
  );
}
