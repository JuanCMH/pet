import { Text, TextInput, View, type TextInputProps } from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

export type TextInputFieldProps = TextInputProps & {
  label: string;
  className?: string;
  inputClassName?: string;
};

export function TextInputField({
  label,
  className,
  inputClassName,
  placeholder,
  ...props
}: TextInputFieldProps) {
  const resolvedPlaceholder = placeholder
    ? placeholder.trim().startsWith("Ej:")
      ? placeholder.trim()
      : `Ej: ${placeholder.trim()}`
    : undefined;

  return (
    <View className={cn("gap-2", className)}>
      <Text className="font-bold text-[14px] text-cobalto">{label}</Text>
      <TextInput
        className={cn(
          "rounded-component border border-gris bg-blanco px-2 py-2 text-cobalto shadow-sm outline-none",
          inputClassName,
        )}
        placeholder={resolvedPlaceholder}
        placeholderTextColor={`${AppColors.cobalto}80`}
        {...props}
      />
    </View>
  );
}
