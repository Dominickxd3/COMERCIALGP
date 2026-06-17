"use client";

import {
  calculateAveragePricePerKg,
  formatCurrencyCompact,
  formatKilosCompact,
  formatPercent,
  formatPriceKg,
} from "./family-data";

/* ─── Shared row ─── */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}

/* ─── Generic tooltip for all bar charts ─── */

type BarTooltipEntry = {
  name?: string;
  familia?: string;
  subfamilia?: string;
  origen?: string;
  producto?: string;
  marca?: string;
  venta: number;
  kilos: number;
  precioPromedio?: number;
  participacion?: number;
  participacionVenta?: number;
};

export function CommercialBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: BarTooltipEntry }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  const displayName =
    item.producto ?? item.subfamilia ?? item.origen ?? item.familia ?? item.name ?? label ?? "—";
  const precio = item.precioPromedio ?? calculateAveragePricePerKg(item.venta, item.kilos);
  const participacion = item.participacionVenta ?? item.participacion;

  return (
    <div className="min-w-56 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs shadow-lg">
      <p className="font-semibold text-slate-950">{displayName}</p>
      {item.marca ? <p className="mt-0.5 text-slate-500">{item.marca}</p> : null}
      <div className="mt-2 space-y-1.5">
        <Row label="Venta" value={formatCurrencyCompact(item.venta)} />
        <Row label="Kilos" value={formatKilosCompact(item.kilos)} />
        <Row label="Precio prom." value={formatPriceKg(precio).replace(" / kg", "/kg")} />
        {typeof participacion === "number" ? (
          <Row label="Participación" value={formatPercent(participacion)} />
        ) : null}
      </div>
    </div>
  );
}
