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
import type { FamilyTopProduct } from "./family-data";
import {
  calculateAveragePricePerKg,
  formatCurrencyCompact,
  formatKilosCompact,
  formatPercent,
  formatPriceKg,
  safeDivide,
} from "./family-data";

type ViewMode = "comparativo" | "venta" | "kilos";

/* ── Helpers ── */

function splitProductAndBrand(productoMarca: string) {
  const match = productoMarca.match(/^(.*)\s\[(.*)\]$/);
  if (!match) return { product: productoMarca, brand: "" };
  return {
    product: match[1]?.trim() ?? productoMarca,
    brand: match[2]?.trim() ?? "",
  };
}

function truncateLabel(text: string, maxLen = 18): string {
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
}

/* ── Tooltip ── */

type ProductEntry = {
  producto: string;
  marca: string;
  venta: number;
  kilos: number;
  precioPromedio: number;
  participacion: number;
};

function ProductTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ProductEntry }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="min-w-56 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs shadow-lg">
      <p className="font-semibold text-slate-950">{item.producto}</p>
      {item.marca ? <p className="mt-0.5 text-slate-500">{item.marca}</p> : null}
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
          <span className="font-semibold text-slate-950">
            {formatPriceKg(item.precioPromedio).replace(" / kg", "/kg")}
          </span>
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

export function ProductsBarChart({
  items,
  totalVenta,
}: {
  items: FamilyTopProduct[];
  totalVenta: number;
}) {
  const [mode, setMode] = useState<ViewMode>("comparativo");

  const chartData = useMemo(() => {
    return items.slice(0, 5).map((item) => {
      const parsed = splitProductAndBrand(item.productoMarca);
      return {
        producto: parsed.product,
        productoCorto: truncateLabel(parsed.product),
        marca: parsed.brand,
        venta: item.venta,
        kilos: item.kilos,
        precioPromedio: calculateAveragePricePerKg(item.venta, item.kilos),
        participacion: safeDivide(item.venta, totalVenta) * 100,
      };
    });
  }, [items, totalVenta]);

  if (!chartData.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-10 text-center text-sm text-slate-500">
        No hay productos disponibles para los filtros seleccionados.
      </div>
    );
  }

  const showVenta = mode === "comparativo" || mode === "venta";
  const showKilos = mode === "comparativo" || mode === "kilos";
  const chartHeight = Math.max(chartData.length * 56, 240);

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

      <div style={{ height: chartHeight }} className="w-full">
        <ChartContainer
          className="h-full w-full"
          config={{
            venta: { label: "Venta (S/)", color: "#3B82F6" },
            kilos: { label: "Kilos", color: "#93C5FD" },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 80, left: 8, bottom: 8 }}
              barCategoryGap="18%"
            >
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" horizontal vertical={false} />
              <XAxis
                type="number"
                axisLine={{ stroke: "#CBD5E1" }}
                tickLine={{ stroke: "#CBD5E1" }}
                tick={{ fill: "#64748B", fontSize: 11 }}
                tickFormatter={(v: number) =>
                  showVenta ? formatCurrencyCompact(v) : formatKilosCompact(v).replace(" kg", "")
                }
              />
              <YAxis
                type="category"
                dataKey="productoCorto"
                width={140}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#334155", fontSize: 11 }}
              />
              <Tooltip content={<ProductTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
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
                  fill="#3B82F6"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={mode === "comparativo" ? 18 : 26}
                  animationDuration={600}
                >
                  {mode !== "comparativo" && (
                    <LabelList
                      dataKey="venta"
                      position="right"
                      offset={8}
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
                  fill="#93C5FD"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={mode === "comparativo" ? 18 : 26}
                  animationDuration={600}
                >
                  {mode !== "comparativo" && (
                    <LabelList
                      dataKey="kilos"
                      position="right"
                      offset={8}
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
