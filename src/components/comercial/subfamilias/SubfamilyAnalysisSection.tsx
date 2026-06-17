"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import type {
  SubfamilyDrilldownData,
  SubfamilyFiltersState,
  SubfamilyOriginBreakdown,
} from "./subfamily-data";
import {
  calculateAveragePricePerKg,
  formatCurrencyCompact,
  formatKilosCompact,
  formatPercent,
  formatPriceKg,
  safeDivide,
} from "./subfamily-data";

type ViewMode = "comparativo" | "venta" | "kilos";

/* ═══════ Shared tooltip row ═══════ */

function TRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}

/* ═══════ Selected subfamily summary ═══════ */

function SubfamilySummaryBadge({ data }: { data: SubfamilyDrilldownData }) {
  const { summary } = data;
  const precio = formatPriceKg(summary.precioPromedio).replace(" / kg", "/kg");

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-2.5 text-sm">
      <span className="font-semibold text-slate-950">{summary.subfamilia}</span>
      <span className="text-slate-400">·</span>
      <span className="text-slate-600">{formatCurrencyCompact(summary.venta)}</span>
      <span className="text-slate-400">·</span>
      <span className="text-slate-600">{formatKilosCompact(summary.kilos)}</span>
      <span className="text-slate-400">·</span>
      <span className="text-slate-600">{precio}</span>
      <span className="text-slate-400">·</span>
      <span className="font-medium text-blue-700">{formatPercent(summary.participacionVenta)} venta</span>
    </div>
  );
}

/* ═══════ Family card (compact, no chart for single family) ═══════ */

