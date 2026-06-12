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
import type { FamilyMetricRow } from "./family-data";
import {
  formatCurrencyCompact,
  formatKilosCompact,
  formatPercent,
  formatPriceKg,
  formatUnitsCompact,
} from "./family-data";

export function FamilyDetailTable({ items }: { items: FamilyMetricRow[] }) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-950">Detalle comercial por familia</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Resumen de venta, kilos, participación, subfamilias y productos activos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 md:hidden">
          {items.map((item) => (
            <div key={item.familia} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{item.familia}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatCurrencyCompact(item.venta)}</p>
                </div>
                <Button asChild size="sm" variant="outline" className="rounded-lg">
                  <Link href={`/subfamilias?familia=${encodeURIComponent(item.familia)}`}>
                    Ver subfamilias
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-500">
                <div>
                  <p>Kilos</p>
                  <p className="mt-1 font-medium text-slate-950">{formatKilosCompact(item.kilos)}</p>
                </div>
                <div>
                  <p>Precio promedio</p>
                  <p className="mt-1 font-medium text-slate-950">{formatPriceKg(item.precioPromedio)}</p>
                </div>
                <div>
                  <p>Participación venta</p>
                  <p className="mt-1 font-medium text-slate-950">{formatPercent(item.participacionVenta)}</p>
                </div>
                <div>
                  <p>Participación kilos</p>
                  <p className="mt-1 font-medium text-slate-950">{formatPercent(item.participacionKilos)}</p>
                </div>
                <div>
                  <p>Subfamilias</p>
                  <p className="mt-1 font-medium text-slate-950">{formatUnitsCompact(item.subfamilias)}</p>
                </div>
                <div>
                  <p>Productos</p>
                  <p className="mt-1 font-medium text-slate-950">{formatUnitsCompact(item.productos)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Familia</TableHead>
                <TableHead>Venta total</TableHead>
                <TableHead>Kilos vendidos</TableHead>
                <TableHead>Precio promedio kg</TableHead>
                <TableHead>Unidades</TableHead>
                <TableHead>Participación venta %</TableHead>
                <TableHead>Participación kilos %</TableHead>
                <TableHead>Subfamilias</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.familia}>
                  <TableCell className="font-medium text-slate-950">{item.familia}</TableCell>
                  <TableCell>{formatCurrencyCompact(item.venta)}</TableCell>
                  <TableCell>{formatKilosCompact(item.kilos)}</TableCell>
                  <TableCell>{formatPriceKg(item.precioPromedio)}</TableCell>
                  <TableCell>{formatUnitsCompact(item.unidades)}</TableCell>
                  <TableCell>{formatPercent(item.participacionVenta)}</TableCell>
                  <TableCell>{formatPercent(item.participacionKilos)}</TableCell>
                  <TableCell>{formatUnitsCompact(item.subfamilias)}</TableCell>
                  <TableCell>{formatUnitsCompact(item.productos)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline" className="rounded-lg">
                      <Link href={`/subfamilias?familia=${encodeURIComponent(item.familia)}`}>
                        Ver subfamilias
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
