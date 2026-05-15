import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import {
  Platform,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
} from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

const TEXT_AREA_LINE_HEIGHT = 20;
const TEXT_AREA_VERTICAL_PADDING = 16;
const DEFAULT_TEXT_AREA_ROWS = 3;

export type TextAreaFieldProps = Omit<TextInputProps, "multiline"> & {
  label: string;
  rows?: number;
  className?: string;
  inputClassName?: string;
  error?: string;
  helperText?: string;
};

export function TextAreaField({
  label,
  rows = DEFAULT_TEXT_AREA_ROWS,
  className,
  inputClassName,
  placeholder,
  error,
  helperText,
  style,
  ...props
}: TextAreaFieldProps) {
  const resolvedPlaceholder = placeholder
    ? placeholder.trim().startsWith("Ej:")
      ? placeholder.trim()
      : `Ej: ${placeholder.trim()}`
    : undefined;

  const showError = Boolean(error);
  const helperMessage = showError ? error : helperText;
  const resolvedRows = Math.max(1, Math.floor(rows));
  const minHeight =
    resolvedRows * TEXT_AREA_LINE_HEIGHT + TEXT_AREA_VERTICAL_PADDING;
  const webStyle =
    Platform.OS === "web"
      ? ({ resize: "none" } as TextStyle & { resize: "none" })
      : null;

  return (
    <View className={cn("gap-1", className)}>
      <Text className="font-semibold text-[14px] text-cobalto">{label}</Text>

      <TextInput
        accessibilityLabel={label}
        className={cn(
          "rounded-component border border-gris bg-blanco px-2 py-2 text-[14px] leading-[20px] text-cobalto shadow-sm outline-none",
          showError && "border-rojo",
          inputClassName,
        )}
        multiline
        placeholder={resolvedPlaceholder}
        placeholderTextColor={`${AppColors.cobalto}80`}
        style={[{ minHeight, textAlignVertical: "top" }, webStyle, style]}
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

export type ControlledTextAreaFieldProps<T extends FieldValues> = Omit<
  TextAreaFieldProps,
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

export function ControlledTextAreaField<T extends FieldValues>({
  name,
  control,
  rules,
  defaultValue = "",
  ...rest
}: ControlledTextAreaFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <TextAreaField
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

export { DEFAULT_TEXT_AREA_ROWS };
