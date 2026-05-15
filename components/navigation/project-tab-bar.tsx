import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { House, MapPinHouse, MessageCircle, Pill } from "lucide-react-native";
import type { ComponentType } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppColors } from "@/constants/theme";

type ProjectRouteName = "index" | "medications" | "map" | "forum";

type NavigationItem = {
  routeName: ProjectRouteName;
  label: string;
  icon: ComponentType<{
    color?: string;
    size?: number;
    strokeWidth?: number;
  }>;
};

const navigationItems: NavigationItem[] = [
  {
    routeName: "index",
    label: "Inicio",
    icon: House,
  },
  {
    routeName: "medications",
    label: "Med",
    icon: Pill,
  },
  {
    routeName: "map",
    label: "Mapa",
    icon: MapPinHouse,
  },
  {
    routeName: "forum",
    label: "Foro",
    icon: MessageCircle,
  },
];

export function ProjectTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const activeRouteName = state.routes[state.index]?.name;
  const isOnVisibleTab = navigationItems.some(
    (item) => item.routeName === activeRouteName,
  );
  const fallbackRouteName: ProjectRouteName = "index";

  return (
    <View
      className="border-gris border-t bg-blanco px-4 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}
    >
      <View className="flex-row items-center justify-between rounded-component bg-blanco">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const routeIndex = state.routes.findIndex(
            (route) => route.name === item.routeName,
          );
          const isFocused = isOnVisibleTab
            ? state.index === routeIndex
            : item.routeName === fallbackRouteName;

          return (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : {}}
              className="flex-1 items-center gap-1 py-1"
              key={item.routeName}
              onPress={() => {
                const route = state.routes[routeIndex];
                if (!route) {
                  return;
                }

                if (isOnVisibleTab && isFocused) {
                  return;
                }

                navigation.navigate(route.name, route.params);
              }}
            >
              <Icon
                color={isFocused ? AppColors.celeste : AppColors.cobalto}
                size={26}
                strokeWidth={2}
              />
              <Text
                className={`text-center text-[12px] leading-[16px] ${
                  isFocused
                    ? "font-sans text-celeste"
                    : "font-sans text-cobalto"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
