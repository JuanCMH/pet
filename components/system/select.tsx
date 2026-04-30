import { ChevronsUpDown } from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  View,
  type View as RNView,
} from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

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
  const [isOpen, setIsOpen] = useState(false);
  const [popoverLayout, setPopoverLayout] = useState({
    left: 0,
    top: 0,
    width: 0,
  });
  const triggerRef = useRef<RNView>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const resolvedPlaceholder = placeholder.trim().startsWith("Ej:")
    ? placeholder.trim()
    : `Ej: ${placeholder.trim()}`;

  function openPopover() {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setPopoverLayout({
        left: x,
        top: y + height + 6,
        width,
      });
      setIsOpen(true);
    });
  }

  return (
    <View className={cn("gap-2", className)}>
      <Text className="font-bold text-[14px] text-cobalto">{label}</Text>

      <View ref={triggerRef}>
        <Pressable
          accessibilityRole="button"
          className={cn(
            "min-h-9 flex-row items-center justify-between rounded-component border border-gris bg-blanco px-2 py-2 shadow-sm",
            triggerClassName,
          )}
          onPress={() => {
            if (isOpen) {
              setIsOpen(false);
              return;
            }

            openPopover();
          }}
        >
          <Text
            className={cn(
              "font-sans text-sm",
              selectedOption ? "text-cobalto" : "text-cobalto/50",
            )}
          >
            {selectedOption?.label ?? resolvedPlaceholder}
          </Text>

          <ChevronsUpDown color={AppColors.cobalto} size={16} strokeWidth={2} />
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
        transparent
        visible={isOpen}
      >
        <Pressable className="flex-1" onPress={() => setIsOpen(false)}>
          <View
            className="absolute rounded-component border border-gris bg-blanco shadow-sm"
            style={{
              left: popoverLayout.left,
              top: popoverLayout.top,
              width: popoverLayout.width,
            }}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;

              return (
                <Pressable
                  key={option.value}
                  className={cn(
                    "px-2 py-2",
                    index !== options.length - 1 && "border-b border-gris",
                    isSelected && "bg-celeste/15",
                  )}
                  onPress={() => {
                    onValueChange?.(option.value);
                    setIsOpen(false);
                  }}
                >
                  <Text className="font-sans text-sm text-cobalto">
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
