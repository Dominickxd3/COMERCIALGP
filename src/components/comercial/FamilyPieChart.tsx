"use client";

import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

type PieChartItem = {
  name: string;
  value: number;
  percentage: number;
};

type ProductItem = {
  name: string;
  value: number; // in Kg
  percentage: number;
};

type FamilyPieChartProps = {
  title: string;
  subtitle: string;
  data: PieChartItem[];
  selectedFamily?: string | null;
  onSelectFamily?: (family: string | null) => void;
  productsData?: ProductItem[];
};

const PIE_COLORS = [
  "#1D4ED8", // Top 1: Azul fuerte
  "#2563EB", // Top 2: Azul medio
  "#0EA5E9", // Top 3: Azul claro
  "#14B8A6", // Top 4: Celeste
  "#94A3B8", // Otros: Gris suave
];

// Helper to format volume in tonnes or kg
export function formatVolume(valueKg: number): string {
  if (valueKg < 1000) {
    return `${valueKg.toFixed(0)} kg`;
  }
  const tonnes = valueKg / 1000;
  const hasDecimal = tonnes % 1 !== 0;

  if (hasDecimal && tonnes < 10) {
    return `${tonnes.toFixed(1)} t`;
  } else {
    const rounded = Math.round(tonnes);
    return `${rounded.toLocaleString("en-US")} t`;
  }
}

const RADIAN = Math.PI / 180;

type CustomLabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  name?: string;
  percentage?: number;
  x?: number;
  y?: number;
  textAnchor?: "inherit" | "end" | "middle" | "start";
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
  const pct = percentage.toFixed(0);
  const labelText = `${name} ${pct}%`;

  const parsedWidth = typeof width === "number" ? width : (width ? parseFloat(width) : undefined);
  const svgWidth = parsedWidth || (cx * 2);
  const offset = isMobile ? 10 : 20;

  const startX = cx + outerRadius * Math.cos(-midAngle * RADIAN);
  const startY = cy + outerRadius * Math.sin(-midAngle * RADIAN);

  const endXRaw = cx + (outerRadius + offset) * Math.cos(-midAngle * RADIAN);
  const endY = cy + (outerRadius + offset) * Math.sin(-midAngle * RADIAN);

  // Dynamic clamping to prevent text from being cut off on left/right borders
  const charWidth = isMobile ? 6 : 7.5;
  const estimatedWidth = labelText.length * charWidth;
  const safetyMargin = isMobile ? 6 : 10;

  let endX = endXRaw;
  const isLeft = endXRaw < cx;

  if (isLeft) {
    // Left side: textAnchor is "end", meaning text extends to the left of textX (endX - 4).
    // So we must guarantee: endX - 4 - estimatedWidth >= safetyMargin.
    const minX = estimatedWidth + 4 + safetyMargin;
    endX = Math.max(minX, endXRaw);
  } else {
    // Right side: textAnchor is "start", meaning text extends to the right of textX (endX + 4).
    // So we must guarantee: endX + 4 + estimatedWidth <= svgWidth - safetyMargin.
    const maxX = svgWidth - estimatedWidth - 4 - safetyMargin;
    endX = Math.min(maxX, endXRaw);
  }

  const textAnchor: "inherit" | "end" | "middle" | "start" = isLeft ? "end" : "start";
  const textX = endX + (isLeft ? -4 : 4);

  // Avoid drawing connector line segments that cross inside/through the donut slice
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
        fill="#475569" // slate-600
        textAnchor={textAnchor}
        dominantBaseline="central"
        className="text-[9px] sm:text-xs font-semibold pointer-events-none select-none"
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
        Participación: <span className="font-medium text-slate-950">{data.percentage.toFixed(0)}%</span>
      </p>
    </div>
  );
}

