import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react-native";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppColors } from "@/constants/theme";

import { MOBILE_SHELL_MAX_WIDTH } from "./mobile-shell";

export type ToastVariant = "success" | "info" | "error";

type ToastInput = {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastState = ToastInput & {
  id: number;
};

type ToastContextValue = {
  showToast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 3000;

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const counter = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(null));
  }, [opacity, translateY]);

  const showToast = useCallback((input: ToastInput) => {
    counter.current += 1;
    const id = counter.current;
    setToast({
      id,
      message: input.message,
      variant: input.variant ?? "success",
      durationMs: input.durationMs ?? DEFAULT_DURATION,
    });
  }, []);

  useEffect(() => {
    if (!toast) return;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      dismiss();
    }, toast.durationMs ?? DEFAULT_DURATION);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [toast, opacity, translateY, dismiss]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View className="absolute inset-x-0 bottom-0" pointerEvents="box-none">
          <SafeAreaView edges={["bottom"]} pointerEvents="box-none">
            <View
              className="w-full items-center px-5 pb-3"
              pointerEvents="box-none"
            >
              <Animated.View
                style={{
                  opacity,
                  transform: [{ translateY }],
                  width: "100%",
                  maxWidth: MOBILE_SHELL_MAX_WIDTH - 40,
                }}
              >
                <ToastBody
                  message={toast.message}
                  onDismiss={dismiss}
                  variant={toast.variant ?? "success"}
                />
              </Animated.View>
            </View>
          </SafeAreaView>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

type ToastBodyProps = {
  message: string;
  variant: ToastVariant;
  onDismiss: () => void;
};

function ToastBody({ message, variant, onDismiss }: ToastBodyProps) {
  const icon = (() => {
    if (variant === "success") {
      return (
        <CheckCircle2 color={AppColors.verde} size={20} strokeWidth={2.2} />
      );
    }
    if (variant === "error") {
      return (
        <TriangleAlert color={AppColors.rojo} size={20} strokeWidth={2.2} />
      );
    }
    return <Info color={AppColors.celeste} size={20} strokeWidth={2.2} />;
  })();

  return (
    <View className="flex-row items-center gap-3 rounded-component border border-gris bg-blanco px-4 py-3 shadow-sm">
      {icon}
      <Text className="flex-1 font-semibold text-[14px] text-cobalto">
        {message}
      </Text>
      <Pressable
        accessibilityLabel="Cerrar notificación"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onDismiss}
      >
        <X color={AppColors.cobalto} size={18} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}
