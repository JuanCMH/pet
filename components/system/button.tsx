import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { Pressable, Text, type PressableProps } from "react-native";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "h-9 self-start flex-row items-center justify-center rounded-component px-4 py-2 shadow-sm active:opacity-90",
  {
    variants: {
      variant: {
        cobalto: "bg-cobalto",
        cyan: "bg-celeste",
      },
    },
    defaultVariants: {
      variant: "cobalto",
    },
  },
);

const buttonTextVariants = cva("font-bold text-sm text-blanco");

export type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    children: ReactNode;
    className?: string;
  };

export function Button({
  children,
  variant,
  className,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    >
      <Text className={buttonTextVariants()}>{children}</Text>
    </Pressable>
  );
}

export { buttonTextVariants, buttonVariants };
