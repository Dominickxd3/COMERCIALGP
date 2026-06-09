"use client";

import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, Sector, Tooltip } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
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
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 14}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.18}
      />
    </g>
  );
}

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: FamilyParticipationItem }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="min-w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] shadow-lg">
      <p className="font-semibold text-slate-950">{item.familia}</p>
      <div className="mt-2 space-y-1 text-slate-600">
        <div className="flex items-center justify-between gap-3">
          <span>Venta</span>
          <span className="font-semibold text-slate-950">{formatCurrencyCompact(item.venta)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Kilos</span>
          <span className="font-semibold text-slate-950">{formatKilosCompact(item.kilos)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Participación</span>
          <span className="font-semibold text-slate-950">{formatPercent(item.participacion)}</span>
        </div>
      </div>
    </div>
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
        <div className="grid gap-6 md:grid-cols-[200px_minmax(0,1fr)] md:items-center">
          <div className="flex items-center justify-center md:justify-center">
            <div className="relative h-52 w-52 md:h-44 md:w-44">
              <ChartContainer className="h-full w-full" config={chartConfig}>
                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <Pie
                    data={items}
                    dataKey="venta"
                    nameKey="familia"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={3}
                    labelLine={false}
                    isAnimationActive
                    {...(interactivePieProps as Record<string, unknown>)}
                  >
                    {items.map((item) => (
                      <Cell key={item.familia} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<PieTooltip />}
                    wrapperStyle={{ zIndex: 50 }}
                    offset={24}
                    allowEscapeViewBox={{ x: true, y: true }}
                  />
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-[38px] flex items-center justify-center rounded-full border border-slate-100 bg-white text-center shadow-sm">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">TOP</p>
                  <p className="text-lg font-semibold text-slate-950">{activeItem?.familia}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {formatPercent(activeItem?.participacion ?? 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 px-1 md:px-0">
            {items.map((item, index) => {
              const isActive = activeIndex === index;

              return (
                <button
                  key={item.familia}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                    isActive ? "border-blue-200 bg-blue-50/60" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
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
