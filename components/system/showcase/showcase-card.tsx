import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { cn } from "@/lib/utils";

export type ShowcaseCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};
export function ShowcaseCard({
  title,
  description,
  children,
  footer,
  className,
}: ShowcaseCardProps) {
  return (
    <View
      className={cn(
        "flex-1 gap-3 rounded-component border border-gris bg-blanco p-3 shadow-sm",
        className,
      )}
    >
      <View className="gap-1">
        <Text className="font-bold text-base text-cobalto">{title}</Text>
        <Text className="font-sans text-xs text-cobalto">{description}</Text>
      </View>

      <View className="flex-1 items-center justify-center">{children}</View>

      {footer ? (
        <View>
          {typeof footer === "string" ? (
            <Text className="font-sans text-[11px] leading-4 text-cobalto">
              {footer}
            </Text>
          ) : (
            footer
          )}
        </View>
      ) : null}
    </View>
  );
}
