import { useConvexAuth } from "@convex-dev/auth/react";
import { Redirect, Tabs } from "expo-router";

import { ProjectTabBar } from "@/components/navigation";

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      tabBar={(props) => <ProjectTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: "Med",
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Mapa",
        }}
      />
      <Tabs.Screen
        name="forum"
        options={{
          title: "Foro",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile-password"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="register-pet"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="pet-detail"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="pet-info"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="new-medication"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-medication"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="forum-post"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
