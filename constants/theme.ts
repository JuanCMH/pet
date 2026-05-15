export const AppColors = {
  negro: "#000000",
  blanco: "#FFFFFF",
  gris: "#E5E5E5",
  cobalto: "#00173D",
  celeste: "#62A1FF",
  verde: "#4ADE80",
  amarillo: "#FACC15",
  rojo: "#F87171",
} as const;

const lightTheme = {
  text: AppColors.cobalto,
  background: AppColors.blanco,
  tint: AppColors.celeste,
  icon: AppColors.cobalto,
  tabIconDefault: AppColors.gris,
  tabIconSelected: AppColors.celeste,
  border: AppColors.gris,
  success: AppColors.verde,
  warning: AppColors.amarillo,
  danger: AppColors.rojo,
} as const;

export const Colors = lightTheme;

export const Fonts = {
  light: "Montserrat_300Light",
  sans: "Montserrat_400Regular",
  serif: "Montserrat_400Regular",
  rounded: "Montserrat_700Bold",
  mono: "Montserrat_400Regular",
  bold: "Montserrat_700Bold",
} as const;
