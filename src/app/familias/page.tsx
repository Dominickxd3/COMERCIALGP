"use client";

import { useMemo, useState } from "react";
import { FamilyFilters } from "@/components/comercial/familias/FamilyFilters";
import { FamilyFichaCard } from "@/components/comercial/familias/FamilyFichaCard";
import { FamilyKpiCards } from "@/components/comercial/familias/FamilyKpiCards";
import { FamilyParticipationList } from "@/components/comercial/familias/FamilyParticipationList";
import { FamilyRankingChart } from "@/components/comercial/familias/FamilyRankingChart";
import {
  FamilyFiltersState,
  familyFilterOptions,
  getFamilyAnalyticsData,
  getFamilyDrilldownData,
} from "@/components/comercial/familias/family-data";

export default function FamiliasPage() {
  const [filters, setFilters] = useState<FamilyFiltersState>({
    year: familyFilterOptions.years[0],
    period: familyFilterOptions.periods[2].value,
    origin: familyFilterOptions.origins[0],
    family: familyFilterOptions.families[0],
  });

  const data = useMemo(() => getFamilyAnalyticsData(filters), [filters]);

  const [selectedFamily, setSelectedFamily] = useState("Pollo");
  const effectiveSelectedFamily =
    data.rows.some((row) => row.familia === selectedFamily)
      ? selectedFamily
      : (data.rows[0]?.familia ?? "Pollo");

  const drilldown = useMemo(
    () => getFamilyDrilldownData(filters, effectiveSelectedFamily),
    [effectiveSelectedFamily, filters],
  );

  return (
    <section className="space-y-6 pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Familias</h1>
        <p className="text-sm text-slate-500">Análisis comercial por familia.</p>
      </div>

      <FamilyFilters
        filters={filters}
        onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
      />

      <FamilyKpiCards items={data.kpis} />

      <div className="grid items-start gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <FamilyRankingChart
          items={data.ranking}
          selectedFamily={effectiveSelectedFamily}
          onSelectFamily={setSelectedFamily}
        />
        <FamilyParticipationList
          items={data.participation}
          selectedFamily={effectiveSelectedFamily}
          onSelectFamily={setSelectedFamily}
        />
      </div>

      <FamilyFichaCard data={drilldown} />
    </section>
  );
}
