"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceDot,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EvolucionMensual } from "./commercial-data";
import { formatCurrencyCompact, formatKilosCompact, formatPriceKg } from "./commercial-data";

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: EvolucionMensual }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="min-w-48 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-xl">
      <p className="font-semibold text-slate-950">{point.mes}</p>
      <div className="mt-2 space-y-1.5 text-slate-600">
        <div className="flex items-center justify-between gap-3">
          <span>Venta</span>
          <span className="font-semibold text-slate-950">{formatCurrencyCompact(point.venta)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Kilos</span>
          <span className="font-semibold text-slate-950">{formatKilosCompact(point.kilos)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Precio promedio</span>
          <span className="font-semibold text-slate-950">{formatPriceKg(point.precioPromedio)}</span>
        </div>
      </div>
    </div>
  );
}

function LegendContent() {
  return (
    <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 pb-2 text-xs text-slate-500">
      <span className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
        Venta
      </span>
      <span className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-sm bg-[#93C5FD]" />
        Kilos
      </span>
      <span className="flex items-center gap-2">
        <span className="h-0.5 w-4 rounded-full bg-[#EF4444]/70" />
        Precio promedio
      </span>
    </div>
  );
}

const axisLine = { stroke: "#CBD5E1", strokeWidth: 1 };
const tickLine = { stroke: "#CBD5E1", strokeWidth: 1 };
const tick = { fill: "#64748B", fontSize: 12 };

export function CommercialEvolutionChart({
  data,
  selectedMonth,
}: {
  data: EvolucionMensual[];
  selectedMonth: string;
}) {
  const selectedPoint = data.find((item) => item.mes === selectedMonth) ?? data.at(-1);

  return (
    <Card className="scroll-mt-24 border-slate-200 bg-white shadow-sm">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-lg font-semibold text-slate-950">Evolución Comercial Mensual</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Ventas y kilos acumulados desde enero hasta el periodo seleccionado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="hidden md:block">
          <LegendContent />
          <ChartContainer
            className="h-[320px] w-full"
            config={{
              venta: { label: "Venta", color: "#2563EB" },
              kilos: { label: "Kilos", color: "#93C5FD" },
              precioPromedio: { label: "Precio promedio", color: "#EF4444" },
            }}
          >
            <ComposedChart data={data} margin={{ top: 20, right: 32, left: 24, bottom: 24 }}>
              <defs>
                <linearGradient id="ventaFillHome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#CBD5E1" strokeDasharray="3 3" vertical horizontal />
              <XAxis
                dataKey="mes"
                axisLine={axisLine}
                tickLine={tickLine}
                tick={tick}
                tickMargin={10}
              />
              <YAxis
                yAxisId="venta"
                orientation="left"
                axisLine={axisLine}
                tickLine={tickLine}
                tick={tick}
                width={76}
                tickFormatter={(value: number) => formatCurrencyCompact(value)}
              />
              <YAxis
                yAxisId="kilos"
                orientation="right"
                axisLine={axisLine}
                tickLine={tickLine}
                tick={tick}
                width={64}
                tickFormatter={(value: number) => formatKilosCompact(value).replace(" kg", "")}
              />
              <ReferenceLine x={selectedMonth} stroke="#CBD5E1" strokeDasharray="4 4" />
              <ChartTooltip cursor={{ fill: "rgba(148, 163, 184, 0.08)" }} content={<TooltipContent />} />
              <Area
                yAxisId="venta"
                type="monotone"
                dataKey="venta"
                name="Venta"
                stroke="#2563EB"
                fill="url(#ventaFillHome)"
                fillOpacity={1}
                strokeWidth={2.5}
                activeDot={{ r: 5 }}
              />
              <Bar
                yAxisId="kilos"
                dataKey="kilos"
                name="Kilos"
                fill="#93C5FD"
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
              {selectedPoint ? (
                <ReferenceDot
                  yAxisId="venta"
                  x={selectedPoint.mes}
                  y={selectedPoint.venta}
                  r={5}
                  fill="#2563EB"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              ) : null}
            </ComposedChart>
          </ChartContainer>
        </div>

        <div className="md:hidden">
          <Tabs defaultValue="venta" className="gap-3">
            <TabsList className="grid h-10 w-full grid-cols-2 rounded-xl bg-slate-100 p-1">
              <TabsTrigger value="venta" className="rounded-lg text-sm">
                Venta
              </TabsTrigger>
              <TabsTrigger value="kilos" className="rounded-lg text-sm">
                Kilos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="venta">
              <ChartContainer className="h-[240px] w-full" config={{ venta: { label: "Venta", color: "#2563EB" } }}>
                <ComposedChart data={data} margin={{ top: 14, right: 16, left: 10, bottom: 16 }}>
                  <defs>
                    <linearGradient id="ventaFillMobileHome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.16} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#CBD5E1" strokeDasharray="3 3" vertical horizontal />
                  <XAxis
                    dataKey="mes"
                    axisLine={axisLine}
                    tickLine={tickLine}
                    tick={tick}
                    tickMargin={10}
                  />
                  <YAxis
                    yAxisId="venta"
                    axisLine={axisLine}
                    tickLine={tickLine}
                    tick={tick}
                    width={66}
                    tickFormatter={(value: number) => formatCurrencyCompact(value)}
                  />
                  <ReferenceLine x={selectedMonth} stroke="#CBD5E1" strokeDasharray="4 4" />
                  <ChartTooltip cursor={{ fill: "rgba(148, 163, 184, 0.08)" }} content={<TooltipContent />} />
                  <Area
                    yAxisId="venta"
                    type="monotone"
                    dataKey="venta"
                    fill="url(#ventaFillMobileHome)"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ChartContainer>
            </TabsContent>

            <TabsContent value="kilos">
              <ChartContainer className="h-[240px] w-full" config={{ kilos: { label: "Kilos", color: "#93C5FD" } }}>
                <ComposedChart data={data} margin={{ top: 14, right: 16, left: 10, bottom: 16 }}>
                  <CartesianGrid stroke="#CBD5E1" strokeDasharray="3 3" vertical horizontal />
                  <XAxis
                    dataKey="mes"
                    axisLine={axisLine}
                    tickLine={tickLine}
                    tick={tick}
                    tickMargin={10}
                  />
                  <YAxis
                    yAxisId="kilos"
                    axisLine={axisLine}
                    tickLine={tickLine}
                    tick={tick}
                    width={60}
                    tickFormatter={(value: number) => formatKilosCompact(value).replace(" kg", "")}
                  />
                  <ReferenceLine x={selectedMonth} stroke="#CBD5E1" strokeDasharray="4 4" />
                  <ChartTooltip cursor={{ fill: "rgba(148, 163, 184, 0.08)" }} content={<TooltipContent />} />
                  <Bar yAxisId="kilos" dataKey="kilos" barSize={16} radius={[6, 6, 0, 0]} fill="#93C5FD" />
                </ComposedChart>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
