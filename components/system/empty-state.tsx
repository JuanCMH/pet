import { Text, View, type PressableProps } from "react-native";

import { cn } from "@/lib/utils";

import { Button } from "./button";

export type EmptyStateProps = {
  title?: string;
  actionLabel?: string;
  onActionPress?: PressableProps["onPress"];
  className?: string;
  disabled?: boolean;
};

export function EmptyState({
  title = "No se encontraron registros",
  actionLabel = "Acción",
  onActionPress,
  className,
  disabled = false,
}: EmptyStateProps) {
  return (
    <View
      className={cn(
        "h-40 w-full items-center justify-center gap-3 rounded-component border border-dashed border-gris bg-blanco p-4 shadow-sm",
        className,
      )}
    >
      <Text className="text-center font-semibold text-sm text-cobalto">
        {title}
      </Text>

      {onActionPress ? (
        <Button
          className="self-center"
          disabled={disabled}
          onPress={onActionPress}
          variant="cyan"
        >
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}
