import { cva, type VariantProps } from "class-variance-authority";
import { Image } from "expo-image";
import type { ImageSourcePropType } from "react-native";
import { View } from "react-native";

import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "overflow-hidden rounded-full border-cobalto bg-blanco",
  {
    variants: {
      size: {
        sm: "h-6 w-6 border-2",
        md: "h-16 w-16 border-4",
        lg: "h-40 w-40 border-8",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export type AvatarProps = VariantProps<typeof avatarVariants> & {
  source: ImageSourcePropType | string;
  alt: string;
  className?: string;
};

export function Avatar({ source, alt, size, className }: AvatarProps) {
  return (
    <View className={cn(avatarVariants({ size }), className)}>
      <Image
        accessibilityLabel={alt}
        contentFit="cover"
        source={source}
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );
}

export { avatarVariants };
