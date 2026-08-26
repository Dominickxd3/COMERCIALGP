"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import type { EvolucionMensual } from "./commercial-data";
import { formatCurrencyCompact, formatKilosCompact } from "./commercial-data";

type ActiveView = "comparativo" | "venta" | "kilos";

const axisLine = { stroke: "#CBD5E1", strokeWidth: 1 };
const tickLine = { stroke: "#CBD5E1", strokeWidth: 1 };
const tick = { fill: "#64748B", fontSize: 12 };

function CustomTooltip({
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
    <div className="min-w-52 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-xl">
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

export function CommercialEvolutionChart({ data }: { data: EvolucionMensual[]; selectedMonth: string }) {
  const [activeView, setActiveView] = useState<ActiveView>("comparativo");

  const chartConfig = useMemo(
    () => ({
      venta: { label: "Venta", color: "#2563EB" },
      kilos: { label: "Kilos", color: "#93C5FD" },
    }),
    [],
  );

  const currentViewLabel =
    activeView === "comparativo"
      ? "Vista actual: Venta y kilos mensual"
      : activeView === "venta"
        ? "Vista actual: Venta mensual"
        : "Vista actual: Kilos vendidos";

  return (
    <Card className="scroll-mt-24 border-slate-200 bg-white shadow-sm">
      <CardHeader className="space-y-3 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-slate-950">Evolución Comercial Mensual</CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Ventas y kilos acumulados desde enero hasta el periodo seleccionado.
          </CardDescription>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-slate-500">{currentViewLabel}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={activeView === "comparativo" ? "default" : "outline"}
              onClick={() => setActiveView("comparativo")}
              className="h-9 rounded-full px-4"
            >
              Comparativo
            </Button>
            <Button
              type="button"
              variant={activeView === "venta" ? "default" : "outline"}
              onClick={() => setActiveView("venta")}
              className="h-9 rounded-full px-4"
            >
              Venta
            </Button>
            <Button
              type="button"
              variant={activeView === "kilos" ? "default" : "outline"}
              onClick={() => setActiveView("kilos")}
              className="h-9 rounded-full px-4"
            >
              Kilos
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-3">
        <div className="h-[240px] w-full md:h-[320px]">
          <ChartContainer className="h-full w-full" config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
              <BarChart
                data={data}
                margin={{ top: 20, right: 32, left: 24, bottom: 20 }}
                barCategoryGap="24%"
                barGap={8}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#DBEAFE" vertical horizontal />

                <XAxis
                  dataKey="mes"
                  axisLine={axisLine}
                  tickLine={tickLine}
                  tick={tick}
                  tickMargin={10}
                />

                {(activeView === "comparativo" || activeView === "venta") ? (
                  <YAxis
                    yAxisId="venta"
                    orientation="left"
                    axisLine={axisLine}
                    tickLine={tickLine}
                    tick={tick}
                    width={76}
                    tickFormatter={(value: number) => formatCurrencyCompact(value)}
                  />
                ) : null}

                {(activeView === "comparativo" || activeView === "kilos") ? (
                  <YAxis
                    yAxisId="kilos"
                    orientation={activeView === "comparativo" ? "right" : "left"}
                    axisLine={axisLine}
                    tickLine={tickLine}
                    tick={tick}
                    width={76}
                    tickFormatter={(value: number) => formatKilosCompact(value).replace(" kg", "")}
                  />
                ) : null}

                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.08)" }} />

                {activeView === "comparativo" && (
                  <>
                    <Bar
                      yAxisId="venta"
                      dataKey="venta"
                      name="Venta"
                      fill="#2563EB"
                      radius={[8, 8, 0, 0]}
                      barSize={36}
                      maxBarSize={46}
                      animationDuration={900}
                    >
                      {data.map((item) => (
                        <Cell key={`venta-${item.periodo}`} fill="#2563EB" />
                      ))}
                    </Bar>

                    <Bar
                      yAxisId="kilos"
                      dataKey="kilos"
                      name="Kilos"
                      fill="#93C5FD"
                      radius={[8, 8, 0, 0]}
                      barSize={36}
                      maxBarSize={46}
                      animationDuration={900}
                    >
                      {data.map((item) => (
                        <Cell key={`kilos-${item.periodo}`} fill="#93C5FD" />
                      ))}
                    </Bar>
                  </>
                )}

                {activeView === "venta" && (
                  <Bar
                    yAxisId="venta"
                    dataKey="venta"
                    name="Venta"
                    fill="#2563EB"
                    radius={[10, 10, 0, 0]}
                    barSize={64}
                    maxBarSize={82}
                    animationDuration={900}
                  >
                    {data.map((item) => (
                      <Cell key={`venta-single-${item.periodo}`} fill="#2563EB" />
                    ))}
                  </Bar>
                )}

                {activeView === "kilos" && (
                  <Bar
                    yAxisId="kilos"
                    dataKey="kilos"
                    name="Kilos"
                    fill="#93C5FD"
                    radius={[10, 10, 0, 0]}
                    barSize={64}
                    maxBarSize={82}
                    animationDuration={900}
                  >
                    {data.map((item) => (
                      <Cell key={`kilos-single-${item.periodo}`} fill="#93C5FD" />
                    ))}
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