function FamilyInfoCard({ data, subfamilia }: { data: SubfamilyDrilldownData; subfamilia: string }) {
  if (!data.families.length) return null;

  // Single family → compact card, no bar chart
  if (data.families.length === 1) {
    const fam = data.families[0]!;
    const precio = calculateAveragePricePerKg(fam.venta, fam.kilos);

    return (
      <Card className="h-full border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-950">
            Familia principal
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            {subfamilia} pertenece a una sola familia.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 px-4 py-3">
              <p className="text-base font-semibold text-slate-950">{fam.familia}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-500">Venta</p>
                  <p className="mt-0.5 font-semibold text-slate-950">{formatCurrencyCompact(fam.venta)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Kilos</p>
                  <p className="mt-0.5 font-semibold text-slate-950">{formatKilosCompact(fam.kilos)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Precio prom. kg</p>
                  <p className="mt-0.5 font-semibold text-slate-950">{formatPriceKg(precio).replace(" / kg", "/kg")}</p>
                </div>
                <div>
                  <p className="text-slate-500">Participación</p>
                  <p className="mt-0.5 font-semibold text-slate-950">{formatPercent(fam.participacion)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Multiple families → BarChart with participation %
  return (
    <Card className="h-full border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-950">
          Familias dentro de {subfamilia}
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Participación por familia. Valores reales en tooltip.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px] w-full">
          <ChartContainer className="h-full w-full" config={{ participacion: { label: "Part. venta %", color: "#2563EB" } }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.families} margin={{ top: 12, right: 12, left: 4, bottom: 4 }} barCategoryGap="35%">
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="familia" axisLine={{ stroke: "#CBD5E1" }} tickLine={false} tick={{ fill: "#334155", fontSize: 12, fontWeight: 600 }} />
                <YAxis domain={[0, 100]} axisLine={{ stroke: "#CBD5E1" }} tickLine={false} tick={{ fill: "#64748B", fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} width={42} />
                <Tooltip
                  cursor={{ fill: "rgba(148,163,184,0.08)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0]?.payload;
                    if (!item) return null;
                    const precio = calculateAveragePricePerKg(item.venta, item.kilos);
                    return (
                      <div className="min-w-52 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs shadow-lg">
                        <p className="font-semibold text-slate-950">{item.familia}</p>
                        <div className="mt-2 space-y-1.5">
                          <TRow label="Venta" value={formatCurrencyCompact(item.venta)} />
                          <TRow label="Kilos" value={formatKilosCompact(item.kilos)} />
                          <TRow label="Precio prom." value={formatPriceKg(precio).replace(" / kg", "/kg")} />
                          <TRow label="Participación" value={formatPercent(item.participacion)} />
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="participacion" name="Part. venta %" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={48} animationDuration={600}>
                  <LabelList dataKey="participacion" position="top" offset={6} fill="#0F172A" fontSize={10} formatter={(v) => `${Number(v ?? 0).toFixed(1)}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/* ═══════ Origin bar chart — participation % ═══════ */

type OriginWithParticipations = SubfamilyOriginBreakdown & {
  participacionVenta: number;
  participacionKilos: number;
};

function OriginCard({ data, subfamilia }: { data: SubfamilyDrilldownData; subfamilia: string }) {
  if (!data.origins.length) return null;

  const totalVenta = data.origins.reduce((s, o) => s + o.venta, 0);
  const totalKilos = data.origins.reduce((s, o) => s + o.kilos, 0);

  const chartData: OriginWithParticipations[] = data.origins.map((o) => ({
    ...o,
    participacionVenta: safeDivide(o.venta, totalVenta) * 100,
    participacionKilos: safeDivide(o.kilos, totalKilos) * 100,
  }));

  return (
    <Card className="h-full border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-950">
          Origen comercial de {subfamilia}
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Participación venta y kilos por origen. Valores reales en tooltip.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px] w-full">
          <ChartContainer
            className="h-full w-full"
            config={{
              participacionVenta: { label: "Part. venta %", color: "#2563EB" },
              participacionKilos: { label: "Part. kilos %", color: "#60A5FA" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 12, right: 12, left: 4, bottom: 4 }} barCategoryGap="35%">
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="origen" axisLine={{ stroke: "#CBD5E1" }} tickLine={false} tick={{ fill: "#334155", fontSize: 12, fontWeight: 600 }} />
                <YAxis domain={[0, 100]} axisLine={{ stroke: "#CBD5E1" }} tickLine={false} tick={{ fill: "#64748B", fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} width={42} />
                <Tooltip
                  cursor={{ fill: "rgba(148,163,184,0.08)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0]?.payload as OriginWithParticipations | undefined;
                    if (!item) return null;
                    const precio = calculateAveragePricePerKg(item.venta, item.kilos);
                    return (
                      <div className="min-w-56 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs shadow-lg">
                        <p className="font-semibold text-slate-950">{item.origen}</p>
                        <div className="mt-2 space-y-1.5">
                          <TRow label="Part. venta" value={formatPercent(item.participacionVenta)} />
                          <TRow label="Part. kilos" value={formatPercent(item.participacionKilos)} />
                          <TRow label="Venta" value={formatCurrencyCompact(item.venta)} />
                          <TRow label="Kilos" value={formatKilosCompact(item.kilos)} />
                          <TRow label="Precio prom." value={formatPriceKg(precio).replace(" / kg", "/kg")} />
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend verticalAlign="top" height={24} iconType="square" wrapperStyle={{ fontSize: 11, color: "#64748B" }} />
                <Bar dataKey="participacionVenta" name="Part. venta %" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={48} animationDuration={600}>
                  <LabelList dataKey="participacionVenta" position="top" offset={6} fill="#0F172A" fontSize={10} formatter={(v) => `${Number(v ?? 0).toFixed(1)}%`} />
                </Bar>
                <Bar dataKey="participacionKilos" name="Part. kilos %" fill="#60A5FA" radius={[6, 6, 0, 0]} maxBarSize={48} animationDuration={600}>
                  <LabelList dataKey="participacionKilos" position="top" offset={6} fill="#0F172A" fontSize={10} formatter={(v) => `${Number(v ?? 0).toFixed(1)}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/* ═══════ Products bar chart — normalized comparativo ═══════ */

function splitProductAndBrand(productoMarca: string) {
  const match = productoMarca.match(/^(.*)\s\[(.*)\]$/);
  if (!match) return { product: productoMarca, brand: "" };
  return { product: match[1]?.trim() ?? productoMarca, brand: match[2]?.trim() ?? "" };
}

function truncateLabel(text: string, maxLen = 18): string {
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
}

type ProductRow = {
  producto: string;
  productoCorto: string;
  marca: string;
  venta: number;
  kilos: number;
  ventaIndex: number;
  kilosIndex: number;
  precioPromedio: number;
  participacion: number;
};

function ProductTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ProductRow }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="min-w-56 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs shadow-lg">
      <p className="font-semibold text-slate-950">{item.producto}</p>
      {item.marca ? <p className="mt-0.5 text-slate-500">{item.marca}</p> : null}
      <div className="mt-2 space-y-1.5">
        <TRow label="Venta" value={formatCurrencyCompact(item.venta)} />
        <TRow label="Kilos" value={formatKilosCompact(item.kilos)} />
        <TRow label="Precio prom." value={formatPriceKg(item.precioPromedio).replace(" / kg", "/kg")} />
        <TRow label="Participación" value={formatPercent(item.participacion)} />
      </div>
    </div>
  );
}

function ProductsBarCard({
  data,
  filters,
}: {
  data: SubfamilyDrilldownData;
  filters: SubfamilyFiltersState;
}) {
  const [mode, setMode] = useState<ViewMode>("comparativo");

  const totalVenta = data.summary.venta;

  const chartData: ProductRow[] = useMemo(() => {
    const rows = data.topProducts.slice(0, 5).map((item) => {
      const parsed = splitProductAndBrand(item.productoMarca);
      return {
        producto: parsed.product,
        productoCorto: truncateLabel(parsed.product),
        marca: parsed.brand,
        venta: item.venta,
        kilos: item.kilos,
        ventaIndex: 0,
        kilosIndex: 0,
        precioPromedio: calculateAveragePricePerKg(item.venta, item.kilos),
        participacion: safeDivide(item.venta, totalVenta) * 100,
      };
    });
    const maxV = Math.max(...rows.map((r) => r.venta), 1);
    const maxK = Math.max(...rows.map((r) => r.kilos), 1);
    return rows.map((r) => ({
      ...r,
      ventaIndex: (r.venta / maxV) * 100,
      kilosIndex: (r.kilos / maxK) * 100,
    }));
  }, [data.topProducts, totalVenta]);

  const productQuery = new URLSearchParams({
    year: filters.year,
    period: filters.period,
    origin: filters.origin,
    familia: data.summary.familia,
    subfamilia: data.summary.subfamilia,
  }).toString();

  if (!chartData.length) {
    return (
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="py-10 text-center text-sm text-slate-500">
          No hay productos disponibles para esta subfamilia.
        </CardContent>
      </Card>
    );
  }

  const isComparativo = mode === "comparativo";
  const chartHeight = Math.max(chartData.length * 56, 220);

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-semibold text-slate-950">
              Productos líderes de {data.summary.subfamilia}
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              {isComparativo
                ? "Índice relativo 0–100. Valores reales en labels y tooltip."
                : "Top productos por venta y kilos dentro de la subfamilia."}
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-lg text-xs">
            <Link href={`/productos?${productQuery}`}>Ver productos</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-4 flex items-center gap-1.5">
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
              ventaIndex: { label: "Venta", color: "#3B82F6" },
              kilosIndex: { label: "Kilos", color: "#93C5FD" },
              venta: { label: "Venta (S/)", color: "#3B82F6" },
              kilos: { label: "Kilos", color: "#93C5FD" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              {isComparativo ? (
                /* ── Comparativo: normalized 0–100 ── */
                <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 100, left: 8, bottom: 8 }} barCategoryGap="18%">
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" horizontal vertical={false} />
                  <XAxis type="number" domain={[0, 100]} axisLine={{ stroke: "#CBD5E1" }} tickLine={{ stroke: "#CBD5E1" }} tick={{ fill: "#64748B", fontSize: 11 }} tickFormatter={(v: number) => `${v}`} />
                  <YAxis type="category" dataKey="productoCorto" width={140} axisLine={false} tickLine={false} tick={{ fill: "#334155", fontSize: 11 }} />
                  <Tooltip content={<ProductTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                  <Legend verticalAlign="top" height={24} iconType="square" wrapperStyle={{ fontSize: 11, color: "#64748B" }} />
                  <Bar dataKey="ventaIndex" name="Venta" fill="#3B82F6" radius={[0, 6, 6, 0]} maxBarSize={18} animationDuration={600}>
                    <LabelList dataKey="venta" position="right" offset={8} fill="#0F172A" fontSize={10} formatter={(v) => formatCurrencyCompact(Number(v ?? 0))} />
                  </Bar>
                  <Bar dataKey="kilosIndex" name="Kilos" fill="#93C5FD" radius={[0, 6, 6, 0]} maxBarSize={18} animationDuration={600}>
                    <LabelList dataKey="kilos" position="right" offset={8} fill="#0F172A" fontSize={10} formatter={(v) => formatKilosCompact(Number(v ?? 0))} />
                  </Bar>
                </BarChart>
              ) : (
                /* ── Single mode: real values ── */
                <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 80, left: 8, bottom: 8 }} barCategoryGap="18%">
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" horizontal vertical={false} />
                  <XAxis
                    type="number"
                    axisLine={{ stroke: "#CBD5E1" }}
                    tickLine={{ stroke: "#CBD5E1" }}
                    tick={{ fill: "#64748B", fontSize: 11 }}
                    tickFormatter={(v: number) =>
                      mode === "venta" ? formatCurrencyCompact(v) : formatKilosCompact(v).replace(" kg", "")
                    }
                  />
                  <YAxis type="category" dataKey="productoCorto" width={140} axisLine={false} tickLine={false} tick={{ fill: "#334155", fontSize: 11 }} />
                  <Tooltip content={<ProductTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                  <Bar
                    dataKey={mode === "venta" ? "venta" : "kilos"}
                    name={mode === "venta" ? "Venta (S/)" : "Kilos"}
                    fill={mode === "venta" ? "#3B82F6" : "#93C5FD"}
                    radius={[0, 6, 6, 0]}
                    maxBarSize={26}
                    animationDuration={600}
                  >
                    <LabelList
                      dataKey={mode === "venta" ? "venta" : "kilos"}
                      position="right"
                      offset={8}
                      fill="#0F172A"
                      fontSize={10}
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

/* ═══════ Export: Analysis section ═══════ */

export function SubfamilyAnalysisSection({
  data,
  filters,
}: {
  data: SubfamilyDrilldownData;
  filters: SubfamilyFiltersState;
}) {
  const subfamilia = data.summary.subfamilia;

  return (
    <section className="space-y-6">
      <SubfamilySummaryBadge data={data} />

      <div className="space-y-1">
        <h2 className="text-base font-semibold text-slate-950">
          Análisis de {subfamilia}
        </h2>
        <p className="text-sm text-slate-500">
          Familia, origen y productos de la subfamilia seleccionada.
        </p>
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-[1fr_1fr]">
        <FamilyInfoCard data={data} subfamilia={subfamilia} />
        <OriginCard data={data} subfamilia={subfamilia} />
      </div>

      <ProductsBarCard data={data} filters={filters} />
    </section>
  );
}
