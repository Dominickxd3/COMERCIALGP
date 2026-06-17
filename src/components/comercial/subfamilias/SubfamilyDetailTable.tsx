import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SubfamilyFiltersState, SubfamilyMetricRow } from "./subfamily-data";
import {
  formatCurrencyCompact,
  formatKilosCompact,
  formatPercent,
  formatPriceKg,
} from "./subfamily-data";

function buildProductUrl(filters: SubfamilyFiltersState, row: SubfamilyMetricRow) {
  const params = new URLSearchParams({
    familia: row.familia,
    subfamilia: row.subfamilia,
    year: filters.year,
    period: filters.period,
    origin: filters.origin,
  });
  return `/productos?${params.toString()}`;
}

export function SubfamilyDetailTable({
  items,
  filters,
  selectedSubfamily,
  onSelectSubfamily,
}: {
  items: SubfamilyMetricRow[];
  filters: SubfamilyFiltersState;
  selectedSubfamily: string;
  onSelectSubfamily: (subfamily: string) => void;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-950">Detalle comercial por subfamilia</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Resumen de venta, kilos, precio promedio y participación. Clic en una fila para seleccionarla.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* ── Mobile cards ── */}
        <div className="grid gap-3 md:hidden">
          {items.map((item) => {
            const isSelected = item.subfamilia === selectedSubfamily;
            return (
              <div
                key={`${item.familia}-${item.subfamilia}`}
                className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                  isSelected
                    ? "border-blue-300 bg-blue-50/60"
                    : "border-slate-200 hover:border-blue-200 hover:bg-blue-50/30"
                }`}
                onClick={() => onSelectSubfamily(item.subfamilia)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.subfamilia}</p>
                    <p className="mt-1 text-xs text-slate-500">Familia: {item.familia}</p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="rounded-lg">
                    <Link href={buildProductUrl(filters, item)}>
                      Ver productos
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="mt-3 space-y-2 text-xs text-slate-500">
                  <p>Venta: <span className="font-medium text-slate-950">{formatCurrencyCompact(item.venta)}</span></p>
                  <p>Kilos: <span className="font-medium text-slate-950">{formatKilosCompact(item.kilos)}</span></p>
                  <p>Precio prom.: <span className="font-medium text-slate-950">{formatPriceKg(item.precioPromedio)}</span></p>
                  <p>Part. venta: <span className="font-medium text-slate-950">{formatPercent(item.participacionVenta)}</span></p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Desktop table ── */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Familia</TableHead>
                <TableHead className="text-left">Subfamilia</TableHead>
                <TableHead className="text-right">Venta total</TableHead>
                <TableHead className="text-right">Kilos vendidos</TableHead>
                <TableHead className="text-right">Precio prom. kg</TableHead>
                <TableHead className="text-right">Part. venta %</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const isSelected = item.subfamilia === selectedSubfamily;
                return (
                  <TableRow
                    key={`${item.familia}-${item.subfamilia}`}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-blue-50/80" : "hover:bg-blue-50/40"
                    }`}
                    onClick={() => onSelectSubfamily(item.subfamilia)}
                  >
                    <TableCell className="text-left">{item.familia}</TableCell>
                    <TableCell className="text-left font-medium text-slate-950">{item.subfamilia}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrencyCompact(item.venta)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatKilosCompact(item.kilos)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatPriceKg(item.precioPromedio)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatPercent(item.participacionVenta)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline" className="rounded-lg" onClick={(e) => e.stopPropagation()}>
                        <Link href={buildProductUrl(filters, item)}>
                          Ver productos
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
