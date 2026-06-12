"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import type { ProductMetricRow } from "./product-data";
import {
  formatCurrencyCompact,
  formatKilosCompact,
  formatPercent,
  formatPriceKg,
} from "./product-data";

function RankingTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ProductMetricRow }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="min-w-60 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-xl">
      <p className="font-semibold text-slate-950">{item.producto}</p>
      <div className="mt-1 text-slate-500">{item.productoMarca}</div>
      <div className="mt-2 space-y-1.5 text-slate-600">
        <div className="flex items-center justify-between gap-3">
          <span>Familia</span>
          <span className="font-semibold text-slate-950">{item.familia}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Subfamilia</span>
          <span className="font-semibold text-slate-950">{item.subfamilia}</span>
        </div>
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

export function ProductRankingChart({
  items,
  mode,
}: {
  items: ProductMetricRow[];
  mode: "venta" | "kilos";
}) {
  const isSales = mode === "venta";
  const dataKey = isSales ? "venta" : "kilos";
  const title = isSales ? "Ranking de productos por venta" : "Ranking de productos por kilos";
  const description = isSales
    ? "Productos líderes por valor vendido en el periodo."
    : "Productos líderes por volumen comercial en el periodo.";
  const color = isSales ? "#2563EB" : "#0F766E";

  return (
    <Card className="h-fit self-start border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-950">{title}</CardTitle>
        <CardDescription className="text-sm text-slate-500">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px] w-full">
          <ChartContainer className="h-full w-full" config={{ [dataKey]: { label: title, color } }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={items} layout="vertical" margin={{ top: 8, right: 96, left: 16, bottom: 8 }} barCategoryGap="18%">
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" horizontal vertical={false} />
                <XAxis
                  type="number"
                  axisLine={{ stroke: "#CBD5E1" }}
                  tickLine={{ stroke: "#CBD5E1" }}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  tickFormatter={(value: number) =>
                    isSales ? formatCurrencyCompact(value) : formatKilosCompact(value).replace(" kg", "")
                  }
                />
                <YAxis
                  type="category"
                  dataKey="producto"
                  width={118}
                  axisLine={{ stroke: "#CBD5E1" }}
                  tickLine={{ stroke: "#CBD5E1" }}
                  tick={{ fill: "#334155", fontSize: 12 }}
                />
                <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.10)" }} content={<RankingTooltip />} />
                <Bar dataKey={dataKey} radius={[0, 8, 8, 0]} fill={color} maxBarSize={30}>
                  <LabelList
                    dataKey={dataKey}
                    position="right"
                    offset={8}
                    fill="#0F172A"
                    fontSize={12}
                    formatter={(value) =>
                      isSales
                        ? formatCurrencyCompact(Number(value ?? 0))
                        : formatKilosCompact(Number(value ?? 0)).replace(" kg", "")
                    }
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
