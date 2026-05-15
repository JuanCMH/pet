import { ChevronsUpDown } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

import { AnchoredPopover } from "./anchored-popover";

export type SelectOption = {
  label: string;
  value: string;
};

export type SelectFieldProps = {
  label: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
};

export function SelectField({
  label,
  options,
  value,
  onValueChange,
  placeholder = "Selecciona una opción",
  className,
  triggerClassName,
}: SelectFieldProps) {
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  return (
    <View className={cn("gap-1", className)}>
      <Text className="font-semibold text-[14px] text-cobalto">{label}</Text>

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
            <Text
              className={cn(
                "font-sans text-sm",
                selectedOption ? "text-cobalto" : "text-cobalto/50",
              )}
            >
              {selectedOption?.label ?? placeholder}
            </Text>

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
                  "px-2 py-2",
                  index !== options.length - 1 && "border-b border-gris",
                  isSelected && "bg-celeste/15",
                )}
                key={option.value}
                onPress={() => {
                  onValueChange?.(option.value);
                  close();
                }}
              >
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
