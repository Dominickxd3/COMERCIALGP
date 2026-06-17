"use client";

import { useMemo } from "react";
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
import { ChartContainer } from "@/components/ui/chart";
import type { FamilyOriginBreakdown } from "./family-data";
import {
  calculateAveragePricePerKg,
  formatCurrencyCompact,
  formatKilosCompact,
  formatPercent,
  formatPriceKg,
} from "./family-data";

/* ── Tooltip ── */

function OriginTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { origen: string; venta: number; kilos: number; participacion: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  const precio = calculateAveragePricePerKg(item.venta, item.kilos);

  return (
    <div className="min-w-52 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs shadow-lg">
      <p className="font-semibold text-slate-950">{item.origen}</p>
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">Venta</span>
          <span className="font-semibold text-slate-950">{formatCurrencyCompact(item.venta)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">Kilos</span>
          <span className="font-semibold text-slate-950">{formatKilosCompact(item.kilos)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">Precio prom.</span>
          <span className="font-semibold text-slate-950">{formatPriceKg(precio).replace(" / kg", "/kg")}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">Participación</span>
          <span className="font-semibold text-slate-950">{formatPercent(item.participacion)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Component ── */

export function OriginBarChart({
  items,
}: {
  items: FamilyOriginBreakdown[];
}) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-10 text-center text-sm text-slate-500">
        No hay origen comercial disponible para los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full">
      <ChartContainer
        className="h-full w-full"
        config={{
          venta: { label: "Venta (S/)", color: "#2563EB" },
          kilos: { label: "Kilos", color: "#60A5FA" },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={items}
            margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
            barCategoryGap="35%"
          >
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="origen"
              axisLine={{ stroke: "#CBD5E1" }}
              tickLine={false}
              tick={{ fill: "#334155", fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              axisLine={{ stroke: "#CBD5E1" }}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 11 }}
              tickFormatter={(v: number) => formatCurrencyCompact(v)}
              width={62}
            />
            <Tooltip content={<OriginTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
            <Legend
              verticalAlign="top"
              height={24}
              iconType="square"
              wrapperStyle={{ fontSize: 11, color: "#64748B" }}
            />

            <Bar
              dataKey="venta"
              name="Venta (S/)"
              fill="#2563EB"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
              animationDuration={600}
            >
              <LabelList
                dataKey="venta"
                position="top"
                offset={6}
                fill="#0F172A"
                fontSize={10}
                formatter={(v) => formatCurrencyCompact(Number(v ?? 0))}
              />
            </Bar>
            <Bar
              dataKey="kilos"
              name="Kilos"
              fill="#60A5FA"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
              animationDuration={600}
            >
              <LabelList
                dataKey="kilos"
                position="top"
                offset={6}
                fill="#0F172A"
                fontSize={10}
                formatter={(v) => formatKilosCompact(Number(v ?? 0))}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
