"use client";

import { useMemo, useState } from "react";
import { SubfamilyDetailTable } from "@/components/comercial/subfamilias/SubfamilyDetailTable";
import { SubfamilyFilters } from "@/components/comercial/subfamilias/SubfamilyFilters";
import { SubfamilyKpiCards } from "@/components/comercial/subfamilias/SubfamilyKpiCards";
import { SubfamilyParticipationList } from "@/components/comercial/subfamilias/SubfamilyParticipationList";
import { SubfamilyRankingChart } from "@/components/comercial/subfamilias/SubfamilyRankingChart";
import {
  getSubfamilyAnalyticsData,
  getSubfamilyOptions,
  subfamilyFilterOptions,
  type SubfamilyFiltersState,
} from "@/components/comercial/subfamilias/subfamily-data";

export function SubfamiliasView({ initialFamily }: { initialFamily: string }) {
  const [filters, setFilters] = useState<SubfamilyFiltersState>({
    year: subfamilyFilterOptions.years[0],
    period: subfamilyFilterOptions.periods[2].value,
    origin: subfamilyFilterOptions.origins[0],
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

      <div className="grid items-start gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <SubfamilyRankingChart items={data.ranking} />
        <SubfamilyParticipationList items={data.participation} />
      </div>

      <SubfamilyDetailTable items={data.rows} />
    </section>
  );
}
