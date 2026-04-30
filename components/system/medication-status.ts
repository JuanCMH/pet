import { cva, type VariantProps } from "class-variance-authority";

export const medicationStatusTextVariants = cva("text-[14px]", {
  variants: {
    status: {
      expiring: "text-rojo",
      soon: "text-amarillo",
      onTime: "text-verde",
    },
  },
  defaultVariants: {
    status: "onTime",
  },
});

export const medicationStatusLabelByVariant = {
  expiring: "Próximo a vencerse",
  soon: "Pronto",
  onTime: "A tiempo",
} as const;

export type MedicationStatus = NonNullable<
  VariantProps<typeof medicationStatusTextVariants>["status"]
>;
