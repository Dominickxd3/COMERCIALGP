"use client";

import { useMemo, useState } from "react";
import { CommercialEvolutionChart } from "@/components/comercial/CommercialEvolutionChart";
import { CommercialFilters } from "@/components/comercial/CommercialFilters";
import { ExecutiveSummaryCard } from "@/components/comercial/ExecutiveSummaryCard";
import { FamilyParticipationCard } from "@/components/comercial/FamilyParticipationCard";
import { KpiCard } from "@/components/comercial/KpiCard";
import { TopFamilyList } from "@/components/comercial/TopFamilyList";
import { TopSubfamilyList } from "@/components/comercial/TopSubfamilyList";
import {
  CommercialFilterState,
  commercialFilterOptions,
  getCommercialDashboardData,
} from "@/components/comercial/commercial-data";

export default function HomePage() {
  const [filters, setFilters] = useState<CommercialFilterState>({
    year: commercialFilterOptions.years[0],
    period: commercialFilterOptions.periods[2].value,
    origin: commercialFilterOptions.origins[0],
    versionCut: commercialFilterOptions.versionCuts[0],
  });

  const data = useMemo(() => getCommercialDashboardData(filters), [filters]);

  return (
    <section className="space-y-6 pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Resumen Ejecutivo Comercial
        </h1>
        <p className="text-sm text-slate-500">
          Ventas, kilos y desempeño comercial del periodo seleccionado.
        </p>
      </div>

      <CommercialFilters
        filters={filters}
        onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
      />

      <ExecutiveSummaryCard summary={data.executiveSummary} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            delta={kpi.delta}
            helper={kpi.helper}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(360px,0.95fr)]">
        <CommercialEvolutionChart
          data={data.monthlyData}
          selectedMonth={data.monthlyData.at(-1)?.mes ?? "Marzo"}
        />
        <FamilyParticipationCard items={data.familyData} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TopFamilyList items={data.topFamilies} />
        <TopSubfamilyList items={data.topSubfamilies} />
      </div>
    </section>
  );
}
