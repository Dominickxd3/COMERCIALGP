"use client";

import { useMemo, useState } from "react";
import { ProductDetailTable } from "@/components/comercial/productos/ProductDetailTable";
import { ProductFilters } from "@/components/comercial/productos/ProductFilters";
import { ProductKpiCards } from "@/components/comercial/productos/ProductKpiCards";
import { ProductRankingChart } from "@/components/comercial/productos/ProductRankingChart";
import {
  getProductAnalyticsData,
  getProductOptions,
  getSubfamilyOptions,
  type ProductFiltersState,
} from "@/components/comercial/productos/product-data";

export function ProductosView({
  initialFamily,
  initialSubfamily,
  initialYear,
  initialPeriod,
  initialOrigin,
}: {
  initialFamily: string;
  initialSubfamily: string;
  initialYear: string;
  initialPeriod: string;
  initialOrigin: string;
}) {
  const [filters, setFilters] = useState<ProductFiltersState>({
    year: initialYear,
    period: initialPeriod,
    origin: initialOrigin,
    family: initialFamily,
    subfamily: initialSubfamily,
    product: "Todos",
    search: "",
  });

  const availableSubfamilies = useMemo(() => getSubfamilyOptions(filters.family), [filters.family]);
  const normalizedSubfamily = availableSubfamilies.includes(filters.subfamily) ? filters.subfamily : "Todas";
  const availableProducts = useMemo(
    () => getProductOptions(filters.family, normalizedSubfamily),
    [filters.family, normalizedSubfamily],
  );

  const normalizedFilters = useMemo(
    () => ({
      ...filters,
      subfamily: normalizedSubfamily,
      product: availableProducts.includes(filters.product) ? filters.product : "Todos",
    }),
    [availableProducts, filters, normalizedSubfamily],
  );

  const data = useMemo(() => getProductAnalyticsData(normalizedFilters), [normalizedFilters]);

  return (
    <section className="space-y-6 pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Productos</h1>
        <p className="text-sm text-slate-500">Ranking y detalle comercial por producto.</p>
      </div>

      <ProductFilters
        filters={normalizedFilters}
        onFilterChange={(key, value) =>
          setFilters((current) => ({
            ...current,
            [key]: value,
            ...(key === "family" ? { subfamily: "Todas", product: "Todos" } : {}),
            ...(key === "subfamily" ? { product: "Todos" } : {}),
          }))
        }
      />

      <ProductKpiCards items={data.kpis} />

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <ProductRankingChart items={data.salesRanking} mode="venta" />
        <ProductRankingChart items={data.kilosRanking} mode="kilos" />
      </div>

      <ProductDetailTable items={data.rows} />
    </section>
  );
}
