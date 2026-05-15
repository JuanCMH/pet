import { useConvexAuth } from "@convex-dev/auth/react";
import { useRouter, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  type FlatListProps,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/system/button";

const SPLASH_DURATION_MS = 2000;
const loginRoute = "/login" as Href;
const registerRoute = "/register" as Href;
const appRoute = "/(tabs)" as Href;

let hasShownInitialSplash = false;

const onboardingSlides = [
  {
    id: "monitoreo",
    image: require("@/assets/images/auth/monitoreo.png"),
    title: "Monitoreo",
    description:
      "Monitorea en tiempo real el estado de salud de tu mascota desde una pantalla principal intuitiva y fácil de entender.",
  },
  {
    id: "emergencia",
    image: require("@/assets/images/auth/emergencia.png"),
    title: "Emergencia",
    description:
      "Accede rápidamente a herramientas de emergencia y sigue instrucciones paso a paso para actuar ante situaciones críticas con tu mascota.",
  },
  {
    id: "economia",
    image: require("@/assets/images/auth/economia.png"),
    title: "Economía",
    description:
      "Lleva el control de gastos, consultas y cuidados de tu mascota desde un módulo financiero simple y organizado.",
  },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [showSplash, setShowSplash] = useState(!hasShownInitialSplash);
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const carouselRef = useRef<FlatList<(typeof onboardingSlides)[number]>>(null);

  useEffect(() => {
    if (hasShownInitialSplash) {
      return;
    }

    const timeout = setTimeout(() => {
      hasShownInitialSplash = true;
      setShowSplash(false);
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!showSplash && !isLoading && isAuthenticated) {
      router.replace(appRoute);
    }
  }, [isAuthenticated, isLoading, router, showSplash]);

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (!carouselWidth) {
      return;
    }

    const nextSlide = Math.min(
      onboardingSlides.length - 1,
      Math.max(
        0,
        Math.round(event.nativeEvent.contentOffset.x / carouselWidth),
      ),
    );
    setActiveSlide(nextSlide);
  };

  const handleScrollToIndexFailed: FlatListProps<
    (typeof onboardingSlides)[number]
  >["onScrollToIndexFailed"] = (info) => {
    requestAnimationFrame(() => {
      carouselRef.current?.scrollToOffset({
        animated: true,
        offset: info.index * carouselWidth,
      });
    });
  };

  const goToSlide = (slideIndex: number) => {
    if (!carouselWidth) {
      return;
    }

    setActiveSlide(slideIndex);
    carouselRef.current?.scrollToIndex({ animated: true, index: slideIndex });
  };

  if (showSplash) {
    return (
      <SafeAreaView className="flex-1 bg-blanco">
        <View className="flex-1 items-center justify-center">
          <Image
            resizeMode="contain"
            source={require("@/assets/images/icon.png")}
            style={{ height: 168, width: 168 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-blanco">
      <View className="flex-1 items-center justify-center px-5">
        <View
          className="w-full items-center gap-8"
          onLayout={(event) => setCarouselWidth(event.nativeEvent.layout.width)}
        >
          {carouselWidth > 0 ? (
            <FlatList
              ref={carouselRef}
              data={onboardingSlides}
              decelerationRate="fast"
              getItemLayout={(_, index) => ({
                length: carouselWidth,
                offset: carouselWidth * index,
                index,
              })}
              horizontal
              className="h-[432px] w-full flex-grow-0"
              keyExtractor={(slide) => slide.id}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              onScrollToIndexFailed={handleScrollToIndexFailed}
              pagingEnabled
              renderItem={({ item }) => (
                <View
                  className="items-center gap-8"
                  style={{ width: carouselWidth }}
                >
                  <Image
                    resizeMode="contain"
                    source={item.image}
                    style={{ height: 250, width: 250 }}
                  />
                  <View className="h-[150px] w-full max-w-[370px] items-center gap-8">
                    <Text className="text-center font-bold text-[32px] leading-[38px] text-cobalto">
                      {item.title}
                    </Text>
                    <Text className="text-center font-montserrat-light text-[16px] leading-[24px] text-cobalto">
                      {item.description}
                    </Text>
                  </View>
                </View>
              )}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              snapToInterval={carouselWidth}
            />
          ) : null}

          <View className="flex-row gap-3">
            {onboardingSlides.map((slide, index) => (
              <Pressable
                accessibilityLabel={`Ir a la pantalla ${index + 1}`}
                accessibilityRole="button"
                className={`h-4 w-[51px] rounded-full ${
                  activeSlide === index ? "bg-cobalto" : "bg-gris"
                }`}
                key={slide.id}
                onPress={() => goToSlide(index)}
              />
            ))}
          </View>

          <View className="items-center gap-8">
            <Button
              className="w-[256px]"
              onPress={() => router.push(loginRoute)}
              variant="cyan"
            >
              Iniciar sesión
            </Button>
            <Button
              className="w-[256px]"
              onPress={() => router.push(registerRoute)}
              variant="cobalto"
            >
              Registrarse
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
