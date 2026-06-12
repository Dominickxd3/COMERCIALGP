import { KpiCard } from "@/components/comercial/KpiCard";
import type { SubfamilyKpi } from "./subfamily-data";

export function SubfamilyKpiCards({ items }: { items: SubfamilyKpi[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
