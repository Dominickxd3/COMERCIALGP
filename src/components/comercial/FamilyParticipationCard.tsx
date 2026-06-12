"use client";

import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { FamilyParticipationItem } from "./commercial-data";
import { formatCurrencyCompact, formatKilosCompact, formatPercent } from "./commercial-data";

type ActiveShapeProps = PieSectorDataItem & {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
};

function renderActiveShape(props: ActiveShapeProps) {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill = "#1D4ED8",
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.18}
      />
    </g>
  );
}

export function FamilyParticipationCard({ items }: { items: FamilyParticipationItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] ?? items[0];
  const chartConfig = useMemo(
    () => Object.fromEntries(items.map((item) => [item.familia, { label: item.familia, color: item.color }])),
    [items],
  );

  const interactivePieProps = {
    activeIndex,
    activeShape: renderActiveShape,
    onMouseEnter: (_: unknown, index: number) => setActiveIndex(index),
    onClick: (_: unknown, index: number) => setActiveIndex(index),
  } as const;

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base font-semibold text-slate-950">Participación por familia</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Distribución comercial por venta del periodo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6">
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="relative h-[240px] w-[240px]">
              <ChartContainer className="h-full w-full" config={chartConfig}>
                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <Pie
                    data={items}
                    dataKey="venta"
                    nameKey="familia"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={3}
                    labelLine={false}
                    isAnimationActive
                    {...(interactivePieProps as Record<string, unknown>)}
                  >
                    {items.map((item) => (
                      <Cell key={item.familia} fill={item.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-[42px] flex items-center justify-center rounded-full border border-slate-100 bg-white text-center shadow-sm">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">TOP</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{activeItem?.familia}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {formatPercent(activeItem?.participacion ?? 0)}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {formatCurrencyCompact(activeItem?.venta ?? 0)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{formatKilosCompact(activeItem?.kilos ?? 0)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const isActive = activeIndex === index;

              return (
                <button
                  key={item.familia}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition-all",
                    isActive
                      ? "border-blue-300 bg-blue-50/70 shadow-sm"
                      : "border-border bg-card hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <p className="truncate text-sm font-semibold text-slate-900">{item.familia}</p>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatCurrencyCompact(item.venta)} · {formatKilosCompact(item.kilos)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-950">{formatPercent(item.participacion)}</p>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${item.participacion}%`, backgroundColor: item.color }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
