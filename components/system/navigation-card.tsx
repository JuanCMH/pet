import { House, MapPinHouse, MessageCircle, Pill } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    id: "inicio",
    label: "Inicio",
    icon: House,
  },
  {
    id: "med",
    label: "Med",
    icon: Pill,
  },
  {
    id: "mapa",
    label: "Mapa",
    icon: MapPinHouse,
  },
  {
    id: "foro",
    label: "Foro",
    icon: MessageCircle,
  },
] as const;

export type NavigationCardItemId = (typeof navigationItems)[number]["id"];

export type NavigationCardProps = {
  className?: string;
  disabled?: boolean;
  onItemPress?: (itemId: NavigationCardItemId) => void;
};

export function NavigationCard({
  className,
  disabled = false,
  onItemPress,
}: NavigationCardProps) {
  return (
    <View
      className={cn(
        "w-full flex-row items-start justify-between rounded-component border border-gris bg-blanco px-4 py-2 shadow-sm",
        disabled && "opacity-60",
        className,
      )}
    >
      {navigationItems.map((item) => {
        const Icon = item.icon;

        return (
          <Pressable
            accessibilityLabel={item.label}
            accessibilityRole="button"
            className="flex-1 items-center gap-1"
            disabled={disabled}
            key={item.id}
            onPress={() => onItemPress?.(item.id)}
          >
            <Icon color={AppColors.cobalto} size={28} strokeWidth={2} />
            <Text className="font-light text-[16px] leading-[20px] text-cobalto">
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
