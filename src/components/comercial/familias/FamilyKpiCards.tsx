import { KpiCard } from "@/components/comercial/KpiCard";
import type { FamilyKpi } from "./family-data";

export function FamilyKpiCards({ items }: { items: FamilyKpi[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((kpi) => (
        <KpiCard
          key={kpi.title}
          title={kpi.title}
          value={kpi.value}
          delta={kpi.delta}
          helper={kpi.helper}
        />
      ))}
    </div>
  );
}
