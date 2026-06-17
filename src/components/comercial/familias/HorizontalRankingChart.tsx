"use client";

import { useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart";
import { CommercialBarTooltip } from "./CommercialTooltip";
import { formatCurrencyCompact, formatKilosCompact } from "./family-data";

type Metric = "venta" | "kilos";

export type HorizontalRankingDatum = {
  name: string;
  venta: number;
  kilos: number;
  precioPromedio: number;
  participacion?: number;
  brand?: string;
};

export function HorizontalRankingChart({
  data,
  color,
  emptyMessage,
  maxItems = 5,
  nameWidth = 112,
  showToggle = true,
}: {
  data: HorizontalRankingDatum[];
  color: string;
  emptyMessage: string;
  maxItems?: number;
  nameWidth?: number;
  showToggle?: boolean;
}) {
  const [metric, setMetric] = useState<Metric>("venta");

  const chartData = useMemo(() => {
    return [...data]
      .sort((a, b) => (metric === "venta" ? b.venta - a.venta : b.kilos - a.kilos))
      .slice(0, maxItems)
      .map((item) => ({
        ...item,
        rankName: item.name,
      }));
  }, [data, maxItems, metric]);

  const chartHeight = Math.min(Math.max(chartData.length * 56, 200), 320);

  if (!chartData.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-10 text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showToggle ? (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={metric === "venta" ? "default" : "outline"}
            size="sm"
            className="h-8 rounded-full px-3 text-xs"
            onClick={() => setMetric("venta")}
          >
            Venta
          </Button>
          <Button
            type="button"
            variant={metric === "kilos" ? "default" : "outline"}
            size="sm"
            className="h-8 rounded-full px-3 text-xs"
            onClick={() => setMetric("kilos")}
          >
            Kilos
          </Button>
        </div>
      ) : null}

      <div style={{ height: chartHeight }} className="w-full">
        <ChartContainer
          className="h-full w-full"
          config={{
            [metric]: {
              label: metric === "venta" ? "Venta" : "Kilos",
              color,
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 54, left: 6, bottom: 8 }}
              barCategoryGap="20%"
            >
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" horizontal vertical={false} />
              <XAxis
                type="number"
                axisLine={{ stroke: "#CBD5E1" }}
                tickLine={{ stroke: "#CBD5E1" }}
                tick={{ fill: "#64748B", fontSize: 12 }}
                tickFormatter={(value: number) =>
                  metric === "venta"
                    ? formatCurrencyCompact(value)
                    : formatKilosCompact(value).replace(" kg", "")
                }
              />
              <YAxis
                type="category"
                dataKey="rankName"
                width={nameWidth}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#334155", fontSize: 12 }}
              />
              <Tooltip content={<CommercialBarTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.08)" }} />
              <Bar
                dataKey={metric}
                fill={color}
                radius={[0, 8, 8, 0]}
                maxBarSize={26}
                animationDuration={700}
              >
                <LabelList
                  dataKey={metric}
                  position="right"
                  offset={8}
                  fill="#0F172A"
                  fontSize={12}
                  formatter={(value) =>
                    metric === "venta"
                      ? formatCurrencyCompact(Number(value ?? 0))
                      : formatKilosCompact(Number(value ?? 0)).replace(" kg", "")
                  }
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
