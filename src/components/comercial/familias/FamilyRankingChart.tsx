"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import type { FamilyMetricRow } from "./family-data";
import { formatCurrencyCompact, formatKilosCompact, formatPercent, formatPriceKg } from "./family-data";

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
    <div className="min-w-52 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-xl">
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

export function FamilyRankingChart({
  items,
  selectedFamily,
  onSelectFamily,
}: {
  items: FamilyMetricRow[];
  selectedFamily: string;
  onSelectFamily: (family: string) => void;
}) {
  return (
    <Card className="h-fit self-start border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-950">Ranking de familias por venta</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Comparativo comercial ordenado de mayor a menor venta.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[260px] w-full md:h-[280px]">
          <ChartContainer className="h-full w-full" config={{ venta: { label: "Venta", color: "#2563EB" } }}>
            <ResponsiveContainer width="100%" height="100%">
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
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  tickFormatter={(value: number) => formatCurrencyCompact(value)}
                />
                <YAxis
                  type="category"
                  dataKey="familia"
                  width={82}
                  axisLine={{ stroke: "#CBD5E1" }}
                  tickLine={{ stroke: "#CBD5E1" }}
                  tick={{ fill: "#334155", fontSize: 12 }}
                />
                <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.10)" }} content={<RankingTooltip />} />
                <Bar
                  dataKey="venta"
                  radius={[0, 8, 8, 0]}
                  fill="#2563EB"
                  maxBarSize={30}
                  onClick={(payload) => {
                    const row = payload as unknown as FamilyMetricRow | undefined;
                    if (row?.familia) onSelectFamily(row.familia);
                  }}
                >
                  {items.map((item) => (
                    <Cell
                      key={item.familia}
                      fill={selectedFamily === item.familia ? "#1D4ED8" : "#60A5FA"}
                      cursor="pointer"
                    />
                  ))}
                  <LabelList
                    dataKey="venta"
                    position="right"
                    offset={8}
                    fill="#0F172A"
                    fontSize={12}
                    formatter={(value) => formatCurrencyCompact(Number(value ?? 0))}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <button
              key={item.familia}
              type="button"
              onClick={() => onSelectFamily(item.familia)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                selectedFamily === item.familia
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              {item.familia}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
