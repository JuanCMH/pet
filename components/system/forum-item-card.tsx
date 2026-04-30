import {
  Pressable,
  Text,
  View,
  type ImageSourcePropType,
  type PressableProps,
} from "react-native";

import { cn } from "@/lib/utils";

import { Avatar } from "./avatar";
import { CardRow } from "./card-row";

export type ForumItemCardProps = {
  avatar: ImageSourcePropType | string;
  authorName: string;
  publishedAt: string;
  description: string;
  className?: string;
  disabled?: boolean;
  onPress?: PressableProps["onPress"];
};

export function ForumItemCard({
  avatar,
  authorName,
  publishedAt,
  description,
  className,
  disabled = false,
  onPress,
}: ForumItemCardProps) {
  const cardClassName = cn(
    "w-full gap-2 rounded-component border border-gris bg-blanco px-4 py-3 shadow-sm",
    disabled && "opacity-60",
    className,
  );

  const content = (
    <>
      <CardRow
        leading={
          <Avatar alt={`Avatar de ${authorName}`} size="sm" source={avatar} />
        }
        primary={authorName}
        primaryClassName="font-semibold"
        trailing={publishedAt}
        trailingClassName="font-semibold"
      />

      <Text className="font-light text-[16px] leading-[22px] text-cobalto">
        {description}
      </Text>
    </>
  );

  if (!onPress) {
    return <View className={cardClassName}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      className={cardClassName}
      disabled={disabled}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}
