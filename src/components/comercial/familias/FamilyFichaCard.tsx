"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FamilyDrilldownData } from "./family-data";
import { formatCurrencyCompact, formatKilosCompact } from "./family-data";

// ── Tab: Resumen ─────────────────────────────────────────────────────────────

function TabResumen({ data }: { data: FamilyDrilldownData }) {
  const items = [
    { label: "Venta total", value: formatCurrencyCompact(data.summary.venta) },
    { label: "Kilos vendidos", value: formatKilosCompact(data.summary.kilos) },
    { label: "Subfamilia líder", value: data.summary.subfamiliaLider },
    { label: "Origen principal", value: data.summary.origenPrincipal },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
            {item.label}
          </p>
          <p className="mt-1.5 text-lg font-semibold text-slate-950">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Tab: Subfamilias ─────────────────────────────────────────────────────────

function TabSubfamilias({
  data,
  familia,
}: {
  data: FamilyDrilldownData;
  familia: string;
}) {
  const maxVenta = Math.max(...data.topSubfamilies.map((s) => s.venta), 1);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {data.topSubfamilies.map((item) => (
          <div
            key={item.subfamilia}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-950">{item.subfamilia}</p>
              <div className="flex shrink-0 items-center gap-3 text-xs text-slate-600">
                <span className="font-medium text-slate-950">
                  {formatCurrencyCompact(item.venta)}
                </span>
                <span className="text-slate-400">·</span>
                <span>{formatKilosCompact(item.kilos)}</span>
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${(item.venta / maxVenta) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-1">
        <Button asChild size="sm" variant="outline" className="rounded-lg">
          <Link href={`/subfamilias?familia=${encodeURIComponent(familia)}`}>
            Ver subfamilias
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ── Tab: Productos ───────────────────────────────────────────────────────────

function TabProductos({
  data,
  familia,
}: {
  data: FamilyDrilldownData;
  familia: string;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {data.topProducts.map((item) => (
          <div
            key={item.productoMarca}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5"
          >
            <p className="min-w-0 truncate text-sm font-semibold text-slate-950">
              {item.productoMarca}
            </p>
            <div className="flex shrink-0 items-center gap-3 text-xs text-slate-600">
              <span className="font-medium text-slate-950">
                {formatCurrencyCompact(item.venta)}
              </span>
              <span className="text-slate-400">·</span>
              <span>{formatKilosCompact(item.kilos)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-1">
        <Button asChild size="sm" variant="outline" className="rounded-lg">
          <Link href={`/productos?familia=${encodeURIComponent(familia)}`}>
            Ver productos
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ── Tab: Origen ──────────────────────────────────────────────────────────────

function TabOrigen({ data }: { data: FamilyDrilldownData }) {
  return (
    <div className="space-y-2">
      {data.origins.map((item) => (
        <div
          key={item.origen}
          className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-3"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-950">{item.origen}</p>
            <p className="text-sm font-semibold text-slate-950">
              {item.participacion.toFixed(1)}%
            </p>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {formatCurrencyCompact(item.venta)} · {formatKilosCompact(item.kilos)}
          </p>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${item.participacion}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Card principal ────────────────────────────────────────────────────────────

export function FamilyFichaCard({ data }: { data: FamilyDrilldownData }) {
  const familia = data.summary.familia;

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-950">
          Ficha comercial:{" "}
          <span className="text-blue-700">{familia}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="resumen">
          <TabsList className="mb-4 h-9 rounded-lg bg-slate-100 p-1">
            <TabsTrigger value="resumen" className="rounded-md text-xs">
              Resumen
            </TabsTrigger>
            <TabsTrigger value="subfamilias" className="rounded-md text-xs">
              Subfamilias
            </TabsTrigger>
            <TabsTrigger value="productos" className="rounded-md text-xs">
              Productos
            </TabsTrigger>
            <TabsTrigger value="origen" className="rounded-md text-xs">
              Origen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumen">
            <TabResumen data={data} />
          </TabsContent>
          <TabsContent value="subfamilias">
            <TabSubfamilias data={data} familia={familia} />
          </TabsContent>
          <TabsContent value="productos">
            <TabProductos data={data} familia={familia} />
          </TabsContent>
          <TabsContent value="origen">
            <TabOrigen data={data} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
