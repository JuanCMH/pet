import { ChevronsUpDown } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, Text, View, type ImageSourcePropType } from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

import { AnchoredPopover } from "./anchored-popover";
import { Avatar } from "./avatar";

export type PetPickerOption = {
  label: string;
  value: string;
  image: ImageSourcePropType | string;
  alt?: string;
};

export type PetPickerProps = {
  label: string;
  options: PetPickerOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
};

export function PetPicker({
  label,
  options,
  value,
  onValueChange,
  placeholder = "Selecciona una mascota",
  className,
  triggerClassName,
}: PetPickerProps) {
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  return (
    <View className={cn("gap-2", className)}>
      <Text className="font-bold text-[14px] text-cobalto">{label}</Text>

      <AnchoredPopover
        renderTrigger={({ ref, toggle }) => (
          <Pressable
            accessibilityRole="button"
            className={cn(
              "min-h-9 flex-row items-center justify-between rounded-component border border-gris bg-blanco px-2 py-2 shadow-sm",
              triggerClassName,
            )}
            onPress={toggle}
            ref={ref}
          >
            <View className="flex-1 flex-row items-center gap-2 pr-2">
              {selectedOption ? (
                <Avatar
                  alt={selectedOption.alt ?? selectedOption.label}
                  size="sm"
                  source={selectedOption.image}
                />
              ) : (
                <View className="h-6 w-6 rounded-full border border-gris bg-celeste/15" />
              )}

              <Text
                className={cn(
                  "flex-1 font-sans text-sm",
                  selectedOption ? "text-cobalto" : "text-cobalto/50",
                )}
                numberOfLines={1}
              >
                {selectedOption?.label ?? placeholder}
              </Text>
            </View>

            <ChevronsUpDown
              color={AppColors.cobalto}
              size={16}
              strokeWidth={2}
            />
          </Pressable>
        )}
      >
        {({ close }) =>
          options.map((option, index) => {
            const isSelected = option.value === value;

            return (
              <Pressable
                className={cn(
                  "flex-row items-center gap-2 px-2 py-2",
                  index !== options.length - 1 && "border-b border-gris",
                  isSelected && "bg-celeste/15",
                )}
                key={option.value}
                onPress={() => {
                  onValueChange?.(option.value);
                  close();
                }}
              >
                <Avatar
                  alt={option.alt ?? option.label}
                  size="sm"
                  source={option.image}
                />

                <Text className="font-sans text-sm text-cobalto">
                  {option.label}
                </Text>
              </Pressable>
            );
          })
        }
      </AnchoredPopover>
    </View>
  );
}
