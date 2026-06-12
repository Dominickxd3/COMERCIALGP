import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubfamilyMetricRow } from "./subfamily-data";
import {
  formatCurrencyCompact,
  formatKilosCompact,
  formatPercent,
  formatPriceKg,
} from "./subfamily-data";

export function SubfamilyParticipationList({ items }: { items: SubfamilyMetricRow[] }) {
  return (
    <Card className="self-start border-slate-200 bg-white shadow-sm xl:h-[420px] xl:overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-950">Participación por subfamilia</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Distribución comercial por venta, kilos y precio promedio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 xl:max-h-[320px] xl:overflow-y-auto xl:pr-2">
          {items.map((item) => (
            <div key={`${item.familia}-${item.subfamilia}`} className="rounded-xl border border-slate-200 bg-slate-50/40 px-3 py-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{item.subfamilia}</p>
                  <p className="mt-1 text-xs text-slate-500">Familia: {item.familia}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatCurrencyCompact(item.venta)} · {formatKilosCompact(item.kilos)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-950">{formatPercent(item.participacionVenta)}</p>
              </div>

              <div className="mt-2.5 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center justify-between gap-3">
                  <span>Precio promedio</span>
                  <span className="font-medium text-slate-900">{formatPriceKg(item.precioPromedio)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Participación kilos</span>
                  <span className="font-medium text-slate-900">{formatPercent(item.participacionKilos)}</span>
                </div>
              </div>

              <div className="mt-2.5 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${item.participacionVenta}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
