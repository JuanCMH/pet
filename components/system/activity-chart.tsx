import { useMemo } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";

import { AppColors } from "@/constants/theme";
import { cn } from "@/lib/utils";

export type ActivityChartPoint = {

  hour: number;

  level: number;
};

export type ActivityChartProps = {
  data: ActivityChartPoint[];

  currentHour?: number;
  className?: string;
};

const LEVEL_LABELS = ["Reposo", "Mediano", "Alto", "Excesivo"];
const PADDING = { top: 12, right: 12, bottom: 28, left: 64 };
const CHART_HEIGHT = 200;

export function ActivityChart({
  data,
  currentHour,
  className,
}: ActivityChartProps) {
  const sortedData = useMemo(
    () => [...data].sort((a, b) => a.hour - b.hour),
    [data],
  );

  const minHour = sortedData[0]?.hour ?? 6;
  const maxHour = sortedData[sortedData.length - 1]?.hour ?? 18;

  return (
    <View
      className={cn("w-full", className)}
      onLayout={() => {

      }}
    >
      <ChartCanvas
        currentHour={currentHour}
        data={sortedData}
        maxHour={maxHour}
        minHour={minHour}
      />
    </View>
  );
}

type ChartCanvasProps = {
  data: ActivityChartPoint[];
  minHour: number;
  maxHour: number;
  currentHour?: number;
};

function ChartCanvas({
  data,
  minHour,
  maxHour,
  currentHour,
}: ChartCanvasProps) {

  const width = 320;
  const height = CHART_HEIGHT;

  const innerWidth = width - PADDING.left - PADDING.right;
  const innerHeight = height - PADDING.top - PADDING.bottom;

  const xForHour = (hour: number) => {
    if (maxHour === minHour) return PADDING.left + innerWidth / 2;
    return PADDING.left + ((hour - minHour) / (maxHour - minHour)) * innerWidth;
  };
  const yForLevel = (level: number) =>
    PADDING.top + ((3 - level) / 3) * innerHeight;

  const polylinePoints = data
    .map((point) => `${xForHour(point.hour)},${yForLevel(point.level)}`)
    .join(" ");

  const tickCount = Math.min(7, maxHour - minHour + 1);
  const ticks = Array.from({ length: tickCount }, (_, index) => {
    const hour = Math.round(
      minHour + (index / Math.max(1, tickCount - 1)) * (maxHour - minHour),
    );
    return hour;
  });

  return (
    <View>
      <Svg
        height={height}
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
      >

        {LEVEL_LABELS.map((_, idx) => {
          const level = 3 - idx;
          const y = yForLevel(level);
          return (
            <Line
              key={`grid-${level}`}
              stroke={AppColors.gris}
              strokeDasharray="4 4"
              strokeWidth={1}
              x1={PADDING.left}
              x2={width - PADDING.right}
              y1={y}
              y2={y}
            />
          );
        })}

        <Polyline
          fill="none"
          points={polylinePoints}
          stroke={AppColors.celeste}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
        />

        {data.map((point) => (
          <Circle
            cx={xForHour(point.hour)}
            cy={yForLevel(point.level)}
            fill={AppColors.celeste}
            key={`pt-${point.hour}`}
            r={4}
          />
        ))}
      </Svg>

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: PADDING.top,
          left: 0,
          width: PADDING.left - 8,
          height: innerHeight,
          justifyContent: "space-between",
        }}
      >
        {LEVEL_LABELS.map((label) => (
          <Text
            className="text-right text-[10px] text-cobalto"
            key={label}
            numberOfLines={1}
          >
            {label}
          </Text>
        ))}
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 4,
          marginLeft: PADDING.left,
          marginRight: PADDING.right,
        }}
      >
        {ticks.map((hour) => {
          const isCurrent = currentHour !== undefined && hour === currentHour;
          return (
            <Text
              className={cn(
                "text-[10px]",
                isCurrent ? "font-bold text-celeste" : "text-cobalto",
              )}
              key={`xtick-${hour}`}
            >
              {String(hour).padStart(2, "0")}
            </Text>
          );
        })}
      </View>
    </View>
  );
}
