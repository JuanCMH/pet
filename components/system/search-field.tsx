import { Search } from "lucide-react-native";
import { Text, TextInput, View, type TextInputProps } from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

export type SearchFieldProps = TextInputProps & {
  label: string;
  className?: string;
  inputClassName?: string;
};

export function SearchField({
  label,
  className,
  inputClassName,
  placeholder,
  ...props
}: SearchFieldProps) {
  return (
    <View className={cn("gap-1", className)}>
      <Text className="font-semibold text-[14px] text-cobalto">{label}</Text>

      <View className="flex-row items-center rounded-component border border-gris bg-blanco px-2 py-2 shadow-sm">
        <TextInput
          className={cn(
            "flex-1 border-0 bg-transparent text-cobalto outline-none",
            inputClassName,
          )}
          placeholder={placeholder?.trim()}
          placeholderTextColor={`${AppColors.cobalto}80`}
          {...props}
        />

        <Search color={AppColors.cobalto} size={16} strokeWidth={2} />
      </View>
    </View>
  );
}
