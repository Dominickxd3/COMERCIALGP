"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { FamilyMetricRow } from "./family-data";
import {
  calculateAveragePricePerKg,
  formatCurrencyCompact,
  formatKilosCompact,
  formatPercent,
  formatPriceKg,
} from "./family-data";

type ViewMode = "comparativo" | "venta" | "kilos";

/* ── Tooltip ── */

function RankingTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: FamilyMetricRow }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="min-w-52 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs shadow-lg">
      <p className="font-semibold text-slate-950">{item.familia}</p>
      <div className="mt-2 space-y-1.5 text-slate-600">
        <div className="flex items-center justify-between gap-3">
          <span>Venta</span>
          <span className="font-semibold text-slate-950">{formatCurrencyCompact(item.venta)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Kilos</span>
          <span className="font-semibold text-slate-950">{formatKilosCompact(item.kilos)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Precio promedio</span>
          <span className="font-semibold text-slate-950">{formatPriceKg(item.precioPromedio)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Participación venta</span>
          <span className="font-semibold text-slate-950">{formatPercent(item.participacionVenta)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Participación kilos</span>
          <span className="font-semibold text-slate-950">{formatPercent(item.participacionKilos)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Component ── */

export function FamilyRankingChart({
  items,
  selectedFamily,
  onSelectFamily,
}: {
  items: FamilyMetricRow[];
  selectedFamily: string;
  onSelectFamily: (family: string) => void;
}) {
  const [mode, setMode] = useState<ViewMode>("comparativo");

  const rankedItems = useMemo(
    () =>
      [...items]
        .sort((a, b) => b.venta - a.venta)
        .map((item, index) => ({
          ...item,
          rankLabel: `#${index + 1} ${item.familia}`,
        })),
    [items],
  );

  const showVenta = mode === "comparativo" || mode === "venta";
  const showKilos = mode === "comparativo" || mode === "kilos";

  return (
    <Card className="h-fit self-start border-slate-200 bg-white shadow-sm">
      <CardHeader className="space-y-4 pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-slate-950">
              Ranking comparativo de familias
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Selecciona una familia para ver subfamilias, origen y productos.
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5">
            {(["comparativo", "venta", "kilos"] as ViewMode[]).map((m) => (
              <Button
                key={m}
                type="button"
                variant={mode === m ? "default" : "outline"}
                size="sm"
                className="h-8 rounded-full px-3.5 text-xs capitalize"
                onClick={() => setMode(m)}
              >
                {m === "comparativo" ? "Comparativo" : m === "venta" ? "Soles" : "Kilos"}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-[280px] w-full">
          <ChartContainer
            className="h-full w-full"
            config={{
              venta: { label: "Venta (S/)", color: "#2563EB" },
              kilos: { label: "Kilos", color: "#60A5FA" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rankedItems}
                layout="vertical"
                margin={{ top: 8, right: 90, left: 16, bottom: 8 }}
                barCategoryGap="18%"
              >
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" horizontal vertical={false} />
                <XAxis
                  type="number"
                  axisLine={{ stroke: "#CBD5E1" }}
                  tickLine={{ stroke: "#CBD5E1" }}
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  tickFormatter={(value: number) =>
                    showVenta
                      ? formatCurrencyCompact(value)
                      : formatKilosCompact(value).replace(" kg", "")
                  }
                />
                <YAxis
                  type="category"
                  dataKey="rankLabel"
                  width={112}
                  axisLine={{ stroke: "#CBD5E1" }}
                  tickLine={{ stroke: "#CBD5E1" }}
                  tick={{ fill: "#334155", fontSize: 12 }}
                />
                <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.10)" }} content={<RankingTooltip />} />
                {mode === "comparativo" && (
                  <Legend
                    verticalAlign="top"
                    height={28}
                    iconType="square"
                    wrapperStyle={{ fontSize: 11, color: "#64748B" }}
                  />
                )}

                {showVenta && (
                  <Bar
                    dataKey="venta"
                    name="Venta (S/)"
                    fill="#2563EB"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={mode === "comparativo" ? 20 : 28}
                    className="cursor-pointer"
                    onClick={(payload) => {
                      const row = payload as unknown as FamilyMetricRow | undefined;
                      if (row?.familia) onSelectFamily(row.familia);
                    }}
                  >
                    {rankedItems.map((item) => (
                      <Cell
                        key={`v-${item.familia}`}
                        fill={selectedFamily === item.familia ? "#1D4ED8" : "#60A5FA"}
                        stroke={selectedFamily === item.familia ? "#0F172A" : "transparent"}
                        strokeWidth={selectedFamily === item.familia ? 1.5 : 0}
                        cursor="pointer"
                      />
                    ))}
                    {mode !== "comparativo" && (
                      <LabelList
                        dataKey="venta"
                        position="right"
                        offset={8}
                        fill="#0F172A"
                        fontSize={11}
                        formatter={(value) => formatCurrencyCompact(Number(value ?? 0))}
                      />
                    )}
                  </Bar>
                )}

                {showKilos && (
                  <Bar
                    dataKey="kilos"
                    name="Kilos"
                    fill="#60A5FA"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={mode === "comparativo" ? 20 : 28}
                    className="cursor-pointer"
                    onClick={(payload) => {
                      const row = payload as unknown as FamilyMetricRow | undefined;
                      if (row?.familia) onSelectFamily(row.familia);
                    }}
                  >
                    {rankedItems.map((item) => (
                      <Cell
                        key={`k-${item.familia}`}
                        fill={selectedFamily === item.familia ? "#2563EB" : "#93C5FD"}
                        stroke={selectedFamily === item.familia ? "#0F172A" : "transparent"}
                        strokeWidth={selectedFamily === item.familia ? 1.5 : 0}
                        cursor="pointer"
                      />
                    ))}
                    {mode !== "comparativo" && (
                      <LabelList
                        dataKey="kilos"
                        position="right"
                        offset={8}
                        fill="#0F172A"
                        fontSize={11}
                        formatter={(value) => formatKilosCompact(Number(value ?? 0))}
                      />
                    )}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