export function FamilyPieChart({ title, subtitle, data, selectedFamily, onSelectFamily, productsData }: FamilyPieChartProps) {
  const hasData = data && data.length > 0;
  const isMobile = useIsMobile();
  const [showOtrosMessage, setShowOtrosMessage] = useState(false);

  // Calculate total volume for the center label
  const totalVolumeText = useMemo(() => {
    if (!data) return "0 t";
    const totalKg = data.reduce((sum, item) => sum + item.value, 0);
    return formatVolume(totalKg);
  }, [data]);

  const selectedFamilyColor = useMemo(() => {
    if (!selectedFamily) return "#94A3B8";
    const idx = data.findIndex((item) => item.name === selectedFamily);
    if (idx === -1) return "#94A3B8";
    return idx === data.length - 1 ? "#94A3B8" : PIE_COLORS[idx % (PIE_COLORS.length - 1)];
  }, [selectedFamily, data]);

  const handleItemClick = (name: string) => {
    if (name === "Otros") {
      setShowOtrosMessage(true);
      setTimeout(() => setShowOtrosMessage(false), 3000);
      return;
    }
    setShowOtrosMessage(false);
    if (onSelectFamily) {
      if (selectedFamily === name) {
        onSelectFamily(null); // toggle off
      } else {
        onSelectFamily(name);
      }
    }
  };

  const chartOuterRadius = 96;
  const chartInnerRadius = 56;

  return (
    <Card className="border-slate-200 bg-white shadow-sm flex flex-col p-4 sm:p-6 space-y-6">
      <div>
        <CardTitle className="text-sm font-semibold text-slate-950">{title}</CardTitle>
        <CardDescription className="text-xs text-slate-500 mt-1">{subtitle}</CardDescription>
      </div>
      <CardContent className="p-0 flex flex-col justify-center">
        {!hasData ? (
          <div className="flex h-full items-center justify-center min-h-[220px]">
            <p className="text-sm text-slate-400">No hay información para el periodo seleccionado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] items-center gap-8 w-full h-full">
            {/* Left/Top: Pie Chart with absolute centered Total */}
            <div className="relative w-full h-[260px] md:h-[300px] flex items-center justify-center">
              <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart className="overflow-visible" margin={{ top: 24, right: 60, bottom: 24, left: 60 }}>
                    <Pie
                      isAnimationActive={false}
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props) => renderCustomizedLabel({ ...props, isMobile })}
                      innerRadius={chartInnerRadius}
                      outerRadius={chartOuterRadius}
                      paddingAngle={1}
                      fill="#8884d8"
                      dataKey="value"
                      onClick={(entry) => {
                        if (entry && entry.name) {
                          handleItemClick(entry.name);
                        }
                      }}
                    >
                      {data.map((entry, index) => {
                        const baseColor = entry.name === "Otros"
                          ? "#94A3B8"
                          : PIE_COLORS[index % (PIE_COLORS.length - 1)];
                        const isSelected = selectedFamily === entry.name;
                        const hasSelection = !!selectedFamily;
                        const opacity = hasSelection && !isSelected ? 0.35 : 1;
                        const stroke = isSelected ? "#1E40AF" : "#ffffff";
                        const strokeWidth = isSelected ? 3 : 1;

                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={baseColor}
                            opacity={opacity}
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                            className={entry.name !== "Otros" ? "cursor-pointer outline-none" : "outline-none"}
                          />
                        );
                      })}
                    </Pie>
                    {!isMobile && <Tooltip content={<CustomTooltip />} />}
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Center donut label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 leading-none">TOTAL</span>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 mt-1 leading-none">
                  {totalVolumeText}
                </span>
              </div>
            </div>

            {/* Right/Bottom: Dynamic Area (Families list OR Products list) */}
            <div className="flex flex-col justify-center space-y-3 pr-2">
              {selectedFamily ? (
                /* Products List */
                <div className="flex flex-col space-y-4">
                  {/* Products Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Top productos de {selectedFamily}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Productos con mayor volumen vendido</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 rounded-lg text-xs font-medium border-slate-200 text-slate-600 hover:text-slate-900 bg-white"
                      onClick={() => onSelectFamily?.(null)}
                    >
                      Volver a familias
                    </Button>
                  </div>

                  {/* Products List */}
                  <div className="space-y-3">
                    {productsData?.map((item) => (
                      <div key={item.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                          <span className="truncate">{item.name.replace(/\s*[pP]roducto\s*$/, "").trim()}</span>
                          <span className="text-slate-600 font-medium whitespace-nowrap">{formatVolume(item.value)}</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
                  </div>
                </div>
              ) : (
                /* Families List */
                <div className="flex flex-col space-y-3">
                  {data.map((item, index) => {
                    const color = item.name === "Otros"
                      ? "#94A3B8"
                      : PIE_COLORS[index % (PIE_COLORS.length - 1)];
                    const isSelected = selectedFamily === item.name;
                    const hasSelection = !!selectedFamily;

                    return (
                      <div
                        key={item.name}
                        onClick={() => handleItemClick(item.name)}
                        className={`p-2 rounded-lg transition-all border ${
                          isSelected
                            ? "bg-blue-50/70 border-blue-200 shadow-xs"
                            : item.name === "Otros"
                            ? "border-transparent cursor-default"
                            : hasSelection
                            ? "border-transparent opacity-50 hover:opacity-80 cursor-pointer"
                            : "border-transparent hover:bg-slate-50 cursor-pointer"
                        }`}
                      >
                        {/* Color dot + Name & Volume/Pct */}
                        <div className="flex items-start gap-2.5 text-sm">
                          {/* Color indicator */}
                          <span
                            className="h-3 w-3 rounded-full mt-1.5 shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`transition-colors ${isSelected ? "font-bold text-blue-900" : "font-semibold text-slate-900"} truncate`}>
                                {item.name}
                              </span>
                              <span className={`text-xs font-semibold whitespace-nowrap transition-colors ${isSelected ? "text-blue-700" : "text-slate-600"}`}>
                                {formatVolume(item.value)} <span className="text-slate-300 mx-0.5">·</span> {item.percentage.toFixed(0)}%
                              </span>
                            </div>
                            {/* Progress Bar */}
                            <div className="mt-1.5 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${item.percentage}%`,
                                  backgroundColor: color,
                                }}
                              />
                            </div>
                            {item.name === "Otros" && showOtrosMessage && (
                              <p className="mt-1 text-[10px] text-amber-600 font-medium">
                                Otros agrupa varias familias.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
