import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FamilyMetricRow } from "./family-data";
import { formatCurrencyCompact, formatKilosCompact, formatPercent, formatPriceKg } from "./family-data";

export function FamilyParticipationList({
  items,
  selectedFamily,
  onSelectFamily,
}: {
  items: FamilyMetricRow[];
  selectedFamily: string;
  onSelectFamily: (family: string) => void;
}) {
  return (
    <Card className="self-start border-slate-200 bg-white shadow-sm xl:h-[390px] xl:overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-950">Participación por familia</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Distribución comercial por venta, kilos y precio promedio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 xl:max-h-[280px] xl:overflow-y-auto xl:pr-2">
          {items.map((item) => {
            const isActive = selectedFamily === item.familia;

            return (
              <button
                key={item.familia}
                type="button"
                onClick={() => onSelectFamily(item.familia)}
                className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? "border-blue-200 bg-blue-50/60"
                    : "border-slate-200 bg-slate-50/40 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <p className="truncate text-sm font-semibold text-slate-950">{item.familia}</p>
                    </div>
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
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
