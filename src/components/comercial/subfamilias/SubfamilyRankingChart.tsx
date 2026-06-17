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
import type { SubfamilyMetricRow } from "./subfamily-data";
import {
  formatCurrencyCompact,
  formatKilosCompact,
  formatPercent,
  formatPriceKg,
} from "./subfamily-data";

type ViewMode = "comparativo" | "venta" | "kilos";

/* ── Tooltip ── */

function RankingTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: NormalizedRow }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="min-w-56 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs shadow-lg">
      <p className="font-semibold text-slate-950">{item.subfamilia}</p>
      <p className="mt-0.5 text-slate-500">Familia: {item.familia}</p>
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
      </div>
    </div>
  );
}

/* ── Normalized row type ── */

type NormalizedRow = SubfamilyMetricRow & {
  ventaIndex: number;
  kilosIndex: number;
};

/* ── Component ── */

export function SubfamilyRankingChart({
  items,
  selectedSubfamily,
  onSelectSubfamily,
}: {
  items: SubfamilyMetricRow[];
  selectedSubfamily: string;
  onSelectSubfamily: (subfamily: string) => void;
}) {
  const [mode, setMode] = useState<ViewMode>("comparativo");

  const normalizedItems: NormalizedRow[] = useMemo(() => {
    const maxVenta = Math.max(...items.map((r) => r.venta), 1);
    const maxKilos = Math.max(...items.map((r) => r.kilos), 1);
    return items.map((item) => ({
      ...item,
      ventaIndex: (item.venta / maxVenta) * 100,
      kilosIndex: (item.kilos / maxKilos) * 100,
    }));
  }, [items]);

  const isComparativo = mode === "comparativo";
  const chartHeight = Math.max(items.length * 44, 260);

  return (
    <Card className="h-fit self-start border-slate-200 bg-white shadow-sm">
      <CardHeader className="space-y-4 pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-slate-950">
              Ranking comparativo de subfamilias
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              {isComparativo
                ? "Índice relativo 0–100. Valores reales en labels y tooltip."
                : "Selecciona una subfamilia para ver familias, origen y productos."}
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
        <div style={{ height: chartHeight }} className="w-full">
          <ChartContainer
            className="h-full w-full"
            config={{
              ventaIndex: { label: "Venta", color: "#2563EB" },
              kilosIndex: { label: "Kilos", color: "#60A5FA" },
              venta: { label: "Venta (S/)", color: "#2563EB" },
              kilos: { label: "Kilos", color: "#60A5FA" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              {isComparativo ? (
                /* ── Comparativo: normalized 0–100 ── */
                <BarChart
                  data={normalizedItems}
                  layout="vertical"
                  margin={{ top: 8, right: 100, left: 16, bottom: 8 }}
                  barCategoryGap="18%"
                >
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" horizontal vertical={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    axisLine={{ stroke: "#CBD5E1" }}
                    tickLine={{ stroke: "#CBD5E1" }}
                    tick={{ fill: "#64748B", fontSize: 11 }}
                    tickFormatter={(v: number) => `${v}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="subfamilia"
                    width={110}
                    axisLine={{ stroke: "#CBD5E1" }}
                    tickLine={{ stroke: "#CBD5E1" }}
                    tick={{ fill: "#334155", fontSize: 12 }}
                  />
                  <Tooltip cursor={{ fill: "rgba(148,163,184,0.10)" }} content={<RankingTooltip />} />
                  <Legend verticalAlign="top" height={28} iconType="square" wrapperStyle={{ fontSize: 11, color: "#64748B" }} />
                  <Bar
                    dataKey="ventaIndex"
                    name="Venta"
                    fill="#2563EB"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={20}
                    className="cursor-pointer"
                    onClick={(payload) => {
                      const row = payload as unknown as NormalizedRow | undefined;
                      if (row?.subfamilia) onSelectSubfamily(row.subfamilia);
                    }}
                  >
                    {normalizedItems.map((item) => (
                      <Cell
                        key={`v-${item.subfamilia}`}
                        fill={selectedSubfamily === item.subfamilia ? "#1D4ED8" : "#60A5FA"}
                        stroke={selectedSubfamily === item.subfamilia ? "#0F172A" : "transparent"}
                        strokeWidth={selectedSubfamily === item.subfamilia ? 1.5 : 0}
                        cursor="pointer"
                      />
                    ))}
                    <LabelList
                      dataKey="venta"
                      position="right"
                      offset={8}
                      fill="#0F172A"
                      fontSize={10}
                      formatter={(v) => formatCurrencyCompact(Number(v ?? 0))}
                    />
                  </Bar>
                  <Bar
                    dataKey="kilosIndex"
                    name="Kilos"
                    fill="#60A5FA"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={20}
                    className="cursor-pointer"
                    onClick={(payload) => {
                      const row = payload as unknown as NormalizedRow | undefined;
                      if (row?.subfamilia) onSelectSubfamily(row.subfamilia);
                    }}
                  >
                    {normalizedItems.map((item) => (
                      <Cell
                        key={`k-${item.subfamilia}`}
                        fill={selectedSubfamily === item.subfamilia ? "#2563EB" : "#93C5FD"}
                        stroke={selectedSubfamily === item.subfamilia ? "#0F172A" : "transparent"}
                        strokeWidth={selectedSubfamily === item.subfamilia ? 1.5 : 0}
                        cursor="pointer"
                      />
                    ))}
                    <LabelList
                      dataKey="kilos"
                      position="right"
                      offset={8}
                      fill="#0F172A"
                      fontSize={10}
                      formatter={(v) => formatKilosCompact(Number(v ?? 0))}
                    />
                  </Bar>
                </BarChart>
              ) : (
                /* ── Single mode: real values ── */
                <BarChart
                  data={items}
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
                      mode === "venta"
                        ? formatCurrencyCompact(value)
                        : formatKilosCompact(value).replace(" kg", "")
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="subfamilia"
                    width={110}
                    axisLine={{ stroke: "#CBD5E1" }}
                    tickLine={{ stroke: "#CBD5E1" }}
                    tick={{ fill: "#334155", fontSize: 12 }}
                  />
                  <Tooltip cursor={{ fill: "rgba(148,163,184,0.10)" }} content={<RankingTooltip />} />
                  <Bar
                    dataKey={mode === "venta" ? "venta" : "kilos"}
                    name={mode === "venta" ? "Venta (S/)" : "Kilos"}
                    fill={mode === "venta" ? "#2563EB" : "#60A5FA"}
                    radius={[0, 6, 6, 0]}
                    maxBarSize={28}
                    className="cursor-pointer"
                    onClick={(payload) => {
                      const row = payload as unknown as SubfamilyMetricRow | undefined;
                      if (row?.subfamilia) onSelectSubfamily(row.subfamilia);
                    }}
                  >
                    {items.map((item) => (
                      <Cell
                        key={`s-${item.subfamilia}`}
                        fill={selectedSubfamily === item.subfamilia ? "#1D4ED8" : (mode === "venta" ? "#60A5FA" : "#93C5FD")}
                        stroke={selectedSubfamily === item.subfamilia ? "#0F172A" : "transparent"}
                        strokeWidth={selectedSubfamily === item.subfamilia ? 1.5 : 0}
                        cursor="pointer"
                      />
                    ))}
                    <LabelList
                      dataKey={mode === "venta" ? "venta" : "kilos"}
                      position="right"
                      offset={8}
                      fill="#0F172A"
                      fontSize={11}
                      formatter={(v) =>
                        mode === "venta"
                          ? formatCurrencyCompact(Number(v ?? 0))
                          : formatKilosCompact(Number(v ?? 0))
                      }
                    />
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
