"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import type { FamilyDrilldownData, FamilyMonthlyPoint } from "./family-data";
import { formatCurrencyCompact, formatKilosCompact } from "./family-data";

type ActiveMetric = "venta" | "kilos";

function MonthlyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: FamilyMonthlyPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="min-w-44 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-xl">
      <p className="font-semibold text-slate-950">{point.mes}</p>
      <div className="mt-1 text-slate-500">Periodo: {point.periodo}</div>
      <div className="mt-2 space-y-1.5 text-slate-600">
        <div className="flex items-center justify-between gap-3">
          <span>Venta</span>
          <span className="font-semibold text-slate-950">{formatCurrencyCompact(point.venta)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Kilos</span>
          <span className="font-semibold text-slate-950">{formatKilosCompact(point.kilos)}</span>
        </div>
      </div>
    </div>
  );
}

export function FamilySelectedDrilldown({ data }: { data: FamilyDrilldownData }) {
  const [activeMetric, setActiveMetric] = useState<ActiveMetric>("venta");
  const isVenta = activeMetric === "venta";

  return (
    <section className="space-y-4">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-950">
            Desglose de familia seleccionada: {data.summary.familia}
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Resumen comercial y profundidad de la familia activa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Venta total</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{formatCurrencyCompact(data.summary.venta)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Kilos vendidos</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{formatKilosCompact(data.summary.kilos)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Origen principal</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{data.summary.origenPrincipal}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Subfamilia líder</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{data.summary.subfamiliaLider}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid items-start gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-3 pb-3">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold text-slate-950">Evolución mensual de la familia</CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Seguimiento mensual de venta y kilos para {data.summary.familia}.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant={isVenta ? "default" : "outline"} className="h-9 rounded-full px-4" onClick={() => setActiveMetric("venta")}>
                Venta
              </Button>
              <Button type="button" variant={!isVenta ? "default" : "outline"} className="h-9 rounded-full px-4" onClick={() => setActiveMetric("kilos")}>
                Kilos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="h-[280px] w-full">
              <ChartContainer className="h-full w-full" config={{ [activeMetric]: { label: activeMetric, color: isVenta ? "#2563EB" : "#93C5FD" } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthly} margin={{ top: 16, right: 20, left: 12, bottom: 16 }} barCategoryGap="24%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#DBEAFE" vertical horizontal />
                    <XAxis dataKey="mes" axisLine={{ stroke: "#CBD5E1" }} tickLine={{ stroke: "#CBD5E1" }} tick={{ fill: "#64748B", fontSize: 12 }} tickMargin={10} />
                    <YAxis
                      axisLine={{ stroke: "#CBD5E1" }}
                      tickLine={{ stroke: "#CBD5E1" }}
                      tick={{ fill: "#64748B", fontSize: 12 }}
                      width={76}
                      tickFormatter={(value: number) => (isVenta ? formatCurrencyCompact(value) : formatKilosCompact(value).replace(" kg", ""))}
                    />
                    <Tooltip content={<MonthlyTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.08)" }} />
                    <Bar
                      dataKey={isVenta ? "venta" : "kilos"}
                      fill={isVenta ? "#2563EB" : "#93C5FD"}
                      radius={[8, 8, 0, 0]}
                      barSize={52}
                      maxBarSize={64}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-950">Origen comercial</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Comparativo GP y TDA para {data.summary.familia}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.origins.map((item) => (
              <div key={item.origen} className="rounded-xl border border-slate-200 bg-slate-50/40 px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{item.origen}</p>
                  <p className="text-sm font-semibold text-slate-950">{item.participacion.toFixed(1)}%</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {formatCurrencyCompact(item.venta)} · {formatKilosCompact(item.kilos)}
                </p>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${item.participacion}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold text-slate-950">Subfamilias principales</CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Ranking comercial dentro de {data.summary.familia}.
                </CardDescription>
              </div>
              <Button asChild size="sm" variant="outline" className="rounded-lg">
                <Link href={`/subfamilias?familia=${encodeURIComponent(data.summary.familia)}`}>Ver subfamilias</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topSubfamilies.map((item) => (
              <div key={item.subfamilia} className="rounded-xl border border-slate-200 bg-slate-50/40 px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{item.subfamilia}</p>
                  <p className="text-sm font-semibold text-slate-950">{formatCurrencyCompact(item.venta)}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">{formatKilosCompact(item.kilos)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold text-slate-950">Productos líderes</CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Top 5 productos de {data.summary.familia}.
                </CardDescription>
              </div>
              <Button asChild size="sm" variant="outline" className="rounded-lg">
                <Link href={`/productos?familia=${encodeURIComponent(data.summary.familia)}`}>Ver productos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topProducts.map((item) => (
              <div key={item.productoMarca} className="rounded-xl border border-slate-200 bg-slate-50/40 px-3 py-3">
                <p className="text-sm font-semibold text-slate-950">{item.productoMarca}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatCurrencyCompact(item.venta)} · {formatKilosCompact(item.kilos)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
