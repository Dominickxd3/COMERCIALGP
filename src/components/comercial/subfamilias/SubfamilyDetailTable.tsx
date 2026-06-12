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
import type { SubfamilyMetricRow } from "./subfamily-data";
import {
  formatCurrencyCompact,
  formatKilosCompact,
  formatPercent,
  formatPriceKg,
  formatUnitsCompact,
} from "./subfamily-data";

export function SubfamilyDetailTable({ items }: { items: SubfamilyMetricRow[] }) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-950">Detalle comercial por subfamilia</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Resumen de venta, kilos, participación y productos por subfamilia.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:hidden">
          {items.map((item) => (
            <div key={`${item.familia}-${item.subfamilia}`} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{item.subfamilia}</p>
                  <p className="mt-1 text-xs text-slate-500">Familia: {item.familia}</p>
                </div>
                <Button asChild size="sm" variant="outline" className="rounded-lg">
                  <Link href={`/productos?familia=${encodeURIComponent(item.familia)}&subfamilia=${encodeURIComponent(item.subfamilia)}`}>
                    Ver productos
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-500">
                <p>{formatCurrencyCompact(item.venta)} · {formatKilosCompact(item.kilos)}</p>
                <p>Precio prom.: <span className="font-medium text-slate-950">{formatPriceKg(item.precioPromedio)}</span></p>
                <p>Participación venta: <span className="font-medium text-slate-950">{formatPercent(item.participacionVenta)}</span></p>
                <p>Participación kilos: <span className="font-medium text-slate-950">{formatPercent(item.participacionKilos)}</span></p>
                <p>Productos: <span className="font-medium text-slate-950">{formatUnitsCompact(item.productos)}</span></p>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Familia</TableHead>
                <TableHead>Subfamilia</TableHead>
                <TableHead>Venta total</TableHead>
                <TableHead>Kilos vendidos</TableHead>
                <TableHead>Precio promedio kg</TableHead>
                <TableHead>Unidades</TableHead>
                <TableHead>Participación venta %</TableHead>
                <TableHead>Participación kilos %</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={`${item.familia}-${item.subfamilia}`}>
                  <TableCell>{item.familia}</TableCell>
                  <TableCell className="font-medium text-slate-950">{item.subfamilia}</TableCell>
                  <TableCell>{formatCurrencyCompact(item.venta)}</TableCell>
                  <TableCell>{formatKilosCompact(item.kilos)}</TableCell>
                  <TableCell>{formatPriceKg(item.precioPromedio)}</TableCell>
                  <TableCell>{formatUnitsCompact(item.unidades)}</TableCell>
                  <TableCell>{formatPercent(item.participacionVenta)}</TableCell>
                  <TableCell>{formatPercent(item.participacionKilos)}</TableCell>
                  <TableCell>{formatUnitsCompact(item.productos)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline" className="rounded-lg">
                      <Link href={`/productos?familia=${encodeURIComponent(item.familia)}&subfamilia=${encodeURIComponent(item.subfamilia)}`}>
                        Ver productos
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
