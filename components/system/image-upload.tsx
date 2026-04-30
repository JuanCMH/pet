import { cva, type VariantProps } from "class-variance-authority";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { ImageUp } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

const imageUploadVariants = cva(
  "h-40 w-40 items-center justify-center gap-2 border border-dashed border-gris bg-blanco shadow-sm",
  {
    variants: {
      shape: {
        square: "rounded-component",
        circle: "rounded-full",
      },
    },
    defaultVariants: {
      shape: "square",
    },
  },
);

export type ImageUploadProps = VariantProps<typeof imageUploadVariants> & {
  title?: string;
  onPress?: () => void;
  value?: string;
  defaultValue?: string;
  onChange?: (uri: string) => void;
  className?: string;
  disabled?: boolean;
};

export function ImageUpload({
  shape,
  title = "Subir imagen",
  onPress,
  value,
  defaultValue,
  onChange,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const selectedImageUri = value ?? internalValue;

  async function handlePress() {
    onPress?.();

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permiso requerido",
        "Debes permitir el acceso a tus fotos para subir una imagen.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    const selectedAsset = result.assets[0];

    if (!selectedAsset?.uri) {
      return;
    }

    if (value === undefined) {
      setInternalValue(selectedAsset.uri);
    }

    onChange?.(selectedAsset.uri);
  }

  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        imageUploadVariants({ shape }),
        selectedImageUri ? "overflow-hidden p-0" : "p-4",
        disabled && "opacity-60",
        className,
      )}
      disabled={disabled}
      onPress={() => {
        void handlePress();
      }}
    >
      {selectedImageUri ? (
        <Image
          contentFit="cover"
          source={selectedImageUri}
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <View className="items-center gap-2">
          <ImageUp color={AppColors.cobalto} size={16} strokeWidth={2} />
          <Text className="font-semibold text-sm text-cobalto">{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export { imageUploadVariants };
