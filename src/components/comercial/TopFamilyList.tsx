import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopFamilyItem } from "./commercial-data";
import { formatCurrencyCompact, formatKilosCompact } from "./commercial-data";

export function TopFamilyList({ items }: { items: TopFamilyItem[] }) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base font-semibold text-slate-950">Top familias</CardTitle>
        <CardDescription className="text-sm text-slate-500">Top 5 familias por venta.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div key={item.familia} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-950">{index + 1}. {item.familia}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatCurrencyCompact(item.venta)} · {formatKilosCompact(item.kilos)}
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-950">{item.participacion}%</p>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-slate-200/70">
              <div
                className="h-1.5 rounded-full bg-[#1D4ED8]"
                style={{ width: `${Math.min(item.participacion, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
