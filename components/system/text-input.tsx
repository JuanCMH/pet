import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import { Text, TextInput, View, type TextInputProps } from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

export type TextInputFieldProps = TextInputProps & {
  label: string;
  className?: string;
  inputClassName?: string;
  error?: string;
  helperText?: string;
};

export function TextInputField({
  label,
  className,
  inputClassName,
  placeholder,
  error,
  helperText,
  ...props
}: TextInputFieldProps) {
  const resolvedPlaceholder = placeholder
    ? placeholder.trim().startsWith("Ej:")
      ? placeholder.trim()
      : `Ej: ${placeholder.trim()}`
    : undefined;

  const showError = Boolean(error);
  const helperMessage = showError ? error : helperText;

  return (
    <View className={cn("gap-1", className)}>
      <Text className="font-semibold text-[14px] text-cobalto">{label}</Text>

      <TextInput
        accessibilityLabel={label}
        className={cn(
          "rounded-component border border-gris bg-blanco px-2 py-2 text-cobalto shadow-sm outline-none",
          showError && "border-rojo",
          inputClassName,
        )}
        placeholder={resolvedPlaceholder}
        placeholderTextColor={`${AppColors.cobalto}80`}
        {...props}
      />

      {helperMessage ? (
        <Text
          className={cn("text-xs", showError ? "text-rojo" : "text-cobalto/70")}
        >
          {helperMessage}
        </Text>
      ) : null}
    </View>
  );
}

export type ControlledTextInputFieldProps<T extends FieldValues> = Omit<
  TextInputFieldProps,
  "value" | "onChangeText" | "onBlur" | "error"
> & {
  name: Path<T>;
  control: Control<T>;
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >;
  defaultValue?: string;
};

export function ControlledTextInputField<T extends FieldValues>({
  name,
  control,
  rules,
  defaultValue = "",
  ...rest
}: ControlledTextInputFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <TextInputField
          {...rest}
          error={error?.message}
          onBlur={onBlur}
          onChangeText={onChange}
          value={value ?? defaultValue}
        />
      )}
    />
  );
}
