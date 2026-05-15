import { HeartPulse } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import {
  Avatar,
  Button,
  DeviceField,
  EmptyState,
  FloatingCard,
  ForumItemCard,
  ImageUpload,
  MapDetailCard,
  MapItemCard,
  MedicationDetailCard,
  MedicationItemCard,
  NavigationCard,
  PetItemCard,
  PetPicker,
  PetStatusCard,
  SearchField,
  SelectField,
  StatusItem,
  StressSlider,
  TextAreaField,
  TextInputField,
  UserBanner,
  VetsMap,
} from "@/components/system";
import { ActivityChart } from "@/components/system/activity-chart";

const personAvatarSample = require("@/assets/images/avatars/person-avatar.png");
const petAvatarSample = require("@/assets/images/avatars/pet-avatar.png");

const DEVICE_STATUS_SEQUENCE = [
  "idle",
  "connecting",
  "available",
  "connected",
  "disconnected",
] as const;

type DeviceStatus = (typeof DEVICE_STATUS_SEQUENCE)[number];

export type ShowcaseEntry = {
  id: string;
  title: string;
  description: string;
  render: () => React.ReactElement;
  footer?: string;
};

export const showcaseRegistry: ShowcaseEntry[] = [
  {
    id: "button",
    title: "Boton",
    description:
      "Alto 36px, padding 16px horizontal, 8px vertical y texto blanco.",
    render: () => (
      <View className="flex-row flex-wrap items-center gap-2">
        <Button>Boton cobalto</Button>
        <Button variant="cyan">Boton cyan</Button>
      </View>
    ),
    footer: "Variantes disponibles: `cobalto` y `cyan`. Radio global: 8px.",
  },
  {
    id: "navigation-card",
    title: "Navegacion",
    description:
      "Tarjeta con padding horizontal 16px, vertical 8px y cuatro iconos de 28x28 con label debajo y espaciado uniforme.",
    render: () => (
      <View className="w-full">
        <NavigationCard />
      </View>
    ),
    footer:
      "Items incluidos: `Inicio`, `Med`, `Mapa` y `Foro`. Expone `onItemPress` opcional.",
  },
  {
    id: "avatar-person",
    title: "Avatar",
    description:
      "Tamanos: 24x24, 64x64 y 160x160. Borde variable de 2px a 8px e imagen por prop.",
    render: () => (
      <ScrollView
        contentContainerStyle={{ alignItems: "flex-end", gap: 12 }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <Avatar alt="Avatar de persona" size="sm" source={personAvatarSample} />
        <Avatar alt="Avatar de persona" size="md" source={personAvatarSample} />
        <Avatar alt="Avatar de persona" size="lg" source={personAvatarSample} />
      </ScrollView>
    ),
    footer: "Variantes de `size`: `sm`, `md`, `lg`.",
  },
  {
    id: "avatar-pet",
    title: "Avatar de mascota",
    description:
      "Tamanos: 24x24, 64x64 y 160x160. Borde variable de 2px a 8px e imagen de mascota por prop.",
    render: () => (
      <ScrollView
        contentContainerStyle={{ alignItems: "flex-end", gap: 12 }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <Avatar alt="Avatar de mascota" size="sm" source={petAvatarSample} />
        <Avatar alt="Avatar de mascota" size="md" source={petAvatarSample} />
        <Avatar alt="Avatar de mascota" size="lg" source={petAvatarSample} />
      </ScrollView>
    ),
    footer: "Variantes de `size`: `sm`, `md`, `lg`.",
  },
  {
    id: "user-banner",
    title: "Banner de usuario",
    description:
      "Tarjeta horizontal con avatar mediano, saludo 24px extralight, nombre 24px medium e icono `Settings` 24x24.",
    render: () => (
      <View className="w-full">
        <UserBanner avatar={personAvatarSample} name="Juan Camilo" />
      </View>
    ),
    footer: "Props clave: `avatar`, `name` y `onSettingsPress` opcional.",
  },
  {
    id: "text-input",
    title: "Campo de texto",
    description:
      "Label 14px semibold, padding interno 8px, borde 1px gris y sombra suave.",
    render: () => (
      <View className="w-full">
        <TextInputField label="Nombre" placeholder="Juan Camilo Perez" />
      </View>
    ),
  },
  {
    id: "text-area",
    title: "Area de texto",
    description:
      "Label 14px semibold, multilinea sin resize manual, borde 1px gris y 3 filas por defecto o las que se definan por prop.",
    render: () => (
      <View className="w-full">
        <TextAreaField
          label="Observaciones"
          placeholder="Administrar con alimento y vigilar tolerancia"
          rows={4}
        />
      </View>
    ),
    footer:
      "Props clave: `rows`, `helperText`, `className` e `inputClassName`.",
  },
  {
    id: "search-field",
    title: "Buscador",
    description:
      "Label 14px, padding interno 8px, borde 1px gris, sombra suave e icono final `Search`.",
    render: () => (
      <View className="w-full">
        <SearchField label="Buscar" placeholder="Nombre o referencia" />
      </View>
    ),
  },
  {
    id: "select",
    title: "Selector",
    description:
      "Label 14px, padding interno 8px, icono final y lista desplegable de opciones.",
    render: () => <SelectFieldPreview />,
  },
  {
    id: "pet-picker",
    title: "Selector de mascota",
    description:
      "Label 14px, padding interno 8px, avatar 24x24, icono final y lista flotante con imagen.",
    render: () => <PetPickerPreview />,
  },
  {
    id: "device-field",
    title: "Dispositivo",
    description:
      "Label 14px, padding interno 8px, icono inicial `Link2`, boton en lugar de input y estado visual al final.",
    render: () => <DeviceFieldPreview />,
    footer:
      "Estados: `idle`, `connecting`, `available`, `connected`, `disconnected`.",
  },
  {
    id: "image-upload",
    title: "Carga de imagen",
    description:
      "Tamano 160x160, formato cuadrado o circular, borde dashed, icono 16x16 y titulo semibold.",
    render: () => (
      <ScrollView
        contentContainerStyle={{ alignItems: "center", gap: 12 }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <ImageUpload shape="square" />
        <ImageUpload shape="circle" />
      </ScrollView>
    ),
    footer: "Variantes de `shape`: `square` y `circle`.",
  },
  {
    id: "status-item",
    title: "Item de estado",
    description:
      "Barra color sky de 32px de alto con icono a la izquierda, titulo 14px semibold y valor 14px alineado al extremo derecho.",
    render: () => (
      <View className="w-full">
        <StatusItem
          icon={HeartPulse}
          title="Frecuencia cardiaca"
          value="85 bpm"
        />
      </View>
    ),
    footer: "Props clave: `icon`, `title`, `value`, `className` y `disabled`.",
  },
  {
    id: "pet-status-card",
    title: "Estado de mascota",
    description:
      "Tarjeta con avatar de mascota a la izquierda, label superior 14px semibold, avatar de usuario pequeno y estado visual en verde, amarillo o rojo.",
    render: () => (
      <View className="w-full">
        <PetStatusCard
          petAvatar={petAvatarSample}
          petName="Luna"
          status="attention"
          userAvatar={personAvatarSample}
        />
      </View>
    ),
    footer:
      "Estados disponibles: `healthy`, `attention`, `critical`. Permite override con `statusLabel`.",
  },
  {
    id: "forum-item-card",
    title: "Item de foro",
    description:
      "Tarjeta con avatar pequeno, nombre y tiempo de publicacion en 14px semibold, mas descripcion de 16px light en la segunda fila.",
    render: () => (
      <View className="w-full">
        <ForumItemCard
          authorName="Laura Gómez"
          avatar={personAvatarSample}
          description="Mi perro lleva casi dos días sin querer comer como normalmente lo hace, solo toma un poco de agua y se ve más..."
          publishedAt="hace 5min"
        />
      </View>
    ),
    footer:
      "Props clave: `avatar`, `authorName`, `publishedAt`, `description`, `className` y `disabled`.",
  },
  {
    id: "map-detail-card",
    title: "Detalle de mapa",
    description:
      "Tarjeta extendida basada en el item de mapa, con telefono en la segunda fila, direccion full width de 16px light y boton final celeste.",
    render: () => (
      <View className="w-full">
        <MapDetailCard
          address="Ak 9 # 164-6, 110131, Cra. 9 #164-06, Bogotá, Cundinamarca"
          name="Zeus veterinaria"
          phone="3134558934"
          schedule="8:00 - 17:00"
          stars={4}
        />
      </View>
    ),
    footer:
      "Props clave: `name`, `schedule`, `phone`, `address`, `stars`, `buttonLabel` y `onMapsPress`.",
  },
  {
    id: "map-item-card",
    title: "Item de mapa",
    description:
      "Tarjeta de dos filas con `MapPinHouse`, nombre truncado 14px semibold, rating de 1 a 5 estrellas y horario con `Clock` y `ArrowRight`.",
    render: () => (
      <View className="w-full">
        <MapItemCard
          name="Zeus veterinaria"
          schedule="8:00 - 17:00"
          stars={4}
        />
      </View>
    ),
    footer:
      "Props clave: `name`, `schedule`, `stars`, `className` y `disabled`. Las estrellas inactivas usan gris.",
  },
  {
    id: "vets-map",
    title: "Mapa de veterinarias",
    description:
      "Render multiplataforma: usa `react-native-maps` en nativo y un canvas SVG con marcadores en web. Marcadores en celeste, seleccionado en rojo.",
    render: () => (
      <View className="h-[240px] w-full overflow-hidden rounded-component border border-gris">
        <VetsMap
          initialLatitude={4.711}
          initialLongitude={-74.0721}
          markers={[
            {
              id: "zeus",
              name: "Zeus veterinaria",
              latitude: 4.7125,
              longitude: -74.071,
              selected: true,
            },
            {
              id: "salud-animal",
              name: "Salud animal",
              latitude: 4.7095,
              longitude: -74.0735,
            },
          ]}
        />
      </View>
    ),
    footer:
      "Props clave: `initialLatitude`, `initialLongitude`, `markers`, `onMarkerPress`. Usa `forwardRef<VetsMapHandle>` con `animateToRegion`.",
  },
  {
    id: "medication-detail-card",
    title: "Detalle de medicamento",
    description:
      "Tarjeta extendida con filas de estado, medicamento, lapso, dosis aplicadas, descripcion de 16px light y boton final en variante cyan.",
    render: () => (
      <View className="w-full">
        <MedicationDetailCard
          appliedDoses="7 de 14"
          description={
            "Se indica administrar una dosis de 500 mg por vía oral cada 12 horas durante un periodo de 7 días. Se recomienda suministrar el medicamento junto con alimento para reducir posibles molestias gastrointestinales.\n\nEs importante completar el tratamiento según lo indicado, sin suspenderlo antes de tiempo. En caso de que el paciente presente vómito, diarrea o signos de reacción alérgica, se debe suspender la administración y consultar nuevamente con el veterinario."
          }
          interval="Cada 12h"
          medicationName="Amoxicilina"
          petName="Luna"
          status="soon"
          time="08:00 AM"
        />
      </View>
    ),
    footer:
      "Props clave: `interval`, `appliedDoses`, `description`, `buttonLabel` y `onAdministeredPress`. Reutiliza los estados del item basico.",
  },
  {
    id: "medication-item-card",
    title: "Item de medicamento",
    description:
      "Tarjeta de dos filas con `SquarePen`, nombre de mascota 14px semibold, estado en rojo/amarillo/verde, `Pill` y hora con `Hourglass`.",
    render: () => (
      <View className="w-full">
        <MedicationItemCard
          medicationName="Amoxicilina"
          petName="Luna"
          status="soon"
          time="08:00 AM"
        />
      </View>
    ),
    footer:
      "Estados: `expiring`, `soon` y `onTime`. Permite override con `statusLabel`.",
  },
  {
    id: "pet-item-card",
    title: "Item de mascota",
    description:
      "Tarjeta horizontal con avatar mediano y `DeviceField` conectado usando el nombre de la mascota como label 14px semibold.",
    render: () => (
      <View className="w-full">
        <PetItemCard
          avatar={petAvatarSample}
          deviceName="VHG - 2187946"
          name="Luna"
        />
      </View>
    ),
    footer:
      "Props clave: `avatar`, `name`, `deviceName` y `onDevicePress` opcional.",
  },
  {
    id: "floating-card",
    title: "Tarjeta flotante",
    description:
      "Tarjeta flotante con maximo ancho 338px, titulo 24px medium y descripcion 16px light en multiples lineas.",
    render: () => (
      <View className="w-full">
        <FloatingCard />
      </View>
    ),
    footer: "Props clave: `title`, `description` y `className`.",
  },
  {
    id: "empty-state",
    title: "Estado vacio",
    description:
      "Alto 160px, ancho disponible, borde dashed, contenido centrado, titulo semibold y boton cyan.",
    render: () => (
      <View className="w-full">
        <EmptyState />
      </View>
    ),
  },
  {
    id: "stress-slider",
    title: "StressSlider",
    description: "Indicador visual del nivel de estrés de la mascota",
    render: () => (
      <View className="w-full">
        <StressSlider value={0.35} />
      </View>
    ),
    footer:
      "Prop clave: `value` entre 0 y 1. Gradiente verde → amarillo → naranja → rojo.",
  },
  {
    id: "activity-chart",
    title: "ActivityChart",
    description: "Gráfica de actividad de la mascota a lo largo del día",
    render: () => (
      <View className="w-full">
        <ActivityChart
          currentHour={12}
          data={[
            { hour: 6, level: 0 },
            { hour: 8, level: 1 },
            { hour: 10, level: 2 },
            { hour: 12, level: 3 },
            { hour: 14, level: 2 },
            { hour: 16, level: 1 },
            { hour: 18, level: 0 },
          ]}
        />
      </View>
    ),
    footer:
      "Renderiza una línea con puntos sobre 4 niveles (Reposo/Mediano/Alto/Excesivo).",
  },
];

function SelectFieldPreview() {
  const [petType, setPetType] = useState<string | undefined>();
  return (
    <View className="w-full">
      <SelectField
        label="Tipo de mascota"
        onValueChange={setPetType}
        options={[
          { label: "Perro", value: "dog" },
          { label: "Gato", value: "cat" },
          { label: "Ave", value: "bird" },
        ]}
        placeholder="Tipo de mascota"
        value={petType}
      />
    </View>
  );
}

function PetPickerPreview() {
  const [selectedPet, setSelectedPet] = useState<string | undefined>();
  return (
    <View className="w-full">
      <PetPicker
        label="Mascota"
        onValueChange={setSelectedPet}
        options={[
          { label: "Luna", value: "luna", image: petAvatarSample, alt: "Luna" },
          { label: "Max", value: "max", image: petAvatarSample, alt: "Max" },
          { label: "Milo", value: "milo", image: petAvatarSample, alt: "Milo" },
        ]}
        placeholder="Mascota"
        value={selectedPet}
      />
    </View>
  );
}

function DeviceFieldPreview() {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>("idle");

  const deviceNameByStatus: Record<DeviceStatus, string | undefined> = {
    idle: undefined,
    connecting: "VHG - 2187946",
    available: "VHG - 2187946",
    connected: "VHG - 2187946",
    disconnected: "VHG - 2187946",
  };

  function cycleDeviceStatus() {
    setDeviceStatus((current) => {
      const idx = DEVICE_STATUS_SEQUENCE.indexOf(current);
      return DEVICE_STATUS_SEQUENCE[(idx + 1) % DEVICE_STATUS_SEQUENCE.length];
    });
  }

  return (
    <View className="w-full">
      <DeviceField
        label="Collar"
        onPress={cycleDeviceStatus}
        placeholder="Vincular dispositivo"
        status={deviceStatus}
        value={deviceNameByStatus[deviceStatus]}
      />
    </View>
  );
}
