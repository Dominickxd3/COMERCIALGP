"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

type PieChartItem = {
  name: string;
  value: number;
  percentage: number;
  isOther?: boolean;
  children?: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
};

type ProductItem = {
  name: string;
  value: number;
  percentage: number;
};

type FamilyPieChartProps = {
  title: string;
  subtitle: string;
  data: PieChartItem[];
  selectedFamily?: string | null;
  onSelectFamily?: (family: string | null) => void;
  selectedOther?: boolean;
  onSelectOther?: (active: boolean) => void;
  selectedOtherFamily?: string | null;
  onSelectOtherFamily?: (family: string | null) => void;
  productsData?: ProductItem[];
};

const MEAT_CHART_COLORS = [
  "#B91C1C",
  "#DC2626",
  "#F97316",
  "#FB923C",
  "#FCA5A5",
  "#FDBA74",
  "#A16207",
  "#78716C",
];

export function formatVolume(valueKg: number): string {
  if (valueKg < 1000) {
    const kilos = Math.round(valueKg);
    return `${kilos.toLocaleString("en-US")} K`;
  }

  const tonnes = valueKg / 1000;
  const tonnesFixed = Math.round((tonnes + Number.EPSILON) * 10) / 10;
  const formattedValue = tonnesFixed.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  return `${formattedValue} T`;
}

const RADIAN = Math.PI / 180;

function formatExternalLabel(name: string, percentage: number, isMobile: boolean) {
  if (name === "Otros") {
    return `Otros ${percentage.toFixed(0)}%`;
  }

  if (percentage < (isMobile ? 8 : 5)) {
    return "";
  }

  const maxLength = isMobile ? 11 : 13;
  const compactName = name.length > maxLength ? `${name.slice(0, maxLength - 3).trim()}...` : name;
  return `${compactName} ${percentage.toFixed(0)}%`;
}

type CustomLabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  name?: string;
  percentage?: number;
  isMobile?: boolean;
  width?: number | string;
};

const renderCustomizedLabel = ({
  cx = 0,
  cy = 0,
  midAngle = 0,
  outerRadius = 0,
  name,
  percentage,
  isMobile = false,
  width,
}: CustomLabelProps) => {
  if (!name || percentage === undefined) return null;

  const labelText = formatExternalLabel(name, percentage, isMobile);
  if (!labelText) return null;

  const parsedWidth = typeof width === "number" ? width : (width ? parseFloat(width) : undefined);
  const svgWidth = parsedWidth || cx * 2;
  const offset = isMobile ? 12 : 22;
  const startX = cx + outerRadius * Math.cos(-midAngle * RADIAN);
  const startY = cy + outerRadius * Math.sin(-midAngle * RADIAN);
  const endXRaw = cx + (outerRadius + offset) * Math.cos(-midAngle * RADIAN);
  const endY = cy + (outerRadius + offset) * Math.sin(-midAngle * RADIAN);
  const charWidth = isMobile ? 5.8 : 7.2;
  const estimatedWidth = labelText.length * charWidth;
  const safetyMargin = isMobile ? 8 : 12;
  const isLeft = endXRaw < cx;

  let endX = endXRaw;
  if (isLeft) {
    const minX = estimatedWidth + 4 + safetyMargin;
    endX = Math.max(minX, endXRaw);
  } else {
    const maxX = svgWidth - estimatedWidth - 4 - safetyMargin;
    endX = Math.min(maxX, endXRaw);
  }

  const textAnchor: "end" | "start" = isLeft ? "end" : "start";
  const textX = endX + (isLeft ? -4 : 4);
  const lineEndX = isLeft ? Math.min(startX, endX) : Math.max(startX, endX);

  return (
    <g>
      <path
        d={`M${startX},${startY}L${lineEndX},${endY}`}
        stroke="#cbd5e1"
        strokeWidth={1}
        fill="none"
      />
      <text
        x={textX}
        y={endY}
        fill="#475569"
        textAnchor={textAnchor}
        dominantBaseline="central"
        className="pointer-events-none select-none text-[9px] font-semibold sm:text-xs"
      >
        {labelText}
      </text>
    </g>
  );
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: PieChartItem;
  }>;
};

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-md">
      <p className="text-sm font-semibold text-slate-950">{data.name}</p>
      <p className="mt-1 text-xs text-slate-500">
        Volumen: <span className="font-medium text-slate-950">{formatVolume(data.value)}</span>
      </p>
      <p className="text-xs text-slate-500">
        Participacion: <span className="font-medium text-slate-950">{data.percentage.toFixed(0)}%</span>
      </p>
    </div>
  );
}

