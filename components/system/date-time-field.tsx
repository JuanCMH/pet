import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { SquarePen, Timer } from "lucide-react-native";
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

export type DateTimeFieldProps = {
  label: string;
  mode: "date" | "time";
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
};

function formatValue(mode: "date" | "time", date?: Date) {
  if (!date) return "";
  if (mode === "date") {
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function DateTimeField({
  label,
  mode,
  value,
  onChange,
  placeholder,
  className,
  triggerClassName,
  disabled = false,
}: DateTimeFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handlePress = () => {
    if (disabled) return;
    setShowPicker(true);
  };

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {

    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (event.type === "set" && selected) {
      onChange?.(selected);
    }
  };

  const Icon = mode === "date" ? SquarePen : Timer;
  const displayValue = formatValue(mode, value);
  const resolvedPlaceholder =
    placeholder ?? (mode === "date" ? "Seleccionar fecha" : "Seleccionar hora");

  return (
    <View className={cn("gap-1", className)}>
      <Text className="font-semibold text-[14px] text-cobalto">{label}</Text>

      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        className={cn(
          "flex-row items-center justify-between rounded-component border border-gris bg-blanco px-3 py-2 shadow-sm",
          disabled && "opacity-60",
          triggerClassName,
        )}
        disabled={disabled}
        onPress={handlePress}
      >
        <Text
          className={cn(
            "text-[14px]",
            displayValue ? "text-cobalto" : "text-cobalto/50",
          )}
        >
          {displayValue || resolvedPlaceholder}
        </Text>
        <Icon color={AppColors.cobalto} size={18} strokeWidth={2} />
      </Pressable>

      {showPicker ? (
        <View>
          <DateTimePicker
            display={Platform.OS === "ios" ? "spinner" : "default"}
            mode={mode}
            onChange={handleChange}
            value={value ?? new Date()}
          />
          {Platform.OS === "ios" ? (
            <Pressable
              accessibilityRole="button"
              className="self-end px-3 py-1"
              onPress={() => setShowPicker(false)}
            >
              <Text className="font-semibold text-cobalto text-sm">Listo</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
