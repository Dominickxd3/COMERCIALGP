import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductMetricRow } from "./product-data";
import {
  formatCurrencyCompact,
  formatKilosCompact,
  formatPercent,
  formatPriceKg,
  formatUnitsCompact,
} from "./product-data";

export function ProductDetailTable({ items }: { items: ProductMetricRow[] }) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-950">Detalle comercial por producto</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Ranking, búsqueda y desglose comercial al máximo nivel de detalle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:hidden">
          {items.map((item) => (
            <div key={`${item.origen}-${item.producto}`} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{item.producto}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.productoMarca}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  {item.origen}
                </span>
              </div>
              <div className="mt-3 space-y-2 text-xs text-slate-500">
                <p>{item.familia} · {item.subfamilia}</p>
                <p>{formatCurrencyCompact(item.venta)} · {formatKilosCompact(item.kilos)}</p>
                <p>Precio prom.: <span className="font-medium text-slate-950">{formatPriceKg(item.precioPromedio)}</span></p>
                <p>Unidades: <span className="font-medium text-slate-950">{formatUnitsCompact(item.unidades)}</span></p>
                <p>Participación venta: <span className="font-medium text-slate-950">{formatPercent(item.participacionVenta)}</span></p>
                <p>Participación kilos: <span className="font-medium text-slate-950">{formatPercent(item.participacionKilos)}</span></p>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origen</TableHead>
                <TableHead>Familia</TableHead>
                <TableHead>Subfamilia</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>ProductoMarca</TableHead>
                <TableHead>Venta total</TableHead>
                <TableHead>Kilos vendidos</TableHead>
                <TableHead>Precio promedio kg</TableHead>
                <TableHead>Unidades</TableHead>
                <TableHead>Participación venta %</TableHead>
                <TableHead>Participación kilos %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={`${item.origen}-${item.producto}`}>
                  <TableCell>{item.origen}</TableCell>
                  <TableCell>{item.familia}</TableCell>
                  <TableCell>{item.subfamilia}</TableCell>
                  <TableCell className="font-medium text-slate-950">{item.producto}</TableCell>
                  <TableCell>{item.productoMarca}</TableCell>
                  <TableCell>{formatCurrencyCompact(item.venta)}</TableCell>
                  <TableCell>{formatKilosCompact(item.kilos)}</TableCell>
                  <TableCell>{formatPriceKg(item.precioPromedio)}</TableCell>
                  <TableCell>{formatUnitsCompact(item.unidades)}</TableCell>
                  <TableCell>{formatPercent(item.participacionVenta)}</TableCell>
                  <TableCell>{formatPercent(item.participacionKilos)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
