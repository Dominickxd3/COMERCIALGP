import { KpiCard } from "@/components/comercial/KpiCard";
import type { ProductKpi } from "./product-data";

export function ProductKpiCards({ items }: { items: ProductKpi[] }) {
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
