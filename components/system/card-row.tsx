import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { cn } from "@/lib/utils";

export type CardRowProps = {
  leading?: ReactNode;
  primary: ReactNode;
  trailingLeading?: ReactNode;
  trailing?: ReactNode;
  trailingFlex?: boolean;
  primaryClassName?: string;
  trailingClassName?: string;
  className?: string;
};

const baseTextClass = "text-[14px] text-cobalto";

function renderText(node: ReactNode, className: string) {
  if (node == null || typeof node === "boolean") {
    return null;
  }
  if (typeof node === "string" || typeof node === "number") {
    return (
      <Text className={className} numberOfLines={1}>
        {node}
      </Text>
    );
  }
  return node;
}

export function CardRow({
  leading,
  primary,
  trailingLeading,
  trailing,
  trailingFlex = false,
  primaryClassName,
  trailingClassName,
  className,
}: CardRowProps) {
  const hasTrailing = trailingLeading != null || trailing != null;

  return (
    <View
      className={cn("flex-row items-center justify-between gap-3", className)}
    >
      <View
        className={cn(
          "min-w-0 flex-row items-center gap-2",
          trailingFlex ? "shrink" : "flex-1",
        )}
      >
        {leading}
        {renderText(primary, cn("flex-1", baseTextClass, primaryClassName))}
      </View>

      {hasTrailing ? (
        <View
          className={cn(
            "flex-row items-center gap-2",
            trailingFlex && "min-w-0 flex-1 justify-end",
          )}
        >
          {trailingLeading}
          {renderText(trailing, cn(baseTextClass, trailingClassName))}
        </View>
      ) : null}
    </View>
  );
}