export function FamilyPieChart({
  title,
  subtitle,
  data,
  selectedFamily,
  onSelectFamily,
  selectedOther = false,
  onSelectOther,
  selectedOtherFamily = null,
  onSelectOtherFamily,
  productsData,
}: FamilyPieChartProps) {
  const isMobile = useIsMobile();

  const safeData = useMemo(() => {
    if (!data) return [];

    const seen = new Set<string>();
    return data.filter((item) => {
      const key = item.name.trim().toUpperCase();
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data]);

  const hasData = safeData.length > 0;

  const totalVolumeText = useMemo(() => {
    const totalKg = safeData.reduce((sum, item) => sum + item.value, 0);
    return formatVolume(totalKg);
  }, [safeData]);

  const selectedFamilyColor = useMemo(() => {
    const activeFamily = selectedOtherFamily ?? selectedFamily;
    if (!activeFamily) return "#78716C";

    const idx = safeData.findIndex((item) => item.name === activeFamily);
    if (idx === -1) return "#78716C";
    return safeData[idx].name === "Otros"
      ? "#78716C"
      : MEAT_CHART_COLORS[idx % (MEAT_CHART_COLORS.length - 1)];
  }, [safeData, selectedFamily, selectedOtherFamily]);

  const otrosChildren = useMemo(
    () => safeData.find((item) => item.name === "Otros")?.children?.filter((item) => item.name !== "Otros") ?? [],
    [safeData],
  );

  const detailFamily = selectedOtherFamily ?? selectedFamily;
  const showProductsDetail = Boolean(detailFamily);
  const showOtherFamiliesDetail = selectedOther && !selectedOtherFamily;
  const hasSelection = Boolean(selectedFamily) || selectedOther;

  const handleItemClick = (name: string) => {
    if (name === "Otros") {
      onSelectFamily?.(null);
      onSelectOther?.(true);
      onSelectOtherFamily?.(null);
      return;
    }

    onSelectOther?.(false);
    onSelectOtherFamily?.(null);
    onSelectFamily?.(selectedFamily === name ? null : name);
  };

  const clearDetail = () => {
    onSelectFamily?.(null);
    onSelectOther?.(false);
    onSelectOtherFamily?.(null);
  };

  const chartOuterRadius = isMobile ? 88 : 112;
  const chartInnerRadius = isMobile ? 52 : 64;

  return (
    <Card className="flex flex-col space-y-6 border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="border-b border-slate-100 pb-4">
        <CardTitle className="text-sm font-semibold text-slate-950">{title}</CardTitle>
        <CardDescription className="mt-1 text-xs text-slate-500">{subtitle}</CardDescription>
      </div>

      <CardContent className="flex flex-col justify-center p-0">
        {!hasData ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <p className="text-sm text-slate-400">No hay informacion para el periodo seleccionado.</p>
          </div>
        ) : (
          <div className="grid h-full w-full grid-cols-1 items-center gap-6 md:grid-cols-[430px_1fr]">
              <div className="relative flex h-[290px] w-full items-center justify-center md:h-[330px]">
                <div className="h-full min-h-[200px] w-full min-w-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart className="overflow-visible" margin={{ top: 18, right: 34, bottom: 18, left: 34 }}>
                      <Pie
                        isAnimationActive={false}
                        data={safeData}
                        cx="50%"
                        cy="50%"
                        labelLine={!isMobile}
                        label={(props) => renderCustomizedLabel({ ...props, isMobile })}
                        innerRadius={chartInnerRadius}
                        outerRadius={chartOuterRadius}
                        paddingAngle={1}
                        dataKey="value"
                        onClick={(entry) => {
                          if (entry?.name) {
                            handleItemClick(entry.name);
                          }
                        }}
                      >
                        {safeData.map((entry, index) => {
                          const baseColor = entry.name === "Otros"
                            ? "#78716C"
                            : MEAT_CHART_COLORS[index % (MEAT_CHART_COLORS.length - 1)];
                          const isSelected = (entry.name === "Otros" && selectedOther) || selectedFamily === entry.name;
                          const opacity = hasSelection && !isSelected ? 0.35 : 1;

                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={baseColor}
                              opacity={opacity}
                              stroke={isSelected ? "#7F1D1D" : "#ffffff"}
                              strokeWidth={isSelected ? 3 : 1}
                              className="cursor-pointer outline-none"
                            />
                          );
                        })}
                      </Pie>
                      {!isMobile && <Tooltip content={<CustomTooltip />} />}
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center">
                  <span className="text-[10px] font-bold uppercase leading-none tracking-wider text-slate-400">TOTAL</span>
                  <span className="mt-1 text-xl font-extrabold leading-none tracking-tight text-slate-900">
                    {totalVolumeText}
                  </span>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-3 pr-2">
                {!selectedFamily && !selectedOther && (
                  <>
                    {safeData.map((item, index) => {
                      const color = item.name === "Otros"
                        ? "#78716C"
                        : MEAT_CHART_COLORS[index % (MEAT_CHART_COLORS.length - 1)];

                      return (
                        <div
                          key={item.name}
                          onClick={() => handleItemClick(item.name)}
                          className="cursor-pointer rounded-lg border border-transparent p-2 transition-all hover:bg-slate-50"
                        >
                          <div className="flex items-start gap-2.5 text-sm">
                            <span
                              className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-slate-900">{item.name}</span>
                                <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-slate-600">
                                  {formatVolume(item.value)} <span className="mx-0.5 text-slate-300">·</span> {item.percentage.toFixed(0)}%
                                </span>
                              </div>
                              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${item.percentage}%`,
                                    backgroundColor: color,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {showProductsDetail && (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-sm font-semibold text-slate-950">{`Top productos de ${detailFamily}`}</CardTitle>
                        <CardDescription className="mt-1 text-xs text-slate-500">
                          Productos con mayor volumen vendido
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {selectedOtherFamily ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:text-slate-900"
                            onClick={() => onSelectOtherFamily?.(null)}
                          >
                            Volver a Otros
                          </Button>
                        ) : null}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:text-slate-900"
                          onClick={clearDetail}
                        >
                          Volver a familias
                        </Button>
                      </div>
                    </div>

                    {productsData?.slice(0, 5).map((item) => (
                      <div key={item.name} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-950">
                          <span className="truncate">{item.name.replace(/\s*[pP]roducto\s*$/, "").trim()}</span>
                          <span className="shrink-0 whitespace-nowrap text-slate-600">{formatVolume(item.value)}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: selectedFamilyColor,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {showOtherFamiliesDetail && (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-sm font-semibold text-slate-950">Familias incluidas en Otros</CardTitle>
                        <CardDescription className="mt-1 text-xs text-slate-500">
                          Familias fuera del Top 5
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:text-slate-900"
                        onClick={clearDetail}
                      >
                        Volver a familias
                      </Button>
                    </div>

                    {otrosChildren.slice(0, 5).map((item) => (
                      <div
                        key={item.name}
                        onClick={() => onSelectOtherFamily?.(item.name)}
                        className="cursor-pointer rounded-lg border border-transparent p-2 transition-all hover:bg-slate-50"
                      >
                        <div className="flex items-start gap-2.5 text-sm">
                          <span
                            className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: "#78716C" }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-slate-900">{item.name}</span>
                              <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-slate-600">
                                {formatVolume(item.value)} <span className="mx-0.5 text-slate-300">·</span> {item.percentage.toFixed(0)}%
                              </span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${item.percentage}%`,
                                  backgroundColor: "#78716C",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
