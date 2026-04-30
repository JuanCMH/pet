import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ShowcaseCard, showcaseRegistry } from "@/components/system/showcase";
import { AppColors } from "@/constants/theme";

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.blanco }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
      >
        <View className="gap-4">
          <View className="gap-1">
            <Text className="font-bold text-3xl text-cobalto">Componentes</Text>
            <Text className="font-sans text-xs text-cobalto">
              Sistema de diseno. Cada tarjeta ocupa una sola celda. Para agregar
              uno nuevo edita `components/system/showcase/registry.tsx`.
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-3">
            {showcaseRegistry.map((entry) => (
              <View key={entry.id} className="w-[48%]">
                <ShowcaseCard
                  description={entry.description}
                  footer={entry.footer}
                  title={entry.title}
                >
                  {entry.render()}
                </ShowcaseCard>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
