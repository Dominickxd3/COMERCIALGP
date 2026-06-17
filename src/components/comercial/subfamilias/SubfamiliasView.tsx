"use client";

import { useMemo, useState } from "react";
import { SubfamilyAnalysisSection } from "@/components/comercial/subfamilias/SubfamilyAnalysisSection";
import { SubfamilyDetailTable } from "@/components/comercial/subfamilias/SubfamilyDetailTable";
import { SubfamilyFilters } from "@/components/comercial/subfamilias/SubfamilyFilters";
import { SubfamilyKpiCards } from "@/components/comercial/subfamilias/SubfamilyKpiCards";
import { SubfamilyRankingChart } from "@/components/comercial/subfamilias/SubfamilyRankingChart";
import {
  getSubfamilyAnalyticsData,
  getSubfamilyDrilldownData,
  getSubfamilyOptions,
  type SubfamilyFiltersState,
} from "@/components/comercial/subfamilias/subfamily-data";

export function SubfamiliasView({
  initialFamily,
  initialYear,
  initialPeriod,
  initialOrigin,
}: {
  initialFamily: string;
  initialYear: string;
  initialPeriod: string;
  initialOrigin: string;
}) {
  const [filters, setFilters] = useState<SubfamilyFiltersState>({
    year: initialYear,
    period: initialPeriod,
    origin: initialOrigin,
    family: initialFamily,
    subfamily: "Todas",
  });

  const availableSubfamilies = useMemo(() => getSubfamilyOptions(filters.family), [filters.family]);
  const normalizedFilters = useMemo(
    () => ({
      ...filters,
      subfamily: availableSubfamilies.includes(filters.subfamily) ? filters.subfamily : "Todas",
    }),
    [availableSubfamilies, filters],
  );

  const data = useMemo(() => getSubfamilyAnalyticsData(normalizedFilters), [normalizedFilters]);

  // Selected subfamily for drilldown
  const [selectedSubfamily, setSelectedSubfamily] = useState("Pechuga");
  const effectiveSelectedSubfamily =
    data.rows.some((row) => row.subfamilia === selectedSubfamily)
      ? selectedSubfamily
      : (data.rows[0]?.subfamilia ?? "Pechuga");

  const drilldown = useMemo(
    () => getSubfamilyDrilldownData(normalizedFilters, effectiveSelectedSubfamily),
    [effectiveSelectedSubfamily, normalizedFilters],
  );

  return (
    <section className="space-y-6 pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Subfamilias</h1>
        <p className="text-sm text-slate-500">Desglose comercial por familia y subfamilia.</p>
      </div>

      <SubfamilyFilters
        filters={normalizedFilters}
        onFilterChange={(key, value) =>
          setFilters((current) => ({
            ...current,
            [key]: value,
            ...(key === "family" ? { subfamily: "Todas" } : {}),
          }))
        }
      />

      <SubfamilyKpiCards items={data.kpis} />

      <SubfamilyRankingChart
        items={data.ranking}
        selectedSubfamily={effectiveSelectedSubfamily}
        onSelectSubfamily={setSelectedSubfamily}
      />

      <SubfamilyAnalysisSection data={drilldown} filters={normalizedFilters} />

      <SubfamilyDetailTable
        items={data.rows}
        filters={normalizedFilters}
        selectedSubfamily={effectiveSelectedSubfamily}
        onSelectSubfamily={setSelectedSubfamily}
      />
    </section>
  );
}
