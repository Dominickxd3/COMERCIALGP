"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FamilyDrilldownData, FamilyFiltersState } from "./family-data";
import { SubfamilyBarChart } from "./SubfamilyBarChart";
import { OriginBarChart } from "./OriginBarChart";
import { ProductsBarChart } from "./ProductsBarChart";

function buildQuery(filters: FamilyFiltersState, familia: string) {
  return new URLSearchParams({
    year: filters.year,
    period: filters.period,
    origin: filters.origin,
    familia,
  }).toString();
}

/* ─── Top subfamilias (vertical BarChart) ─── */

function TopSubfamiliasCard({
  data,
  filters,
}: {
  data: FamilyDrilldownData;
  filters: FamilyFiltersState;
}) {
  const subfamilyQuery = `/subfamilias?${buildQuery(filters, data.summary.familia)}`;

  return (
    <Card className="h-full border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-slate-950">
              Top subfamilias de {data.summary.familia}
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Ranking comercial por venta y kilos dentro de la familia.
            </CardDescription>
          </div>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-lg text-xs"
          >
            <Link href={subfamilyQuery}>Ver subfamilias</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <SubfamilyBarChart
          items={data.topSubfamilies}
          totalVenta={data.summary.venta}
        />
      </CardContent>
    </Card>
  );
}

/* ─── Origen comercial (vertical grouped BarChart) ─── */

function OrigenComercialCard({
  data,
  familia,
}: {
  data: FamilyDrilldownData;
  familia: string;
}) {
  return (
    <Card className="h-full border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-950">
          Origen comercial de {familia}
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Comparativa de venta y kilos por origen comercial.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <OriginBarChart items={data.origins} />
      </CardContent>
    </Card>
  );
}

/* ─── Productos líderes (horizontal BarChart) ─── */

function ProductosLideresCard({
  data,
  filters,
}: {
  data: FamilyDrilldownData;
  filters: FamilyFiltersState;
}) {
  const productQuery = `/productos?${buildQuery(filters, data.summary.familia)}`;

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-semibold text-slate-950">
              Productos líderes de {data.summary.familia}
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Top productos por venta y kilos dentro de la familia.
            </CardDescription>
          </div>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-lg text-xs"
          >
            <Link href={productQuery}>Ver productos</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ProductsBarChart
          items={data.topProducts}
          totalVenta={data.summary.venta}
        />
      </CardContent>
    </Card>
  );
}

/* ─── Export: Section ─── */

export function FamilyAnalysisSection({
  data,
  filters,
}: {
  data: FamilyDrilldownData;
  filters: FamilyFiltersState;
}) {
  const familia = data.summary.familia;

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-slate-950">
          Composición de {familia}
        </h2>
        <p className="text-sm text-slate-500">
          Distribución comercial por subfamilia y origen.
        </p>
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-[1fr_1fr]">
        <TopSubfamiliasCard data={data} filters={filters} />
        <OrigenComercialCard data={data} familia={familia} />
      </div>

      <ProductosLideresCard data={data} filters={filters} />
    </section>
  );
}
