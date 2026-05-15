import { SquarePen, Timer } from "lucide-react-native";
import { useRef } from "react";
import { Pressable, Text, View } from "react-native";

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

function toInputValue(mode: "date" | "time", date?: Date) {
  if (!date) return "";
  if (mode === "date") {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mi}`;
}

function parseInputValue(mode: "date" | "time", raw: string, base?: Date) {
  if (!raw) return undefined;
  if (mode === "date") {
    const [yyyy, mm, dd] = raw.split("-").map((s) => Number.parseInt(s, 10));
    if (!yyyy || !mm || !dd) return undefined;
    const next = new Date(base ?? new Date());
    next.setFullYear(yyyy, mm - 1, dd);
    next.setHours(0, 0, 0, 0);
    return next;
  }
  const [hh, mi] = raw.split(":").map((s) => Number.parseInt(s, 10));
  if (Number.isNaN(hh) || Number.isNaN(mi)) return undefined;
  const next = new Date(base ?? new Date());
  next.setHours(hh, mi, 0, 0);
  return next;
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
  const inputRef = useRef<HTMLInputElement | null>(null);

  const Icon = mode === "date" ? SquarePen : Timer;
  const displayValue = formatValue(mode, value);
  const resolvedPlaceholder =
    placeholder ?? (mode === "date" ? "Seleccionar fecha" : "Seleccionar hora");

  const handlePress = () => {
    if (disabled) return;
    const el = inputRef.current;
    if (!el) return;
    if (
      typeof (el as unknown as { showPicker?: () => void }).showPicker ===
      "function"
    ) {
      try {
        (el as unknown as { showPicker: () => void }).showPicker();
        return;
      } catch {

      }
    }
    el.focus();
    el.click();
  };

  return (
    <View className={cn("gap-1", className)}>
      <Text className="font-semibold text-[14px] text-cobalto">{label}</Text>

      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        className={cn(
          "relative flex-row items-center justify-between rounded-component border border-gris bg-blanco px-3 py-2 shadow-sm",
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

        <input
          ref={inputRef}
          aria-label={label}
          disabled={disabled}
          onChange={(event) => {
            const next = parseInputValue(mode, event.target.value, value);
            if (next) onChange?.(next);
          }}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            cursor: disabled ? "not-allowed" : "pointer",
            border: "none",
            background: "transparent",
            color: "transparent",
            width: "100%",
            height: "100%",
          }}
          type={mode === "date" ? "date" : "time"}
          value={toInputValue(mode, value)}
        />
      </Pressable>
    </View>
  );
}
