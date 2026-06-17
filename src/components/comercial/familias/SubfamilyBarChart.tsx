"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart";
import type { FamilySubfamilyLeader } from "./family-data";
import {
  calculateAveragePricePerKg,
  formatCurrencyCompact,
  formatKilosCompact,
  formatPercent,
  formatPriceKg,
  safeDivide,
} from "./family-data";
import { CommercialBarTooltip } from "./CommercialTooltip";

type ViewMode = "comparativo" | "venta" | "kilos";

export function SubfamilyBarChart({
  items,
  totalVenta,
}: {
  items: FamilySubfamilyLeader[];
  totalVenta: number;
}) {
  const [mode, setMode] = useState<ViewMode>("comparativo");

  const chartData = useMemo(() => {
    return items.slice(0, 6).map((item) => ({
      subfamilia: item.subfamilia,
      name: item.subfamilia,
      venta: item.venta,
      kilos: item.kilos,
      precioPromedio: calculateAveragePricePerKg(item.venta, item.kilos),
      participacionVenta: item.participacionVenta ?? safeDivide(item.venta, totalVenta) * 100,
    }));
  }, [items, totalVenta]);

  if (!chartData.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-10 text-center text-sm text-slate-500">
        No hay subfamilias disponibles para los filtros seleccionados.
      </div>
    );
  }

  const showVenta = mode === "comparativo" || mode === "venta";
  const showKilos = mode === "comparativo" || mode === "kilos";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5">
        {(["comparativo", "venta", "kilos"] as ViewMode[]).map((m) => (
          <Button
            key={m}
            type="button"
            variant={mode === m ? "default" : "outline"}
            size="sm"
            className="h-7 rounded-full px-3 text-xs capitalize"
            onClick={() => setMode(m)}
          >
            {m === "comparativo" ? "Comparativo" : m === "venta" ? "Venta" : "Kilos"}
          </Button>
        ))}
      </div>

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
              data={chartData}
              margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
              barCategoryGap="22%"
            >
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="subfamilia"
                axisLine={{ stroke: "#CBD5E1" }}
                tickLine={false}
                tick={{ fill: "#334155", fontSize: 11 }}
                interval={0}
              />
              <YAxis
                axisLine={{ stroke: "#CBD5E1" }}
                tickLine={false}
                tick={{ fill: "#64748B", fontSize: 11 }}
                tickFormatter={(v: number) =>
                  showVenta ? formatCurrencyCompact(v) : formatKilosCompact(v).replace(" kg", "")
                }
                width={62}
              />
              <Tooltip content={<CommercialBarTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
              {mode === "comparativo" && (
                <Legend
                  verticalAlign="top"
                  height={24}
                  iconType="square"
                  wrapperStyle={{ fontSize: 11, color: "#64748B" }}
                />
              )}

              {showVenta && (
                <Bar
                  dataKey="venta"
                  name="Venta (S/)"
                  fill="#2563EB"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={mode === "comparativo" ? 32 : 44}
                  animationDuration={600}
                >
                  {mode !== "comparativo" && (
                    <LabelList
                      dataKey="venta"
                      position="top"
                      offset={6}
                      fill="#0F172A"
                      fontSize={10}
                      formatter={(v) => formatCurrencyCompact(Number(v ?? 0))}
                    />
                  )}
                </Bar>
              )}

              {showKilos && (
                <Bar
                  dataKey="kilos"
                  name="Kilos"
                  fill="#60A5FA"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={mode === "comparativo" ? 32 : 44}
                  animationDuration={600}
                >
                  {mode !== "comparativo" && (
                    <LabelList
                      dataKey="kilos"
                      position="top"
                      offset={6}
                      fill="#0F172A"
                      fontSize={10}
                      formatter={(v) => formatKilosCompact(Number(v ?? 0))}
                    />
                  )}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
