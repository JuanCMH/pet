import { useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { type Href, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  EmptyState,
  MedicationDetailCard,
  MedicationItemCard,
} from "@/components/system";
import type { MedicationStatus } from "@/components/system/medication-status";
import { AppColors } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/get-error-message";

type FrequencyUnit = "hours" | "days" | "weeks" | "months";

const newMedicationRoute = "/(tabs)/new-medication" as Href;

const unitToMs: Record<FrequencyUnit, number> = {
  hours: 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
  weeks: 7 * 24 * 60 * 60 * 1000,
  months: 30 * 24 * 60 * 60 * 1000,
};

const unitLabelSingular: Record<FrequencyUnit, string> = {
  hours: "hora",
  days: "día",
  weeks: "semana",
  months: "mes",
};

const unitLabelPlural: Record<FrequencyUnit, string> = {
  hours: "horas",
  days: "días",
  weeks: "semanas",
  months: "meses",
};

function formatTime(date: Date) {
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatInterval(value: number, unit: FrequencyUnit) {
  const label = value === 1 ? unitLabelSingular[unit] : unitLabelPlural[unit];
  return `Cada ${value} ${label}`;
}

function computeNextDose(
  startDate: number,
  frequencyValue: number,
  unit: FrequencyUnit,
  lastDoseAt?: number,
) {
  const intervalMs = frequencyValue * unitToMs[unit];
  if (!intervalMs || intervalMs <= 0) return startDate;
  const reference = lastDoseAt ?? startDate;
  const now = Date.now();
  if (reference > now) return reference;
  const steps = Math.ceil((now - reference) / intervalMs);
  return reference + Math.max(1, steps) * intervalMs;
}

function resolveStatus(nextDoseAt: number): MedicationStatus {
  const diff = nextDoseAt - Date.now();
  if (diff <= 0) return "expiring";
  if (diff <= 60 * 60 * 1000) return "soon";
  return "onTime";
}

type MedicationRow = {
  _id: Id<"medications">;
  petId: Id<"pets">;
  name: string;
  purpose: string;
  frequencyValue: number;
  frequencyUnit: FrequencyUnit;
  startDate: number;
  pet: { name: string } | null;
};

export default function MedicationsTabScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const medications = useQuery(
    api.medications.listMine,
    isAuthenticated ? { activeOnly: true } : "skip",
  ) as MedicationRow[] | undefined;
  const logMutation = useMutation(api.medicationLogs.log);

  const [expandedId, setExpandedId] = useState<Id<"medications"> | null>(null);
  const [appliedCounts, setAppliedCounts] = useState<
    Record<string, { count: number; lastAt: number }>
  >({});

  const goToNew = () => router.push(newMedicationRoute);
  const goToEdit = (medicationId: Id<"medications">) =>
    router.push(`/edit-medication?medicationId=${medicationId}` as Href);

  const toggleExpanded = (id: Id<"medications">) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleAdministered = async (medication: MedicationRow) => {
    try {
      const administeredAt = Date.now();
      await logMutation({
        medicationId: medication._id,
        administeredAt,
        skipped: false,
      });
      setAppliedCounts((prev) => {
        const previous = prev[medication._id];
        return {
          ...prev,
          [medication._id]: {
            count: (previous?.count ?? 0) + 1,
            lastAt: administeredAt,
          },
        };
      });
      Alert.alert(
        "Dosis registrada",
        "Marcamos la administración correctamente.",
      );
    } catch (caughtError) {
      Alert.alert("No se pudo registrar", getErrorMessage(caughtError));
    }
  };

  const rows = useMemo(() => {
    if (!medications) return [];
    return medications.map((med) => {
      const applied = appliedCounts[med._id];
      const nextDoseAt = computeNextDose(
        med.startDate,
        med.frequencyValue,
        med.frequencyUnit,
        applied?.lastAt,
      );
      const status = resolveStatus(nextDoseAt);
      return {
        med,
        nextDoseAt,
        status,
        appliedCount: applied?.count ?? 0,
      };
    });
  }, [medications, appliedCounts]);

  const hasMedications = rows.length > 0;
  const isLoadingData = isLoading || medications === undefined;

  return (
    <SafeAreaView className="flex-1 bg-blanco">
      <View className="flex-1 gap-4 px-5 pt-3 pb-4">
        <View className="flex-row items-center justify-between">
          <Text className="font-bold text-[24px] leading-[28px] text-cobalto">
            Medicamentos
          </Text>
          <Pressable
            accessibilityLabel="Registrar nuevo medicamento"
            accessibilityRole="button"
            hitSlop={8}
            onPress={goToNew}
          >
            <Plus color={AppColors.cobalto} size={26} strokeWidth={2.4} />
          </Pressable>
        </View>

        {isLoadingData ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={AppColors.cobalto} size="large" />
          </View>
        ) : hasMedications ? (
          <ScrollView
            bounces={false}
            className="flex-1"
            contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {rows.map(({ med, nextDoseAt, status, appliedCount }) => {
              const isExpanded = expandedId === med._id;
              const petName = med.pet?.name ?? "Mascota";
              const time = formatTime(new Date(nextDoseAt));
              const interval = formatInterval(
                med.frequencyValue,
                med.frequencyUnit,
              );

              if (isExpanded) {
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={med._id}
                    onLongPress={() => goToEdit(med._id)}
                    onPress={() => toggleExpanded(med._id)}
                  >
                    <MedicationDetailCard
                      appliedDoses={`${appliedCount} dosis aplicadas`}
                      description={
                        med.purpose || "Sin prescripción registrada."
                      }
                      interval={interval}
                      medicationName={med.name}
                      onAdministeredPress={() => handleAdministered(med)}
                      onEditPress={() => goToEdit(med._id)}
                      petName={petName}
                      status={status}
                      time={time}
                    />
                  </Pressable>
                );
              }

              return (
                <Pressable
                  accessibilityRole="button"
                  key={med._id}
                  onLongPress={() => goToEdit(med._id)}
                  onPress={() => toggleExpanded(med._id)}
                >
                  <MedicationItemCard
                    medicationName={med.name}
                    onEditPress={() => goToEdit(med._id)}
                    petName={petName}
                    status={status}
                    time={time}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <EmptyState
            actionLabel="Registrar medicamento"
            className="min-h-0 flex-1"
            onActionPress={goToNew}
            title="No tienes medicamentos registrados"
          />
        )}
      </View>
    </SafeAreaView>
  );
}
