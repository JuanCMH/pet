import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
} from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "h-9 flex-row items-center justify-center gap-2 rounded-component px-4 py-2 active:opacity-90",
  {
    variants: {
      variant: {
        cobalto: "bg-cobalto shadow-sm",
        cyan: "bg-celeste shadow-sm",
        outline: "border border-cobalto bg-transparent",
        ghost: "bg-transparent",
      },
      block: {
        true: "self-stretch",
        false: "self-start",
      },
    },
    defaultVariants: {
      variant: "cobalto",
      block: false,
    },
  },
);

const buttonTextVariants = cva("font-bold text-sm", {
  variants: {
    variant: {
      cobalto: "text-blanco",
      cyan: "text-blanco",
      outline: "text-cobalto",
      ghost: "text-cobalto",
    },
  },
  defaultVariants: {
    variant: "cobalto",
  },
});

export type ButtonProps = Omit<PressableProps, "children"> &
  VariantProps<typeof buttonVariants> & {
    children?: ReactNode;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    loading?: boolean;
    className?: string;
    textClassName?: string;
  };

export function Button({
  children,
  variant,
  block,
  leftIcon,
  rightIcon,
  loading = false,
  disabled,
  className,
  textClassName,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const spinnerColor =
    variant === "outline" || variant === "ghost"
      ? AppColors.cobalto
      : AppColors.blanco;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      className={cn(
        buttonVariants({ variant, block }),
        isDisabled && "opacity-50",
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : leftIcon ? (
        <View>{leftIcon}</View>
      ) : null}

      {typeof children === "string" || typeof children === "number" ? (
        <Text className={cn(buttonTextVariants({ variant }), textClassName)}>
          {children}
        </Text>
      ) : (
        children
      )}

      {!loading && rightIcon ? <View>{rightIcon}</View> : null}
    </Pressable>
  );
}

export { buttonTextVariants, buttonVariants };
